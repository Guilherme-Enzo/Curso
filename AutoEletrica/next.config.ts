import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/404",
      },
    ];
  },
};

export default nextConfig;
