export async function onRequest(context) {
  const { request, next } = context;
  const accept = request.headers.get("Accept") || "";

  // If the agent specifically requests markdown
  if (accept.toLowerCase().includes("text/markdown")) {
    const response = await next();
    
    // Only intercept HTML responses
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("text/html")) {
      const html = await response.text();
      
      const markdown = `# Ethan Lally - Portfolio

Welcome to my portfolio! I am an aspiring developer.

## About Me
I am a student at the University of Dayton studying computer science.

## Projects
- **Portfolio Website**: Built with Angular and hosted on Cloudflare Pages.

## Contact
- **Email (Personal)**: ejlally05@gmail.com
- **Email (School)**: lallye4@udayton.edu
- **Domain**: lally.lol
- **GitHub**: ethanlally`;
      
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
