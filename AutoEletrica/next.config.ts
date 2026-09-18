import type { NextConfig } from "next";

const fotoIaInternalUrl =
  process.env.FOTOIA_INTERNAL_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/fotoia/:path*",
        destination: `${fotoIaInternalUrl}/fotoia/:path*`,
      },
    ];
  },
};

export default nextConfig;
