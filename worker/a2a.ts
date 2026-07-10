export async function onRequest(context: any) {
  const { request } = context;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null });
  }

  if (body.method !== 'message/send') {
    return Response.json({ jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id: body.id ?? null });
  }

  return Response.json({
    jsonrpc: '2.0',
    id: body.id ?? null,
    result: {
      id: crypto.randomUUID(),
      contextId: crypto.randomUUID(),
      status: {
        state: 'completed',
        timestamp: new Date().toISOString()
      },
      artifacts: [
        {
          artifactId: crypto.randomUUID(),
          parts: [
            {
              kind: 'text',
              text: 'Contact information is available at https://lally.lol/links and https://github.com/ethanlally.'
            }
          ]
        }
      ]
    }
  });
}
