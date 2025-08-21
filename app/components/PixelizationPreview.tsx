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
        <p>이미지를 업로드하면 픽셀화 미리보기가 표시됩니다.</p>
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
          오류가 발생했습니다
        </p>
        <p style={{ fontSize: '0.9rem' }}>{error}</p>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="processing-status">
        <div className="loading-spinner" />
        <p>이미지를 픽셀화하는 중...</p>
      </div>
    )
  }

  return (
    <div>
      <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        픽셀화된 이미지
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
            픽셀화 정보
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <strong>완성 크기:</strong><br/>
              {pixelizationInfo.targetSize}
            </div>
            <div>
              <strong>비즈 격자:</strong><br/>
              {pixelizationInfo.beadGrid}
            </div>
            <div>
              <strong>총 비즈 개수:</strong><br/>
              {pixelizationInfo.totalBeads.toLocaleString()}개
            </div>
            <div>
              <strong>비즈 종류:</strong><br/>
              {pixelizationInfo.beadType === 'circular' ? '원형' : '사각형'} ({pixelizationInfo.beadSize})
            </div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <strong>해상도:</strong> {pixelizationInfo.beadsPerCm} 비즈/cm
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
        <strong>💡 팁:</strong> 픽셀화된 이미지는 실제 보석십자수 도안의 기본 구조를 보여줍니다. 
        다음 단계에서 색상 매칭과 아이콘 배치가 적용됩니다.
      </div>
    </div>
  )
}