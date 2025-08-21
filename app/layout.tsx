import './globals.css'
import type { Metadata } from 'next'
import ResponsiveNavigation from './components/ResponsiveNavigation'

export const metadata: Metadata = {
  title: {
    default: '보석십자수 도안 변환기 - 이미지를 아름다운 도안으로',
    template: '%s | 보석십자수 도안 변환기'
  },
  description: '이미지를 업로드하여 아름다운 보석십자수 도안으로 변환하세요. DMC 색상 매칭, 실시간 미리보기, PDF 다운로드까지 모든 기능을 무료로 제공합니다.',
  keywords: [
    '보석십자수',
    '도안 변환',
    '이미지 변환',
    'DMC 색상',
    '보석십자수 패턴',
    '픽셀 아트',
    '도안 생성',
    'AI 업스케일링',
    '무료 도구',
    '보석십자수 도안'
  ],
  authors: [{ name: '보석십자수 도안 변환기' }],
  creator: '보석십자수 도안 변환기',
  publisher: '보석십자수 도안 변환기',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://beadsmapmaker.vercel.app'), // 실제 도메인으로 변경 필요
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://beadsmapmaker.vercel.app', // 실제 도메인으로 변경 필요
    title: '보석십자수 도안 변환기 - 이미지를 아름다운 도안으로',
    description: '이미지를 업로드하여 아름다운 보석십자수 도안으로 변환하세요. DMC 색상 매칭, 실시간 미리보기, PDF 다운로드까지 모든 기능을 무료로 제공합니다.',
    siteName: '보석십자수 도안 변환기',
    images: [
      {
        url: 'https://beadsmapmaker.vercel.app/images/Thumbnail.jpeg',
        width: 1200,
        height: 630,
        alt: '보석십자수 도안 변환기 썸네일 이미지',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '보석십자수 도안 변환기 - 이미지를 아름다운 도안으로',
    description: '이미지를 업로드하여 아름다운 보석십자수 도안으로 변환하세요. DMC 색상 매칭, 실시간 미리보기, PDF 다운로드까지 모든 기능을 무료로 제공합니다.',
    images: ['https://beadsmapmaker.vercel.app/images/Thumbnail.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Google Search Console에서 제공하는 코드
    yandex: 'your-yandex-verification-code', // Yandex Webmaster에서 제공하는 코드
    yahoo: 'your-yahoo-verification-code', // Yahoo Site Explorer에서 제공하는 코드
  },
  category: 'crafts',
  classification: '보석십자수 도구',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <header className="header" style={{ alignItems: 'center', backgroundColor: 'white', position: 'relative', zIndex: 10, borderBottom: '2px solid black' }}>
          <div className="container">
            <ResponsiveNavigation />
          </div>
        </header>
        <main className="main">
          <div className="container">
            {children}
          </div>
        </main>
        <footer className="footer" style={{ backgroundColor: 'white', position: 'relative', zIndex: 10, borderTop: '2px solid black' }}>
          <div className="container">
            <p>&copy; 2025 보석십자수 도안 만들기. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}