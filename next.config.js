/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure API routes are never statically optimized
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
};

module.exports = nextConfig;
