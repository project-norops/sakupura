import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@sakupla/dynamic-pricing",
    "@sakupla/shared-ui",
    "@sakupla/social-text-formatter",
    "twitter-text",
  ],
};

export default nextConfig;
