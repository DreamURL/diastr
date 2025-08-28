/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  // GitHub Pages 배포를 위한 설정
  basePath: '/diastr',
  assetPrefix: '/diastr/',
  // 환경변수 설정
  env: {
    NEXT_PUBLIC_BASE_PATH: '/diastr'
  }
}

module.exports = nextConfig