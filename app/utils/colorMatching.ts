// CIELAB Delta E Color Matching System

export interface RGBColor {
  r: number
  g: number
  b: number
}

export interface LABColor {
  l: number
  a: number
  b: number
}

/**
 * Convert RGB to CIELAB color space for accurate color comparison
 */
export function rgbToLab(rgb: RGBColor): LABColor {
  // First convert RGB to XYZ
  let r = rgb.r / 255
  let g = rgb.g / 255
  let b = rgb.b / 255

  // Apply gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  // Convert to XYZ using sRGB matrix
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  // Convert XYZ to LAB
  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116

  return {
    l: (116 * y) - 16,
    a: 500 * (x - y),
    b: 200 * (y - z)
  }
}

/**
 * Calculate Delta E 2000 color difference between two LAB colors
 * Returns a value where 0 = identical colors, higher values = more different
 */
export function deltaE2000(lab1: LABColor, lab2: LABColor): number {
  const { l: l1, a: a1, b: b1 } = lab1
  const { l: l2, a: a2, b: b2 } = lab2

  // Calculate Chroma and Hue
  const c1 = Math.sqrt(a1 * a1 + b1 * b1)
  const c2 = Math.sqrt(a2 * a2 + b2 * b2)
  const cAvg = (c1 + c2) / 2

  const g = 0.5 * (1 - Math.sqrt(Math.pow(cAvg, 7) / (Math.pow(cAvg, 7) + Math.pow(25, 7))))
  
  const a1Prime = a1 * (1 + g)
  const a2Prime = a2 * (1 + g)
  
  const c1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1)
  const c2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2)
  const cPrimeAvg = (c1Prime + c2Prime) / 2

  const h1Prime = Math.atan2(b1, a1Prime) * 180 / Math.PI
  const h2Prime = Math.atan2(b2, a2Prime) * 180 / Math.PI

  let deltaHPrime = h2Prime - h1Prime
  if (Math.abs(deltaHPrime) > 180) {
    deltaHPrime = deltaHPrime > 0 ? deltaHPrime - 360 : deltaHPrime + 360
  }

  const deltaLPrime = l2 - l1
  const deltaCPrime = c2Prime - c1Prime
  const deltaHPrimeValue = 2 * Math.sqrt(c1Prime * c2Prime) * Math.sin(deltaHPrime * Math.PI / 360)

  const lPrimeAvg = (l1 + l2) / 2
  const hPrimeAvg = Math.abs(h1Prime - h2Prime) <= 180 ? 
    (h1Prime + h2Prime) / 2 : 
    ((h1Prime + h2Prime + 360) / 2)

  const t = 1 - 0.17 * Math.cos((hPrimeAvg - 30) * Math.PI / 180) +
           0.24 * Math.cos(2 * hPrimeAvg * Math.PI / 180) +
           0.32 * Math.cos((3 * hPrimeAvg + 6) * Math.PI / 180) -
           0.20 * Math.cos((4 * hPrimeAvg - 63) * Math.PI / 180)

  const deltaTheta = 30 * Math.exp(-Math.pow((hPrimeAvg - 275) / 25, 2))
  const rc = 2 * Math.sqrt(Math.pow(cPrimeAvg, 7) / (Math.pow(cPrimeAvg, 7) + Math.pow(25, 7)))
  const sl = 1 + (0.015 * Math.pow(lPrimeAvg - 50, 2)) / Math.sqrt(20 + Math.pow(lPrimeAvg - 50, 2))
  const sc = 1 + 0.045 * cPrimeAvg
  const sh = 1 + 0.015 * cPrimeAvg * t
  const rt = -Math.sin(2 * deltaTheta * Math.PI / 180) * rc

  const kl = 1, kc = 1, kh = 1 // weighting factors

  const deltaE = Math.sqrt(
    Math.pow(deltaLPrime / (kl * sl), 2) +
    Math.pow(deltaCPrime / (kc * sc), 2) +
    Math.pow(deltaHPrimeValue / (kh * sh), 2) +
    rt * (deltaCPrime / (kc * sc)) * (deltaHPrimeValue / (kh * sh))
  )

  return deltaE
}

/**
 * Simple Euclidean distance in RGB space (faster but less accurate)
 */
export function euclideanDistance(rgb1: RGBColor, rgb2: RGBColor): number {
  const dr = rgb1.r - rgb2.r
  const dg = rgb1.g - rgb2.g
  const db = rgb1.b - rgb2.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

/**
 * Find the closest color from a palette using Delta E 2000
 */
export function findClosestColorDeltaE(
  targetColor: RGBColor,
  palette: RGBColor[]
): { color: RGBColor; distance: number; index: number } {
  const targetLab = rgbToLab(targetColor)
  let minDistance = Infinity
  let closestColor = palette[0]
  let closestIndex = 0

  for (let i = 0; i < palette.length; i++) {
    const paletteColor = palette[i]
    const paletteLab = rgbToLab(paletteColor)
    const distance = deltaE2000(targetLab, paletteLab)

    if (distance < minDistance) {
      minDistance = distance
      closestColor = paletteColor
      closestIndex = i
    }
  }

  return {
    color: closestColor,
    distance: minDistance,
    index: closestIndex
  }
}

/**
 * Find the closest color using Euclidean distance (faster)
 */
export function findClosestColorEuclidean(
  targetColor: RGBColor,
  palette: RGBColor[]
): { color: RGBColor; distance: number; index: number } {
  let minDistance = Infinity
  let closestColor = palette[0]
  let closestIndex = 0

  for (let i = 0; i < palette.length; i++) {
    const paletteColor = palette[i]
    const distance = euclideanDistance(targetColor, paletteColor)

    if (distance < minDistance) {
      minDistance = distance
      closestColor = paletteColor
      closestIndex = i
    }
  }

  return {
    color: closestColor,
    distance: minDistance,
    index: closestIndex
  }
}

/**
 * K-Means clustering for color quantization
 */
export interface KMeansResult {
  centroids: RGBColor[]
  labels: number[]
  iterations: number
}

export function kMeansColorQuantization(
  colors: RGBColor[],
  k: number,
  maxIterations: number = 100
): KMeansResult {
  if (colors.length === 0) throw new Error('Colors array cannot be empty')
  if (k <= 0) throw new Error('K must be positive')
  if (k >= colors.length) {
    // If k >= number of unique colors, return all colors as centroids
    return {
      centroids: colors.slice(0, k),
      labels: colors.map((_, i) => Math.min(i, k - 1)),
      iterations: 0
    }
  }

  // Initialize centroids using k-means++ algorithm
  const centroids: RGBColor[] = []
  
  // Choose first centroid randomly
  centroids.push(colors[Math.floor(Math.random() * colors.length)])
  
  // Choose remaining centroids using k-means++
  for (let i = 1; i < k; i++) {
    const distances: number[] = []
    let totalDistance = 0
    
    for (const color of colors) {
      let minDistanceSquared = Infinity
      for (const centroid of centroids) {
        const dist = euclideanDistance(color, centroid)
        minDistanceSquared = Math.min(minDistanceSquared, dist * dist)
      }
      distances.push(minDistanceSquared)
      totalDistance += minDistanceSquared
    }
    
    // Choose next centroid with probability proportional to squared distance
    const random = Math.random() * totalDistance
    let cumulative = 0
    for (let j = 0; j < colors.length; j++) {
      cumulative += distances[j]
      if (cumulative >= random) {
        centroids.push(colors[j])
        break
      }
    }
  }

  let labels = new Array(colors.length)
  let prevLabels: number[] = []
  let iterations = 0

  // Main k-means loop
  while (iterations < maxIterations) {
    // Assign each color to closest centroid
    for (let i = 0; i < colors.length; i++) {
      let minDistance = Infinity
      let closestCentroid = 0
      
      for (let j = 0; j < centroids.length; j++) {
        const distance = euclideanDistance(colors[i], centroids[j])
        if (distance < minDistance) {
          minDistance = distance
          closestCentroid = j
        }
      }
      
      labels[i] = closestCentroid
    }

    // Check for convergence
    if (iterations > 0 && arraysEqual(labels, prevLabels)) {
      break
    }
    prevLabels = [...labels]

    // Update centroids
    for (let j = 0; j < k; j++) {
      const clusterColors = colors.filter((_, i) => labels[i] === j)
      
      if (clusterColors.length > 0) {
        const avgR = clusterColors.reduce((sum, c) => sum + c.r, 0) / clusterColors.length
        const avgG = clusterColors.reduce((sum, c) => sum + c.g, 0) / clusterColors.length
        const avgB = clusterColors.reduce((sum, c) => sum + c.b, 0) / clusterColors.length
        
        centroids[j] = {
          r: Math.round(avgR),
          g: Math.round(avgG),
          b: Math.round(avgB)
        }
      } else {
        // CRITICAL FIX: Reinitialize empty clusters to maximize diversity
        // Find the color farthest from existing centroids
        let maxMinDistance = 0
        let bestColor = colors[0]
        
        for (const color of colors) {
          let minDistance = Infinity
          for (let k = 0; k < centroids.length; k++) {
            if (k !== j) { // Don't compare to itself
              const dist = euclideanDistance(color, centroids[k])
              minDistance = Math.min(minDistance, dist)
            }
          }
          if (minDistance > maxMinDistance) {
            maxMinDistance = minDistance
            bestColor = color
          }
        }
        
        // Reinitialize empty cluster with the most diverse color
        centroids[j] = { ...bestColor }
      }
    }

    iterations++
  }

  return {
    centroids,
    labels,
    iterations
  }
}

/**
 * Helper function to check if two arrays are equal
 */
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/**
 * Extract unique colors from image data with optional sampling
 */
export function extractColorsFromImageData(
  imageData: ImageData,
  maxSamples?: number
): RGBColor[] {
  const colors: RGBColor[] = []
  const data = imageData.data
  
  // Sample pixels to limit processing time for large images
  const step = maxSamples ? Math.max(1, Math.floor(data.length / 4 / maxSamples)) : 1
  
  for (let i = 0; i < data.length; i += 4 * step) {
    colors.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2]
    })
  }
  
  return colors
}

/**
 * Calculate optimal number of colors based on image characteristics
 */
export function calculateOptimalColorCount(
  imageData: ImageData,
  minColors: number = 8,
  maxColors: number = 100
): { optimal: number; min: number; max: number } {
  const totalPixels = imageData.width * imageData.height
  
  // Sample colors to analyze complexity
  const sampledColors = extractColorsFromImageData(imageData, 10000)
  const uniqueColors = new Set(sampledColors.map(c => `${c.r},${c.g},${c.b}`)).size
  
  // Calculate optimal based on image complexity and size
  const complexityFactor = Math.min(uniqueColors / 1000, 1) // 0-1 scale
  const sizeFactor = Math.min(totalPixels / 100000, 1) // 0-1 scale
  
  const optimal = Math.round(
    minColors + (maxColors - minColors) * (complexityFactor * 0.7 + sizeFactor * 0.3)
  )
  
  return {
    optimal: Math.max(minColors, Math.min(maxColors, optimal)),
    min: Math.max(minColors, Math.min(20, Math.floor(optimal * 0.4))),
    max: Math.min(maxColors, Math.max(optimal * 1.5, uniqueColors))
  }
}