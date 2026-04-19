import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* You can put other Next.js options here if you have them */
  
  webpack: (config, { isServer }) => {
    // This part fixes the 'fs' error for your Random Forest library
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;