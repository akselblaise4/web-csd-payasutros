/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Prevents X-Powered-By header leakage
  images: {
    unoptimized: true, // Suitable for local images and Liga B API image URLs
  },
};

module.exports = nextConfig;
