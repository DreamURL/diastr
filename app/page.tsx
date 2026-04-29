import type { Metadata } from 'next'
import HomeContent from './components/HomeContent'
import JsonLd from './components/JsonLd'

export const metadata: Metadata = {
  title: 'Diamond painting Pattern Converter',
  description: 'Welcome to the Diamond painting Pattern Converter. Upload your images to convert them into beautiful Diamond painting patterns. We provide all features for free including DMC color matching, real-time preview, and PDF download.',
  keywords: ['Diamond painting', 'pattern conversion', 'image upload', 'DMC colors', 'free tool'],
}

const SITE_URL = 'https://diastr.dreamurl.biz'

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'diastr — Diamond Painting Pattern Converter',
  alternateName: 'Diamond Painting Pattern Maker',
  url: SITE_URL,
  inLanguage: 'en',
  description:
    'Free online diamond painting pattern maker. Convert any photo or image to a diamond art pattern with accurate DMC color matching.',
}

const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'diastr Diamond Painting Pattern Converter',
  alternateName: [
    'Diamond Painting Pattern Maker',
    'Photo to Diamond Painting Converter',
    'Image to Diamond Painting Converter',
    'Diamond Art Converter',
  ],
  url: SITE_URL,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any (Web Browser)',
  browserRequirements: 'Requires JavaScript and a modern browser',
  inLanguage: 'en',
  description:
    'Upload a photo and convert it into a printable diamond painting pattern. Includes DMC color matching with CIELAB Delta E 2000, real-time preview, customizable bead count and canvas size, and PDF download.',
  featureList: [
    'Photo to diamond painting pattern conversion',
    'DMC color matching with CIELAB Delta E 2000',
    'Customizable canvas size (5cm to 200cm)',
    'Round and square bead support',
    'Adjustable color count (minimum, optimal, maximum)',
    'PDF pattern download',
    'AI image upscaling',
    'Real-time preview',
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: undefined,
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is diastr a diamond painting pattern maker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. diastr works as a free online diamond painting pattern maker. Upload any photo and the converter generates a printable pattern with matched DMC colors, ready to use as a diamond art canvas.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I convert a photo to a diamond painting pattern?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Upload a JPG, PNG, or WebP image on the homepage. The photo to diamond painting converter automatically pixelates the image, matches each pixel to the closest DMC color, and lets you adjust canvas size and bead count before exporting the pattern.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between diamond painting and diamond art?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Diamond painting and diamond art refer to the same craft — placing small resin beads on a coded canvas to recreate an image. diastr functions as both a diamond painting converter and a diamond art converter; the terms can be used interchangeably.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I download my diamond painting pattern as a PDF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. After the image to diamond painting converter generates your pattern, you can download the full pattern with DMC color codes and symbol legends as a PDF for printing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the diamond painting pattern converter free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. All features — image upload, DMC color matching, real-time preview, AI upscaling, and PDF pattern download — are free. No account or subscription is required.',
      },
    },
    {
      '@type': 'Question',
      name: 'What image types work best as diamond painting patterns?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Photos with clear subjects, strong contrast, and well-lit backgrounds convert best. The diamond painting picture converter handles portraits, pets, landscapes, and artwork; busy or low-resolution photos may need AI upscaling first.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the converter use real DMC colors?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. The pattern maker matches every pixel to an authentic DMC thread color using CIELAB Delta E 2000, so the diamond art pattern you download corresponds to actual DMC bead codes you can buy.',
      },
    },
  ],
}

const STRUCTURED_DATA = [webSiteSchema, webApplicationSchema, faqSchema]

export default function HomePage() {
  return (
    <>
      <JsonLd data={STRUCTURED_DATA} />
      <HomeContent />
    </>
  )
}
