// client/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "path": false,
      "util": false,
    };
    return config;
  },
};

module.exports = nextConfig;
