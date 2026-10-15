import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/user-dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
