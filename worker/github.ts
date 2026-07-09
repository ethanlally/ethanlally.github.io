export async function onRequest(context: any) {
  const { request, env } = context;

  const cacheUrl = new URL(request.url);
  cacheUrl.searchParams.set('v', '2');
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = (caches as any).default;

  const isLocal = cacheUrl.hostname === 'localhost' || cacheUrl.hostname === '127.0.0.1';
  let response = null;

  if (!isLocal && cache) {
    let cached = await cache.match(cacheKey);
    if (cached) {
      return new Response(cached.body, {
        status: cached.status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
      });
    }
  }

  try {
    const githubResponse = await fetch('https://api.github.com/users/ethanlally/repos?sort=updated&per_page=5', {
      headers: {
        'User-Agent': 'Cloudflare-Worker'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!githubResponse.ok) {
        throw new Error(`GitHub API responded with status: ${githubResponse.status}`);
    }

    const data = await githubResponse.json();

    const cacheResponse = new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600'
      }
    });

    context.waitUntil(cache.put(cacheKey, cacheResponse.clone()));

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}
