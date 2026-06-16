const fs = require('fs');
const path = require('path');

const domain = 'https://lally.lol';
const routesPath = path.join(__dirname, '../src/app/app.routes.ts');
const publicDir = path.join(__dirname, '../public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');
const robotsPath = path.join(publicDir, 'robots.txt');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Read routes
const routesContent = fs.readFileSync(routesPath, 'utf8');
const routeRegex = /path:\s*'([^']*)'/g;
let match;
const urls = [];

while ((match = routeRegex.exec(routesContent)) !== null) {
    const route = match[1];
    if (route !== '**') { // Ignore wildcard routes
        urls.push(`${domain}/${route}`);
    }
}

// Generate sitemap.xml
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemapXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

urls.forEach(url => {
    sitemapXml += `  <url>\n    <loc>${url}</loc>\n  </url>\n`;
});

sitemapXml += `</urlset>\n`;

fs.writeFileSync(sitemapPath, sitemapXml);
console.log('sitemap.xml generated successfully.');

// Ensure robots.txt exists and has Sitemap
let robotsTxt = '';
if (fs.existsSync(robotsPath)) {
    robotsTxt = fs.readFileSync(robotsPath, 'utf8');
}

if (robotsTxt.includes('Sitemap:')) {
    robotsTxt = robotsTxt.replace(/Sitemap:.*(\n|$)/g, `Sitemap: ${domain}/sitemap.xml\n`);
} else {
    robotsTxt += `\nSitemap: ${domain}/sitemap.xml\n`;
}
fs.writeFileSync(robotsPath, robotsTxt.trim() + '\n');
console.log('robots.txt updated with Sitemap.');
