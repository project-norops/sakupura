import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@sakupla/dynamic-pricing",
    "@sakupla/shared-ui",
    "@sakupla/social-text-formatter",
    "twitter-text",
  ],
  async headers() {
    if (process.env.VERCEL_ENV !== "preview") {
      return [];
    }

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
