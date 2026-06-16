export async function onRequest(context) {
  const { request, next } = context;
  const accept = request.headers.get("Accept") || "";

  // If the agent specifically requests markdown
  if (accept.includes("text/markdown")) {
    const response = await next();
    
    // Only intercept HTML responses
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("text/html")) {
      const html = await response.text();
      
      // Super basic HTML to Markdown extraction
      let markdown = html
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      
      markdown = markdown.replace(/<[^>]+>/g, ' ');
      markdown = markdown.replace(/\s+/g, ' ').trim();
      
      markdown = "# Ethan Lally Portfolio\n\n" + markdown;
      
      return new Response(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "x-markdown-tokens": markdown.split(/\s+/).length.toString()
        }
      });
    }
    
    return response;
  }
  
  return next();
}
