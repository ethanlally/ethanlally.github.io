export async function onRequest(context: any) {
  const { request, env } = context;

  const cacheUrl = new URL(request.url);
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = (caches as any).default;
  
  const isLocal = cacheUrl.hostname === 'localhost' || cacheUrl.hostname === '127.0.0.1';
  let response = null;
  
  if (!isLocal && cache) {
    response = await cache.match(cacheKey);
  }

  if (response) {
    return response;
  }


  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) {

    return new Response(JSON.stringify({ isPlaying: false, error: 'Spotify API not configured.' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const basic = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
  const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;

  try {
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: env.SPOTIFY_REFRESH_TOKEN as string,
      }),
      signal: AbortSignal.timeout(5000)
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
        throw new Error('Failed to fetch access token');
    }

    const { access_token } = tokenData;

    const spotifyResponse = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      signal: AbortSignal.timeout(5000)
    });

    let jsonResponse;

    if (spotifyResponse.status === 204 || spotifyResponse.status > 400) {
      jsonResponse = { isPlaying: false, fetchedAt: Date.now() };
    } else {
      const song = await spotifyResponse.json();
      if (song.item === null) {
        jsonResponse = { isPlaying: false, fetchedAt: Date.now() };
      } else {
        jsonResponse = {
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
    }

    response = new Response(JSON.stringify(jsonResponse), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=15, max-age=0, must-revalidate'
        }
    });

    context.waitUntil(cache.put(cacheKey, response.clone()));

    return response;

  } catch (error: any) {
    return new Response(JSON.stringify({ isPlaying: false, error: error.message || 'Unknown error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}
