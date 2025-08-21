'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  PixelizationConfig,
  BeadPixel,
  calculatePixelizationConfig,
  loadImageData,
  pixelizeImage,
  createPixelizedImageData,
  imageDataToDataURL,
  resizeImageForDisplay
} from '../utils/imagePixelization'

export interface PixelizationState {
  isProcessing: boolean
  error: string | null
  config: PixelizationConfig | null
  pixels: BeadPixel[]
  originalImageData: ImageData | null
  pixelizedImageUrl: string | null
  displayImageUrl: string | null
}

export interface PixelizationOptions {
  targetWidth: number
  beadType: 'circular' | 'square'
  imageWidth: number
  imageHeight: number
  beadSize?: number
  useAverageColor?: boolean
  maxDisplayWidth?: number
  maxDisplayHeight?: number
}

export function useImagePixelization() {
  const [state, setState] = useState<PixelizationState>({
    isProcessing: false,
    error: null,
    config: null,
    pixels: [],
    originalImageData: null,
    pixelizedImageUrl: null,
    displayImageUrl: null
  })

  const pixelizeImageFromSrc = useCallback(async (
    imageSrc: string,
    options: PixelizationOptions
  ) => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null
    }))

    try {
      // Calculate configuration
      const config = calculatePixelizationConfig(
        options.targetWidth,
        options.imageWidth,
        options.imageHeight,
        options.beadType,
        options.beadSize
      )

      // Load original image data
      const originalImageData = await loadImageData(imageSrc)

      // Pixelize the image
      const pixels = pixelizeImage(originalImageData, config)

      // Create pixelized image for preview
      const pixelizedImageData = createPixelizedImageData(
        pixels,
        config,
        options.useAverageColor ?? true
      )
      const pixelizedImageUrl = imageDataToDataURL(pixelizedImageData)

      // Create display-sized version
      const displayImageUrl = await resizeImageForDisplay(
        pixelizedImageUrl,
        options.maxDisplayWidth ?? 400,
        options.maxDisplayHeight ?? 300,
        false // Use pixelated rendering
      )

      setState(prev => ({
        ...prev,
        isProcessing: false,
        config,
        pixels,
        originalImageData,
        pixelizedImageUrl,
        displayImageUrl
      }))

      return {
        config,
        pixels,
        pixelizedImageUrl,
        displayImageUrl
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  const clearPixelization = useCallback(() => {
    setState({
      isProcessing: false,
      error: null,
      config: null,
      pixels: [],
      originalImageData: null,
      pixelizedImageUrl: null,
      displayImageUrl: null
    })
  }, [])

  const getPixelizationInfo = useCallback(() => {
    if (!state.config) return null

    return {
      targetSize: `${state.config.targetWidth}cm × ${state.config.targetHeight.toFixed(1)}cm`,
      beadGrid: `${state.config.beadGridWidth} × ${state.config.beadGridHeight}`,
      totalBeads: state.config.beadGridWidth * state.config.beadGridHeight,
      beadType: state.config.beadConfig.type,
      beadSize: `${state.config.beadConfig.sizeInMm}mm`,
      beadsPerCm: state.config.beadConfig.beadsPerCm.toFixed(1)
    }
  }, [state.config])

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [state.error])

  return {
    ...state,
    pixelizeImageFromSrc,
    clearPixelization,
    getPixelizationInfo
  }
}