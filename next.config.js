/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  // 환경변수 설정
  env: {
    NEXT_PUBLIC_BASE_PATH: ''
  }
}

module.exports = nextConfig