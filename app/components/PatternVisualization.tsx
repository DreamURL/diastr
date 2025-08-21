'use client'

import { useEffect, useRef, useState } from 'react'
import { DMCFirstPattern } from '../hooks/useDMCFirstPatternGeneration'
import { 
  renderPatternToCanvas, 
  createPatternLegend,
  canvasToDataURL,
} from '../utils/patternVisualization'
import { 
  createWebPreviewSVG,
  createDetailedSVG 
} from '../utils/svgPatternVisualization'

interface PatternVisualizationProps {
  pattern: DMCFirstPattern
  showGrid?: boolean
  showIcons?: boolean
  showColors?: boolean
  scale?: number
  showLegend?: boolean
  className?: string
  useSVG?: boolean  // 🚀 NEW: Use SVG rendering instead of Canvas
  maxSize?: number  // Maximum size for SVG rendering (default: 800px)
}

export default function PatternVisualization({
  pattern,
  showGrid = true,
  showIcons = true,
  showColors = true,
  scale = 15,
  showLegend = false,
  className = '',
  useSVG = true,  // 🚀 Default to SVG for better quality and performance
  maxSize = 800
}: PatternVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const legendRef = useRef<HTMLCanvasElement>(null)
  const [patternUrl, setPatternUrl] = useState<string>('')
  const [legendUrl, setLegendUrl] = useState<string>('')
  const [renderStats, setRenderStats] = useState<any>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [renderError, setRenderError] = useState<string>('')

  useEffect(() => {
    if (!pattern) return

    const renderPattern = async () => {
      setIsRendering(true)
      setRenderError('')
      
      try {
        if (useSVG) {
          // 🚀 NEW: SVG rendering for lightweight, scalable patterns
          console.log('🎨 Rendering pattern with SVG (lightweight & scalable)...')
          
          const svgDataUrl = await createWebPreviewSVG(pattern, maxSize)
          setPatternUrl(svgDataUrl)
          
          // Set basic stats for SVG rendering
          setRenderStats({
            width: pattern.config.beadGridWidth,
            height: pattern.config.beadGridHeight,
            totalCells: pattern.config.beadGridWidth * pattern.config.beadGridHeight,
            uniqueColors: pattern.dmcPalette.selectedColors.length,
            renderType: 'SVG',
            fileSize: svgDataUrl.length
          })

          // Note: SVG legends not implemented yet, fallback to canvas if needed
          if (showLegend) {
            console.log('⚠️ SVG legend not implemented, using canvas fallback')
            const uniqueColors = Array.from(new Set(pattern.constrainedPixels.map(p => p.selectedDMCColor.code)))
            const { iconAssignments } = await import('../utils/iconPlacement').then(module => ({
              iconAssignments: module.assignIconsToColors(uniqueColors, [])
            }))
            const legendCanvas = createPatternLegend(pattern, iconAssignments, 40)
            const legendDataUrl = canvasToDataURL(legendCanvas)
            setLegendUrl(legendDataUrl)
          }

        } else {
          // 🔄 Fallback: Canvas rendering (original method)
          console.log('🖼️ Rendering pattern with Canvas (fallback mode)...')
          
          const { canvas, iconAssignments, stats } = await renderPatternToCanvas(pattern, {
            scale,
            showGrid,
            showIcons,
            showColors,
            iconSize: Math.max(8, scale - 4),
            gridLineWidth: 1,
            backgroundColor: '#ffffff',
            gridColor: '#000000',
            iconColor: '#000000'
          })

          const url = canvasToDataURL(canvas)
          setPatternUrl(url)
          setRenderStats({ ...stats, renderType: 'Canvas' })

          // Create legend if requested
          if (showLegend) {
            const legendCanvas = createPatternLegend(pattern, iconAssignments, 40)
            const legendDataUrl = canvasToDataURL(legendCanvas)
            setLegendUrl(legendDataUrl)
          }
        }

      } catch (error) {
        console.error('Pattern rendering failed:', error)
        setRenderError(`렌더링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
        
        // Auto-fallback: If SVG fails, try Canvas
        if (useSVG && !renderError) {
          console.log('🔄 SVG 렌더링 실패, Canvas로 자동 폴백...')
          try {
            const { canvas, iconAssignments, stats } = await renderPatternToCanvas(pattern, {
              scale,
              showGrid,
              showIcons,
              showColors,
              iconSize: Math.max(8, scale - 4),
              gridLineWidth: 1,
              backgroundColor: '#ffffff',
              gridColor: '#000000',
              iconColor: '#000000'
            })

            const url = canvasToDataURL(canvas)
            setPatternUrl(url)
            setRenderStats({ ...stats, renderType: 'Canvas (fallback)' })
            setRenderError('')  // Clear error since fallback worked
          } catch (fallbackError) {
            console.error('Canvas fallback also failed:', fallbackError)
            setRenderError('SVG와 Canvas 렌더링 모두 실패')
          }
        }
      } finally {
        setIsRendering(false)
      }
    }

    renderPattern()
  }, [pattern, showGrid, showIcons, showColors, scale, showLegend, useSVG, maxSize])

  if (isRendering) {
    return (
      <div className={`pattern-visualization loading ${className}`}>
        <div className="loading-spinner" />
        <p>{useSVG ? '🎨 SVG 패턴 렌더링 중...' : '🖼️ Canvas 패턴 렌더링 중...'}</p>
      </div>
    )
  }

  if (renderError) {
    return (
      <div className={`pattern-visualization error ${className}`}>
        <div style={{
          padding: '1rem',
          border: '2px solid #dc3545',
          borderRadius: '4px',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          color: '#dc3545'
        }}>
          <h4>⚠️ 렌더링 오류</h4>
          <p>{renderError}</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            새로고침하거나 다른 설정으로 다시 시도해보세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`pattern-visualization ${className}`}>
      {/* Main Pattern */}
      <div className="pattern-main" style={{ marginBottom: '1rem' }}>

        {patternUrl ? (
          <div>
            <div style={{ border: '2px solid black', display: 'inline-block' }}>
              <img 
                src={patternUrl}
                alt="Cross Stitch Pattern"
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
            
            {/* 🚀 Render info badge */}
            {renderStats && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: renderStats.renderType === 'SVG' ? 'rgba(139,92,246,0.1)' : 'rgba(0,123,255,0.1)',
                border: `1px solid ${renderStats.renderType === 'SVG' ? '#8b5cf6' : '#007bff'}`,
                borderRadius: '12px',
                fontSize: '0.7rem',
                display: 'inline-block',
                color: renderStats.renderType === 'SVG' ? '#8b5cf6' : '#007bff',
                fontWeight: 'bold'
              }}>
                {renderStats.renderType === 'SVG' ? '🎨 SVG (가벼움)' : 
                 renderStats.renderType === 'Canvas (fallback)' ? '🔄 Canvas (폴백)' : 
                 '🖼️ Canvas'}
                {renderStats.fileSize && ` • ${Math.round(renderStats.fileSize / 1024)}KB`}
              </div>
            )}
          </div>
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
            <p>잠시만 기다려 주세요.</p>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && legendUrl && (
        <div className="pattern-legend">
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            색상 범례
          </h4>
          <div style={{ border: '2px solid black', display: 'inline-block' }}>
            <img 
              src={legendUrl}
              alt="Pattern Legend"
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}