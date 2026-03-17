import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
    resolveAlias: {
      // Force Turbopack to resolve these CSS packages from our local node_modules
      // This is needed because /home/sihagaksh/package.json (Jupyter) confuses
      // Turbopack's monorepo root detection.
      'tailwindcss': resolve(__dirname, 'node_modules/tailwindcss'),
      'tw-animate-css': resolve(__dirname, 'node_modules/tw-animate-css'),
    },
  },
}

export default nextConfig
