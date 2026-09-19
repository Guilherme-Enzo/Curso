import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  ...(basePath ? { basePath } : {}),
  trailingSlash: false,
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
