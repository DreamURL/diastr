// Pattern Visualization System for Cross Stitch Patterns
// Creates visual representations with icons, grids, and colors

import { DMCFirstPattern } from '../hooks/useDMCFirstPatternGeneration'
import { assignIconsToColors, type Icon } from './iconPlacement'
import { convertSVGToPNG } from './svgIconGenerator'

export interface VisualizedPattern {
  imageData: ImageData
  iconAssignments: Map<string, Icon>
  gridLines: boolean
  scale: number
  width: number
  height: number
}

export interface PatternRenderOptions {
  scale: number
  showGrid: boolean
  showIcons: boolean
  showColors: boolean
  iconSize: number
  gridLineWidth: number
  backgroundColor: string
  gridColor: string
  iconColor: string
}

const DEFAULT_RENDER_OPTIONS: PatternRenderOptions = {
  scale: 20, // pixels per bead
  showGrid: true,
  showIcons: true,
  showColors: true,
  iconSize: 12,
  gridLineWidth: 1,
  backgroundColor: '#ffffff',
  gridColor: '#000000',
  iconColor: '#000000'
}

/**
 * Create a pattern grid from DMC pattern data
 */
function createPatternGrid(pattern: DMCFirstPattern): Array<Array<string>> {
  const grid: Array<Array<string>> = []
  const width = pattern.config.beadGridWidth
  const height = pattern.config.beadGridHeight
  
  // Initialize grid
  for (let y = 0; y < height; y++) {
    grid[y] = new Array(width).fill('')
  }
  
  // Fill grid with DMC codes
  for (const pixel of pattern.constrainedPixels) {
    if (pixel.x < width && pixel.y < height) {
      grid[pixel.y][pixel.x] = pixel.selectedDMCColor.code
    }
  }
  
  return grid
}

/**
 * Render pattern as canvas with colors, grid, and icons
 * Updated to use SVG→PNG system for perfect icon quality!
 */
export async function renderPatternToCanvas(
  pattern: DMCFirstPattern,
  options: Partial<PatternRenderOptions> = {}
): Promise<{
  canvas: HTMLCanvasElement
  iconAssignments: Map<string, Icon>
  stats: any
}> {
  const opts = { ...DEFAULT_RENDER_OPTIONS, ...options }
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Calculate dimensions
  const patternWidth = pattern.config.beadGridWidth
  const patternHeight = pattern.config.beadGridHeight
  const canvasWidth = patternWidth * opts.scale
  const canvasHeight = patternHeight * opts.scale

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  // Create pattern grid and assign icons
  const patternGrid = createPatternGrid(pattern)
  const uniqueColors = Array.from(new Set(pattern.constrainedPixels.map(p => p.selectedDMCColor.code)))
  const iconAssignments = assignIconsToColors(uniqueColors, patternGrid)

  // 🌟 Pre-convert all SVG icons to high-res PNG for canvas rendering
  const iconPngCache = new Map<string, string>()
  const iconSizeMm = (opts.iconSize * 25.4) / 96 // Convert px to mm
  
  if (opts.showIcons) {
    const conversionPromises = uniqueColors.map(async (dmcCode) => {
      const icon = iconAssignments.get(dmcCode)
      if (icon) {
        try {
          const pngData = await convertSVGToPNG(icon, iconSizeMm, 150) // 150 DPI for web display
          iconPngCache.set(dmcCode, pngData)
          return dmcCode
        } catch (error) {
          return null
        }
      }
      return null
    })
    
    const results = await Promise.all(conversionPromises)
    const successCount = results.filter(r => r !== null).length
  }

  // Fill background
  ctx.fillStyle = opts.backgroundColor
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Draw background colors first
  for (const pixel of pattern.constrainedPixels) {
    const x = pixel.x * opts.scale
    const y = pixel.y * opts.scale
    
    // Draw color background if enabled
    if (opts.showColors) {
      ctx.fillStyle = `rgb(${pixel.selectedDMCColor.r}, ${pixel.selectedDMCColor.g}, ${pixel.selectedDMCColor.b})`
      ctx.fillRect(x, y, opts.scale, opts.scale)
    }
  }

  // Draw all icons after backgrounds (for proper layering)
  if (opts.showIcons) {
    const iconDrawPromises: Promise<void>[] = []
    
    for (const pixel of pattern.constrainedPixels) {
      const x = pixel.x * opts.scale
      const y = pixel.y * opts.scale
      const pngIconData = iconPngCache.get(pixel.selectedDMCColor.code)
      
      if (pngIconData) {
        const drawPromise = drawSVGIconOnCanvas(ctx, pngIconData, x, y, opts.scale, opts.iconSize)
        iconDrawPromises.push(drawPromise)
      }
    }
    
    // Wait for all icons to be drawn
    await Promise.all(iconDrawPromises)
  }

  // Draw grid lines if enabled
  if (opts.showGrid) {
    drawGridLines(ctx, canvasWidth, canvasHeight, opts.scale, opts.gridLineWidth, opts.gridColor)
  }

  return {
    canvas,
    iconAssignments,
    stats: {
      width: patternWidth,
      height: patternHeight,
      totalCells: patternWidth * patternHeight,
      uniqueColors: uniqueColors.length
    }
  }
}

/**
 * Draw SVG-converted PNG icon on canvas at specified position
 * 🌟 REVOLUTIONARY: Perfect quality icons using SVG→PNG conversion!
 */
function drawSVGIconOnCanvas(
  ctx: CanvasRenderingContext2D,
  pngIconData: string,
  x: number,
  y: number,
  cellSize: number,
  iconSize: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const centerX = x + (cellSize - iconSize) / 2
      const centerY = y + (cellSize - iconSize) / 2
      
      // Draw high-resolution PNG icon with perfect quality
      ctx.drawImage(img, centerX, centerY, iconSize, iconSize)
      resolve()
    }
    img.onerror = () => {
      resolve() // Continue even if one icon fails
    }
    img.src = pngIconData
  })
}

/**
 * LEGACY: Draw text-based icon (fallback only)
 */
function drawIconOnCanvas(
  ctx: CanvasRenderingContext2D,
  icon: Icon,
  x: number,
  y: number,
  cellSize: number,
  iconSize: number,
  color: string
): void {
  const centerX = x + cellSize / 2
  const centerY = y + cellSize / 2
  
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  
  // Set font for text-based icons
  if (icon.type === 'number' || icon.type === 'letter') {
    ctx.font = `bold ${iconSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(icon.symbol, centerX, centerY)
  } else {
    // For shape and arrow icons, use Unicode symbols
    ctx.font = `${iconSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(icon.symbol, centerX, centerY)
  }
}

/**
 * Draw grid lines on canvas (overlay 방식으로 수정)
 */
function drawGridLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellSize: number,
  lineWidth: number,
  color: string
): void {
  // 그리드를 오버레이로 그리기 위해 투명도 설정
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  
  // 그리드가 이미지 크기에 영향을 주지 않도록 설정
  ctx.globalCompositeOperation = 'source-over' // 기본값, 이미지 위에 그리기

  ctx.beginPath()

  // Vertical lines (세로선)
  for (let x = 0; x <= width; x += cellSize) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
  }

  // Horizontal lines (가로선)
  for (let y = 0; y <= height; y += cellSize) {
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
  }

  ctx.stroke()
  
  // 그리드 그리기 후 원래 상태로 복원
  ctx.globalCompositeOperation = 'source-over'
}

/**
 * Create a visual pattern preview with icons and colors
 */
export async function createPatternPreview(
  pattern: DMCFirstPattern,
  scale: number = 10,
  showIcons: boolean = true,
  showGrid: boolean = true
): Promise<{
  imageData: ImageData
  iconAssignments: Map<string, Icon>
  renderStats: any
}> {
  const { canvas, iconAssignments, stats } = await renderPatternToCanvas(pattern, {
    scale,
    showIcons,
    showGrid,
    showColors: true,
    iconSize: Math.max(8, scale - 4),
    gridLineWidth: 1
  })

  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  return {
    imageData,
    iconAssignments,
    renderStats: stats
  }
}

/**
 * Create a legend showing all DMC colors and their assigned icons
 */
export function createPatternLegend(
  pattern: DMCFirstPattern,
  iconAssignments: Map<string, Icon>,
  cellSize: number = 40
): HTMLCanvasElement {
  const uniqueColors = Array.from(new Set(pattern.constrainedPixels.map(p => p.selectedDMCColor.code)))
  const itemsPerRow = Math.min(10, uniqueColors.length)
  const rows = Math.ceil(uniqueColors.length / itemsPerRow)
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  const padding = 10
  const itemWidth = cellSize + 100 // space for DMC code text
  const itemHeight = cellSize + 20
  
  canvas.width = itemsPerRow * itemWidth + padding * 2
  canvas.height = rows * itemHeight + padding * 2
  
  // Background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Draw legend items
  uniqueColors.forEach((dmcCode, index) => {
    const dmcColor = pattern.constrainedPixels.find(p => p.selectedDMCColor.code === dmcCode)?.selectedDMCColor
    const icon = iconAssignments.get(dmcCode)
    
    if (!dmcColor || !icon) return
    
    const row = Math.floor(index / itemsPerRow)
    const col = index % itemsPerRow
    const x = padding + col * itemWidth
    const y = padding + row * itemHeight
    
    // Color swatch
    ctx.fillStyle = `rgb(${dmcColor.r}, ${dmcColor.g}, ${dmcColor.b})`
    ctx.fillRect(x, y, cellSize, cellSize)
    
    // Icon overlay
    ctx.fillStyle = '#000000'
    ctx.font = `${cellSize * 0.6}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(icon.symbol, x + cellSize / 2, y + cellSize / 2)
    
    // DMC code text
    ctx.fillStyle = '#000000'
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`DMC ${dmcCode}`, x + cellSize + 10, y)
    ctx.fillText(`${dmcColor.name}`, x + cellSize + 10, y + 15)
  })
  
  return canvas
}

/**
 * Generate high-quality pattern export image
 */
export async function generatePatternExport(
  pattern: DMCFirstPattern,
  options: {
    scale?: number
    includeGrid?: boolean
    includeIcons?: boolean
    includeLegend?: boolean
    format?: 'png' | 'svg'
  } = {}
): Promise<{
  patternCanvas: HTMLCanvasElement
  legendCanvas: HTMLCanvasElement | null
  iconAssignments: Map<string, Icon>
}> {
  const opts = {
    scale: 20,
    includeGrid: true,
    includeIcons: true,
    includeLegend: true,
    format: 'png' as const,
    ...options
  }

  // Create main pattern
  const { canvas: patternCanvas, iconAssignments } = await renderPatternToCanvas(pattern, {
    scale: opts.scale,
    showGrid: opts.includeGrid,
    showIcons: opts.includeIcons,
    showColors: true,
    iconSize: Math.max(12, opts.scale - 6),
    gridLineWidth: 1
  })

  // Create legend if requested
  let legendCanvas: HTMLCanvasElement | null = null
  if (opts.includeLegend) {
    legendCanvas = createPatternLegend(pattern, iconAssignments, 40)
  }

  return {
    patternCanvas,
    legendCanvas,
    iconAssignments
  }
}

/**
 * Convert canvas to data URL for display
 */
export function canvasToDataURL(canvas: HTMLCanvasElement, format: string = 'image/png'): string {
  return canvas.toDataURL(format)
}

/**
 * Convert ImageData to data URL
 */
export function imageDataToDataURL(imageData: ImageData, format: string = 'image/png'): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)
  
  return canvas.toDataURL(format)
}