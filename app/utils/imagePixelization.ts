// Image Pixelization Engine for Gem Cross Stitch Pattern Generation

export interface BeadConfig {
  type: 'circular' | 'square'
  sizeInMm: number
  beadsPerCm: number
}

export interface PixelizationConfig {
  targetWidth: number // in cm
  targetHeight: number // in cm
  beadGridWidth: number // number of beads horizontally
  beadGridHeight: number // number of beads vertically
  beadConfig: BeadConfig
}

export interface PixelData {
  r: number
  g: number
  b: number
  a: number
}

export interface BeadPixel {
  x: number
  y: number
  color: PixelData
  averageColor: PixelData
}

/**
 * Calculate bead configuration based on bead type and size
 */
export function calculateBeadConfig(beadType: 'circular' | 'square', beadSize?: number): BeadConfig {
  const sizeInMm = beadSize || (beadType === 'circular' ? 2.8 : 2.6)
  const beadsPerCm = 10 / sizeInMm // Convert to beads per centimeter
  
  return {
    type: beadType,
    sizeInMm,
    beadsPerCm
  }
}

/**
 * Calculate pixelization configuration from input parameters
 */
export function calculatePixelizationConfig(
  targetWidth: number,
  imageWidth: number,
  imageHeight: number,
  beadType: 'circular' | 'square',
  beadSize?: number
): PixelizationConfig {
  const aspectRatio = imageHeight / imageWidth
  const targetHeight = targetWidth * aspectRatio
  
  const beadConfig = calculateBeadConfig(beadType, beadSize)
  const beadGridWidth = Math.round(targetWidth * beadConfig.beadsPerCm)
  const beadGridHeight = Math.round(targetHeight * beadConfig.beadsPerCm)
  
  return {
    targetWidth,
    targetHeight,
    beadGridWidth,
    beadGridHeight,
    beadConfig
  }
}

/**
 * Load image data from canvas
 */
export function loadImageData(imageSrc: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      resolve(imageData)
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageSrc
  })
}

/**
 * Get pixel color at specific coordinates
 */
export function getPixelColor(imageData: ImageData, x: number, y: number): PixelData {
  const index = (y * imageData.width + x) * 4
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2],
    a: imageData.data[index + 3]
  }
}

/**
 * Calculate average color for a region of pixels
 */
export function calculateAverageColor(
  imageData: ImageData,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): PixelData {
  let totalR = 0, totalG = 0, totalB = 0, totalA = 0
  let pixelCount = 0
  
  for (let y = startY; y < endY && y < imageData.height; y++) {
    for (let x = startX; x < endX && x < imageData.width; x++) {
      const pixel = getPixelColor(imageData, x, y)
      totalR += pixel.r
      totalG += pixel.g
      totalB += pixel.b
      totalA += pixel.a
      pixelCount++
    }
  }
  
  if (pixelCount === 0) {
    return { r: 0, g: 0, b: 0, a: 255 }
  }
  
  return {
    r: Math.round(totalR / pixelCount),
    g: Math.round(totalG / pixelCount),
    b: Math.round(totalB / pixelCount),
    a: Math.round(totalA / pixelCount)
  }
}

/**
 * Pixelize image based on bead grid configuration
 */
export function pixelizeImage(
  imageData: ImageData,
  config: PixelizationConfig
): BeadPixel[] {
  const pixels: BeadPixel[] = []
  
  // Calculate scaling factors
  const scaleX = imageData.width / config.beadGridWidth
  const scaleY = imageData.height / config.beadGridHeight
  
  for (let beadY = 0; beadY < config.beadGridHeight; beadY++) {
    for (let beadX = 0; beadX < config.beadGridWidth; beadX++) {
      // Calculate source pixel region for this bead
      const startX = Math.floor(beadX * scaleX)
      const startY = Math.floor(beadY * scaleY)
      const endX = Math.floor((beadX + 1) * scaleX)
      const endY = Math.floor((beadY + 1) * scaleY)
      
      // Get center pixel for this bead region
      const centerX = Math.floor((startX + endX) / 2)
      const centerY = Math.floor((startY + endY) / 2)
      const centerColor = getPixelColor(imageData, centerX, centerY)
      
      // Calculate average color for this bead region
      const averageColor = calculateAverageColor(imageData, startX, startY, endX, endY)
      
      pixels.push({
        x: beadX,
        y: beadY,
        color: centerColor,
        averageColor
      })
    }
  }
  
  return pixels
}

/**
 * Create pixelized image data for preview
 */
export function createPixelizedImageData(
  pixels: BeadPixel[],
  config: PixelizationConfig,
  useAverageColor = true
): ImageData {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }
  
  canvas.width = config.beadGridWidth
  canvas.height = config.beadGridHeight
  
  const imageData = ctx.createImageData(config.beadGridWidth, config.beadGridHeight)
  
  pixels.forEach(pixel => {
    const index = (pixel.y * config.beadGridWidth + pixel.x) * 4
    const color = useAverageColor ? pixel.averageColor : pixel.color
    
    imageData.data[index] = color.r
    imageData.data[index + 1] = color.g
    imageData.data[index + 2] = color.b
    imageData.data[index + 3] = color.a
  })
  
  return imageData
}

/**
 * Convert ImageData to data URL for display
 */
export function imageDataToDataURL(imageData: ImageData): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }
  
  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)
  
  return canvas.toDataURL('image/png')
}

/**
 * Resize image data URL to specific dimensions for display
 */
export function resizeImageForDisplay(
  imageSrc: string,
  maxWidth: number,
  maxHeight: number,
  smooth = true
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      // Calculate display dimensions while maintaining aspect ratio
      let displayWidth = img.width
      let displayHeight = img.height
      
      if (displayWidth > maxWidth) {
        displayHeight = (displayHeight * maxWidth) / displayWidth
        displayWidth = maxWidth
      }
      
      if (displayHeight > maxHeight) {
        displayWidth = (displayWidth * maxHeight) / displayHeight
        displayHeight = maxHeight
      }
      
      canvas.width = displayWidth
      canvas.height = displayHeight
      
      // Set image smoothing for pixelated or smooth display
      ctx.imageSmoothingEnabled = smooth
      if (!smooth) {
        ctx.imageSmoothingQuality = 'low'
      }
      
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight)
      resolve(canvas.toDataURL('image/png'))
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageSrc
  })
}