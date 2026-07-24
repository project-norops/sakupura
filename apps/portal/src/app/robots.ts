import type { NextRequest } from "next/server";

export const runtime = "edge";

export function GET(request: NextRequest) {
  const body = `User-agent: *\nAllow: /\nSitemap: https://norops.jp/sitemap.xml\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
    },
  });
}

// Default export for route handler compatibility
export default function handler(request: NextRequest) {
  return GET(request);
}
