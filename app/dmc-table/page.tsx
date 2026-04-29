import type { Metadata } from 'next'
import AdSideBanner from '../components/AdSideBanner'
import AdUnit from '../components/AdUnit'
import DMCFullTable from '../components/DMCFullTable'
import JsonLd from '../components/JsonLd'
import { DMC_COLORS } from '../utils/dmcColors'

export const metadata: Metadata = {
  title: 'Full DMC Color Chart — All DMC Thread Colors with RGB & HEX',
  description:
    'Complete DMC color chart with every DMC thread code, color name, RGB value, and HEX code. A reference for diamond painting pattern conversion, cross stitch, and embroidery projects.',
  keywords: [
    'DMC color chart',
    'DMC thread colors',
    'DMC color list',
    'DMC color codes',
    'DMC RGB',
    'DMC HEX',
    'diamond painting DMC chart',
    'cross stitch DMC chart',
    'embroidery DMC reference',
  ],
  alternates: {
    canonical: 'https://diastr.dreamurl.biz/dmc-table',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://diastr.dreamurl.biz/dmc-table',
    title: 'Full DMC Color Chart — All DMC Thread Colors with RGB & HEX',
    description:
      'Complete DMC color chart with every DMC thread code, color name, RGB value, and HEX code.',
    siteName: 'Diamond painting Pattern Converter',
    images: [
      {
        url: '/images/Thumbnail.jpeg',
        width: 1200,
        height: 630,
        alt: 'Full DMC Color Chart — diastr',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Full DMC Color Chart — All DMC Thread Colors with RGB & HEX',
    description:
      'Complete DMC color chart with every DMC thread code, color name, RGB value, and HEX code.',
    images: ['/images/Thumbnail.jpeg'],
  },
}

// AdSense slot ID — single account, reused across the site (same as utility-village)
const ADSENSE_SLOT = '8504504766'
const SLOT_LEFT_BANNER = ADSENSE_SLOT
const SLOT_RIGHT_BANNER = ADSENSE_SLOT
const SLOT_INLINE_TOP = ADSENSE_SLOT
const SLOT_INLINE_BOTTOM = ADSENSE_SLOT

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Full DMC Color Chart',
  description: `Complete database of ${DMC_COLORS.length} DMC thread colors with RGB and HEX values, used for diamond painting, cross stitch, and embroidery.`,
  url: 'https://diastr.dreamurl.biz/dmc-table',
  inLanguage: 'en',
  keywords: 'DMC color chart, DMC thread colors, DMC RGB, DMC HEX, diamond painting',
  variableMeasured: ['DMC Code', 'Color Name', 'RGB', 'HEX'],
  creator: {
    '@type': 'Organization',
    name: 'diastr',
    url: 'https://diastr.dreamurl.biz',
  },
}

export default function DMCTablePage() {
  return (
    <>
      <JsonLd data={SCHEMA} />
      <AdSideBanner side="left" slot={SLOT_LEFT_BANNER} />
      <AdSideBanner side="right" slot={SLOT_RIGHT_BANNER} />

      <div
        className="dmc-table-page"
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: 'clamp(1rem, 4vw, 2.5rem)',
          fontFamily: 'Baskervville, serif',
          fontWeight: 500,
          color: 'black',
        }}
      >
        <header style={{ marginTop: '200px', marginBottom: '2rem', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
              fontWeight: 700,
              fontFamily: 'Baskervville, serif',
              marginBottom: '0.75rem',
            }}
          >
            Full DMC Color Chart
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
              opacity: 0.8,
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            All {DMC_COLORS.length.toLocaleString()} DMC thread colors with their official codes,
            color names, RGB values, and HEX codes. The same color database used by the diastr
            diamond painting pattern converter.
          </p>
        </header>

        {/* Top inline ad */}
        <div style={{ margin: '0 auto 1.5rem', textAlign: 'center' }}>
          <AdUnit
            slot={SLOT_INLINE_TOP}
            format="auto"
            style={{ display: 'block', minHeight: '90px' }}
          />
        </div>

        <DMCFullTable />

        {/* Bottom inline ad */}
        <div style={{ margin: '1.5rem auto 0', textAlign: 'center' }}>
          <AdUnit
            slot={SLOT_INLINE_BOTTOM}
            format="auto"
            style={{ display: 'block', minHeight: '90px' }}
          />
        </div>
      </div>
    </>
  )
}
