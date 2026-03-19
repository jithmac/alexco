import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'monetize.lk',
      },
      {
        protocol: 'https',
        hostname: 'alexco.lk',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },
  // Ensure we can handle large uploads if needed
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  compress: false,
};

export default nextConfig;
