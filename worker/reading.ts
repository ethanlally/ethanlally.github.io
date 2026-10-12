const refreshMs = 60 * 60 * 1000;
const staleMs = 24 * refreshMs;
const pending = new Map<string, Promise<CacheEntry>>();

interface Book {
  title: string;
  author: string;
  coverUrl: string | null;
  bookUrl: string;
}

interface CacheEntry {
  book: Book | null;
  updatedAt: number | null;
  retryAt: number;
  unavailable: boolean;
}

interface ReadingContext {
  request: Request;
  env: { HARDCOVER_API_TOKEN?: string };
}

const query = `{
  me {
    user_books(
      where: {status_id: {_eq: 2}, privacy_setting_id: {_eq: 1}}
      order_by: [{updated_at: desc}, {id: desc}]
      limit: 1
    ) {
      book { title slug cached_image cached_contributors }
    }
  }
}`;

function parseBook(payload: any): Book | null {
  if (payload.errors?.length || !Array.isArray(payload.data?.me) || payload.data.me.length !== 1) {
    throw new Error('Invalid reading response');
  }
  const entries = payload.data.me[0].user_books;
  if (!Array.isArray(entries)) throw new Error('Missing reading list');
  if (!entries.length) return null;
  const book = entries[0]?.book;
  if (
    typeof book?.title !== 'string' ||
    !book.title.trim() ||
    typeof book.slug !== 'string' ||
    !/^[a-zA-Z0-9-]+$/.test(book.slug)
  ) {
    throw new Error('Invalid book');
  }
  const contributors = Array.isArray(book.cached_contributors) ? book.cached_contributors : [];
  const authors = contributors
    .filter((entry: any) => entry.contributor_role_id === 1 || entry.contribution === 'Author')
    .map((entry: any) => entry.author?.name)
    .filter((name: unknown): name is string => typeof name === 'string' && !!name.trim());
  let coverUrl: string | null = null;
  try {
    const cover = new URL(book.cached_image?.url);
    if (
      cover.protocol === 'https:' &&
      cover.hostname === 'assets.hardcover.app' &&
      !cover.username &&
      !cover.password
    )
      coverUrl = cover.href;
  } catch {}
  return {
    title: book.title.trim(),
    author: [...new Set(authors)].join(', ') || 'Unknown author',
    coverUrl,
    bookUrl: `https://hardcover.app/books/${book.slug}`,
  };
}

async function refresh(token: string, previous?: CacheEntry): Promise<CacheEntry> {
  let retryAt = Date.now() + refreshMs;
  try {
    const response = await fetch('https://api.hardcover.app/v1/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'EthanLallyPortfolio/1.0 (https://lally.lol)',
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(8000),
      redirect: 'manual',
      cache: 'no-store',
    });
    if (response.status === 429) {
      const value = response.headers.get('Retry-After');
      if (value) {
        const until = /^\d+$/.test(value) ? Date.now() + Number(value) * 1000 : Date.parse(value);
        if (Number.isFinite(until)) retryAt = Math.max(retryAt, until);
      }
    }
    if (!response.ok) throw new Error('Reading service unavailable');
    const book = parseBook(await response.json());
    const now = Date.now();
    return { book, updatedAt: now, retryAt: now + refreshMs, unavailable: false };
  } catch {
    return {
      book: previous?.book ?? null,
      updatedAt: previous?.updatedAt ?? null,
      retryAt,
      unavailable: true,
    };
  }
}

function respond(entry: CacheEntry): Response {
  const usable = entry.updatedAt !== null && Date.now() - entry.updatedAt < staleMs;
  const seconds = Math.max(1, Math.ceil((entry.retryAt - Date.now()) / 1000));
  return Response.json(
    {
      book: usable ? entry.book : null,
      updatedAt: usable ? entry.updatedAt : null,
      stale: entry.unavailable && usable,
      ...(entry.unavailable ? { error: 'Reading updates are temporarily unavailable.' } : {}),
    },
    {
      status: entry.unavailable && !usable ? 503 : 200,
      headers: {
        'Cache-Control': 'no-store',
        ...(entry.unavailable ? { 'Retry-After': String(seconds) } : {}),
      },
    },
  );
}

export async function onRequest({ request, env }: ReadingContext): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(null, { status: 405, headers: { Allow: 'GET' } });
  }
  const token = env.HARDCOVER_API_TOKEN?.trim().replace(/^Bearer\s+/i, '');
  if (!token) {
    return Response.json(
      { error: 'Reading updates are not configured.', book: null },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const accountKey = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
    const url = new URL('/api/reading', request.url);
    url.searchParams.set('cache', `2-${accountKey}`);
    const key = new Request(url);
    const cache = (caches as CacheStorage & { default: Cache }).default;
    const cached = await cache.match(key);
    const previous: CacheEntry | undefined = cached ? await cached.json() : undefined;
    if (previous && previous.retryAt > Date.now()) return respond(previous);
    let work = pending.get(url.href);
    if (!work) {
      work = (async () => {
        const entry = await refresh(token, previous);
        const ttl = Math.max(staleMs / 1000, Math.ceil((entry.retryAt - Date.now()) / 1000));
        await cache.put(
          key,
          Response.json(entry, {
            headers: { 'Cache-Control': `public, max-age=${ttl}` },
          }),
        );
        return entry;
      })();
      pending.set(url.href, work);
      void work.finally(() => pending.delete(url.href)).catch(() => {});
    }
    return respond(await work);
  } catch {
    return Response.json(
      { book: null, error: 'Reading updates are temporarily unavailable.' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}
