import './globals.css'
import type { Metadata } from 'next'
import PillNav from './components/PillNav'
import GoogleAnalytics from './components/GoogleAnalytics'

// OG/트위터 썸네일 URL. 빌드마다 값이 바뀌면(Date.now() 등) 소셜 플랫폼의
// 이미지 캐시가 매번 무효화되므로 고정 값을 쓴다.
// 썸네일 이미지를 실제로 교체했을 때만 아래 숫자를 수동으로 올릴 것.
const OG_IMAGE_URL = '/images/Thumbnail.jpeg?v=1'

export const metadata: Metadata = {
  title: {
    default: 'Diamond painting Pattern Converter - Transform Images into Beautiful Patterns',
    template: '%s | Diamond painting Pattern Converter'
  },
  description: 'Upload an image to convert it into a beautiful Diamond painting pattern. DMC color matching, real-time preview, PDF download - all features available for free.',
  keywords: [
    'Diamond painting',
    'pattern conversion',
    'image conversion',
    'DMC colors',
    'Diamond painting patterns',
    'pixel art',
    'pattern generation',
    'AI upscaling',
    'free tools',
    'Diamond painting patterns'
  ],
  authors: [{ name: 'Diamond painting Pattern Converter' }],
  creator: 'Diamond painting Pattern Converter',
  publisher: 'Diamond painting Pattern Converter',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://diastr.dreamurl.biz'),
  // canonical 은 여기(루트 레이아웃)에 두지 않는다.
  // metadata 를 선언하지 않은 하위 페이지가 이 값을 그대로 상속받아
  // 모든 페이지가 홈으로 canonical 되는 문제가 생긴다. 각 페이지에서 개별 선언할 것.
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://diastr.dreamurl.biz/',
    title: 'Diamond painting Pattern Converter - Transform Images into Beautiful Patterns',
    description: 'Upload an image to convert it into a beautiful Diamond painting pattern. DMC color matching, real-time preview, PDF download - all features available for free.',
    siteName: 'Diamond painting Pattern Converter',
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Diamond painting Pattern Converter thumbnail image',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diamond painting Pattern Converter - Transform Images into Beautiful Patterns',
    description: 'Upload an image to convert it into a beautiful Diamond painting pattern. DMC color matching, real-time preview, PDF download - all features available for free.',
    images: [OG_IMAGE_URL],
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
    google: '8ffBOQzpKmyUUZgcFGz8hQ1Fn4S2uKyG5rirawBZWLg',
  },
  category: 'crafts',
  classification: 'Diamond painting Tools',
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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body style={{ fontFamily: 'Baskervville, serif', fontWeight: '500' }}>
        <GoogleAnalytics />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}>
          <PillNav
            items={[
              { label: 'Home', href: '/' },
              { label: 'Convert', href: '/convert' },
              { label: 'How to Use', href: '/use' },
              { label: 'Upscaling', href: '/gallery' },
              { label: 'DMC Table', href: '/dmc-table' }
            ]}
            className="custom-nav"
            ease="power2.easeOut"
            baseColor="#000000"
            pillColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#000000"
          />
        </div>
        <main className="main-overlay">
          {children}
        </main>
      </body>
    </html>
  )
}