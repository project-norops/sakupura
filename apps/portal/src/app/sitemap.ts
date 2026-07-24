export const runtime = "edge";

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://norops.jp/</loc>\n  </url>\n  <url>\n    <loc>https://norops.jp/robots.txt</loc>\n  </url>\n</urlset>`;

export function GET() {
  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml;charset=UTF-8",
    },
  });
}

// Default export for route handler compatibility
export default function handler() {
  return GET();
}
