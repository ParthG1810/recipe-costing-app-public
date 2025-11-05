import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Skip TypeScript errors during build for demo
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build for demo
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
