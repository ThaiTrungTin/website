import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  // Chỉ export tĩnh và đặt basePath khi deploy qua GitHub Pages (GitHub Actions)
  ...(isGithubActions
    ? {
        output: 'export' as const,
        basePath: '/website',
        trailingSlash: true,
      }
    : {}),
  images: {
    qualities: [75, 90, 95],
    unoptimized: isGithubActions,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'ntkpdadakcyugvivvsjw.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
