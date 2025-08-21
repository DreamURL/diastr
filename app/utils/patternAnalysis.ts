// Pattern Analysis for Accurate Color Count Recommendations
// Uses actual pixelized pattern data and DMC matching logic

import { BeadPixel, PixelizationConfig } from './imagePixelization'
import { 
  extractColorsFromImageData, 
  kMeansColorQuantization,
  type RGBColor 
} from './colorMatching'
import { 
  analyzeImageForDMCSelection,
  type DMCFirstPalette
} from './dmcFirstMatching'
import { DMC_COLORS } from './dmcColors'

export interface PatternColorAnalysis {
  optimal: number
  maximum: number
  analysis: {
    totalPixels: number
    uniquePixelColors: number
    dominantColors: number
    colorComplexity: number
    patternDensity: number
  }
}

/**
 * Analyze pixelized pattern data to determine optimal and maximum color counts
 * Uses the same DMC matching logic as the actual pattern generation
 */
export async function analyzePatternColorRequirements(
  pixels: BeadPixel[],
  config: PixelizationConfig,
  imageData: ImageData
): Promise<PatternColorAnalysis> {
  const totalPixels = pixels.length
  
  // Extract colors from pixelized data (same as actual DMC matching)
  const pixelColors: RGBColor[] = pixels.map(pixel => pixel.averageColor)
  
  // Analyze color distribution in pixelized data
  const colorFrequency = new Map<string, number>()
  const uniqueColors = new Set<string>()
  
  for (const color of pixelColors) {
    const key = `${color.r},${color.g},${color.b}`
    uniqueColors.add(key)
    colorFrequency.set(key, (colorFrequency.get(key) || 0) + 1)
  }
  
  const uniquePixelColors = uniqueColors.size
  
  // Calculate color complexity using entropy
  let entropy = 0
  colorFrequency.forEach((count) => {
    const probability = count / totalPixels
    entropy -= probability * Math.log2(probability)
  })
  const maxEntropy = Math.log2(uniquePixelColors)
  const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0
  
  // Find dominant colors (colors that occupy >2% of pattern)
  const dominantThreshold = totalPixels * 0.02
  const dominantColors = Array.from(colorFrequency.values())
    .filter(count => count > dominantThreshold).length
  
  // Calculate pattern density (how evenly colors are distributed)
  const avgFrequency = totalPixels / uniquePixelColors
  let variance = 0
  colorFrequency.forEach((count) => {
    variance += Math.pow(count - avgFrequency, 2)
  })
  const standardDeviation = Math.sqrt(variance / uniquePixelColors)
  const patternDensity = 1 - (standardDeviation / avgFrequency) // 0-1, higher = more even distribution
  
  // Test different color counts with actual DMC matching
  const testResults = await testDMCMatching(pixelColors, imageData)
  
  // Calculate optimal based on diminishing returns in quality
  const optimal = calculateOptimalFromTests(testResults, {
    complexity: normalizedEntropy,
    dominantColors,
    totalPixels,
    patternDensity
  })
  
  // Calculate maximum based on pattern resolution and practical limits
  const maxByResolution = Math.min(
    Math.floor(totalPixels / 4), // At least 4 pixels per color for visibility
    100 // Practical maximum for cross stitch
  )
  
  const maxByComplexity = Math.min(uniquePixelColors, DMC_COLORS.length)
  const maximum = Math.min(maxByResolution, maxByComplexity)
  
  return {
    optimal: Math.min(optimal, maximum),
    maximum: Math.max(maximum, optimal),
    analysis: {
      totalPixels,
      uniquePixelColors,
      dominantColors,
      colorComplexity: normalizedEntropy,
      patternDensity
    }
  }
}

/**
 * Test DMC matching with different color counts to find quality breakpoints
 */
async function testDMCMatching(
  pixelColors: RGBColor[],
  imageData: ImageData
): Promise<Array<{ colorCount: number; quality: number; efficiency: number }>> {
  const testCounts = [8, 12, 16, 20, 25, 30, 35, 40, 50, 60, 80]
  const results = []
  
  for (const colorCount of testCounts) {
    try {
      // Use actual DMC palette creation logic
      const paletteResult = await analyzeImageForDMCSelection(imageData, colorCount, 'standard')
      const palette = paletteResult.selectedColors
      
      // Calculate quality metrics
      let totalDistance = 0
      let matchedPixels = 0
      
      for (const pixelColor of pixelColors.slice(0, 1000)) { // Sample for performance
        let bestDistance = Infinity
        
        for (const dmcColor of palette) {
          const distance = Math.sqrt(
            Math.pow(pixelColor.r - dmcColor.r, 2) +
            Math.pow(pixelColor.g - dmcColor.g, 2) +
            Math.pow(pixelColor.b - dmcColor.b, 2)
          )
          
          if (distance < bestDistance) {
            bestDistance = distance
          }
        }
        
        totalDistance += bestDistance
        matchedPixels++
      }
      
      const avgDistance = totalDistance / matchedPixels
      const quality = Math.max(0, 1 - avgDistance / 255) // 0-1 scale
      const efficiency = quality / colorCount // Quality per color
      
      results.push({
        colorCount,
        quality,
        efficiency
      })
    } catch (error) {
    }
  }
  
  return results
}

/**
 * Calculate optimal color count from test results using diminishing returns analysis
 */
function calculateOptimalFromTests(
  testResults: Array<{ colorCount: number; quality: number; efficiency: number }>,
  patternMetrics: {
    complexity: number
    dominantColors: number
    totalPixels: number
    patternDensity: number
  }
): number {
  if (testResults.length === 0) {
    return 30 // Fallback
  }
  
  // Sort by color count
  testResults.sort((a, b) => a.colorCount - b.colorCount)
  
  // Find point of diminishing returns
  let bestColorCount = testResults[0].colorCount
  let bestScore = 0
  
  for (let i = 1; i < testResults.length; i++) {
    const current = testResults[i]
    const previous = testResults[i - 1]
    
    // Calculate improvement rate
    const qualityImprovement = current.quality - previous.quality
    const colorCostIncrease = current.colorCount - previous.colorCount
    const improvementRate = qualityImprovement / colorCostIncrease
    
    // Score based on quality gain vs. complexity cost
    const complexityBonus = patternMetrics.complexity * 0.3
    const densityBonus = patternMetrics.patternDensity * 0.2
    const dominantBonus = Math.min(patternMetrics.dominantColors / 10, 0.3)
    
    const score = improvementRate + complexityBonus + densityBonus + dominantBonus
    
    if (score > bestScore && current.colorCount <= 80) {
      bestScore = score
      bestColorCount = current.colorCount
    }
    
    // Stop if improvement rate drops significantly
    if (improvementRate < 0.001) {
      break
    }
  }
  
  // Ensure optimal is within reasonable bounds
  return Math.max(8, Math.min(bestColorCount, 80))
}

/**
 * Quick analysis for real-time updates (less accurate but faster)
 */
export function quickPatternColorAnalysis(
  pixels: BeadPixel[],
  config: PixelizationConfig
): { optimal: number; maximum: number } {
  const totalPixels = pixels.length
  const uniqueColors = new Set(
    pixels.map(p => `${p.averageColor.r},${p.averageColor.g},${p.averageColor.b}`)
  ).size
  
  // Simple heuristic based on pattern characteristics
  const densityFactor = Math.min(totalPixels / 1000, 1) // 0-1
  const complexityFactor = Math.min(uniqueColors / 100, 1) // 0-1
  
  const optimal = Math.max(
    8,
    Math.min(
      Math.round(12 + (uniqueColors * 0.3) + (densityFactor * 15) + (complexityFactor * 20)),
      80
    )
  )
  
  const maximum = Math.min(
    Math.floor(totalPixels / 4),
    Math.min(uniqueColors, 100)
  )
  
  return {
    optimal: Math.min(optimal, maximum),
    maximum: Math.max(maximum, optimal)
  }
}