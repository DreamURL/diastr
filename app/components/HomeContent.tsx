'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ImageUpload from './ImageUpload'
import { storeImageUnlimited } from '../utils/imageStorageUnlimited'

export default function HomeContent() {
  const router = useRouter()
  
  const handleImageUpload = async (file: File) => {
    try {
      const result = await storeImageUnlimited(file, 'uploadedImage')
      if (result.success) {
        router.push('/convert')
      } else {
        throw new Error('Failed to save image.')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save image.'
      alert(`Image upload failed: ${errorMessage}\n\nThis may be due to browser limitations.\nPlease refresh the page and try again.`) 
    }
  }

  return (
    <div className="home-layout">
      {/* Upload Section */}
      <div className="home-section home-upload-section">
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: 'clamp(5rem, 5vw, 5rem)', 
            fontWeight: '700', 
            fontFamily: 'Basteleur, serif',
            color: 'black', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            diastr
          </h1>
          <h2 style={{ 
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', 
            fontWeight: '500', 
            fontFamily: 'Baskervville, serif',
            color: 'black', 
            marginBottom: '1rem' 
          }}>
            Diamond Painting Pattern Converter
          </h2>
          <p style={{ 
            fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', 
            fontFamily: 'Baskervville, serif',
            fontWeight: '500',
            color: 'black', 
            lineHeight: '1.6', 
            opacity: '0.8' 
          }}>
            Upload an image to convert it into a beautiful Diamond painting pattern
          </p>
        </div>
        <div className="upload-container">
          <ImageUpload onImageUpload={handleImageUpload} />
        </div>
        <p style={{ 
          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', 
          fontFamily: 'Baskervville, serif',
          fontWeight: '500',
          color: 'black', 
          opacity: '0.6', 
          marginTop: '2rem', 
          textAlign: 'center' 
        }}>
          Supports JPG, PNG, WebP formats
        </p>
      </div>

      {/* Gallery Section */}
      <div 
        className="home-section home-gallery-section" 
        role="img"
        aria-label="Diamond painting pattern conversion before and after comparison"
      >
        <div className="gallery-images-container">
          <div className="image-with-label">
            <div className="image-label" style={{ fontFamily: 'Baskervville, serif', fontWeight: '700' }}>Before</div>
            <Image
              src="/images/main_left.jpg"
              alt="Original image - before Diamond painting conversion"
              width={600}
              height={600}
              className="home-gallery-image"
              priority
              sizes="(max-width: 480px) 200px, (max-width: 768px) 250px, 320px"
            />
          </div>
          <div className="image-with-label">
            <div className="image-label" style={{ fontFamily: 'Baskervville, serif', fontWeight: '700' }}>After</div>
            <Image
              src="/images/main_right.jpeg"
              alt="Conversion result - Diamond painting pattern"
              width={600}
              height={600}
              className="home-gallery-image"
              loading="lazy"
              sizes="(max-width: 480px) 200px, (max-width: 768px) 250px, 320px"
            />
          </div>
        </div>
      </div>
    </div>
  )
}