'use client'

import { useState } from 'react'
import PatternVisualization from './PatternVisualization'
import { BeadPixel, PixelizationConfig } from '../utils/imagePixelization'
import { DMCFirstPattern } from '../hooks/useDMCFirstPatternGeneration'

interface PreviewPanelProps {
  imageData: string
  targetWidth: number
  beadType: 'circular' | 'square'
  colorCount: number
  imageWidth: number
  imageHeight: number
  dmcPattern?: DMCFirstPattern | null
  dmcPreviewUrl?: string | null
  isGeneratingPattern?: boolean
  calculatedSize?: {
    actualWidth: number
    actualHeight: number
    beadGridWidth: number
    beadGridHeight: number
    totalBeads: number
  } | null
}

export default function PreviewPanel({ 
  imageData,
  targetWidth,
  beadType,
  colorCount,
  imageWidth,
  imageHeight,
  dmcPattern,
  dmcPreviewUrl,
  isGeneratingPattern = false,
  calculatedSize
}: PreviewPanelProps) {
  const [pixelizationData, setPixelizationData] = useState<{
    pixels: BeadPixel[]
    config: PixelizationConfig
  } | null>(null)

  // calculatedSize가 있으면 사용, 없으면 기존 방식으로 계산
  const actualWidth = calculatedSize?.actualWidth ?? (() => {
    const beadSizeMm = beadType === 'circular' ? 2.8 : 2.6
    const beadsPerCm = 10 / beadSizeMm
    const beadGridWidth = Math.round(targetWidth * beadsPerCm)
    return beadGridWidth / beadsPerCm
  })()
  
  const actualHeight = calculatedSize?.actualHeight ?? (() => {
    const aspectRatio = imageHeight / imageWidth
    const beadSizeMm = beadType === 'circular' ? 2.8 : 2.6
    const beadsPerCm = 10 / beadSizeMm
    const targetHeight = targetWidth * aspectRatio
    const beadGridHeight = Math.round(targetHeight * beadsPerCm)
    return beadGridHeight / beadsPerCm
  })()
  
  const beadGridWidth = calculatedSize?.beadGridWidth ?? (() => {
    const beadSizeMm = beadType === 'circular' ? 2.8 : 2.6
    const beadsPerCm = 10 / beadSizeMm
    return Math.round(targetWidth * beadsPerCm)
  })()
  
  const beadGridHeight = calculatedSize?.beadGridHeight ?? (() => {
    const aspectRatio = imageHeight / imageWidth
    const beadSizeMm = beadType === 'circular' ? 2.8 : 2.6
    const beadsPerCm = 10 / beadSizeMm
    const targetHeight = targetWidth * aspectRatio
    return Math.round(targetHeight * beadsPerCm)
  })()
  
  const totalBeads = calculatedSize?.totalBeads ?? (beadGridWidth * beadGridHeight)

  const handlePixelizationComplete = (pixels: BeadPixel[], config: PixelizationConfig) => {
    setPixelizationData({ pixels, config })
  }
  
  return (
    <div>
      <div className="mb-4">
        {isGeneratingPattern ? (
          <div className="processing-status" style={{ height: '200px' }}>
            <div className="loading-spinner" />
            <p>DMC 색상 매칭 중...</p>
          </div>
        ) : dmcPattern ? (
          <PatternVisualization
            pattern={dmcPattern}
            showGrid={false}  // 🎯 Clean preview: No grid lines
            showIcons={false}  // 🎨 Clean preview: Show colors only
            showColors={true}
            scale={12}
            showLegend={false}
            useSVG={true}  // 🚀 Use SVG for lightweight, scalable preview
            maxSize={600}  // Optimized for preview panel
          />
        ) : (
          <div style={{ 
            width: '300px',
            height: '200px',
            border: '2px solid black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}>
            <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>
              {colorCount}색 DMC 도안<br/>
              {pixelizationData ? '"도안 만들기" 버튼을 눌러주세요' : '(픽셀화 완료 후 생성 가능)'}
            </p>
          </div>
        )}
      </div>
      
      {/* 계산된 크기 정보 표시 */}
      {calculatedSize && (
        <div style={{ 
          padding: '1rem', 
          border: '1px solid black', 
          backgroundColor: 'rgba(0,0,0,0.05)',
          fontSize: '0.9rem',
          marginTop: '1rem'
        }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>도안 크기 정보</h4>
          <p>실제 가로: {calculatedSize.actualWidth.toFixed(2)}cm</p>
          <p>실제 세로: {calculatedSize.actualHeight.toFixed(2)}cm</p>
          <p>비즈 격자: {calculatedSize.beadGridWidth} × {calculatedSize.beadGridHeight}</p>
          <p>총 비즈 개수: {calculatedSize.totalBeads.toLocaleString()}개</p>
        </div>
      )}
    </div>
  )
}