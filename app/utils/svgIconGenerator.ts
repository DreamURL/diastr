// SVG Icon Generator for Cross Stitch Patterns
// REVOLUTIONARY: Vector-based icons with infinite resolution!

export interface SVGIconOptions {
  sizeMm: number
  color?: string
  fontWeight?: 'normal' | 'bold'
  fontFamily?: string
  fontSize?: number // Font size multiplier (1.0 = default 75, 0.75 = smaller for double digits)
  isDoubleDigit?: boolean // Special handling for two-digit numbers
}

/**
 * Create SVG icon with infinite resolution (VECTOR-BASED SOLUTION!)
 * No more resolution limits, browser crashes, or quality issues!
 */
export function createIconSVGForPDF(icon: any, options: SVGIconOptions = { sizeMm: 5 }): string {
  if (!icon || !icon.symbol) return createDefaultIconSVG(options)
  
  const { 
    sizeMm, 
    color = 'black', 
    fontWeight = 'normal', 
    fontFamily = 'Arial, sans-serif',
    fontSize: optionsFontSize,
    isDoubleDigit: optionsIsDoubleDigit 
  } = options
  const symbol = icon.symbol
  
  // Auto-detect double digit from icon properties or symbol length
  const isDoubleDigit = optionsIsDoubleDigit ?? icon.isDoubleDigit ?? (symbol.length > 1 && /^\d+$/.test(symbol))
  
  // Calculate optimal font size
  const baseFontSize = 75
  const iconFontSizeMultiplier = optionsFontSize ?? icon.fontSize ?? (isDoubleDigit ? 0.75 : 1.0)
  const finalFontSize = Math.round(baseFontSize * iconFontSizeMultiplier)
  
  // Adjust vertical position for double-digit numbers (they may need slight offset)
  const yPosition = isDoubleDigit ? '52' : '50'
  
  // Create SVG with precise dimensions for PDF compatibility
  const svg = `
    <svg width="${sizeMm}mm" height="${sizeMm}mm" 
         viewBox="0 0 100 100" 
         xmlns="http://www.w3.org/2000/svg">
      <text x="50" y="${yPosition}" 
            text-anchor="middle" 
            dominant-baseline="central"
            font-family="${fontFamily}"
            font-size="${finalFontSize}"
            font-weight="${fontWeight}"
            fill="${color}"
            style="text-rendering: geometricPrecision; shape-rendering: geometricPrecision; letter-spacing: ${isDoubleDigit ? '-1px' : '0'}">
        ${escapeXmlEntities(symbol)}
      </text>
    </svg>
  `.replace(/\n\s+/g, ' ').trim()
  
  // Convert SVG to data URL
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * Create default fallback SVG icon (simple circle)
 */
export function createDefaultIconSVG(options: SVGIconOptions = { sizeMm: 5 }): string {
  const { sizeMm, color = 'black' } = options
  
  const svg = `
    <svg width="${sizeMm}mm" height="${sizeMm}mm" 
         viewBox="0 0 100 100" 
         xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="25" 
              fill="${color}" 
              style="shape-rendering: geometricPrecision;"/>
    </svg>
  `.replace(/\n\s+/g, ' ').trim()
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
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
 * Create optimized icon for canvas rendering
 * Converts SVG to image element for canvas drawing
 */
export function createSVGImageForCanvas(icon: any, sizeMm: number = 5): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Pass icon-specific font settings to SVG generator
    const svgOptions: SVGIconOptions = {
      sizeMm,
      fontSize: icon.fontSize,
      isDoubleDigit: icon.isDoubleDigit
    }
    const svgDataUrl = createIconSVGForPDF(icon, svgOptions)
    const img = new Image()
    
    img.onload = () => resolve(img)
    img.onerror = () => {
      // Create fallback image
      const fallbackImg = new Image()
      fallbackImg.onload = () => resolve(fallbackImg)
      fallbackImg.onerror = () => reject(new Error('Failed to create fallback icon'))
      fallbackImg.src = createDefaultIconSVG({ sizeMm })
    }
    
    img.src = svgDataUrl
  })
}

/**
 * SVG Icon cache for performance optimization
 */
const svgIconCache = new Map<string, string>()

/**
 * Get cached SVG icon or create new one
 * ENHANCED: Now supports font size variations for proper double-digit rendering
 */
export function getCachedSVGIcon(icon: any, sizeMm: number): string {
  // Include font size and double-digit flag in cache key for proper differentiation
  const fontSize = icon?.fontSize ?? (icon?.isDoubleDigit ? 0.75 : 1.0)
  const isDoubleDigit = icon?.isDoubleDigit ?? false
  const cacheKey = `svg-${icon?.symbol || 'default'}-${sizeMm}-fs${fontSize}-dd${isDoubleDigit}`
  
  if (!svgIconCache.has(cacheKey)) {
    const svgDataUrl = icon?.symbol 
      ? createIconSVGForPDF(icon, { sizeMm, fontSize: icon.fontSize, isDoubleDigit: icon.isDoubleDigit })
      : createDefaultIconSVG({ sizeMm })
    svgIconCache.set(cacheKey, svgDataUrl)
  }
  
  return svgIconCache.get(cacheKey)!
}

/**
 * 🚀 NEW: Direct vector icon rendering for PDF (NO RASTERIZATION!)
 * Returns icon data for direct PDF vector rendering
 */
export function createVectorIconForPDF(icon: any, sizeMm: number): {
  symbol: string
  fontSize: number
  fontFamily: string
  fontWeight: string
  isDoubleDigit: boolean
} {
  if (!icon || !icon.symbol) {
    return {
      symbol: '●',
      fontSize: Math.round(sizeMm * 12), // Convert mm to points (1mm ≈ 2.83pt, but use 12 for visibility)
      fontFamily: 'Arial',
      fontWeight: 'normal',
      isDoubleDigit: false
    }
  }
  
  const symbol = icon.symbol
  const isDoubleDigit = icon.isDoubleDigit ?? (symbol.length > 1 && /^\d+$/.test(symbol))
  
  // Calculate optimal font size in points for PDF (adjusted for perfect fit)
  // PDF points: 1mm ≈ 2.83pt, but we need smaller icons to fit in bead squares
  const baseFontSizePoints = sizeMm * 2.2 // Reduced from 10 to fit better in squares
  const fontSizeMultiplier = icon.fontSize ?? (isDoubleDigit ? 0.6 : 0.8) // Smaller for better fit
  const finalFontSize = Math.max(4, Math.round(baseFontSizePoints * fontSizeMultiplier)) // Minimum 4pt
  
  return {
    symbol: symbol,
    fontSize: finalFontSize,
    fontFamily: 'Arial', // Use standard PDF font
    fontWeight: 'normal',
    isDoubleDigit
  }
}

/**
 * LEGACY: Convert SVG to high-resolution PNG for PDF compatibility
 * ⚠️ DEPRECATED: Use createVectorIconForPDF instead for infinite resolution
 */
export function convertSVGToPNG(icon: any, sizeMm: number, dpi: number = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create SVG data URL with proper font sizing for double-digit numbers
    const svgOptions: SVGIconOptions = {
      sizeMm,
      fontSize: icon.fontSize,
      isDoubleDigit: icon.isDoubleDigit
    }
    const svgDataUrl = createIconSVGForPDF(icon, svgOptions)
    
    // Calculate canvas size for high DPI
    const sizePx = (sizeMm / 25.4) * dpi // Convert mm to pixels at specified DPI
    
    // Create temporary image to load SVG
    const img = new Image()
    img.onload = () => {
      // Create high-resolution canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      // Set canvas size
      canvas.width = sizePx
      canvas.height = sizePx
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true
      if ('imageSmoothingQuality' in ctx) {
        (ctx as any).imageSmoothingQuality = 'high'
      }
      
      // Clear with transparent background
      ctx.clearRect(0, 0, sizePx, sizePx)
      
      // Draw SVG to canvas at high resolution
      ctx.drawImage(img, 0, 0, sizePx, sizePx)
      
      // Convert to PNG data URL
      const pngDataUrl = canvas.toDataURL('image/png', 1.0)
      
      resolve(pngDataUrl)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load SVG for conversion'))
    }
    
    img.src = svgDataUrl
  })
}

/**
 * Clear SVG cache (useful for memory management)
 */
export function clearSVGIconCache(): void {
  svgIconCache.clear()
}