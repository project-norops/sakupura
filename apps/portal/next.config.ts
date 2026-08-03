import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@sakupla/dynamic-pricing",
    "@sakupla/shared-ui",
    "@sakupla/social-text-formatter",
    "twitter-text",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        missing: [
          {
            type: "host",
            value: "^(www\\.)?norops\\.jp$",
          },
        ],
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
