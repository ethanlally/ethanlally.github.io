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

    const repos = await githubResponse.json();

    response = new Response(JSON.stringify(repos), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=3600, max-age=0, must-revalidate'
        }
    });

    // 3. Save to Edge Cache
    context.waitUntil(cache.put(cacheKey, response.clone()));

    return response;

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}
