'use client'

import { useEffect } from 'react'
import { useImagePixelization } from '../hooks/useImagePixelization'
import { BeadPixel, PixelizationConfig } from '../utils/imagePixelization'

interface PixelizationPreviewProps {
  imageData: string | null
  targetWidth: number
  beadType: 'circular' | 'square'
  imageWidth: number
  imageHeight: number
  onPixelizationComplete?: (pixels: BeadPixel[], config: PixelizationConfig) => void
}

export default function PixelizationPreview({
  imageData,
  targetWidth,
  beadType,
  imageWidth,
  imageHeight,
  onPixelizationComplete
}: PixelizationPreviewProps) {
  const {
    isProcessing,
    error,
    displayImageUrl,
    pixels,
    config,
    pixelizeImageFromSrc,
    getPixelizationInfo
  } = useImagePixelization()

  // Auto-pixelize when parameters change
  useEffect(() => {
    if (imageData && imageWidth > 0 && imageHeight > 0 && targetWidth > 0) {
      pixelizeImageFromSrc(imageData, {
        targetWidth,
        beadType,
        imageWidth,
        imageHeight,
        useAverageColor: true,
        maxDisplayWidth: 400,
        maxDisplayHeight: 300
      }).then(() => {
        if (onPixelizationComplete && pixels.length > 0 && config) {
          onPixelizationComplete(pixels, config)
        }
      }).catch(() => {})
    }
  }, [imageData, targetWidth, beadType, imageWidth, imageHeight, pixelizeImageFromSrc])

  const pixelizationInfo = getPixelizationInfo()

  if (!imageData) {
    return (
      <div style={{ 
        border: '2px solid black',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)'
      }}>
        <p>Upload an image to see the pixelized preview.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        border: '2px solid black',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)'
      }}>
        <p style={{ color: 'red', fontWeight: 'bold', marginBottom: '1rem' }}>
          An error occurred
        </p>
        <p style={{ fontSize: '0.9rem' }}>{error}</p>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="processing-status">
        <div className="loading-spinner" />
        <p>Pixelizing image...</p>
      </div>
    )
  }

  return (
    <div>
      <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        Pixelized Image
      </h4>
      
      {displayImageUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <img 
            src={displayImageUrl}
            alt="Pixelized preview"
            className="pixelized-image"
            style={{ 
              border: '2px solid black',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </div>
      )}
      
      {pixelizationInfo && (
        <div style={{ 
          padding: '1rem',
          border: '1px solid black',
          backgroundColor: 'rgba(0,0,0,0.05)',
          fontSize: '0.9rem'
        }}>
          <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Pixelization Info
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <strong>Final Size:</strong><br/>
              {pixelizationInfo.targetSize}
            </div>
            <div>
              <strong>Bead Grid:</strong><br/>
              {pixelizationInfo.beadGrid}
            </div>
            <div>
              <strong>Total Beads:</strong><br/>
              {pixelizationInfo.totalBeads.toLocaleString()}
            </div>
            <div>
              <strong>Bead Type:</strong><br/>
              {pixelizationInfo.beadType === 'circular' ? 'Circular' : 'Square'} ({pixelizationInfo.beadSize})
            </div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <strong>Resolution:</strong> {pixelizationInfo.beadsPerCm} beads/cm
          </div>
        </div>
      )}
      
      <div style={{ 
        marginTop: '1rem',
        padding: '0.75rem',
        border: '1px solid black',
        backgroundColor: 'rgba(0,0,0,0.02)',
        fontSize: '0.8rem'
      }}>
        <strong>💡 Tip:</strong> The pixelized image shows the basic structure of the diamond painting pattern. Color matching and icon placement are applied in the next step.
      </div>
    </div>
  )
}