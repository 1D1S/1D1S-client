/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

const imageBaseUrls = [
  process.env.NEXT_PUBLIC_ODOS_IMAGE_URL,
  process.env.NEXT_PUBLIC_ODOS_IMAGE_BASE_URL,
  process.env.NEXT_PUBLIC_ODOS_API_URL,
].filter((value): value is string => Boolean(value));

const imageHostnames = Array.from(
  new Set(
    imageBaseUrls
      .map((value) => {
        try {
          return new URL(value).hostname;
        } catch {
          return null;
        }
      })
      .filter((hostname): hostname is string => Boolean(hostname))
  )
);

const imageDomains = Array.from(
  new Set([...imageHostnames, 'placehold.co', 'localhost', 'picsum.photos'])
);

const nextConfig = {
  images: {
    dangerouslyAllowSVG: isDev,
    domains: imageDomains,
    remotePatterns: [
      ...imageHostnames.map((hostname) => ({
        protocol: 'https',
        hostname,
        pathname: '/**',
      })),
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
