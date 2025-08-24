// Pure SVG Generator for Cross Stitch Patterns
// Generates lightweight SVG files with pattern only (no margins or info)

import { assignIconsToColors } from './iconPlacement'
import { DMCFirstPattern } from '../hooks/useDMCFirstPatternGeneration'
import { createVectorIconForPDF } from './svgIconGenerator'

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
 * Generate pure SVG pattern (no margins, no info)
 * Returns SVG content as string for direct download
 */
export function generatePureSVGPattern(
  pattern: DMCFirstPattern,
  beadType: 'circular' | 'square',
  calculatedSize: {
    actualWidth: number
    actualHeight: number
    beadGridWidth: number
    beadGridHeight: number
    totalBeads: number
  },
  beadSizeMm?: number
): string {
  // Use provided bead size or fallback to defaults
  const actualBeadSizeMm = beadSizeMm || (beadType === 'circular' ? 2.8 : 2.6)
  
  // Calculate pattern dimensions in mm (no margins)
  const patternWidthMm = calculatedSize.beadGridWidth * actualBeadSizeMm
  const patternHeightMm = calculatedSize.beadGridHeight * actualBeadSizeMm
  
  console.log(`📐 Creating pure SVG pattern: ${patternWidthMm.toFixed(1)}mm × ${patternHeightMm.toFixed(1)}mm`)
  
  // Generate icon assignments
  const patternGrid = createPatternGrid(pattern)
  const uniqueColors = Array.from(new Set(pattern.constrainedPixels.map(p => p.selectedDMCColor.code)))
  const iconAssignments = assignIconsToColors(uniqueColors, patternGrid)
  
  // Start building SVG content
  let svgContent = `<svg width="${patternWidthMm}mm" height="${patternHeightMm}mm" 
    viewBox="0 0 ${patternWidthMm} ${patternHeightMm}" 
    xmlns="http://www.w3.org/2000/svg">
  <!-- No CSS styles - all styles inline to prevent conflicts -->
  
  <!-- Pattern Background -->`
  
  // Draw each bead background
  for (const pixel of pattern.constrainedPixels) {
    const x = pixel.x * actualBeadSizeMm
    const y = pixel.y * actualBeadSizeMm
    
    svgContent += `
  <rect x="${x}" y="${y}" width="${actualBeadSizeMm}" height="${actualBeadSizeMm}" 
        fill="rgb(${pixel.selectedDMCColor.r}, ${pixel.selectedDMCColor.g}, ${pixel.selectedDMCColor.b})" 
        stroke="rgb(${pixel.selectedDMCColor.r}, ${pixel.selectedDMCColor.g}, ${pixel.selectedDMCColor.b})" 
        stroke-width="0.1" 
        shape-rendering="crispEdges" />`
  }
  
  svgContent += `
  
  <!-- Icon Backgrounds -->`
  
  // Draw white circle backgrounds for icons
  for (const pixel of pattern.constrainedPixels) {
    const x = pixel.x * actualBeadSizeMm
    const y = pixel.y * actualBeadSizeMm
    
    const centerX = x + actualBeadSizeMm / 2
    const centerY = y + actualBeadSizeMm / 2
    const circleRadius = actualBeadSizeMm * 0.45
    
    svgContent += `
  <circle cx="${centerX}" cy="${centerY}" r="${circleRadius}" 
          fill="white" opacity="0.1" />`
  }
  
  svgContent += `
  
  <!-- Icons -->`
  
  // Draw icons as text elements
  for (const pixel of pattern.constrainedPixels) {
    const x = pixel.x * actualBeadSizeMm
    const y = pixel.y * actualBeadSizeMm
    
    const icon = iconAssignments.get(pixel.selectedDMCColor.code)
    if (icon) {
      const vectorData = createVectorIconForPDF(icon, actualBeadSizeMm * 0.8)
      
      const centerX = x + actualBeadSizeMm / 2
      const centerY = y + actualBeadSizeMm / 2
      
      // EXACT PDF REPLICATION: Use identical font size calculation as PDF
      // PDF sets font size directly in points, SVG viewBox is in mm
      // 1 point = 0.352778 mm (standard conversion)
      let svgFontSizeMm = vectorData.fontSize * 0.05
      
      // Apply EXACT same scaling as PDF for double digits  
      if (vectorData.isDoubleDigit) {
        svgFontSizeMm = svgFontSizeMm * 0.70 // PDF: pdf.setFontSize(vectorData.fontSize * 0.85)
      }
      
      console.log(`📊 EXACT PDF MATCH: ${vectorData.symbol} | PDF: ${vectorData.fontSize}pt | SVG: ${svgFontSizeMm.toFixed(2)}mm | Double: ${vectorData.isDoubleDigit}`)
      
      // Simple approach: Just use PDF's charSpace equivalent in SVG
      const letterSpacing = vectorData.isDoubleDigit ? '-0.5' : '0'  // PDF charSpace: -0.2 equivalent
      
      svgContent += `
  <text x="${centerX}" y="${centerY}" 
        font-family="Arial, sans-serif"
        text-anchor="middle"
        font-size="${svgFontSizeMm}mm" 
        dominant-baseline="central" 
        fill="black"
        font-weight="normal"
        letter-spacing="${letterSpacing}">
    ${escapeXmlEntities(vectorData.symbol)}
  </text>`
    }
  }
  
  // Note: Grid lines removed for cleaner SVG output
  
  svgContent += `
</svg>`
  
  console.log(`✅ Pure SVG pattern generated successfully!`)
  
  return svgContent
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
 * Download SVG content as file
 */
export function downloadSVGFile(
  svgContent: string,
  fileName: string
): void {
  // Create blob with SVG content
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
  
  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  console.log(`📥 SVG file downloaded: ${fileName}`)
}