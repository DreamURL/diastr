import type { Metadata } from 'next'
import HomeContent from './components/HomeContent'

export const metadata: Metadata = {
  title: 'Diamond painting Pattern Converter',
  description: 'Welcome to the Diamond painting Pattern Converter. Upload your images to convert them into beautiful Diamond painting patterns. We provide all features for free including DMC color matching, real-time preview, and PDF download.',
  keywords: ['Diamond painting', 'pattern conversion', 'image upload', 'DMC colors', 'free tool'],
}

export default function HomePage() {
  return <HomeContent />
}