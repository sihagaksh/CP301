import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = require('next-pwa')({
  // ─── next-pwa options ─────────────────────────────────────────────
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'iitrpr-offline-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 86400, // 1 day
        },
      },
    },
  ],

  // ─── next.js options ──────────────────────────────────────────────
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // NOTE: turbopack key is intentionally NOT here so webpack is used for
  // production builds (next-pwa requires webpack's plugin system).
  // Dev uses Turbopack via the --turbopack flag in "npm run dev".
});

export default nextConfig;
