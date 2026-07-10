import { onRequest as github } from './github';
import { onRequest as spotify } from './spotify';
import { onRequest as a2a } from './a2a';
import { markdownFor } from './markdown';

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/github') {
      return github({ request, env, waitUntil: ctx.waitUntil.bind(ctx) });
    }
    
    if (url.pathname === '/api/spotify') {
      return spotify({ request, env, waitUntil: ctx.waitUntil.bind(ctx) });
    }

    if (url.pathname === '/a2a') {
      return a2a({ request });
    }

    if (url.pathname === '/status') {
      return Response.json({ status: 'ok' });
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    if (request.method === 'GET' && request.headers.get('Accept')?.includes('text/markdown')) {
      const markdown = markdownFor(url.pathname);
      return new Response(markdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
          'X-Markdown-Tokens': String(markdown.split(/\s+/).length)
        }
      });
    }

    try {
      return await env.ASSETS.fetch(request);
    } catch {
      return new Response('Not found', { status: 404 });
    }
  }
};
