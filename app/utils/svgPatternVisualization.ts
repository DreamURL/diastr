// SVG Pattern Visualization System for Cross Stitch Patterns
// Creates lightweight, scalable SVG patterns for web display

import { DMCFirstPattern } from '../hooks/useDMCFirstPatternGeneration'
import { assignIconsToColors, type Icon } from './iconPlacement'
import { createVectorIconForPDF } from './svgIconGenerator'

export interface SVGPatternOptions {
  scale: number          // pixels per bead cell
  showGrid: boolean
  showIcons: boolean
  showColors: boolean
  iconScale: number      // icon size relative to cell (0.0-1.0)
  gridLineWidth: number
  backgroundColor: string
  gridColor: string
  iconColor: string
}

const DEFAULT_SVG_OPTIONS: SVGPatternOptions = {
  scale: 20,
  showGrid: false,       // 🎯 Match PDF output: No grid lines by default
  showIcons: true,
  showColors: true,
  iconScale: 0.7,        // Icons are 70% of cell size (matching PDF)
  gridLineWidth: 1,
  backgroundColor: '#ffffff',
  gridColor: '#000000',
  iconColor: '#000000'
}

/**
 * Create pattern grid from DMC pattern data
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
 * 🚀 Render pattern as SVG for web display (INFINITE SCALABILITY!)
 * Uses same vector logic as PDF generation for consistent quality
 */
export async function renderPatternToSVG(
  pattern: DMCFirstPattern,
  options: Partial<SVGPatternOptions> = {}
): Promise<{
  svgString: string
  iconAssignments: Map<string, Icon>
  stats: any
}> {
  const opts = { ...DEFAULT_SVG_OPTIONS, ...options }
  
  // Calculate dimensions
  const patternWidth = pattern.config.beadGridWidth
  const patternHeight = pattern.config.beadGridHeight
  const svgWidth = patternWidth * opts.scale
  const svgHeight = patternHeight * opts.scale
  
  // Create pattern grid and assign icons
  const patternGrid = createPatternGrid(pattern)
  const uniqueColors = Array.from(new Set(pattern.constrainedPixels.map(p => p.selectedDMCColor.code)))
  const iconAssignments = assignIconsToColors(uniqueColors, patternGrid)
  
  // Calculate icon size in pixels (converted from vector logic)
  const iconSizePx = opts.scale * opts.iconScale
  
  // Start building SVG string
  let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`
  
  // Add background
  svgContent += `<rect width="${svgWidth}" height="${svgHeight}" fill="${opts.backgroundColor}"/>`
  
  // Add color backgrounds first (if enabled)
  if (opts.showColors) {
    for (const pixel of pattern.constrainedPixels) {
      const x = pixel.x * opts.scale
      const y = pixel.y * opts.scale
      const color = `rgb(${pixel.selectedDMCColor.r}, ${pixel.selectedDMCColor.g}, ${pixel.selectedDMCColor.b})`
      
      svgContent += `<rect x="${x}" y="${y}" width="${opts.scale}" height="${opts.scale}" fill="${color}"/>`
    }
  }
  
  // Add icon backgrounds (50% transparent white circles like in PDF)
  if (opts.showIcons) {
    for (const pixel of pattern.constrainedPixels) {
      const x = pixel.x * opts.scale
      const y = pixel.y * opts.scale
      const centerX = x + opts.scale / 2
      const centerY = y + opts.scale / 2
      const circleRadius = opts.scale * 0.45  // 45% of bead size (matching PDF)
      
      svgContent += `<circle cx="${centerX}" cy="${centerY}" r="${circleRadius}" fill="white" fill-opacity="0.1"/>`
    }
  }
  
  // Add icons (if enabled)
  if (opts.showIcons) {
    for (const pixel of pattern.constrainedPixels) {
      const icon = iconAssignments.get(pixel.selectedDMCColor.code)
      if (icon) {
        const x = pixel.x * opts.scale
        const y = pixel.y * opts.scale
        const centerX = x + opts.scale / 2
        const centerY = y + opts.scale / 2
        
        // 🎯 EXACT SAME LOGIC AS PDF: Use 70% of bead size for icon area
        const beadSizeMm = opts.scale / 3.78  // Convert px to mm (assuming 96 DPI: 25.4mm / 96px * scale)
        const vectorIcon = createVectorIconForPDF(icon, beadSizeMm * 0.7)
        
        // Calculate font size in pixels (convert from points, PDF-style)
        let fontSizePx = (vectorIcon.fontSize * 96) / 72  // 72pt = 96px at 96 DPI
        
        // 🎯 EXACT SAME TWO-DIGIT LOGIC AS PDF
        if (vectorIcon.isDoubleDigit) {
          fontSizePx = fontSizePx * 0.85  // Additional scaling for two-digit numbers
        }
        
        // Ensure minimum readable size
        const finalFontSize = Math.max(8, fontSizePx)
        
        svgContent += `<text x="${centerX}" y="${centerY}" ` +
          `text-anchor="middle" dominant-baseline="central" ` +
          `font-family="${vectorIcon.fontFamily}" ` +
          `font-size="${finalFontSize}" ` +
          `font-weight="${vectorIcon.fontWeight}" ` +
          `fill="${opts.iconColor}" ` +
          `style="text-rendering: geometricPrecision; shape-rendering: geometricPrecision;">${escapeXmlEntities(vectorIcon.symbol)}</text>`
      }
    }
  }
  
  // Add grid lines (if enabled) - draw last so they're on top
  if (opts.showGrid) {
    // Vertical lines
    for (let i = 0; i <= patternWidth; i++) {
      const x = i * opts.scale
      svgContent += `<line x1="${x}" y1="0" x2="${x}" y2="${svgHeight}" stroke="${opts.gridColor}" stroke-width="${opts.gridLineWidth}"/>`
    }
    
    // Horizontal lines
    for (let i = 0; i <= patternHeight; i++) {
      const y = i * opts.scale
      svgContent += `<line x1="0" y1="${y}" x2="${svgWidth}" y2="${y}" stroke="${opts.gridColor}" stroke-width="${opts.gridLineWidth}"/>`
    }
  }
  
  // Close SVG
  svgContent += `</svg>`
  
  return {
    svgString: svgContent,
    iconAssignments,
    stats: {
      width: patternWidth,
      height: patternHeight,
      totalCells: patternWidth * patternHeight,
      uniqueColors: uniqueColors.length,
      svgSize: svgContent.length  // SVG string size in characters
    }
  }
}

/**
 * Create SVG data URL for direct use in img src or CSS
 */
export function createSVGDataURL(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
}

/**
 * Escape XML entities for safe SVG embedding
 */
function escapeXmlEntities(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 🚀 Create lightweight SVG pattern for web preview
 * Optimized for fast loading and smooth interaction
 */
export async function createWebPreviewSVG(
  pattern: DMCFirstPattern,
  maxSize: number = 800  // Maximum dimension in pixels
): Promise<string> {
  const patternWidth = pattern.config.beadGridWidth
  const patternHeight = pattern.config.beadGridHeight
  
  // Calculate scale to fit within maxSize
  const maxDimension = Math.max(patternWidth, patternHeight)
  const scale = Math.min(maxSize / maxDimension, 20)  // Max 20px per cell for performance
  
  const { svgString } = await renderPatternToSVG(pattern, {
    scale: Math.max(8, scale),  // Minimum 8px per cell for readability
    showGrid: false,  // 🎯 Clean preview: No grid lines
    showIcons: false,  // 🎨 Clean preview: No icons or icon backgrounds
    showColors: true,
    iconScale: 0.7,  // Icon scale (not used when showIcons is false)
    gridLineWidth: 1,
    backgroundColor: '#ffffff',
    gridColor: '#000000',
    iconColor: '#000000'
  })
  
  return createSVGDataURL(svgString)
}

/**
 * 🎯 Create high-detail SVG pattern for zoom/export
 * Higher resolution for detailed viewing
 */
export async function createDetailedSVG(
  pattern: DMCFirstPattern,
  scale: number = 30  // Larger scale for detail
): Promise<string> {
  const { svgString } = await renderPatternToSVG(pattern, {
    scale,
    showGrid: false,  // 🎯 Match PDF output: No grid lines
    showIcons: true,
    showColors: true,
    iconScale: 0.7,  // 🎯 Match PDF icon scale (70% of bead size)
    gridLineWidth: Math.max(1, scale / 20),  // Scale grid line width
    backgroundColor: '#ffffff',
    gridColor: '#000000',
    iconColor: '#000000'
  })
  
  return createSVGDataURL(svgString)
}