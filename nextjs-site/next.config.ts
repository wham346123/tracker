import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Map /images/a1.png, /images/b1.png, etc. to /api/letter/[letter]
        source: '/images/:letter(\\w)1.png',
        destination: '/api/letter/:letter',
      },
    ];
  },
};

export default nextConfig;
