/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  // GitHub Pages 배포를 위한 설정 - dreamurl.github.io/diastr/
  basePath: '/diastr',
  assetPrefix: '/diastr/',
}

module.exports = nextConfig