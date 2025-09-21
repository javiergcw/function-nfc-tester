import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/akua/:path*',
        destination: 'https://sandbox.akua.la/v1/pos/providers/cloudcommerce/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/akua/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, api-key' },
        ],
      },
    ];
  },
};

export default nextConfig;
