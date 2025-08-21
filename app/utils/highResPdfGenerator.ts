// High-Resolution Memory-Efficient PDF Generator
// Solves: Browser memory issues + PDF resolution problems

import jsPDF from 'jspdf'
import { assignIconsToColors } from './iconPlacement'
import { DMCFirstPattern } from '../hooks/useDMCFirstPatternGeneration'
import { createIconSVGForPDF, convertSVGToPNG } from './svgIconGenerator'

interface MemoryConfig {
  maxMemoryMB: number
  maxCanvasPixels: number
  targetDPI: number
  tileSize: number
}

interface RenderMetrics {
  originalDPI: number
  adjustedDPI: number
  memoryUsageMB: number
  tileCount: number
  renderingTime: number
}

interface ColorTableEntry {
  dmcCode: string
  dmcName: string
  color: { r: number; g: number; b: number }
  icon: any
  count: number
  percentage: number
}

/**
 * Calculate memory-safe rendering parameters
 * Automatically adjusts DPI and tiling based on pattern size
 */
function calculateMemorySafeParams(
  widthMm: number,
  heightMm: number,
  targetQuality: 'high' | 'ultra' = 'high'
): MemoryConfig {
  // Memory limits based on browser capabilities
  const memoryLimits = {
    high: { maxMemoryMB: 150, targetDPI: 300 },    // 150MB = safe for most browsers
    ultra: { maxMemoryMB: 250, targetDPI: 600 }    // 250MB = high-end browsers
  }
  
  const limit = memoryLimits[targetQuality]
  
  // Calculate pixel dimensions at target DPI
  const mmToPx = limit.targetDPI / 25.4
  const widthPx = widthMm * mmToPx
  const heightPx = heightMm * mmToPx
  const totalPixels = widthPx * heightPx
  
  // Estimate memory usage (4 bytes per pixel + overhead)
  const estimatedMemoryMB = (totalPixels * 4) / (1024 * 1024) * 1.5 // 1.5x overhead
  
  
  
  let adjustedDPI = limit.targetDPI
  let maxCanvasPixels = totalPixels
  
  // Adjust DPI if memory exceeds limit
  if (estimatedMemoryMB > limit.maxMemoryMB) {
    const reductionFactor = Math.sqrt(limit.maxMemoryMB / estimatedMemoryMB)
    adjustedDPI = Math.round(limit.targetDPI * reductionFactor)
    
    const newMmToPx = adjustedDPI / 25.4
    const newWidthPx = widthMm * newMmToPx
    const newHeightPx = heightMm * newMmToPx
    maxCanvasPixels = newWidthPx * newHeightPx
    
  }
  
  // Calculate optimal tile size (max 2000px per side)
  const maxTilePx = 2000
  const tileSizeMm = Math.min(
    (maxTilePx * 25.4) / adjustedDPI,
    Math.min(widthMm, heightMm)
  )
  
  return {
    maxMemoryMB: limit.maxMemoryMB,
    maxCanvasPixels,
    targetDPI: adjustedDPI,
    tileSize: tileSizeMm
  }
}

/**
 * Create pattern grid for icon assignment
 */
function createPatternGrid(pattern: DMCFirstPattern): Array<Array<string>> {
  const grid: Array<Array<string>> = []
  const width = pattern.config.beadGridWidth
  const height = pattern.config.beadGridHeight
  
  for (let y = 0; y < height; y++) {
    grid[y] = new Array(width).fill('')
  }
  
  for (const pixel of pattern.constrainedPixels) {
    if (pixel.x < width && pixel.y < height) {
      grid[pixel.y][pixel.x] = pixel.selectedDMCColor.code
    }
  }
  
  return grid
}

/**
 * Render pattern tile with high-resolution SVG icons
 * Memory-efficient: processes one tile at a time
 */
async function renderPatternTile(
  pattern: DMCFirstPattern,
  iconAssignments: Map<string, any>,
  tileX: number,
  tileY: number,
  tileWidthMm: number,
  tileHeightMm: number,
  beadSizeMm: number,
  dpi: number,
  tileStartXMm: number,
  tileStartYMm: number
): Promise<HTMLCanvasElement> {
  
  const mmToPx = dpi / 25.4
  const tileWidthPx = Math.round(tileWidthMm * mmToPx)
  const tileHeightPx = Math.round(tileHeightMm * mmToPx)
  const beadSizePx = beadSizeMm * mmToPx
  
  // Create high-resolution canvas for this tile
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')
  
  canvas.width = tileWidthPx
  canvas.height = tileHeightPx
  
  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, tileWidthPx, tileHeightPx)
  
  // High-quality rendering settings
  ctx.imageSmoothingEnabled = true
  if ('imageSmoothingQuality' in ctx) {
    (ctx as any).imageSmoothingQuality = 'high'
  }
  
  // Calculate which beads are in this tile
  const tileEndX = tileStartXMm + tileWidthMm
  const tileEndY = tileStartYMm + tileHeightMm
  
  const startBeadX = Math.floor(tileStartXMm / beadSizeMm)
  const startBeadY = Math.floor(tileStartYMm / beadSizeMm)
  const endBeadX = Math.ceil(tileEndX / beadSizeMm)
  const endBeadY = Math.ceil(tileEndY / beadSizeMm)
  
  // Draw beads in this tile
  for (const pixel of pattern.constrainedPixels) {
    if (pixel.x >= startBeadX && pixel.x < endBeadX && 
        pixel.y >= startBeadY && pixel.y < endBeadY) {
      
      // Calculate position within tile
      const beadWorldX = pixel.x * beadSizeMm
      const beadWorldY = pixel.y * beadSizeMm
      const beadTileX = (beadWorldX - tileStartXMm) * mmToPx
      const beadTileY = (beadWorldY - tileStartYMm) * mmToPx
      
      // Draw bead background
      ctx.fillStyle = `rgb(${pixel.selectedDMCColor.r}, ${pixel.selectedDMCColor.g}, ${pixel.selectedDMCColor.b})`
      ctx.fillRect(beadTileX, beadTileY, beadSizePx, beadSizePx)
      
      // Draw SVG icon directly (no PNG conversion!)
      const icon = iconAssignments.get(pixel.selectedDMCColor.code)
      if (icon) {
        await drawSVGIcon(ctx, icon, beadTileX, beadTileY, beadSizePx, dpi)
      }
    }
  }
  
  // Draw grid lines for this tile
  await drawTileGrid(ctx, tileWidthPx, tileHeightPx, beadSizePx, tileStartXMm, tileStartYMm, tileWidthMm, tileHeightMm, beadSizeMm)
  
  return canvas
}

/**
 * Draw SVG icon directly on canvas with high quality
 * No PNG conversion = better quality + less memory
 */
async function drawSVGIcon(
  ctx: CanvasRenderingContext2D,
  icon: any,
  x: number,
  y: number,
  beadSizePx: number,
  dpi: number
): Promise<void> {
  // Calculate icon size (60% of bead size)
  const iconSizePx = beadSizePx * 0.6
  const fontSize = icon.isDoubleDigit 
    ? iconSizePx * (icon.fontSize || 0.75)
    : iconSizePx
  
  // Set font properties
  ctx.fillStyle = '#000000'
  ctx.font = `bold ${Math.round(fontSize)}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Add subtle shadow for better readability
  ctx.shadowColor = 'rgba(255,255,255,0.7)'
  ctx.shadowBlur = 1
  ctx.shadowOffsetX = 0.5
  ctx.shadowOffsetY = 0.5
  
  // Draw icon symbol
  const textX = x + beadSizePx / 2
  const textY = y + beadSizePx / 2 + (icon.isDoubleDigit ? fontSize * 0.05 : 0)
  
  ctx.fillText(icon.symbol, textX, textY)
  
  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

/**
 * Draw grid lines for tile
 */
async function drawTileGrid(
  ctx: CanvasRenderingContext2D,
  tileWidthPx: number,
  tileHeightPx: number,
  beadSizePx: number,
  tileStartXMm: number,
  tileStartYMm: number,
  tileWidthMm: number,
  tileHeightMm: number,
  beadSizeMm: number
): Promise<void> {
  
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = Math.max(0.5, beadSizePx * 0.015)
  ctx.lineCap = 'square'
  ctx.lineJoin = 'miter'
  
  ctx.beginPath()
  
  // Calculate grid line positions
  const mmToPx = tileWidthPx / tileWidthMm
  const startX = -(tileStartXMm % beadSizeMm) * mmToPx
  const startY = -(tileStartYMm % beadSizeMm) * mmToPx
  
  // Vertical lines
  for (let x = startX; x <= tileWidthPx; x += beadSizePx) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, tileHeightPx)
  }
  
  // Horizontal lines
  for (let y = startY; y <= tileHeightPx; y += beadSizePx) {
    ctx.moveTo(0, y)
    ctx.lineTo(tileWidthPx, y)
  }
  
  ctx.stroke()
}

/**
 * Prepare color table data from pattern
 */
function prepareColorTableData(pattern: DMCFirstPattern, iconAssignments: Map<string, any>): ColorTableEntry[] {
  const tableData: ColorTableEntry[] = []
  
  // Handle both Map and Object types for colorUsage
  const colorUsageEntries = pattern.statistics.colorUsage instanceof Map 
    ? Array.from(pattern.statistics.colorUsage.entries())
    : Object.entries(pattern.statistics.colorUsage)

  for (const [dmcCode, count] of colorUsageEntries) {
    const dmcColor = pattern.dmcPalette.selectedColors.find(c => c.code === dmcCode)
    const icon = iconAssignments.get(dmcCode)
    
    if (dmcColor && icon) {
      tableData.push({
        dmcCode,
        dmcName: dmcColor.name,
        color: { r: dmcColor.r, g: dmcColor.g, b: dmcColor.b },
        icon,
        count: Number(count),
        percentage: (Number(count) / pattern.statistics.totalPixels) * 100
      })
    }
  }

  // Sort by usage count (descending)
  tableData.sort((a, b) => b.count - a.count)
  
  return tableData
}

/**
 * Add color table pages to PDF (A4 portrait, optimized for high-res icons)
 */
async function addColorTablePages(pdf: any, colorTableData: ColorTableEntry[]): Promise<void> {
  // A4 dimensions for color table
  const pageWidth = 210  // A4 width in mm
  const pageHeight = 297 // A4 height in mm
  const startY = 55      // Starting Y position
  const rowHeight = 8    // Height per row
  const bottomMargin = 30 // Bottom margin
  const availableHeight = pageHeight - bottomMargin - startY
  const itemsPerPage = Math.floor(availableHeight / rowHeight) // ~26 items per page
  
  
  const totalPages = Math.ceil(colorTableData.length / itemsPerPage)
  
  // Pre-convert all SVG icons to high-res PNG for PDF
  const iconPngCache = new Map<string, string>()
  const iconSizeMm = 6
  
  const conversionPromises = colorTableData.map(async (entry) => {
    try {
      const pngData = await convertSVGToPNG(entry.icon, iconSizeMm, 600) // 600 DPI for crisp icons
      iconPngCache.set(entry.dmcCode, pngData)
      return entry.dmcCode
    } catch (error) {
      return null
    }
  })
  
  const results = await Promise.all(conversionPromises)
  const successCount = results.filter(r => r !== null).length
  
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    // Add new page for color table (A4 portrait)
    pdf.addPage([pageWidth, pageHeight], 'portrait')
    
    // Set standard font
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    
    // Page size info
    const pageSizeText = `Paper: ${pageWidth}mm × ${pageHeight}mm`
    const textWidth = pdf.getTextWidth(pageSizeText)
    pdf.text(pageSizeText, pageWidth - textWidth - 10, 15)
    
    // Page header
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DMC Color & Icon Reference', 20, 30)
    
    // Page info
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Page ${pageIndex + 1} of ${totalPages}`, 20, 40)
    
    // Calculate data for this page
    const startIndex = pageIndex * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, colorTableData.length)
    const pageData = colorTableData.slice(startIndex, endIndex)
    
    // Table header
    let yPos = 55
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    
    // Header background
    pdf.setFillColor(0, 0, 0)
    pdf.rect(15, yPos - 5, pageWidth - 30, 10, 'F')
    
    // Header text (white on black)
    pdf.setTextColor(255, 255, 255)
    pdf.text('#', 20, yPos)
    pdf.text('Color', 35, yPos)
    pdf.text('Icon', 55, yPos)
    pdf.text('DMC Code', 75, yPos)
    pdf.text('Color Name', 105, yPos)
    pdf.text('Count', 150, yPos)
    pdf.text('Ratio', 175, yPos)
    
    yPos += 12
    
    // Table rows
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    
    for (let index = 0; index < pageData.length; index++) {
      const entry = pageData[index]
      const rowNum = startIndex + index + 1
      
      // Alternating row background
      if (index % 2 === 0) {
        pdf.setFillColor(248, 248, 248)
        pdf.rect(15, yPos - 6, pageWidth - 30, 8, 'F')
      }
      
      // Row number
      pdf.text(rowNum.toString(), 20, yPos)
      
      // Color swatch
      pdf.setFillColor(entry.color.r, entry.color.g, entry.color.b)
      pdf.rect(35, yPos - 4, 15, 6, 'F')
      pdf.setDrawColor(0, 0, 0)
      pdf.rect(35, yPos - 4, 15, 6, 'S')
      
      // High-res PNG icon
      const iconXPos = 55
      const iconYPos = yPos - 4
      const pngIconData = iconPngCache.get(entry.dmcCode)
      
      if (pngIconData) {
        pdf.addImage(
          pngIconData,
          'PNG',
          iconXPos,
          iconYPos,
          iconSizeMm,
          iconSizeMm,
          `png-icon-${entry.dmcCode}`,
          'FAST'
        )
      } else {
        // Fallback to text
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(14)
        pdf.text(entry.icon.symbol || '•', iconXPos + 3, yPos)
      }
      
      // DMC info
      pdf.setFontSize(9)
      pdf.text(`DMC ${entry.dmcCode}`, 75, yPos)
      
      // Color name (truncate if too long)
      const colorName = entry.dmcName.length > 20 ? entry.dmcName.substring(0, 17) + '...' : entry.dmcName
      pdf.text(colorName, 105, yPos)
      
      // Count and percentage
      pdf.text(entry.count.toLocaleString(), 150, yPos)
      pdf.text(entry.percentage.toFixed(1) + '%', 175, yPos)
      
      yPos += 8
    }
    
    // Footer with summary
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Colors shown: ${pageData.length} / Total: ${colorTableData.length}`, 20, pageHeight - 15)
  }
  
}

/**
 * Memory-efficient high-resolution PDF generation
 * Uses tiled rendering to handle large patterns
 */
export async function generateHighResPDF(
  pattern: DMCFirstPattern,
  beadType: 'circular' | 'square',
  calculatedSize: {
    actualWidth: number
    actualHeight: number
    beadGridWidth: number
    beadGridHeight: number
    totalBeads: number
  },
  imageName: string,
  quality: 'high' | 'ultra' = 'high',
  includeColorTable: boolean = false,
  beadSizeMm?: number
): Promise<RenderMetrics> {
  
  const startTime = Date.now()
  
  // Calculate pattern dimensions
  const patternWidthMm = calculatedSize.actualWidth * 10
  const patternHeightMm = calculatedSize.actualHeight * 10
  const beadSize = beadSizeMm || (beadType === 'circular' ? 2.8 : 2.6)
  
  // Get memory-safe rendering parameters
  const memoryConfig = calculateMemorySafeParams(patternWidthMm, patternHeightMm, quality)
  
  // Calculate optimal paper size (same logic as original)
  const marginMm = 10
  const paperWidth = Math.max(210, patternWidthMm + marginMm * 2) // A4 minimum
  const paperHeight = Math.max(297, patternHeightMm + marginMm * 2)
  const isLandscape = paperWidth > paperHeight
  
  // Create PDF
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [paperWidth, paperHeight]
  })
  
  // Generate icon assignments
  const patternGrid = createPatternGrid(pattern)
  const uniqueColors = Array.from(new Set(pattern.constrainedPixels.map(p => p.selectedDMCColor.code)))
  const iconAssignments = assignIconsToColors(uniqueColors, patternGrid)
  
  // Calculate tiling
  const tilesX = Math.ceil(patternWidthMm / memoryConfig.tileSize)
  const tilesY = Math.ceil(patternHeightMm / memoryConfig.tileSize)
  const totalTiles = tilesX * tilesY
  
  // Pattern positioning on page
  const patternX = (paperWidth - patternWidthMm) / 2
  const patternY = (paperHeight - patternHeightMm) / 2
  
  // Render and composite tiles
  for (let tileY = 0; tileY < tilesY; tileY++) {
    for (let tileX = 0; tileX < tilesX; tileX++) {
      const tileProgress = (tileY * tilesX + tileX + 1)
      
      // Calculate tile dimensions
      const tileWidthMm = Math.min(memoryConfig.tileSize, patternWidthMm - tileX * memoryConfig.tileSize)
      const tileHeightMm = Math.min(memoryConfig.tileSize, patternHeightMm - tileY * memoryConfig.tileSize)
      
      // Calculate tile start position in pattern coordinates
      const tileStartXMm = tileX * memoryConfig.tileSize
      const tileStartYMm = tileY * memoryConfig.tileSize
      
      // Render tile
      const tileCanvas = await renderPatternTile(
        pattern,
        iconAssignments,
        tileX,
        tileY,
        tileWidthMm,
        tileHeightMm,
        beadSize,
        memoryConfig.targetDPI,
        tileStartXMm,
        tileStartYMm
      )
      
      // Convert tile to image and add to PDF
      const tileImgData = tileCanvas.toDataURL('image/png', 1.0)
      const tilePdfX = patternX + tileX * memoryConfig.tileSize
      const tilePdfY = patternY + tileY * memoryConfig.tileSize
      
      pdf.addImage(
        tileImgData,
        'PNG',
        tilePdfX,
        tilePdfY,
        tileWidthMm,
        tileHeightMm,
        `tile-${tileX}-${tileY}`,
        'FAST'
      )
      
      // Force garbage collection by nullifying canvas
      tileCanvas.width = 1
      tileCanvas.height = 1
      
    }
  }
  
  // Add pattern info
  pdf.setFontSize(8)
  pdf.setTextColor(100, 100, 100)
  const infoText = `${patternWidthMm.toFixed(1)}×${patternHeightMm.toFixed(1)}mm | ${memoryConfig.targetDPI}DPI | ${calculatedSize.beadGridWidth}×${calculatedSize.beadGridHeight} beads`
  pdf.text(infoText, 10, paperHeight - 5)
  
  // Add color table if requested
  if (includeColorTable) {
    const colorTableData = prepareColorTableData(pattern, iconAssignments)
    if (colorTableData.length > 0) {
      await addColorTablePages(pdf, colorTableData)
    }
  }
  
  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 10)
  const cleanImageName = imageName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9가-힣]/g, '_')
  const filenameSuffix = includeColorTable ? 'Complete' : 'PatternOnly'
  const filename = `HighRes_${filenameSuffix}_${cleanImageName}_${calculatedSize.actualWidth.toFixed(1)}x${calculatedSize.actualHeight.toFixed(1)}cm_${memoryConfig.targetDPI}DPI_${timestamp}.pdf`
  
  // Save PDF
  pdf.save(filename)
  
  const renderingTime = Date.now() - startTime
  const metrics: RenderMetrics = {
    originalDPI: quality === 'high' ? 300 : 600,
    adjustedDPI: memoryConfig.targetDPI,
    memoryUsageMB: memoryConfig.maxMemoryMB,
    tileCount: totalTiles,
    renderingTime
  }
    
  return metrics
}

/**
 * Monitor memory usage during PDF generation
 */
export function getMemoryUsage(): { used: number; total: number; percentage: number } {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    }
  }
  return { used: 0, total: 0, percentage: 0 }
}