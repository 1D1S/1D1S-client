// next.config.js
/** @type {import('next').NextConfig} */
const dev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  images: {
    dangerouslyAllowSVG: dev,
    domains: dev ? ['placehold.co', 'localhost'] : ['my-production-domain.com'],
  },
};

module.exports = nextConfig;
