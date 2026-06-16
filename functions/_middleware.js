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
      // Strip head, scripts, styles
      let markdown = html
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      
      // Strip remaining HTML tags
      markdown = markdown.replace(/<[^>]+>/g, ' ');
      // Normalize whitespace
      markdown = markdown.replace(/\s+/g, ' ').trim();
      
      // Add a header
      markdown = "# Ethan Lally Portfolio\n\n" + markdown;
      
      return new Response(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "x-markdown-tokens": markdown.split(/\s+/).length.toString()
        }
      });
    }
    
    // Return original response if not HTML (or if body already consumed)
    // Wait, the above logic consumes the body. If it wasn't HTML, we shouldn't have consumed it.
    // That's why we checked contentType first.
  }
  
  return next();
}
