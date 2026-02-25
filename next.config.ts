import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: 
    [
       {
        protocol: 'https',
        hostname: 'movingquotetexas.com',
      },
       {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      { protocol: 'http', hostname: 'localhost' }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/moving/:path*',
        destination: 'https://movingrelogroup.org/:path*',
      },
    ];
  },
};

export default nextConfig;
