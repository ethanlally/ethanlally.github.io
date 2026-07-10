const cacheTtlSeconds = 10;
let accessToken: { value: string; expiresAt: number } | undefined;

function responseForBrowser(response: Response): Response {
  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

async function getAccessToken(env: any): Promise<string> {
  if (accessToken && accessToken.expiresAt > Date.now()) {
    return accessToken.value;
  }

  const basic = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.SPOTIFY_REFRESH_TOKEN as string,
    }),
    signal: AbortSignal.timeout(5000),
    cache: 'no-store'
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error('Failed to fetch access token');
  }

  const expiresIn = Number(tokenData.expires_in ?? 3600);
  accessToken = {
    value: tokenData.access_token,
    expiresAt: Date.now() + Math.max(expiresIn - 60, 60) * 1000
  };

  return accessToken.value;
}

export async function onRequest(context: any) {
  const { request, env } = context;
  const cacheUrl = new URL(request.url);
  cacheUrl.search = '';
  cacheUrl.searchParams.set('v', '1');
  const cacheKey = new Request(cacheUrl.toString());
  const cache = (caches as any).default;

  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) {
    return Response.json({ isPlaying: false, error: 'Spotify API not configured.' }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  }

  const cached = await cache.match(cacheKey);
  if (cached) {
    return responseForBrowser(cached);
  }

  try {
    const token = await getAccessToken(env);
    const spotifyResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store'
    });

    let data;
    if (spotifyResponse.status === 204 || !spotifyResponse.ok) {
      data = { isPlaying: false, fetchedAt: Date.now() };
    } else {
      const song = await spotifyResponse.json();
      data = song.item === null ? {
        isPlaying: false,
        fetchedAt: Date.now()
      } : {
        album: song.item.album.name,
        albumImageUrl: song.item.album.images[0]?.url,
        artist: song.item.artists.map((_artist: any) => _artist.name).join(', '),
        isPlaying: song.is_playing,
        songUrl: song.item.external_urls.spotify,
        title: song.item.name,
        progress_ms: song.progress_ms,
        duration_ms: song.item.duration_ms,
        fetchedAt: Date.now()
      };
    }

    const cacheResponse = Response.json(data, {
      headers: { 'Cache-Control': `s-maxage=${cacheTtlSeconds}` }
    });
    context.waitUntil(cache.put(cacheKey, cacheResponse.clone()));

    return responseForBrowser(cacheResponse);
  } catch (error: any) {
    return Response.json({ isPlaying: false, error: error.message || 'Unknown error' }, {
      status: 500,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
}
