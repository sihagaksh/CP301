/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // PWA and Performance Optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Enable SWR for better client-side caching
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Optimize for mobile PWAs
  experimental: {
    // Optimizes build for mobile
    optimizePackageImports: ["lucide-react", "@radix-ui/*"],
  },
  // PWA headers for service worker and caching
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
    {
      source: '/manifest.json',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=604800',
        },
      ],
    },
  ],
}

export default nextConfig
