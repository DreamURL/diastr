'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { assignIconsToColors } from '../utils/iconPlacement'
import { 
  calculateRealScaleMetrics, 
  renderRealScalePattern, 
  generateRealScaleDownload,
  validateRealScale,
  getRealScaleCSSProperties,
  type RealScaleConfig 
} from '../utils/realScaleRenderer'

interface RealImageData {
  pattern: any
  colorStatistics: Array<{
    dmcColor: any
    count: number
    percentage: number
  }> | null
  calculatedSize: {
    actualWidth: number
    actualHeight: number
    beadGridWidth: number
    beadGridHeight: number
    totalBeads: number
  } | null
  imageName: string
  beadType: 'circular' | 'square'
  beadSize?: number // mm
  previewImageUrl: string | null
  timestamp: number
}

export default function RealImagePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [patternData, setPatternData] = useState<RealImageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [canvasReady, setCanvasReady] = useState(false)
  
  // Load pattern data from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('realImagePattern')
      if (!storedData) {
        setError('도안 데이터를 찾을 수 없습니다. 도안 생성 페이지에서 다시 시도해주세요.')
        setIsLoading(false)
        return
      }
      
      const data: RealImageData = JSON.parse(storedData)
      
      // 데이터 유효성 및 구조 검증
      if (!data.pattern || !data.calculatedSize) {
        setError('도안 데이터가 손상되었습니다. 도안을 다시 생성해주세요.')
        setIsLoading(false)
        return
      }
      
      // Check data validity (not older than 1 hour)
      const oneHour = 60 * 60 * 1000
      if (Date.now() - data.timestamp > oneHour) {
        setError('도안 데이터가 만료되었습니다. 도안을 다시 생성해주세요.')
        setIsLoading(false)
        return
      }
      
      // 데이터 구조 복원 (압축된 데이터 처리)
      const restoredData = {
        ...data,
        pattern: {
          ...data.pattern,
          constrainedPixels: data.pattern.constrainedPixels || [],
          config: data.pattern.config || {
            beadGridWidth: data.calculatedSize.beadGridWidth,
            beadGridHeight: data.calculatedSize.beadGridHeight
          }
        },
        colorStatistics: data.colorStatistics || [],
        previewImageUrl: data.previewImageUrl || null, // 압축 시 제거될 수 있음
        beadSize: data.beadSize || (data.beadType === 'circular' ? 2.8 : 2.6) // 기본값 사용
      }
      
      setPatternData(restoredData)
      
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        setError('저장된 도안 데이터가 손상되었습니다. 도안을 다시 생성해주세요.')
      } else {
        setError('도안 데이터를 불러오는데 실패했습니다. 브라우저를 새로고침하고 다시 시도해주세요.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Render real-scale pattern on canvas
  useEffect(() => {
    if (!patternData || !canvasRef.current) return
    
    renderRealScalePatternPrecise()
  }, [patternData])
  
  const renderRealScalePatternPrecise = async () => {
    if (!patternData || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const { pattern, calculatedSize, beadType } = patternData
    
    try {
      // Create real-scale configuration
      const config: RealScaleConfig = {
        beadType,
        patternWidthCm: calculatedSize!.actualWidth,
        patternHeightCm: calculatedSize!.actualHeight,
        beadGridWidth: calculatedSize!.beadGridWidth,
        beadGridHeight: calculatedSize!.beadGridHeight,
        dpi: 96 // Browser standard
      }
      
      // Calculate precise metrics
      const metrics = calculateRealScaleMetrics(config)
      
      // Validate scale accuracy
      const validation = validateRealScale(
        metrics,
        calculatedSize!.actualWidth,
        calculatedSize!.actualHeight
      )
      
      // Create pattern grid and icon assignments
      const patternGrid = createPatternGridFromPattern(pattern)
      const uniqueColors: string[] = pattern?.constrainedPixels 
        ? Array.from(new Set(pattern.constrainedPixels.map((p: any) => p.selectedDMCColor.code)))
        : []
      const iconAssignments = assignIconsToColors(uniqueColors, patternGrid)
      
      // Render at precise real scale
      await renderRealScalePattern(canvas, pattern, config, iconAssignments)
      
      setCanvasReady(true)
      
    } catch (error) {
      // Fallback to basic rendering
      await renderBasicPattern()
    }
  }
  
  // Fallback rendering method
  const renderBasicPattern = async () => {
    if (!patternData || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const { pattern, calculatedSize, beadType } = patternData
    
    // Basic real scale calculation
    const beadSizeMm = patternData.beadSize || (beadType === 'circular' ? 2.8 : 2.6)
    const patternWidthMm = calculatedSize!.actualWidth * 10
    const patternHeightMm = calculatedSize!.actualHeight * 10
    const mmToPx = 96 / 25.4
    const patternWidthPx = patternWidthMm * mmToPx
    const patternHeightPx = patternHeightMm * mmToPx
    const beadSizePx = beadSizeMm * mmToPx
    
    canvas.width = patternWidthPx
    canvas.height = patternHeightPx
    canvas.style.width = `${patternWidthMm}mm`
    canvas.style.height = `${patternHeightMm}mm`
    
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, patternWidthPx, patternHeightPx)
    
    const patternGrid = createPatternGridFromPattern(pattern)
    const uniqueColors: string[] = pattern?.constrainedPixels 
      ? Array.from(new Set(pattern.constrainedPixels.map((p: any) => p.selectedDMCColor.code)))
      : []
    const iconAssignments = assignIconsToColors(uniqueColors, patternGrid)
    
    // Draw pixels and icons
    for (const pixel of pattern.constrainedPixels || []) {
      const x = pixel.x * beadSizePx
      const y = pixel.y * beadSizePx
      
      ctx.fillStyle = `rgb(${pixel.selectedDMCColor.r}, ${pixel.selectedDMCColor.g}, ${pixel.selectedDMCColor.b})`
      ctx.fillRect(x, y, beadSizePx, beadSizePx)
      
      const icon = iconAssignments.get(pixel.selectedDMCColor.code)
      if (icon) {
        const iconSizeBase = Math.max(beadSizePx * 0.6, 8)
        const fontSize = icon.isDoubleDigit 
          ? Math.round(iconSizeBase * (icon.fontSize || 0.75))
          : iconSizeBase
        
        ctx.fillStyle = '#000000'
        ctx.font = `bold ${fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        const textX = x + beadSizePx / 2
        const textY = icon.isDoubleDigit ? y + beadSizePx / 2 + 1 : y + beadSizePx / 2
        
        ctx.fillText(icon.symbol, textX, textY)
      }
    }
    
    // Draw grid
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = Math.max(0.5, beadSizePx * 0.02)
    ctx.beginPath()
    
    for (let x = 0; x <= calculatedSize!.beadGridWidth; x++) {
      const xPos = x * beadSizePx
      ctx.moveTo(xPos, 0)
      ctx.lineTo(xPos, patternHeightPx)
    }
    
    for (let y = 0; y <= calculatedSize!.beadGridHeight; y++) {
      const yPos = y * beadSizePx
      ctx.moveTo(0, yPos)
      ctx.lineTo(patternWidthPx, yPos)
    }
    
    ctx.stroke()
    
    setCanvasReady(true)
  }
  
  const createPatternGridFromPattern = (pattern: any): Array<Array<string>> => {
    if (!pattern) return []
    
    const grid: Array<Array<string>> = []
    const width = pattern.config.beadGridWidth
    const height = pattern.config.beadGridHeight
    
    for (let y = 0; y < height; y++) {
      grid[y] = new Array(width).fill('')
    }
    
    for (const pixel of pattern.constrainedPixels || []) {
      if (pixel.x < width && pixel.y < height) {
        grid[pixel.y][pixel.x] = pixel.selectedDMCColor.code
      }
    }
    
    return grid
  }
  
  const handleDownload = () => {
    if (!canvasRef.current || !patternData) return
    
    try {
      const filename = `실제크기도안_${patternData.imageName.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().slice(0, 10)}.png`
      generateRealScaleDownload(canvasRef.current, filename)
      
    } catch (error) {
      alert('이미지 다운로드에 실패했습니다.')
    }
  }
  
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(0.1, Math.min(5, newZoom)))
  }
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '1.5rem' }}>🔄 실제 크기 도안 로딩 중...</div>
        <div style={{ fontSize: '1rem', color: '#666' }}>잠시만 기다려주세요</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '2rem',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '1.5rem', color: 'red' }}>❌ {error}</div>
        <button
          onClick={() => router.push('/convert')}
          style={{
            padding: '12px 24px',
            fontSize: '1.1rem',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          도안 생성 페이지로 돌아가기
        </button>
      </div>
    )
  }
  
  if (!patternData) return null
  
  const { calculatedSize, beadType, imageName } = patternData
  const patternWidthMm = calculatedSize!.actualWidth * 10
  const patternHeightMm = calculatedSize!.actualHeight * 10
  
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '2px solid black',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
              🖼️ 실제 크기 도안 뷰어
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
              {imageName} • {calculatedSize!.actualWidth.toFixed(1)}×{calculatedSize!.actualHeight.toFixed(1)}cm • 
              {beadType === 'circular' ? '원형' : '사각형'} 비즈 • 
              {calculatedSize!.beadGridWidth}×{calculatedSize!.beadGridHeight} 격자
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Zoom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>확대:</span>
              <button 
                onClick={() => handleZoomChange(zoom - 0.1)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.9rem',
                  backgroundColor: 'transparent',
                  border: '2px solid black',
                  cursor: 'pointer'
                }}
              >
                -
              </button>
              <span style={{ 
                fontSize: '0.9rem', 
                fontWeight: 'bold',
                minWidth: '3rem',
                textAlign: 'center'
              }}>
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={() => handleZoomChange(zoom + 0.1)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.9rem',
                  backgroundColor: 'transparent',
                  border: '2px solid black',
                  cursor: 'pointer'
                }}
              >
                +
              </button>
            </div>
            
            <button
              onClick={handleDownload}
              disabled={!canvasReady}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                backgroundColor: canvasReady ? 'black' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: canvasReady ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
              }}
            >
              🎯 실제크기 도안 다운로드
            </button>
            
            <button
              onClick={() => router.back()}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                backgroundColor: 'transparent',
                color: 'black',
                border: '2px solid black',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← 돌아가기
            </button>
          </div>
        </div>
      </div>
      
      {/* Pattern Display Area */}
      <div style={{
        flex: 1,
        padding: '2rem',
        overflow: 'auto'
      }}>
        <div style={{
          backgroundColor: 'white',
          border: '2px solid black',
          borderRadius: '8px',
          padding: '2rem',
          display: 'inline-block',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            marginBottom: '1rem',
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px'
          }}>
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              📐 실제 크기 (1:1 스케일)
            </h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
              아래 도안은 실제 크기로 표시됩니다. 우클릭하여 이미지를 저장하거나 위 다운로드 버튼을 사용하세요.
            </p>
          </div>
          
          <div 
            ref={containerRef}
            style={{
              overflow: 'auto',
              maxWidth: '100%',
              maxHeight: '70vh',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px'
            }}
          >
            <div style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease'
            }}>
              <canvas
                ref={canvasRef}
                style={{
                  display: 'block',
                  border: '2px solid #333',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
                onContextMenu={(e) => {}}
              />
            </div>
          </div>
          
          {/* Pattern Info */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: '4px',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <strong>실제 크기:</strong><br/>
                {calculatedSize!.actualWidth.toFixed(1)} × {calculatedSize!.actualHeight.toFixed(1)} cm
              </div>
              <div>
                <strong>격자:</strong><br/>
                {calculatedSize!.beadGridWidth} × {calculatedSize!.beadGridHeight}
              </div>
              <div>
                <strong>총 비즈:</strong><br/>
                {calculatedSize!.totalBeads.toLocaleString()}개
              </div>
            </div>
            
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              backgroundColor: 'rgba(0,0,0,0.03)',
              borderRadius: '4px'
            }}>
              <strong>💡 사용법 안내:</strong><br/>
              • 이 도안은 실제 크기(1:1)로 표시됩니다<br/>
              • 우클릭하여 "이미지 저장"으로 다운로드하거나 위의 다운로드 버튼을 사용하세요<br/>
              • 확대/축소 버튼으로 세부사항을 확인할 수 있습니다<br/>
              • 인쇄시에도 실제 크기로 출력됩니다 (100% 크기로 인쇄 설정 필요)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}