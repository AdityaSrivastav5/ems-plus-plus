/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        '@apollo/client': '@apollo/client/index.js',
      },
    },
  },
};

export default nextConfig;
