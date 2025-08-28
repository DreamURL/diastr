/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },

  basePath: '/diastr',
  assetPrefix: '/diastr/',
}

module.exports = nextConfig