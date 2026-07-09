import { onRequest as github } from './github';
import { onRequest as spotify } from './spotify';

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/github') {
      return github({ request, env, waitUntil: ctx.waitUntil.bind(ctx) });
    }
    
    if (url.pathname === '/api/spotify') {
      return spotify({ request, env, waitUntil: ctx.waitUntil.bind(ctx) });
    }
    
    // Serve the static Angular assets for all other routes
    return env.ASSETS.fetch(request);
  }
};
