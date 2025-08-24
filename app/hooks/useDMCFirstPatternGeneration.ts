'use client'

// New DMC-First Pattern Generation Hook
// Architecture: Image Analysis → DMC Selection → Constrained Pixelization

import { useState, useCallback } from 'react'
import { 
  analyzeImageForDMCSelection, 
  pixelizeWithConstrainedDMCColors,
  generateFullDMCPattern,
  type DMCFirstPalette,
  type ConstrainedPixel,
  type FullDMCPattern,
  type FullMatchedPixel
} from '../utils/dmcFirstMatching'
import { 
  calculatePixelizationConfig,
  loadImageData,
  imageDataToDataURL,
  type PixelizationConfig
} from '../utils/imagePixelization'
import { DMCColor } from '../utils/dmcColors'

export interface DMCFirstPattern {
  constrainedPixels: ConstrainedPixel[]
  dmcPalette: DMCFirstPalette
  config: PixelizationConfig
  statistics: {
    totalPixels: number
    guaranteedColors: number
    averageSelectionDistance: number
    colorUsage: Map<string, number>
    selectionQuality: number
  }
}

export interface DMCFirstGenerationState {
  isGenerating: boolean
  isAnalyzingColors: boolean
  error: string | null
  pattern: DMCFirstPattern | null
  previewImageUrl: string | null
  colorStatistics: Array<{
    dmcColor: DMCColor
    count: number
    percentage: number
  }> | null
}

export interface DMCFirstPatternOptions {
  targetWidth: number
  beadType: 'circular' | 'square'
  colorCount: number
  imageWidth: number
  imageHeight: number
  beadSize?: number
  analysisQuality?: 'fast' | 'standard' | 'high'
  // 🎯 NEW: 사용자 지정 색상 지원
  useCustomColors?: boolean
  customColorCodes?: string[]
}

export function useDMCFirstPatternGeneration() {
  const [state, setState] = useState<DMCFirstGenerationState>({
    isGenerating: false,
    isAnalyzingColors: false,
    error: null,
    pattern: null,
    previewImageUrl: null,
    colorStatistics: null
  })

  /**
   * NEW ARCHITECTURE: Generate pattern using DMC-first approach
   */
  const generatePattern = useCallback(async (
    imageSrc: string,
    options: DMCFirstPatternOptions
  ) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null
    }))

    try {
      console.log(`🚀 Starting DMC-first pattern generation with ${options.colorCount} colors`)

      // PHASE 1: Load original image data
      const imageData = await loadImageData(imageSrc)
      console.log(`📸 Loaded image: ${imageData.width}x${imageData.height}`)

      // PHASE 2: Calculate pixelization configuration
      const config = calculatePixelizationConfig(
        options.targetWidth,
        options.imageWidth,
        options.imageHeight,
        options.beadType,
        options.beadSize
      )
      console.log(`📐 Pattern grid: ${config.beadGridWidth}x${config.beadGridHeight}`)

      // 🎯 NEW ALGORITHM: Full DMC Matching → Color Reduction with Custom Colors Support
      setState(prev => ({ ...prev, isAnalyzingColors: true }))
      
      const fullPattern = await generateFullDMCPattern(
        imageData,
        config,
        options.colorCount,
        options.analysisQuality || 'standard',
        // 🎯 NEW: 사용자 지정 색상 지원
        options.useCustomColors ? options.customColorCodes : undefined
      )
      
      setState(prev => ({ ...prev, isAnalyzingColors: false }))
      
      const colorModeLog = options.useCustomColors 
        ? `🎨 CUSTOM COLORS: Used ${options.customColorCodes?.length} user-specified colors`
        : `🎨 ALL COLORS: Used ${fullPattern.statistics.originalColorCount} colors, reduced to ${fullPattern.statistics.reducedColorCount}`
      console.log(colorModeLog)

      // Convert to legacy format for UI compatibility
      const pattern: DMCFirstPattern = convertFullPatternToLegacy(fullPattern)

      // PHASE 7: Generate preview image
      const previewImageData = generateConstrainedPatternPreview(pattern, 10)
      const previewImageUrl = imageDataToDataURL(previewImageData)

      // PHASE 8: Calculate color statistics for UI
      const colorStatistics = generateColorStatistics(pattern)

      setState(prev => ({
        ...prev,
        isGenerating: false,
        pattern,
        previewImageUrl,
        colorStatistics
      }))

      console.log(`✅ NEW ALGORITHM pattern generation completed successfully`)
      console.log(`   - Colors requested: ${options.colorCount}`)
      console.log(`   - Colors delivered: ${pattern.dmcPalette.selectedColors.length}`)
      console.log(`   - Quality score: ${(pattern.statistics.selectionQuality * 100).toFixed(1)}%`)
      console.log(`   - Original colors used: ${fullPattern.statistics.originalColorCount}`)
      console.log(`   - Reduction strategy: ${fullPattern.statistics.reductionStrategy}`)

      return {
        pattern,
        previewImageUrl,
        colorStatistics
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      setState(prev => ({
        ...prev,
        isGenerating: false,
        isAnalyzingColors: false,
        error: errorMessage
      }))
      console.error('DMC-first pattern generation failed:', error)
      throw error
    }
  }, [])

  /**
   * NEW COLOR SUGGESTION SYSTEM: Unlimited color capability
   */
  const calculateColorSuggestions = useCallback(async (
    imageSrc: string,
    imageWidth?: number,
    imageHeight?: number,
    targetWidth?: number,
    beadType?: 'circular' | 'square',
    beadSize?: number
  ) => {
    try {
      // Must have all parameters for accurate analysis
      if (!imageWidth || !imageHeight || !targetWidth || !beadType) {
        return {
          optimal: 30,
          maximum: 100 // NEW: Much higher maximum
        }
      }

      // Load and analyze entire image
      const imageData = await loadImageData(imageSrc)
      
      // Calculate pattern grid size
      const config = calculatePixelizationConfig(
        targetWidth,
        imageWidth,
        imageHeight,
        beadType,
        beadSize
      )

      // NEW: Advanced color analysis for unlimited detail
      const suggestions = analyzeImageForColorSuggestions(imageData, config)

      return {
        optimal: suggestions.optimal,
        maximum: suggestions.maximum
      }
    } catch (error) {
      console.error('색상 제안 계산 실패:', error)
      return {
        optimal: 30,
        maximum: 100 // NEW: Higher fallback maximum
      }
    }
  }, [])

  /**
   * Quick color analysis for real-time updates
   */
  const quickColorAnalysis = useCallback(async (
    imageSrc: string,
    imageWidth: number,
    imageHeight: number,
    targetWidth: number,
    beadType: 'circular' | 'square'
  ) => {
    try {
      // Quick analysis using fast quality setting
      const imageData = await loadImageData(imageSrc)
      const config = calculatePixelizationConfig(targetWidth, imageWidth, imageHeight, beadType)
      
      // Use fast analysis for real-time feedback
      const suggestions = analyzeImageForColorSuggestions(imageData, config, 'fast')
      
      return suggestions
    } catch (error) {
      console.error('빠른 색상 분석 실패:', error)
      return { optimal: 30, maximum: 100 }
    }
  }, [])

  const clearPattern = useCallback(() => {
    setState({
      isGenerating: false,
      isAnalyzingColors: false,
      error: null,
      pattern: null,
      previewImageUrl: null,
      colorStatistics: null
    })
  }, [])

  const getPatternInfo = useCallback(() => {
    if (!state.pattern) return null

    return {
      dimensions: `${state.pattern.config.beadGridWidth} × ${state.pattern.config.beadGridHeight}`,
      totalBeads: state.pattern.statistics.totalPixels.toLocaleString(),
      guaranteedColors: state.pattern.statistics.guaranteedColors,
      selectionQuality: (state.pattern.statistics.selectionQuality * 100).toFixed(1),
      physicalSize: `${state.pattern.config.targetWidth}cm × ${state.pattern.config.targetHeight.toFixed(1)}cm`,
      beadType: state.pattern.config.beadConfig.type === 'circular' ? '원형' : '사각형',
      analysisStrategy: state.pattern.dmcPalette.analysisData.selectionStrategy,
      imageComplexity: (state.pattern.dmcPalette.analysisData.imageComplexity * 100).toFixed(1)
    }
  }, [state.pattern])

  return {
    ...state,
    generatePattern,
    calculateColorSuggestions,
    quickColorAnalysis,
    clearPattern,
    getPatternInfo
  }
}

/**
 * Calculate comprehensive pattern statistics
 */
function calculatePatternStatistics(
  pixels: ConstrainedPixel[],
  dmcPalette: DMCFirstPalette
): DMCFirstPattern['statistics'] {
  const colorUsage = new Map<string, number>()
  let totalSelectionDistance = 0

  for (const pixel of pixels) {
    const code = pixel.selectedDMCColor.code
    colorUsage.set(code, (colorUsage.get(code) || 0) + 1)
    totalSelectionDistance += pixel.selectionDistance
  }

  const averageSelectionDistance = totalSelectionDistance / pixels.length
  
  // Quality score: lower distance = better quality
  const selectionQuality = Math.max(0, 1 - (averageSelectionDistance / 50))

  return {
    totalPixels: pixels.length,
    guaranteedColors: dmcPalette.selectedColors.length,
    averageSelectionDistance,
    colorUsage,
    selectionQuality
  }
}

/**
 * Generate color statistics for UI display
 */
function generateColorStatistics(pattern: DMCFirstPattern): Array<{
  dmcColor: DMCColor
  count: number
  percentage: number
}> {
  const stats: Array<{
    dmcColor: DMCColor
    count: number
    percentage: number
  }> = []

  pattern.statistics.colorUsage.forEach((count, code) => {
    const dmcColor = pattern.dmcPalette.selectedColors.find(c => c.code === code)
    if (dmcColor) {
      stats.push({
        dmcColor,
        count,
        percentage: (count / pattern.statistics.totalPixels) * 100
      })
    }
  })

  // Sort by usage count (descending)
  return stats.sort((a, b) => b.count - a.count)
}

/**
 * Generate preview image for constrained pattern
 */
function generateConstrainedPatternPreview(
  pattern: DMCFirstPattern,
  scale: number = 10
): ImageData {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  const width = pattern.config.beadGridWidth * scale
  const height = pattern.config.beadGridHeight * scale
  
  canvas.width = width
  canvas.height = height
  
  // Fill with white background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // Draw each pixel with its selected DMC color
  for (const pixel of pattern.constrainedPixels) {
    const x = pixel.x * scale
    const y = pixel.y * scale
    
    ctx.fillStyle = `rgb(${pixel.selectedDMCColor.r}, ${pixel.selectedDMCColor.g}, ${pixel.selectedDMCColor.b})`
    ctx.fillRect(x, y, scale, scale)
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.lineWidth = 0.5
    ctx.strokeRect(x, y, scale, scale)
  }

  return ctx.getImageData(0, 0, width, height)
}

/**
 * Analyze image for color suggestions with unlimited capability
 */
function analyzeImageForColorSuggestions(
  imageData: ImageData,
  config: PixelizationConfig,
  quality: 'fast' | 'standard' = 'standard'
): { optimal: number, maximum: number } {
  const totalPixels = imageData.width * imageData.height
  const patternPixels = config.beadGridWidth * config.beadGridHeight
  
  // Sample colors from image
  const sampleSize = quality === 'fast' ? Math.min(5000, totalPixels * 0.05) : Math.min(20000, totalPixels * 0.2)
  const step = Math.max(1, Math.floor(totalPixels / sampleSize))
  
  const colorSet = new Set<string>()
  for (let i = 0; i < imageData.data.length; i += step * 4) {
    const r = imageData.data[i]
    const g = imageData.data[i + 1]
    const b = imageData.data[i + 2]
    colorSet.add(`${r},${g},${b}`)
  }
  
  const uniqueColors = colorSet.size
  
  // Calculate complexity factor
  const complexityRatio = Math.min(uniqueColors / 1000, 1) // Normalize to 0-1
  const sizeRatio = Math.min(patternPixels / 10000, 1) // Pattern size influence
  
  // NEW: Much higher optimal calculations for unlimited detail
  const baseOptimal = Math.min(uniqueColors, 80)
  const optimal = Math.max(
    8, // Minimum practical
    Math.min(
      Math.round(baseOptimal * (0.5 + complexityRatio * 0.3 + sizeRatio * 0.2)),
      120 // Higher optimal maximum
    )
  )
  
  // NEW: Much higher maximum for unlimited detail capability
  const maxByComplexity = Math.min(uniqueColors, 447) // All DMC colors
  const maxByPattern = Math.min(
    Math.floor(patternPixels / 2), // At least 2 pixels per color
    300 // Practical maximum for very detailed work
  )
  
  const maximum = Math.min(maxByComplexity, maxByPattern)
  
  return {
    optimal: Math.min(optimal, maximum),
    maximum: Math.max(maximum, optimal + 20) // Ensure reasonable difference
  }
}

/**
 * Convert new FullDMCPattern to legacy DMCFirstPattern for UI compatibility
 */
function convertFullPatternToLegacy(fullPattern: FullDMCPattern): DMCFirstPattern {
  // Convert FullMatchedPixel[] to ConstrainedPixel[]
  const constrainedPixels: ConstrainedPixel[] = fullPattern.fullMatchedPixels.map(pixel => ({
    x: pixel.x,
    y: pixel.y,
    color: pixel.color,
    averageColor: pixel.averageColor,
    selectedDMCColor: pixel.matchedDMCColor,
    selectionDistance: pixel.matchingDistance
  }))
  
  // Create legacy DMC palette
  const dmcPalette: DMCFirstPalette = {
    selectedColors: fullPattern.reducedPalette,
    analysisData: {
      totalImageColors: fullPattern.statistics.originalColorCount,
      imageComplexity: fullPattern.statistics.qualityScore,
      selectionStrategy: `NEW ALGORITHM: ${fullPattern.statistics.reductionStrategy}`,
      guaranteedCount: fullPattern.statistics.reducedColorCount
    }
  }
  
  // Create color usage map
  const colorUsage = new Map<string, number>()
  for (const analysis of fullPattern.colorUsage) {
    colorUsage.set(analysis.dmcColor.code, analysis.pixelCount)
  }
  
  // Calculate legacy statistics
  const totalDistance = constrainedPixels.reduce((sum, p) => sum + p.selectionDistance, 0)
  const statistics = {
    totalPixels: fullPattern.statistics.totalPixels,
    guaranteedColors: fullPattern.statistics.reducedColorCount,
    averageSelectionDistance: totalDistance / constrainedPixels.length,
    colorUsage,
    selectionQuality: fullPattern.statistics.qualityScore
  }
  
  return {
    constrainedPixels,
    dmcPalette,
    config: fullPattern.config,
    statistics
  }
}