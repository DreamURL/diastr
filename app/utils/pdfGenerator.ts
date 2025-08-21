// Real-size PDF Generator for Cross Stitch Patterns
// Generates actual-size PDFs optimized for bead placement work

import jsPDF from 'jspdf'
import { assignIconsToColors } from './iconPlacement'
import { DMCFirstPattern } from '../hooks/useDMCFirstPatternGeneration'
import { createVectorIconForPDF } from './svgIconGenerator'

// Standard font support for jsPDF
// Use standard fonts for better compatibility
const setStandardFont = (pdf: any, weight: 'normal' | 'bold' = 'normal') => {
  try {
    pdf.setFont('helvetica', weight)
  } catch (error) {
  }
}

// Format numbers to 2 decimal places maximum
const formatDecimal = (num: number): string => {
  return (Math.round(num * 100) / 100).toString()
}

// LEGACY functions removed for cleanup

// ORIGINAL BITMAP FUNCTION (for reference/fallback)
const createIconImageForPDFBitmap = (icon: any, sizePx: number = 50, beadSizeMm: number = 2.8): string => {
  if (!icon || !icon.symbol) return createDefaultIconImage(sizePx, beadSizeMm)
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    return createDefaultIconImage(sizePx, beadSizeMm)
  }
  
  // Calculate optimal scale based on final output size
  // Target: HIGH RESOLUTION 2400 DPI print quality (94.49 px/mm) - PROFESSIONAL PUBLISHING LEVEL
  const printDPI = 2400 // High professional quality - optimized for browser performance
  const printPxPerMm = printDPI / 25.4 // 188.98 px/mm
  const finalSizeMm = beadSizeMm * 0.855 // Icon is 85% of bead size for maximum visibility
  const targetPrintPx = finalSizeMm * printPxPerMm
  
  // Calculate scale to achieve MAXIMUM print quality - EXTREME SCALING!
  const baseScale = Math.max(8, Math.ceil(targetPrintPx / sizePx)) // Minimum 8x base
  const highScale = Math.max(baseScale, 50) // Force minimum 50x for high clarity (reduced from 200x)
  const baseScaleLimit = Math.min(150, highScale) // Allow up to 150x scaling (reduced from 500x)
  
  // Additional resolution boost for very large patterns
  const resolutionBoost = beadSizeMm > 2.5 ? Math.floor(baseScaleLimit * 0.1) : 0
  const scale = Math.min(200, baseScaleLimit + resolutionBoost) // Ultimate cap at 200x - BROWSER-FRIENDLY
  
  // Apply light super-sampling for enhanced quality (browser-friendly)
  const superSample = 1.2 // Light 1.2x super-sampling for quality without performance hit
  const finalCanvasScale = scale * superSample
  
  canvas.width = sizePx * finalCanvasScale
  canvas.height = sizePx * finalCanvasScale
  
  // Scale context for HIGH resolution (browser-optimized)
  ctx.scale(finalCanvasScale, finalCanvasScale)
  
  // Clear canvas with transparent background
  ctx.clearRect(0, 0, sizePx, sizePx)
  
  // Set font and style for symbol rendering - HIGH SIZE AND QUALITY (NO BOLD, BROWSER-OPTIMIZED)
  const fontSize = Math.floor(sizePx * 0.99) // 99% of canvas size for absolute maximum clarity
  ctx.font = `${fontSize}px 'Arial', 'DejaVu Sans', 'Segoe UI Symbol', 'Noto Sans CJK', 'Apple Symbols', 'Helvetica', sans-serif`
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Enable HIGH quality text rendering and canvas settings (browser-optimized)
  if ('textRenderingOptimization' in ctx) {
    (ctx as any).textRenderingOptimization = 'optimizeQuality'
  }
  
  // Set all quality enhancement properties to MAXIMUM
  ctx.imageSmoothingEnabled = true
  if ('imageSmoothingQuality' in ctx) {
    (ctx as any).imageSmoothingQuality = 'high'
  }
  
  // EXTREME text rendering properties
  if ('textRenderingOptimization' in ctx) {
    (ctx as any).textRenderingOptimization = 'optimizeQuality'
  }
  if ('fontKerning' in ctx) {
    (ctx as any).fontKerning = 'normal'
  }
  if ('textRendering' in ctx) {
    (ctx as any).textRendering = 'geometricPrecision'
  }
  if ('fontVariantNumeric' in ctx) {
    (ctx as any).fontVariantNumeric = 'lining-nums'
  }
  if ('fontOpticalSizing' in ctx) {
    (ctx as any).fontOpticalSizing = 'auto'
  }
  
  // Additional canvas quality settings
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 10
  
  // Draw the symbol at center
  const centerX = sizePx / 2
  const centerY = sizePx / 2
  
  try {
    // Draw text cleanly without bold effects
    ctx.fillText(icon.symbol, centerX, centerY)
  } catch (error) {
    // Fallback to a simple dot
    ctx.fillText('•', centerX, centerY)
  }
  
  // Convert to data URL
  return canvas.toDataURL('image/png', 1.0)
}

// Create default fallback icon image with dynamic resolution
const createDefaultIconImage = (sizePx: number = 50, beadSizeMm: number = 2.8): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' // 1x1 transparent PNG
  
  // Use same HIGH RESOLUTION scaling logic as main icon function
  const printDPI = 2400 // High professional quality (browser-optimized)
  const printPxPerMm = printDPI / 25.4
  const finalSizeMm = beadSizeMm * 0.85
  const targetPrintPx = finalSizeMm * printPxPerMm
  const baseScale = Math.max(4, Math.ceil(targetPrintPx / sizePx))
  const highScale = Math.max(baseScale, 50)
  const baseScaleLimit = Math.min(150, highScale)
  const resolutionBoost = beadSizeMm > 2.5 ? Math.floor(baseScaleLimit * 0.1) : 0
  const scale = Math.min(200, baseScaleLimit + resolutionBoost)
  
  // Apply light super-sampling for fallback icon too
  const superSample = 1.2
  const finalCanvasScale = scale * superSample
  
  canvas.width = sizePx * finalCanvasScale
  canvas.height = sizePx * finalCanvasScale
  ctx.scale(finalCanvasScale, finalCanvasScale)
  
  ctx.clearRect(0, 0, sizePx, sizePx)
  ctx.fillStyle = '#000000'
  
  // Enhanced quality settings for fallback icon
  ctx.imageSmoothingEnabled = true
  if ('imageSmoothingQuality' in ctx) {
    (ctx as any).imageSmoothingQuality = 'high'
  }
  
  // Draw a clean high-quality circle (no stroke)
  ctx.beginPath()
  ctx.arc(sizePx / 2, sizePx / 2, sizePx * 0.3, 0, 2 * Math.PI) // Moderate size circle
  ctx.fill()
  
  return canvas.toDataURL('image/png', 1.0)
}

// Note: Using vector rendering for optimal quality

// Paper size definitions (width × height in mm)
interface PaperSize {
  name: string
  series: 'A' | 'B'
  size: string
  width: number
  height: number
}

const PAPER_SIZES: PaperSize[] = [
  // A Series (ISO 216)
  { name: 'A0', series: 'A', size: 'A0', width: 841, height: 1189 },
  { name: 'A1', series: 'A', size: 'A1', width: 594, height: 841 },
  { name: 'A2', series: 'A', size: 'A2', width: 420, height: 594 },
  { name: 'A3', series: 'A', size: 'A3', width: 297, height: 420 },
  { name: 'A4', series: 'A', size: 'A4', width: 210, height: 297 },
  
  // B Series (ISO 216)
  { name: 'B0', series: 'B', size: 'B0', width: 1000, height: 1414 },
  { name: 'B1', series: 'B', size: 'B1', width: 707, height: 1000 },
  { name: 'B2', series: 'B', size: 'B2', width: 500, height: 707 },
  { name: 'B3', series: 'B', size: 'B3', width: 353, height: 500 },
  { name: 'B4', series: 'B', size: 'B4', width: 250, height: 353 }
]

interface OptimalPaper {
  paper: PaperSize
  orientation: 'portrait' | 'landscape'
  patternWidth: number  // Pattern width on paper
  patternHeight: number // Pattern height on paper
  marginMm: number
}

/**
 * Calculate optimal paper size and orientation for pattern
 * Always matches long side to long side for best fit
 */
export function calculateOptimalPaper(
  patternWidthCm: number,
  patternHeightCm: number,
  marginMm: number = 20
): OptimalPaper {
  const patternWidthMm = patternWidthCm * 10
  const patternHeightMm = patternHeightCm * 10
  
  // Required paper size including margins
  const requiredWidthMm = patternWidthMm + (marginMm * 2)
  const requiredHeightMm = patternHeightMm + (marginMm * 2)
  
  // Determine pattern orientation
  const isPatternLandscape = patternWidthMm > patternHeightMm
  
  let bestPaper: OptimalPaper | null = null
  let minArea = Infinity
  
  // Test all paper sizes in both orientations
  for (const paper of PAPER_SIZES) {
    // Test both portrait and landscape orientations
    const orientations = [
      { width: paper.width, height: paper.height, orientation: 'portrait' as const },
      { width: paper.height, height: paper.width, orientation: 'landscape' as const }
    ]
    
    for (const orientation of orientations) {
      // Check if pattern fits
      if (requiredWidthMm <= orientation.width && requiredHeightMm <= orientation.height) {
        const area = orientation.width * orientation.height
        
        // Prefer orientation that matches pattern aspect ratio
        const isPaperLandscape = orientation.width > orientation.height
        const orientationMatch = isPatternLandscape === isPaperLandscape
        const orientationBonus = orientationMatch ? -100000 : 0 // Huge preference for matching orientation
        
        const score = area + orientationBonus
        
        if (score < minArea) {
          minArea = score
          bestPaper = {
            paper,
            orientation: orientation.orientation,
            patternWidth: orientation.width,
            patternHeight: orientation.height,
            marginMm
          }
        }
      }
    }
  }
  
  // Fallback to largest paper if nothing fits
  if (!bestPaper) {
    const largest = PAPER_SIZES[0] // B0 is largest
    const orientation = isPatternLandscape ? 'landscape' : 'portrait'
    bestPaper = {
      paper: largest,
      orientation,
      patternWidth: orientation === 'landscape' ? largest.height : largest.width,
      patternHeight: orientation === 'landscape' ? largest.width : largest.height,
      marginMm
    }
  }
  
  return bestPaper
}

/**
 * Generate real-size pattern canvas for PDF
 */
async function generateRealSizePatternCanvas(
  pattern: DMCFirstPattern,
  beadType: 'circular' | 'square',
  widthMm: number,
  heightMm: number
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }
  
  // Convert mm to pixels (96 DPI standard: 1mm = 3.779527559 px)
  const mmToPx = 3.779527559
  const canvasWidthPx = widthMm * mmToPx
  const canvasHeightPx = heightMm * mmToPx
  
  canvas.width = canvasWidthPx
  canvas.height = canvasHeightPx
  
  // Calculate bead size in pixels
  const beadSizeMm = beadType === 'circular' ? 2.8 : 2.6
  const beadSizePx = beadSizeMm * mmToPx
  
  // Fill white background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidthPx, canvasHeightPx)
  
  // Generate icon assignments
  const patternGrid = createPatternGrid(pattern)
  const uniqueColors = Array.from(new Set(pattern.constrainedPixels.map(p => p.selectedDMCColor.code)))
  const iconAssignments = assignIconsToColors(uniqueColors, patternGrid)
  
  // 🚀 NEW: Pre-generate VECTOR icon data for INFINITE RESOLUTION rendering!
  const iconVectorCache = new Map<string, ReturnType<typeof createVectorIconForPDF>>()
  
  // Get unique icons to avoid duplicates
  const uniqueIcons = new Map<string, any>()
  for (const pixel of pattern.constrainedPixels) {
    const icon = iconAssignments.get(pixel.selectedDMCColor.code)
    if (icon && !uniqueIcons.has(icon.symbol)) {
      uniqueIcons.set(icon.symbol, icon)
    }
  }
  
  
  // Prepare all unique icons for vector rendering (INSTANT PROCESSING - NO PNG CONVERSION!)
  for (const [symbol, icon] of Array.from(uniqueIcons.entries())) {
    const iconSizePx = Math.max(beadSizePx * 0.6, 8)
    const iconSizeMm = (iconSizePx * 25.4) / mmToPx // Convert px to mm
    const cacheKey = `${icon.symbol}-${iconSizePx}`
    
    const vectorData = createVectorIconForPDF(icon, iconSizeMm)
    iconVectorCache.set(cacheKey, vectorData)
  }
  
  console.log(`✅ Vector icon preparation completed. Cache size: ${iconVectorCache.size} (ZERO rasterization!)`)
  
  // Draw each bead
  for (const pixel of pattern.constrainedPixels) {
    const x = pixel.x * beadSizePx
    const y = pixel.y * beadSizePx
    
    // Draw color background
    ctx.fillStyle = `rgb(${pixel.selectedDMCColor.r}, ${pixel.selectedDMCColor.g}, ${pixel.selectedDMCColor.b})`
    ctx.fillRect(x, y, beadSizePx, beadSizePx)
    
    // Note: Icons will be drawn after all background colors are complete
    // This ensures proper layering and avoids async drawing issues
  }
  
  // 🌟 Draw all icons using Canvas text rendering (CONSISTENT WITH VECTOR PDF!)
  for (const pixel of pattern.constrainedPixels) {
    const x = pixel.x * beadSizePx
    const y = pixel.y * beadSizePx
    
    const icon = iconAssignments.get(pixel.selectedDMCColor.code)
    if (icon) {
      const iconSizePx = Math.max(beadSizePx * 0.6, 8)
      const cacheKey = `${icon.symbol}-${iconSizePx}`
      const vectorData = iconVectorCache.get(cacheKey)
      
      if (vectorData) {
        // Draw white circle background (50% transparent)
        const centerX = x + beadSizePx / 2
        const centerY = y + beadSizePx / 2
        const circleRadius = iconSizePx * 0.45
        
        ctx.globalAlpha = 0.5
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI)
        ctx.fill()
        
        // Reset opacity and draw text icon
        ctx.globalAlpha = 1.0
        ctx.fillStyle = '#000000'
        ctx.font = `${vectorData.fontWeight} ${vectorData.fontSize * (mmToPx / 2.83)}px ${vectorData.fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Draw the icon symbol
        ctx.fillText(vectorData.symbol, centerX, centerY)
      }
    }
  }
  
  // Draw grid lines
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = Math.max(0.5, beadSizePx * 0.02)
  ctx.beginPath()
  
  // Vertical lines
  for (let i = 0; i <= pattern.config.beadGridWidth; i++) {
    const xPos = i * beadSizePx
    ctx.moveTo(xPos, 0)
    ctx.lineTo(xPos, canvasHeightPx)
  }
  
  // Horizontal lines
  for (let i = 0; i <= pattern.config.beadGridHeight; i++) {
    const yPos = i * beadSizePx
    ctx.moveTo(0, yPos)
    ctx.lineTo(canvasWidthPx, yPos)
  }
  
  ctx.stroke()
  
  return canvas
}

/**
 * Create pattern grid from DMC pattern
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
 * Color table entry for PDF generation
 */
interface ColorTableEntry {
  dmcCode: string
  dmcName: string
  color: { r: number; g: number; b: number }
  icon: any
  count: number
  percentage: number
}

/**
 * Prepare color table data from pattern
 */
function prepareColorTableData(pattern: DMCFirstPattern): ColorTableEntry[] {
  // Create pattern grid and assign icons
  const patternGrid = createPatternGrid(pattern)
  const uniqueColors = Array.from(new Set(pattern.constrainedPixels.map(p => p.selectedDMCColor.code)))
  const iconAssignments = assignIconsToColors(uniqueColors, patternGrid)

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
 * Add color table pages to PDF (A4 portrait, max 100 rows per page)
 */
async function addColorTablePages(pdf: any, colorTableData: ColorTableEntry[], optimalPaper: OptimalPaper) {
  // Calculate actual items per page based on A4 dimensions
  const pageWidth = 210  // A4 width in mm
  const pageHeight = 297 // A4 height in mm
  const startY = 55      // Starting Y position
  const rowHeight = 8    // Height per row
  const bottomMargin = 30 // Bottom margin
  const availableHeight = pageHeight - bottomMargin - startY
  const itemsPerPage = Math.floor(availableHeight / rowHeight) // Should be ~26 items
  
  
  const totalPages = Math.ceil(colorTableData.length / itemsPerPage)
  
  // 🌟 Prepare vector icon data for consistent rendering
  const iconVectorCache = new Map<string, ReturnType<typeof createVectorIconForPDF>>()
  const iconSizeMm = 6
  
  // Pre-generate vector data for all icons (no PNG conversion needed)
  for (const entry of colorTableData) {
    if (entry.icon) {
      const vectorData = createVectorIconForPDF(entry.icon, iconSizeMm)
      iconVectorCache.set(entry.dmcCode, vectorData)
    }
  }
  
  // A4 dimensions already calculated above
  
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    // Add new page for color table (A4 portrait) - except for the first page
    if (pageIndex > 0) {
      pdf.addPage([pageWidth, pageHeight], 'portrait')
    }
    
    // Add page size info to top-right corner
    setStandardFont(pdf)
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    const pageSizeText = `Paper: ${pageWidth}mm × ${pageHeight}mm`
    const textWidth = pdf.getTextWidth(pageSizeText)
    pdf.text(pageSizeText, pageWidth - textWidth - 10, 15)
    
    // Page header
    pdf.setFontSize(16)
    setStandardFont(pdf, 'bold')
    pdf.text('DMC Color & Icon Reference', 20, 30)
    
    // Page info
    pdf.setFontSize(12)
    setStandardFont(pdf)
    pdf.text(`Page ${pageIndex + 1} of ${totalPages}`, 20, 40)
    
    // Calculate data for this page
    const startIndex = pageIndex * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, colorTableData.length)
    const pageData = colorTableData.slice(startIndex, endIndex)
    
    // Table header
    let yPos = 55
    pdf.setFontSize(10)
    setStandardFont(pdf, 'bold')
    
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
    setStandardFont(pdf)
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
      pdf.rect(35, yPos - 5, 15, 5, 'F')
      pdf.setDrawColor(0, 0, 0)
      pdf.rect(35, yPos - 5, 15, 5, 'S')
      
      // 🌟 Icon - Use vector rendering (consistent with PDF generation!)
      const iconXPos = 55
      const iconYPos = yPos - 5
      const vectorData = iconVectorCache.get(entry.dmcCode)
      
      if (vectorData) {
        // Draw white circle background (50% transparent)
        const centerX = iconXPos + iconSizeMm / 2
        const centerY = iconYPos + iconSizeMm / 2
        const circleRadius = iconSizeMm * 0.45
        
        pdf.setGState(pdf.GState({ opacity: 0.5 }))
        pdf.setFillColor(255, 255, 255)
        pdf.circle(centerX, centerY, circleRadius, 'F')
        
        // Reset opacity and draw text icon
        pdf.setGState(pdf.GState({ opacity: 1.0 }))
        pdf.setTextColor(0, 0, 0)
        pdf.setFont(vectorData.fontFamily, vectorData.fontWeight)
        pdf.setFontSize(vectorData.fontSize)
        
        // Draw the icon symbol centered
        pdf.text(vectorData.symbol, centerX, centerY, { align: 'center', baseline: 'middle' })
      } else {
        // Fallback to simple text if vector data not available
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(14)
        setStandardFont(pdf)
        pdf.text(entry.icon.symbol || '•', iconXPos + 3, yPos)
      }
      
      // DMC info
      pdf.setFontSize(9)
      setStandardFont(pdf)
      pdf.text(`DMC ${entry.dmcCode}`, 75, yPos)
      
      // Color name (truncate if too long)
      const colorName = entry.dmcName.length > 20 ? entry.dmcName.substring(0, 17) + '...' : entry.dmcName
      pdf.text(colorName, 105, yPos)
      
      // Count and percentage
      pdf.text(entry.count.toLocaleString(), 150, yPos)
      pdf.text(entry.percentage.toFixed(1) + '%', 175, yPos)
      
      yPos += 8
      
      // This check should no longer be needed with proper itemsPerPage calculation
      if (yPos > pageHeight - bottomMargin) {
        break
      }
    }
    
    // Footer with summary
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    setStandardFont(pdf)
    pdf.text(`Colors shown: ${pageData.length} / Total: ${colorTableData.length}`, 20, pageHeight - 15)
  }
  
}

/**
 * 🚀 NEW: Generate PURE VECTOR PDF with infinite resolution (NO CANVAS!)
 * Uses jsPDF's native vector drawing functions for perfect scalability
 */
export async function generateVectorPDF(
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
  beadSizeMm?: number // Optional bead size parameter
): Promise<void> {
  try {
    // 🎯 NEW: 100px margin (26.46mm at 96 DPI) with center alignment
    const marginPx = 100
    const marginMm = (marginPx / 96) * 25.4 // Convert 100px to mm: ~26.46mm
    
    // Calculate pattern dimensions in mm
    const patternWidthMm = calculatedSize.actualWidth * 10
    const patternHeightMm = calculatedSize.actualHeight * 10
    
    // 🚀 CUSTOM PAGE SIZE: Always create perfect-fit page with margins
    const pageWidthMm = patternWidthMm + (marginMm * 2)  // Pattern + 100px margins on each side
    const pageHeightMm = patternHeightMm + (marginMm * 2) // Pattern + 100px margins on top/bottom
    
    console.log(`📐 Creating custom PDF page: ${pageWidthMm.toFixed(1)}mm × ${pageHeightMm.toFixed(1)}mm (Pattern: ${patternWidthMm.toFixed(1)}mm × ${patternHeightMm.toFixed(1)}mm + ${marginMm.toFixed(1)}mm margins)`)
    
    // Determine orientation based on aspect ratio
    const orientation = pageWidthMm > pageHeightMm ? 'landscape' : 'portrait'
    
    // 🚀 Create PDF with CUSTOM page size (no standard paper limitations!)
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: [pageWidthMm, pageHeightMm]  // Custom size: exact fit for pattern + margins
    })
    
    // Use provided bead size or fallback to defaults
    const actualBeadSizeMm = beadSizeMm || (beadType === 'circular' ? 2.8 : 2.6)
    
    // Generate icon assignments
    const patternGrid = createPatternGrid(pattern)
    const uniqueColors = Array.from(new Set(pattern.constrainedPixels.map(p => p.selectedDMCColor.code)))
    const iconAssignments = assignIconsToColors(uniqueColors, patternGrid)
    

    
    // 🎯 CENTER ALIGNMENT: Calculate starting position to center pattern on page
    const patternStartX = (pageWidthMm - patternWidthMm) / 2   // Perfect horizontal centering
    const patternStartY = (pageHeightMm - patternHeightMm) / 2  // Perfect vertical centering
    
    console.log(`🎯 Pattern positioned at center: (${patternStartX.toFixed(1)}mm, ${patternStartY.toFixed(1)}mm)`)
    
    // Draw each bead as pure vector
    let beadCount = 0
    for (const pixel of pattern.constrainedPixels) {
      const x = patternStartX + (pixel.x * actualBeadSizeMm)
      const y = patternStartY + (pixel.y * actualBeadSizeMm)
      
      // Draw bead background as rectangle (even for circular beads to eliminate gaps)
      pdf.setFillColor(pixel.selectedDMCColor.r, pixel.selectedDMCColor.g, pixel.selectedDMCColor.b)
      pdf.rect(x, y, actualBeadSizeMm, actualBeadSizeMm, 'F')
      
      // Draw white circle background for icon (50% transparency)
      pdf.setGState(pdf.GState({ opacity: 0.1 }))
      pdf.setFillColor(255, 255, 255) // White
      const circleRadius = actualBeadSizeMm * 0.45 // Circle inscribed in square (90% of half side)
      pdf.circle(x + actualBeadSizeMm/2, y + actualBeadSizeMm/2, circleRadius, 'F')
      
      // Reset opacity for icon text
      pdf.setGState(pdf.GState({ opacity: 1.0 }))
      
      // Draw icon as pure vector text with precise centering
      const icon = iconAssignments.get(pixel.selectedDMCColor.code)
      if (icon) {
        const vectorData = createVectorIconForPDF(icon, actualBeadSizeMm * 0.7) // Reduced icon area for better fit
        
        // Set text properties for vector rendering
        pdf.setTextColor(0, 0, 0) // Black text
        pdf.setFontSize(vectorData.fontSize)
        pdf.setFont(vectorData.fontFamily.toLowerCase(), 'normal')
        
        // Calculate precise center position for perfect alignment
        const textX = x + actualBeadSizeMm/2
        const textY = y + actualBeadSizeMm/2 // Perfect center alignment
        
        // Special handling for two-digit numbers
        if (vectorData.isDoubleDigit) {
          // Additional scaling for two-digit numbers to ensure perfect fit
          pdf.setFontSize(vectorData.fontSize * 0.85) // Further reduce for two digits
          
          // Draw text with tighter spacing for two digits
          pdf.text(vectorData.symbol, textX, textY, { 
            align: 'center',
            baseline: 'middle',
            maxWidth: actualBeadSizeMm * 0.85, // Tighter bounds for two digits
            charSpace: -0.2 // Reduce character spacing for better fit
          })
        } else {
          // Single character icons
          pdf.text(vectorData.symbol, textX, textY, { 
            align: 'center',
            baseline: 'middle',
            maxWidth: actualBeadSizeMm * 0.9 // Standard bounds for single characters
          })
        }
      }
      
      beadCount++
      
    }
    
    console.log(`✅ Pattern rendering completed: ${beadCount} beads as PERFECT VECTOR SQUARES with optimized icons!`)
    
    // 🎯 Add pattern info in available space (top-left corner above pattern)
    setStandardFont(pdf, 'normal')
    pdf.setFontSize(8) // Smaller font to fit in margin
    pdf.setTextColor(0, 0, 0)
    
    const infoX = 5 // Small margin from edge
    const infoY = 10 // Top margin
    pdf.text(`Size: ${calculatedSize.actualWidth} × ${calculatedSize.actualHeight} cm`, infoX, infoY)
    pdf.text(`Beads: ${calculatedSize.totalBeads.toLocaleString()}`, infoX, infoY + 4)
    pdf.text(`Type: ${beadType === 'circular' ? 'Circular' : 'Square'} (${actualBeadSizeMm}mm)`, infoX, infoY + 8)
    
    // Save the PDF with detailed filename
    const cleanImageName = imageName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9가-힣]/g, '_')
    const fileName = `${cleanImageName}_${calculatedSize.actualWidth}×${calculatedSize.actualHeight}cm.pdf`
    pdf.save(fileName)
    
    console.log(`🚀 CENTERED VECTOR PDF saved: ${fileName}`)
    console.log(`📄 Page size: ${pageWidthMm.toFixed(1)}mm × ${pageHeightMm.toFixed(1)}mm with perfect center alignment!`)
    
  } catch (error) {
    console.error('Vector PDF generation failed:', error)
    throw error
  }
}

/**
 * Generate DMC color table PDF only (pattern image removed)
 * Pages: DMC color table only (max 100 rows per page)
 */
export async function generateRealSizePDF(
  pattern: DMCFirstPattern,
  beadType: 'circular' | 'square',
  calculatedSize: {
    actualWidth: number
    actualHeight: number
    beadGridWidth: number
    beadGridHeight: number
    totalBeads: number
  },
  imageName: string
): Promise<void> {
  try {
    // Create PDF with standard A4 size for table display
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Prepare color table data
    const colorTableData = prepareColorTableData(pattern)
    
    // Add color table pages if there are colors to display
    if (colorTableData.length > 0) {
      // Use A4 paper settings for table layout
      const a4Paper = {
        paper: { name: 'A4', series: 'A' as const, size: 'A4', width: 210, height: 297 },
        patternWidth: 210,
        patternHeight: 297,
        orientation: 'portrait' as const,
        marginMm: 10  // Standard margin for A4 table layout
      }
      await addColorTablePages(pdf, colorTableData, a4Paper)
    } else {
      // Add empty page with message if no colors
      setStandardFont(pdf)
      pdf.setFontSize(16)
      pdf.text('No colors found in pattern', 105, 150, { align: 'center' })
    }
    
    // Generate filename with properly formatted decimals
    const timestamp = new Date().toISOString().slice(0, 10)
    const cleanImageName = imageName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9가-힣]/g, '_')
    const filename = `DMC_Table_${cleanImageName}_${formatDecimal(calculatedSize.actualWidth)}x${formatDecimal(calculatedSize.actualHeight)}cm_${timestamp}.pdf`
    
    // Save PDF
    pdf.save(filename)

  } catch (error) {
    throw new Error(`DMC table PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}