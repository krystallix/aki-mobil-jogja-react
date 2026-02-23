import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'supabase.arkane.my.id',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/aki',
        destination: '/katalog',
        permanent: true, // 301 redirect
      },
      {
        source: '/aki/:slug*',
        destination: '/katalog/product/:slug*',
        permanent: true, // 301 redirect
      },
    ];
  },
};

export default nextConfig;
