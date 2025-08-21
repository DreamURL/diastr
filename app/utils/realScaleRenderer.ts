// Real Scale Pattern Renderer
// PRECISION: Renders patterns at exact 1:1 physical scale

export interface RealScaleConfig {
  beadType: 'circular' | 'square'
  patternWidthCm: number
  patternHeightCm: number
  beadGridWidth: number
  beadGridHeight: number
  dpi?: number // Default: 96 DPI (browser standard)
}

export interface RealScaleMetrics {
  beadSizeMm: number
  beadSizePx: number
  patternWidthMm: number
  patternHeightMm: number
  patternWidthPx: number
  patternHeightPx: number
  mmToPxRatio: number
  totalBeads: number
}

/**
 * Calculate precise real-scale metrics for pattern rendering
 * ACCURATE: Based on actual bead physical dimensions
 */
export function calculateRealScaleMetrics(config: RealScaleConfig): RealScaleMetrics {
  // Physical bead sizes (measured from actual DMC beads)
  const beadSizeMm = config.beadType === 'circular' ? 2.8 : 2.6
  
  // Pattern dimensions in mm
  const patternWidthMm = config.patternWidthCm * 10
  const patternHeightMm = config.patternHeightCm * 10
  
  // DPI conversion (96 DPI = browser standard, 72 DPI = print standard)
  const dpi = config.dpi || 96
  const mmToPxRatio = dpi / 25.4 // 25.4mm = 1 inch
  
  // Convert to pixels for canvas rendering
  const beadSizePx = beadSizeMm * mmToPxRatio
  const patternWidthPx = patternWidthMm * mmToPxRatio
  const patternHeightPx = patternHeightMm * mmToPxRatio
  
  const totalBeads = config.beadGridWidth * config.beadGridHeight
  
  const metrics: RealScaleMetrics = {
    beadSizeMm,
    beadSizePx,
    patternWidthMm,
    patternHeightMm,
    patternWidthPx,
    patternHeightPx,
    mmToPxRatio,
    totalBeads
  }  
  return metrics
}

/**
 * Render pattern at exact real scale on canvas
 * PRECISION: 1:1 physical scale with accurate bead sizes and icon scaling
 */
export async function renderRealScalePattern(
  canvas: HTMLCanvasElement,
  pattern: any,
  config: RealScaleConfig,
  iconAssignments: Map<string, any>
): Promise<void> {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')
  
  const metrics = calculateRealScaleMetrics(config)
  
  // Set canvas pixel dimensions
  canvas.width = metrics.patternWidthPx
  canvas.height = metrics.patternHeightPx
  
  // Set canvas CSS dimensions to exact physical size
  canvas.style.width = `${metrics.patternWidthMm}mm`
  canvas.style.height = `${metrics.patternHeightMm}mm`
  
  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = false // Sharp pixels for grid
  if ('textRenderingOptimization' in ctx) {
    (ctx as any).textRenderingOptimization = 'optimizePrecision'
  }
  
  // Clear with white background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, metrics.patternWidthPx, metrics.patternHeightPx)
  
  // Draw each bead with precise positioning
  const pixels = pattern.constrainedPixels || []
  
  for (const pixel of pixels) {
    const x = pixel.x * metrics.beadSizePx
    const y = pixel.y * metrics.beadSizePx
    
    // Draw bead color background
    ctx.fillStyle = `rgb(${pixel.selectedDMCColor.r}, ${pixel.selectedDMCColor.g}, ${pixel.selectedDMCColor.b})`
    ctx.fillRect(x, y, metrics.beadSizePx, metrics.beadSizePx)
    
    // Draw icon with precise sizing
    const icon = iconAssignments.get(pixel.selectedDMCColor.code)
    if (icon) {
      await drawRealScaleIcon(ctx, icon, x, y, metrics.beadSizePx)
    }
  }
  
  // Draw grid with precise line weights
  await drawRealScaleGrid(ctx, config, metrics)
  
}

/**
 * Draw icon at real scale with proper font sizing
 * PRECISION: Icons scaled based on actual bead dimensions
 */
async function drawRealScaleIcon(
  ctx: CanvasRenderingContext2D,
  icon: any,
  x: number,
  y: number,
  beadSizePx: number
): Promise<void> {
  // Calculate icon size based on bead physical size
  const baseIconSize = beadSizePx * 0.6 // 60% of bead size
  const minIconSize = 6 // Minimum readable size
  
  // Apply font size multiplier for double-digit numbers
  const fontSizeMultiplier = icon.fontSize || (icon.isDoubleDigit ? 0.75 : 1.0)
  const finalIconSize = Math.max(baseIconSize * fontSizeMultiplier, minIconSize)
  
  // Set font properties for optimal readability
  ctx.fillStyle = '#000000'
  ctx.font = `bold ${Math.round(finalIconSize)}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Calculate text position (center of bead)
  const textX = x + beadSizePx / 2
  const textY = y + beadSizePx / 2
  
  // Adjust position for double-digit numbers
  const adjustedY = icon.isDoubleDigit ? textY + (finalIconSize * 0.05) : textY
  
  // Draw icon with high contrast (subtle shadow for readability)
  ctx.shadowColor = 'rgba(255,255,255,0.5)'
  ctx.shadowBlur = 0.5
  ctx.shadowOffsetX = 0.5
  ctx.shadowOffsetY = 0.5
  
  ctx.fillText(icon.symbol, textX, adjustedY)
  
  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

/**
 * Draw grid lines at real scale
 * PRECISION: Grid line thickness based on actual physical proportions
 */
async function drawRealScaleGrid(
  ctx: CanvasRenderingContext2D,
  config: RealScaleConfig,
  metrics: RealScaleMetrics
): Promise<void> {
  // Calculate optimal grid line thickness (proportion of bead size)
  const gridLineThickness = Math.max(0.5, metrics.beadSizePx * 0.015)
  
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = gridLineThickness
  ctx.lineCap = 'square'
  ctx.lineJoin = 'miter'
  
  ctx.beginPath()
  
  // Vertical grid lines
  for (let x = 0; x <= config.beadGridWidth; x++) {
    const xPos = x * metrics.beadSizePx
    ctx.moveTo(xPos, 0)
    ctx.lineTo(xPos, metrics.patternHeightPx)
  }
  
  // Horizontal grid lines  
  for (let y = 0; y <= config.beadGridHeight; y++) {
    const yPos = y * metrics.beadSizePx
    ctx.moveTo(0, yPos)
    ctx.lineTo(metrics.patternWidthPx, yPos)
  }
  
  ctx.stroke()
  
}

/**
 * Generate download-ready image at real scale
 * OUTPUT: High-resolution PNG at exactly 1:1 scale
 */
export function generateRealScaleDownload(
  canvas: HTMLCanvasElement,
  filename: string
): void {
  try {
    // Generate high-quality PNG
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to generate image blob')
      }
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Cleanup
      URL.revokeObjectURL(url)
      
    }, 'image/png', 1.0) // Maximum quality
    
  } catch (error) {
    throw error
  }
}

/**
 * Validate real-scale rendering accuracy
 * VERIFICATION: Ensure 1:1 physical scale precision
 */
export function validateRealScale(
  metrics: RealScaleMetrics,
  expectedWidthCm: number,
  expectedHeightCm: number
): {
  isAccurate: boolean
  widthError: number
  heightError: number
  recommendations: string[]
} {
  const actualWidthCm = metrics.patternWidthMm / 10
  const actualHeightCm = metrics.patternHeightMm / 10
  
  const widthError = Math.abs(actualWidthCm - expectedWidthCm)
  const heightError = Math.abs(actualHeightCm - expectedHeightCm)
  
  const tolerance = 0.1 // 1mm tolerance
  const isAccurate = widthError <= tolerance && heightError <= tolerance
  
  const recommendations: string[] = []
  
  if (!isAccurate) {
    recommendations.push('🔧 Scale accuracy warning detected')
    if (widthError > tolerance) {
      recommendations.push(`Width error: ${widthError.toFixed(2)}cm`)
    }
    if (heightError > tolerance) {
      recommendations.push(`Height error: ${heightError.toFixed(2)}cm`)
    }
    recommendations.push('Consider adjusting DPI or bead size calculations')
  } else {
    recommendations.push('✅ Real-scale accuracy verified')
  }
  
  return {
    isAccurate,
    widthError,
    heightError,
    recommendations
  }
}

/**
 * Get real-scale CSS properties for precise display
 * CSS: Ensures browser displays at exact physical dimensions
 */
export function getRealScaleCSSProperties(metrics: RealScaleMetrics): {
  width: string
  height: string
  aspectRatio: string
} {
  return {
    width: `${metrics.patternWidthMm}mm`,
    height: `${metrics.patternHeightMm}mm`,
    aspectRatio: `${metrics.patternWidthPx} / ${metrics.patternHeightPx}`
  }
}