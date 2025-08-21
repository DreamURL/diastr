// DMC-First Matching Algorithm for Cross Stitch Pattern Generation
// New Architecture: Image Analysis → DMC Selection → Constrained Pixelization

import { DMC_COLORS, DMC_COLOR_MAP, type DMCColor } from './dmcColors'
import {
  type RGBColor,
  type LABColor,
  rgbToLab,
  deltaE2000,
  extractColorsFromImageData,
  kMeansColorQuantization
} from './colorMatching'
import { type PixelizationConfig, type BeadPixel, type PixelData } from './imagePixelization'

// Pre-calculate LAB values for all DMC colors for performance
const DMC_LAB_CACHE = new Map<string, LABColor>()
DMC_COLORS.forEach(color => {
  DMC_LAB_CACHE.set(color.code, rgbToLab({
    r: color.r,
    g: color.g, 
    b: color.b
  }))
})

export interface DMCFirstMatch {
  dmcColor: DMCColor
  representativeness: number // How well this DMC color represents the image (0-1)
  coverage: number // How much of the image this color covers (0-1)
  importance: number // Combined score for selection priority
}

export interface DMCFirstPalette {
  selectedColors: DMCColor[]
  analysisData: {
    totalImageColors: number
    imageComplexity: number
    selectionStrategy: string
    guaranteedCount: number
  }
}

export interface ConstrainedPixel extends BeadPixel {
  selectedDMCColor: DMCColor
  selectionDistance: number // Distance to selected DMC color
}

/**
 * PHASE 1: Analyze entire image and select optimal DMC colors
 * This replaces the old pixelization-first approach
 */
export async function analyzeImageForDMCSelection(
  imageData: ImageData,
  targetColorCount: number,
  analysisQuality: 'fast' | 'standard' | 'high' = 'standard'
): Promise<DMCFirstPalette> {
  
  // CRITICAL DEBUG: Track DMC-First algorithm process
  console.log(`🚀 DMC-First Algorithm - Target: ${targetColorCount} colors`)
  
  // Validate input
  if (targetColorCount < 1) {
    throw new Error('Target color count must be at least 1')
  }
  
  if (targetColorCount > DMC_COLORS.length) {
  }
  
  const actualTargetCount = Math.min(targetColorCount, DMC_COLORS.length)
  console.log(`📐 Actual target (capped): ${actualTargetCount}`)
  
  // 1. Comprehensive image analysis with adaptive sampling
  const sampleSize = getSampleSizeForQuality(analysisQuality, imageData)
  const imageColors = extractColorsFromImageData(imageData, sampleSize)
  console.log(`📊 Sample size: ${sampleSize}, extracted colors: ${imageColors.length}`)
  
  if (imageColors.length === 0) {
    throw new Error('No colors found in image')
  }
  
  // 2. Advanced color analysis and clustering
  const clusterCount = calculateOptimalClusters(imageColors.length, actualTargetCount)
  console.log(`🎯 K-means clusters to generate: ${clusterCount} (${clusterCount / actualTargetCount}x target)`)
  
  const kmeansResult = kMeansColorQuantization(imageColors, clusterCount)
  console.log(`✅ K-means completed: ${kmeansResult.centroids.length} centroids after ${kmeansResult.iterations} iterations`)
  
  // 3. Calculate color importance and representativeness
  const colorAnalysis = analyzeColorImportance(imageColors, kmeansResult)
  console.log(`📈 Color importance analysis: ${colorAnalysis.length} colors analyzed`)
  
  // 4. Multi-factor DMC selection algorithm
  const selectedDMCColors = await selectOptimalDMCColors(
    colorAnalysis,
    actualTargetCount,
    analysisQuality
  )
  
  // 5. Validate exact count guarantee
  if (selectedDMCColors.length !== actualTargetCount) {
    throw new Error('DMC selection count mismatch')
  }
  
  return {
    selectedColors: selectedDMCColors,
    analysisData: {
      totalImageColors: new Set(imageColors.map(c => `${c.r},${c.g},${c.b}`)).size,
      imageComplexity: calculateImageComplexity(imageColors),
      selectionStrategy: getSelectionStrategy(analysisQuality, actualTargetCount),
      guaranteedCount: actualTargetCount
    }
  }
}

/**
 * PHASE 2: Pixelize image using only pre-selected DMC colors
 * This ensures exact color count and unlimited detail capability
 */
export function pixelizeWithConstrainedDMCColors(
  imageData: ImageData,
  config: PixelizationConfig,
  dmcPalette: DMCFirstPalette
): ConstrainedPixel[] {
  
  const pixels: ConstrainedPixel[] = []
  const scaleX = imageData.width / config.beadGridWidth
  const scaleY = imageData.height / config.beadGridHeight
  
  // Pre-calculate LAB values for selected DMC colors
  const selectedDMCLabs = dmcPalette.selectedColors.map(dmc => ({
    dmc,
    lab: DMC_LAB_CACHE.get(dmc.code)!
  }))
  
  for (let beadY = 0; beadY < config.beadGridHeight; beadY++) {
    for (let beadX = 0; beadX < config.beadGridWidth; beadX++) {
      // Calculate source pixel region for this bead
      const startX = Math.floor(beadX * scaleX)
      const startY = Math.floor(beadY * scaleY)
      const endX = Math.floor((beadX + 1) * scaleX)
      const endY = Math.floor((beadY + 1) * scaleY)
      
      // Calculate average color for this bead region
      const averageColor = calculateRegionAverageColor(imageData, startX, startY, endX, endY)
      const centerColor = getPixelColorAt(imageData, 
        Math.floor((startX + endX) / 2), 
        Math.floor((startY + endY) / 2)
      )
      
      // Find closest DMC color from pre-selected palette
      const { dmcColor, distance } = findClosestDMCFromPalette(averageColor, selectedDMCLabs)
      
      pixels.push({
        x: beadX,
        y: beadY,
        color: centerColor,
        averageColor: averageColor,
        selectedDMCColor: dmcColor,
        selectionDistance: distance
      })
    }
  }
  
  return pixels
}

/**
 * Calculate optimal sample size based on analysis quality
 */
function getSampleSizeForQuality(quality: 'fast' | 'standard' | 'high', imageData: ImageData): number {
  const totalPixels = imageData.width * imageData.height
  
  switch (quality) {
    case 'fast':
      return Math.min(10000, Math.floor(totalPixels * 0.1))
    case 'standard':
      return Math.min(50000, Math.floor(totalPixels * 0.3))
    case 'high':
      return Math.min(200000, Math.floor(totalPixels * 0.7))
    default:
      return 50000
  }
}

/**
 * Calculate optimal number of clusters for K-means
 * CRITICAL FIX: Increased diversity to support high color counts
 */
function calculateOptimalClusters(sampleSize: number, targetCount: number): number {
  // CRITICAL FIX: Use more clusters (8x) than target to get better color diversity
  // This ensures enough diversity for high color count requests (e.g., 200-250 colors)
  const baseClusters = Math.min(targetCount * 8, sampleSize) // Increased from 3x to 8x
  const maxClusters = Math.min(sampleSize / 5, 2000) // Reduced divisor, increased max clusters
  return Math.min(baseClusters, maxClusters)
}

/**
 * Analyze color importance based on frequency, distribution, and visual impact
 */
function analyzeColorImportance(
  imageColors: RGBColor[],
  kmeansResult: { centroids: RGBColor[], labels: number[] }
): Array<{
  centroid: RGBColor
  frequency: number
  visualImpact: number
  distributionScore: number
  importance: number
}> {
  // Calculate cluster frequencies
  const clusterFrequencies = new Array(kmeansResult.centroids.length).fill(0)
  for (const label of kmeansResult.labels) {
    clusterFrequencies[label]++
  }
  
  const totalSamples = imageColors.length
  
  return kmeansResult.centroids.map((centroid, index) => {
    const frequency = clusterFrequencies[index] / totalSamples
    
    // Calculate visual impact (brightness, saturation)
    const visualImpact = calculateVisualImpact(centroid)
    
    // Calculate distribution score (how spread out this color is)
    const distributionScore = calculateDistributionScore(centroid, imageColors)
    
    // Combined importance score
    const importance = (
      frequency * 0.4 +           // Frequency is important
      visualImpact * 0.3 +        // Visual impact matters
      distributionScore * 0.3     // Distribution adds context
    )
    
    return {
      centroid,
      frequency,
      visualImpact,
      distributionScore,
      importance
    }
  }).sort((a, b) => b.importance - a.importance) // Sort by importance
}

/**
 * Calculate visual impact of a color
 */
function calculateVisualImpact(color: RGBColor): number {
  // Convert to HSL for better perceptual analysis
  const r = color.r / 255
  const g = color.g / 255
  const b = color.b / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1))
  
  // High contrast colors (very dark or very light) have high impact
  const contrastImpact = Math.abs(lightness - 0.5) * 2
  
  // High saturation has high impact
  const saturationImpact = saturation
  
  return (contrastImpact * 0.6 + saturationImpact * 0.4)
}

/**
 * Calculate how distributed a color is across the image
 */
function calculateDistributionScore(target: RGBColor, imageColors: RGBColor[]): number {
  const targetLab = rgbToLab(target)
  let similarColorCount = 0
  const threshold = 20 // Delta E threshold for "similar" colors
  
  for (const color of imageColors) {
    const colorLab = rgbToLab(color)
    const distance = deltaE2000(targetLab, colorLab)
    if (distance <= threshold) {
      similarColorCount++
    }
  }
  
  return Math.min(similarColorCount / imageColors.length * 10, 1) // Normalize to 0-1
}

/**
 * Multi-factor DMC selection algorithm
 */
async function selectOptimalDMCColors(
  colorAnalysis: Array<{
    centroid: RGBColor
    frequency: number
    visualImpact: number
    distributionScore: number
    importance: number
  }>,
  targetCount: number,
  quality: 'fast' | 'standard' | 'high'
): Promise<DMCColor[]> {
  const selectedColors: DMCColor[] = []
  const usedDMCCodes = new Set<string>()
  
  // Phase 1: Select DMC colors for most important image colors
  const primaryPhaseCount = Math.min(targetCount, Math.floor(colorAnalysis.length * 0.8))
  
  for (let i = 0; i < primaryPhaseCount && selectedColors.length < targetCount; i++) {
    const analysis = colorAnalysis[i]
    const bestMatch = findBestDMCMatchExcluding(analysis.centroid, usedDMCCodes)
    
    if (bestMatch) {
      selectedColors.push(bestMatch.dmcColor)
      usedDMCCodes.add(bestMatch.dmcColor.code)
    }
  }
  
  // Phase 2: Fill remaining slots with diverse DMC colors
  while (selectedColors.length < targetCount) {
    const nextBest = findMostDiverseDMCColor(usedDMCCodes, selectedColors)
    
    if (!nextBest) {
      // Emergency fallback: use any remaining DMC color
      const remaining = DMC_COLORS.filter(c => !usedDMCCodes.has(c.code))
      if (remaining.length === 0) break
      
      const fallback = remaining[0]
      selectedColors.push(fallback)
      usedDMCCodes.add(fallback.code)
    } else {
      selectedColors.push(nextBest)
      usedDMCCodes.add(nextBest.code)
    }
  }
  
  return selectedColors
}

/**
 * Find best DMC match excluding already used colors
 */
function findBestDMCMatchExcluding(
  targetColor: RGBColor,
  usedCodes: Set<string>
): { dmcColor: DMCColor, distance: number } | null {
  const targetLab = rgbToLab(targetColor)
  let bestMatch: { dmcColor: DMCColor, distance: number } | null = null
  
  for (const dmcColor of DMC_COLORS) {
    if (usedCodes.has(dmcColor.code)) continue
    
    const dmcLab = DMC_LAB_CACHE.get(dmcColor.code)!
    const distance = deltaE2000(targetLab, dmcLab)
    
    if (!bestMatch || distance < bestMatch.distance) {
      bestMatch = { dmcColor, distance }
    }
  }
  
  return bestMatch
}

/**
 * Find most diverse DMC color from remaining options
 */
function findMostDiverseDMCColor(
  usedCodes: Set<string>,
  alreadySelected: DMCColor[]
): DMCColor | null {
  const available = DMC_COLORS.filter(c => !usedCodes.has(c.code))
  if (available.length === 0) return null
  
  let mostDiverse: DMCColor | null = null
  let maxMinDistance = 0
  
  for (const candidate of available) {
    const candidateLab = DMC_LAB_CACHE.get(candidate.code)!
    
    // Find minimum distance to any already selected color
    let minDistance = Infinity
    for (const selected of alreadySelected) {
      const selectedLab = DMC_LAB_CACHE.get(selected.code)!
      const distance = deltaE2000(candidateLab, selectedLab)
      minDistance = Math.min(minDistance, distance)
    }
    
    if (minDistance > maxMinDistance) {
      maxMinDistance = minDistance
      mostDiverse = candidate
    }
  }
  
  return mostDiverse
}

/**
 * Calculate image complexity measure
 */
function calculateImageComplexity(imageColors: RGBColor[]): number {
  const uniqueColors = new Set(imageColors.map(c => `${c.r},${c.g},${c.b}`)).size
  const totalColors = imageColors.length
  
  if (totalColors === 0) return 0
  
  // Higher ratio of unique to total colors = higher complexity
  return Math.min(uniqueColors / totalColors * 2, 1)
}

/**
 * Get selection strategy description
 */
function getSelectionStrategy(quality: 'fast' | 'standard' | 'high', targetCount: number): string {
  const strategies = {
    fast: 'Frequency-based selection',
    standard: 'Multi-factor analysis',
    high: 'Comprehensive perceptual analysis'
  }
  
  return `${strategies[quality]} (${targetCount} colors)`
}

/**
 * Calculate average color for a pixel region
 */
function calculateRegionAverageColor(
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
      const index = (y * imageData.width + x) * 4
      totalR += imageData.data[index]
      totalG += imageData.data[index + 1]
      totalB += imageData.data[index + 2]
      totalA += imageData.data[index + 3]
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
 * Get pixel color at specific coordinates
 */
function getPixelColorAt(imageData: ImageData, x: number, y: number): PixelData {
  const index = (y * imageData.width + x) * 4
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2],
    a: imageData.data[index + 3]
  }
}

/**
 * Find closest DMC color from pre-selected palette
 */
function findClosestDMCFromPalette(
  targetColor: PixelData,
  dmcLabs: Array<{ dmc: DMCColor, lab: LABColor }>
): { dmcColor: DMCColor, distance: number } {
  const targetLab = rgbToLab(targetColor)
  let bestMatch = dmcLabs[0]
  let bestDistance = deltaE2000(targetLab, bestMatch.lab)
  
  for (let i = 1; i < dmcLabs.length; i++) {
    const distance = deltaE2000(targetLab, dmcLabs[i].lab)
    if (distance < bestDistance) {
      bestDistance = distance
      bestMatch = dmcLabs[i]
    }
  }
  
  return { dmcColor: bestMatch.dmc, distance: bestDistance }
}

// =============================================================================
// NEW ALGORITHM: Full DMC Matching → Color Reduction
// =============================================================================

/**
 * NEW: Full matched pixel with all DMC colors available
 */
export interface FullMatchedPixel extends BeadPixel {
  matchedDMCColor: DMCColor
  matchingDistance: number
}

/**
 * NEW: Color usage analysis for intelligent reduction
 */
export interface ColorUsageAnalysis {
  dmcColor: DMCColor
  pixelCount: number
  percentage: number
  importance: number // 0-1, based on usage and visual impact
  averageDistance: number // Average matching distance
  canMerge: boolean // Can be merged with similar colors
}

/**
 * NEW: Enhanced pattern with full DMC matching capabilities
 */
export interface FullDMCPattern {
  fullMatchedPixels: FullMatchedPixel[]
  colorUsage: ColorUsageAnalysis[]
  reducedPalette: DMCColor[]
  config: PixelizationConfig
  statistics: {
    totalPixels: number
    originalColorCount: number
    reducedColorCount: number
    targetColorCount: number
    qualityScore: number // 0-1, higher = better color accuracy
    reductionStrategy: string
  }
}

/**
 * PHASE 1: Pixelize with full 454 DMC colors (HIGHEST QUALITY)
 */
export function pixelizeWithFullDMCMatching(
  imageData: ImageData,
  config: PixelizationConfig
): FullMatchedPixel[] {
  
  const pixels: FullMatchedPixel[] = []
  const scaleX = imageData.width / config.beadGridWidth
  const scaleY = imageData.height / config.beadGridHeight
  
  // Pre-calculated LAB values for ALL 454 DMC colors (already cached)
  const allDMCLabs = DMC_COLORS.map(dmc => ({
    dmc,
    lab: DMC_LAB_CACHE.get(dmc.code)!
  }))
  
  for (let beadY = 0; beadY < config.beadGridHeight; beadY++) {
    for (let beadX = 0; beadX < config.beadGridWidth; beadX++) {
      // Calculate source pixel region
      const startX = Math.floor(beadX * scaleX)
      const startY = Math.floor(beadY * scaleY)
      const endX = Math.floor((beadX + 1) * scaleX)
      const endY = Math.floor((beadY + 1) * scaleY)
      
      // Calculate average color for this bead region
      const averageColor = calculateRegionAverageColor(imageData, startX, startY, endX, endY)
      const centerColor = getPixelColorAt(imageData, 
        Math.floor((startX + endX) / 2), 
        Math.floor((startY + endY) / 2)
      )
      
      // Find closest DMC color from ALL 454 colors
      const { dmcColor, distance } = findClosestDMCFromAllColors(averageColor, allDMCLabs)
      
      pixels.push({
        x: beadX,
        y: beadY,
        color: centerColor,
        averageColor: averageColor,
        matchedDMCColor: dmcColor,
        matchingDistance: distance
      })
    }
  }
  
  return pixels
}

/**
 * PHASE 2: Analyze color usage and importance
 */
export function analyzeColorUsage(pixels: FullMatchedPixel[]): ColorUsageAnalysis[] {
  
  // Count usage for each color
  const usageMap = new Map<string, { count: number, distances: number[] }>()
  
  for (const pixel of pixels) {
    const code = pixel.matchedDMCColor.code
    if (!usageMap.has(code)) {
      usageMap.set(code, { count: 0, distances: [] })
    }
    const usage = usageMap.get(code)!
    usage.count++
    usage.distances.push(pixel.matchingDistance)
  }
  
  // Calculate analysis for each used color
  const analyses: ColorUsageAnalysis[] = []
  usageMap.forEach((usage, code) => {
    const dmcColor = DMC_COLORS.find(c => c.code === code)!
    const percentage = (usage.count / pixels.length) * 100
    const averageDistance = usage.distances.reduce((a: number, b: number) => a + b, 0) / usage.distances.length
    
    // Calculate importance (usage frequency + visual impact + matching quality)
    const usageImportance = Math.min(percentage / 10, 1) // Normalize to 0-1
    const visualImportance = calculateVisualImpact(dmcColor)
    const qualityImportance = Math.max(0, 1 - (averageDistance / 50)) // Lower distance = higher quality
    const importance = (usageImportance * 0.5 + visualImportance * 0.3 + qualityImportance * 0.2)
    
    analyses.push({
      dmcColor,
      pixelCount: usage.count,
      percentage,
      importance,
      averageDistance,
      canMerge: percentage < 2 || averageDistance > 15 // Low usage or poor matching
    })
  })
  
  // Sort by importance (descending)
  analyses.sort((a, b) => b.importance - a.importance)
  
  return analyses
}

/**
 * PHASE 3: Reduce colors to target count using intelligent strategies
 */
export function reduceColorsToTarget(
  analyses: ColorUsageAnalysis[], 
  targetCount: number
): { reducedPalette: DMCColor[], strategy: string } {
  
  if (analyses.length <= targetCount) {
    return {
      reducedPalette: analyses.map(a => a.dmcColor),
      strategy: `No reduction needed (${analyses.length} colors)`
    }
  }
  
  let strategy = ''
  let reducedAnalyses = [...analyses]
  
  // Strategy 1: Remove very low usage colors (< 0.5%)
  const lowUsageThreshold = 0.5
  const highImportance = reducedAnalyses.filter(a => a.percentage >= lowUsageThreshold || a.importance > 0.7)
  
  if (highImportance.length <= targetCount) {
    reducedAnalyses = highImportance
    strategy += `Removed low usage (<${lowUsageThreshold}%). `
  }
  
  // Strategy 2: Merge similar colors if still too many
  if (reducedAnalyses.length > targetCount) {
    reducedAnalyses = mergeSimilarColors(reducedAnalyses, targetCount)
    strategy += 'Merged similar colors. '
  }
  
  // Strategy 3: Keep only top N by importance
  if (reducedAnalyses.length > targetCount) {
    reducedAnalyses = reducedAnalyses.slice(0, targetCount)
    strategy += 'Selected top colors by importance.'
  }
  
  let reducedPalette = reducedAnalyses.map(a => a.dmcColor)
  
  // CRITICAL FIX: Ensure we meet the user's requested color count
  if (reducedPalette.length < targetCount) {
    strategy += ` Expanded from ${reducedPalette.length} to ${targetCount} colors. `
    
    // Add most diverse colors from remaining DMC palette
    const usedCodes = new Set(reducedPalette.map(c => c.code))
    const remainingColors = DMC_COLORS.filter(c => !usedCodes.has(c.code))
    
    // Find colors that are most different from existing palette
    while (reducedPalette.length < targetCount && remainingColors.length > 0) {
      let bestColor: DMCColor | null = null
      let maxMinDistance = 0
      
      for (const candidate of remainingColors) {
        const candidateLab = DMC_LAB_CACHE.get(candidate.code)!
        let minDistance = Infinity
        
        // Find minimum distance to existing palette
        for (const existing of reducedPalette) {
          const existingLab = DMC_LAB_CACHE.get(existing.code)!
          const distance = deltaE2000(candidateLab, existingLab)
          minDistance = Math.min(minDistance, distance)
        }
        
        // Keep the color with maximum minimum distance (most diverse)
        if (minDistance > maxMinDistance) {
          maxMinDistance = minDistance
          bestColor = candidate
        }
      }
      
      if (bestColor) {
        reducedPalette.push(bestColor)
        usedCodes.add(bestColor.code)
        
        // Remove from remaining colors
        const index = remainingColors.indexOf(bestColor)
        if (index > -1) remainingColors.splice(index, 1)
      } else {
        // Fallback: add any remaining color
        if (remainingColors.length > 0) {
          reducedPalette.push(remainingColors[0])
          remainingColors.splice(0, 1)
        } else {
          break
        }
      }
    }
  }
  
  return { reducedPalette, strategy }
}

/**
 * Merge similar colors to reduce count
 * CRITICAL FIX: Less aggressive merging to preserve user-requested color count
 */
function mergeSimilarColors(analyses: ColorUsageAnalysis[], targetCount: number): ColorUsageAnalysis[] {
  const result = [...analyses]
  const mergeThreshold = 12 // CRITICAL FIX: Increased from 8 to 12 for less aggressive merging
  const maxIterations = Math.min(100, result.length - targetCount * 2) // More conservative iteration limit
  
  let iterations = 0
  while (result.length > targetCount && iterations < maxIterations) {
    iterations++
    
    // CRITICAL FIX: Much more conservative quick removal
    if (result.length - targetCount > 50) { // Increased threshold from 10 to 50
      // Remove only a few colors at once to preserve user intent
      const toRemove = Math.min(3, result.length - targetCount) // Reduced from 10 to 3
      result.sort((a, b) => a.importance - b.importance) // Ascending
      result.splice(0, toRemove) // Remove lowest importance colors
      continue
    }
    
    // Find the most similar pair with mergeable colors
    let bestPair: { i: number, j: number, distance: number } | null = null
    const maxComparisons = 100 // Limit comparisons per iteration
    let comparisons = 0
    
    for (let i = 0; i < result.length && comparisons < maxComparisons; i++) {
      if (!result[i].canMerge) continue
      
      for (let j = i + 1; j < result.length && comparisons < maxComparisons; j++) {
        if (!result[j].canMerge) continue
        comparisons++
        
        const color1Lab = DMC_LAB_CACHE.get(result[i].dmcColor.code)!
        const color2Lab = DMC_LAB_CACHE.get(result[j].dmcColor.code)!
        const distance = deltaE2000(color1Lab, color2Lab)
        
        if (distance <= mergeThreshold && (!bestPair || distance < bestPair.distance)) {
          bestPair = { i, j, distance }
          // Early exit if very similar colors found
          if (distance < 3) break
        }
      }
      if (bestPair && bestPair.distance < 3) break // Early exit
    }
    
    if (!bestPair) {
      // No similar colors to merge, remove lowest importance
      const lowestIndex = result.reduce((minIndex, analysis, index) => 
        analysis.importance < result[minIndex].importance ? index : minIndex, 0)
      result.splice(lowestIndex, 1)
    } else {
      // Merge the similar colors (keep the more important one)
      const { i, j } = bestPair
      if (result[i].importance >= result[j].importance) {
        result[i].pixelCount += result[j].pixelCount
        result[i].percentage += result[j].percentage
        result.splice(j, 1)
      } else {
        result[j].pixelCount += result[i].pixelCount
        result[j].percentage += result[i].percentage
        result.splice(i, 1)
      }
    }
  }
  
  return result
}

/**
 * Find closest DMC color from ALL 454 colors
 */
function findClosestDMCFromAllColors(
  targetColor: PixelData,
  allDMCLabs: Array<{ dmc: DMCColor, lab: LABColor }>
): { dmcColor: DMCColor, distance: number } {
  const targetLab = rgbToLab(targetColor)
  let bestMatch = allDMCLabs[0]
  let bestDistance = deltaE2000(targetLab, bestMatch.lab)
  
  // Early exit if perfect match found
  if (bestDistance < 1) {
    return { dmcColor: bestMatch.dmc, distance: bestDistance }
  }
  
  for (let i = 1; i < allDMCLabs.length; i++) {
    const distance = deltaE2000(targetLab, allDMCLabs[i].lab)
    if (distance < bestDistance) {
      bestDistance = distance
      bestMatch = allDMCLabs[i]
      
      // Early exit if very close match found (deltaE < 1 is imperceptible difference)
      if (bestDistance < 1) {
        break
      }
    }
  }
  
  return { dmcColor: bestMatch.dmc, distance: bestDistance }
}

/**
 * NEW MAIN FUNCTION: Generate pattern with quality-first approach
 */
export async function generateFullDMCPattern(
  imageData: ImageData,
  config: PixelizationConfig,
  targetColorCount: number
): Promise<FullDMCPattern> {
  
  // CRITICAL DEBUG: Track color count changes throughout the process
  console.log(`🎯 Target color count: ${targetColorCount}`)
  
  // PHASE 1: Full DMC matching (maximum quality)
  const fullMatchedPixels = pixelizeWithFullDMCMatching(imageData, config)
  console.log(`📊 Phase 1 - Total pixels processed: ${fullMatchedPixels.length}`)
  
  // PHASE 2: Analyze color usage
  const colorUsage = analyzeColorUsage(fullMatchedPixels)
  console.log(`🎨 Phase 2 - Unique colors detected: ${colorUsage.length}`)
  
  // PHASE 3: Intelligent color reduction
  const { reducedPalette, strategy } = reduceColorsToTarget(colorUsage, targetColorCount)
  console.log(`🔄 Phase 3 - Color reduction strategy: ${strategy}`)
  console.log(`✅ Phase 3 - Final palette size: ${reducedPalette.length} (target: ${targetColorCount})`)
  
  // CRITICAL VALIDATION: Ensure we meet user expectations
  if (Math.abs(reducedPalette.length - targetColorCount) > 5) {
    console.warn(`⚠️ SIGNIFICANT DEVIATION: Got ${reducedPalette.length} colors, expected ${targetColorCount}`)
  }
  
  // PHASE 4: Remap pixels to reduced palette
  const remappedPixels = remapPixelsToReducedPalette(fullMatchedPixels, reducedPalette)
  console.log(`🔗 Phase 4 - Pixels remapped to reduced palette`)
  
  // Verify all colors are actually used
  const actuallyUsedColors = new Set(remappedPixels.map(p => p.matchedDMCColor.code))
  console.log(`🧮 Final verification - Colors actually used: ${actuallyUsedColors.size}/${reducedPalette.length}`)
  
  // Calculate quality statistics
  const totalDistance = fullMatchedPixels.reduce((sum, p) => sum + p.matchingDistance, 0)
  const averageDistance = totalDistance / fullMatchedPixels.length
  const qualityScore = Math.max(0, 1 - (averageDistance / 30)) // Higher = better
  
  const pattern: FullDMCPattern = {
    fullMatchedPixels: remappedPixels,
    colorUsage: colorUsage.filter(c => reducedPalette.some(p => p.code === c.dmcColor.code)),
    reducedPalette,
    config,
    statistics: {
      totalPixels: fullMatchedPixels.length,
      originalColorCount: colorUsage.length,
      reducedColorCount: reducedPalette.length,
      targetColorCount,
      qualityScore,
      reductionStrategy: strategy
    }
  }
  
  return pattern
}

/**
 * Remap pixels to reduced palette
 */
function remapPixelsToReducedPalette(
  pixels: FullMatchedPixel[], 
  reducedPalette: DMCColor[]
): FullMatchedPixel[] {
  const reducedLabs = reducedPalette.map(dmc => ({
    dmc,
    lab: DMC_LAB_CACHE.get(dmc.code)!
  }))
  
  return pixels.map(pixel => {
    // If current color is still in palette, keep it
    if (reducedPalette.some(p => p.code === pixel.matchedDMCColor.code)) {
      return pixel
    }
    
    // Otherwise, find closest color in reduced palette
    const { dmcColor, distance } = findClosestDMCFromPalette(pixel.averageColor, reducedLabs)
    
    return {
      ...pixel,
      matchedDMCColor: dmcColor,
      matchingDistance: distance
    }
  })
}