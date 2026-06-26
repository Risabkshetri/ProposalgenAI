import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '7279-2401-4900-8397-cbe8-c9d0-fd4-7965-2c37.ngrok-free.app',
    'localhost',
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*'
      }
    ]
  }
};

export default nextConfig;
