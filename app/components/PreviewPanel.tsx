'use client'

import { useState, useRef, useEffect } from 'react'
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
  colorStatistics?: Array<{
    dmcColor: { code: string; r: number; g: number; b: number }
    percentage: number
    count: number
  }> | null
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
  calculatedSize,
  colorStatistics
}: PreviewPanelProps) {
  const [pixelizationData, setPixelizationData] = useState<{
    pixels: BeadPixel[]
    config: PixelizationConfig
  } | null>(null)

  // Container size tracking for responsive image scaling
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 400, height: 300 })

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

  // Measure container size for responsive image scaling
  useEffect(() => {
    const updateContainerSize = () => {
      if (imageContainerRef.current) {
        const rect = imageContainerRef.current.getBoundingClientRect()
        setContainerSize({
          width: Math.floor(rect.width - 40), // Account for padding and border
          height: Math.floor(rect.height - 40)
        })
      }
    }

    // Initial measurement
    updateContainerSize()

    // Setup ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver(updateContainerSize)
    if (imageContainerRef.current) {
      resizeObserver.observe(imageContainerRef.current)
    }

    // Cleanup
    return () => {
      if (imageContainerRef.current) {
        resizeObserver.unobserve(imageContainerRef.current)
      }
      resizeObserver.disconnect()
    }
  }, [])

  // Calculate optimal maxSize based on container dimensions
  const optimalMaxSize = Math.min(containerSize.width, containerSize.height, 800)
  
  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'Baskervville, serif',
      fontWeight: '500'
    }}>
      {/* Preview Image Area - 5/6 of height */}
      <div 
        ref={imageContainerRef}
        style={{ 
          flex: 5, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden', // Contain image within bounds
          marginBottom: '0.5rem',
          padding: '4px',
          minHeight: 0, // Ensure flex child can shrink
          maxHeight: '100%' // Enforce height boundary
        }}
      >
        {isGeneratingPattern ? (
          <div className="processing-status" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}>
            <div className="loading-spinner" />
            <p style={{ 
              fontFamily: 'Baskervville, serif',
              fontWeight: '500',
              fontSize: '1rem',
              marginTop: '1rem'
            }}>Matching DMC Colors...</p>
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
            maxSize={optimalMaxSize}  // Dynamic size based on container
          />
        ) : (
          <div style={{ 
            width: '80%',
            height: '80%',
            border: '2px solid black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px'
          }}>
            <p style={{ 
              fontSize: '0.9rem', 
              textAlign: 'center',
              fontFamily: 'Baskervville, serif',
              fontWeight: '500',
              lineHeight: '1.4'
            }}>
              {colorCount} Color DMC Pattern<br/>
              {pixelizationData ? 'Click "Generate Pattern" button' : '(Available after pixelization)'}
            </p>
          </div>
        )}
      </div>
      
      {/* Information Area - 1/6 of height (Size Info + Pattern Statistics) */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        gap: '0.5rem',
        overflow: 'hidden'
      }}>
        {/* Pattern Size Information - Left Half */}
        <div style={{ 
          flex: 1,
          border: '1px solid black', 
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderRadius: '4px',
          padding: '0.5rem',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h4 style={{ 
            fontWeight: '700', 
            marginBottom: '0.25rem',
            fontSize: '0.9rem',
            fontFamily: 'Baskervville, serif',
            margin: '0 0 0.25rem 0'
          }}>Pattern Size Information</h4>
          
          <div style={{ 
            fontSize: '0.75rem',
            fontFamily: 'Baskervville, serif',
            fontWeight: '500',
            lineHeight: '1.2',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem',
            overflow: 'auto'
          }}>
            <p style={{ margin: 0 }}>Width: {calculatedSize?.actualWidth.toFixed(2) ?? actualWidth.toFixed(2)}cm</p>
            <p style={{ margin: 0 }}>Height: {calculatedSize?.actualHeight.toFixed(2) ?? actualHeight.toFixed(2)}cm</p>
            <p style={{ margin: 0 }}>Grid: {calculatedSize?.beadGridWidth ?? beadGridWidth} × {calculatedSize?.beadGridHeight ?? beadGridHeight}</p>
            <p style={{ margin: 0 }}>Total: {(calculatedSize?.totalBeads ?? totalBeads).toLocaleString()}</p>
          </div>
        </div>

        {/* Pattern Statistics - Right Half */}
        <div style={{ 
          flex: 1,
          border: '1px solid black', 
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderRadius: '4px',
          padding: '0.5rem',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h4 style={{ 
            fontWeight: '700', 
            marginBottom: '0.25rem',
            fontSize: '0.9rem',
            fontFamily: 'Baskervville, serif',
            margin: '0 0 0.25rem 0'
          }}>Pattern Statistics</h4>
          
          {dmcPattern && colorStatistics ? (
            <div style={{ 
              fontSize: '0.75rem',
              fontFamily: 'Baskervville, serif',
              fontWeight: '500',
              lineHeight: '1.2',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
              overflow: 'auto'
            }}>
              <p style={{ margin: 0 }}>Colors: {dmcPattern.statistics.guaranteedColors}</p>
              <p style={{ margin: 0 }}>Quality: {(dmcPattern.statistics.selectionQuality * 100).toFixed(1)}%</p>
              <div style={{ marginTop: '0.15rem' }}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.7rem' }}>Main Colors:</p>
                {colorStatistics.slice(0, 2).map((stat, index) => (
                  <p key={stat.dmcColor.code} style={{ margin: 0, fontSize: '0.65rem' }}>
                    DMC {stat.dmcColor.code}: {stat.percentage.toFixed(1)}%
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ 
              fontSize: '0.75rem',
              fontFamily: 'Baskervville, serif',
              fontWeight: '500',
              color: '#666',
              textAlign: 'center',
              marginTop: '0.5rem'
            }}>
              Available after pattern generation
            </div>
          )}
        </div>
      </div>
    </div>
  )
}