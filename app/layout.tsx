import './globals.css'
import type { Metadata } from 'next'
import PillNav from './components/PillNav'

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
  metadataBase: new URL('https://dreamurl.github.io/diastr'), 
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dreamurl.github.io/diastr', 
    title: 'Diamond painting Pattern Converter - Transform Images into Beautiful Patterns',
    description: 'Upload an image to convert it into a beautiful Diamond painting pattern. DMC color matching, real-time preview, PDF download - all features available for free.',
    siteName: 'Diamond painting Pattern Converter',
    images: [
      {
        url: 'https://dreamurl.github.io/diastr/images/Thumbnail.jpeg?v=2',
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
    images: ['https://dreamurl.github.io/diastr/images/Thumbnail.jpeg?v=2'],
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
    google: 'your-google-verification-code', 
    yandex: 'your-yahoo-verification-code', 
    yahoo: 'your-yahoo-verification-code', 
  },
  category: 'crafts',
  classification: 'Diamond painting Tools',
  manifest: '/diastr/manifest.json',
  icons: {
    icon: [
      { url: '/diastr/favicon.ico', sizes: 'any' },
      { url: '/diastr/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/diastr/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/diastr/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
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
        <link rel="icon" href="/diastr/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/diastr/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/diastr/icons/icon-192x192.png" />
      </head>
      <body style={{ fontFamily: 'Baskervville, serif', fontWeight: '500' }}>
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
              { label: 'Upscaling', href: '/gallery' }
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