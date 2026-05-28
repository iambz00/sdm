import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // devIndicators: false,
  transpilePackages: ["xlsx"],  // for SheetJS
  experimental: {
  },
};

export default nextConfig;
