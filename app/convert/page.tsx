'use client'

import { useState, useEffect } from 'react'
import { getStoredImageUnlimited } from '../utils/imageStorageUnlimited'
import SizeConfiguration from '../components/SizeConfiguration'
import BeadConfiguration from '../components/BeadConfiguration'
import ColorConfiguration from '../components/ColorConfiguration'
import PreviewPanel from '../components/PreviewPanel'
import DMCColorTable from '../components/DMCColorTable'
import { useDMCFirstPatternGeneration } from '../hooks/useDMCFirstPatternGeneration'
import { generateRealSizePDF, generateVectorPDF } from '../utils/pdfGenerator'
import { generatePureSVGPattern, downloadSVGFile } from '../utils/svgGenerator'


export default function ConvertPage() {
  const [imageData, setImageData] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string>('')
  const [imageWidth, setImageWidth] = useState<number>(0)
  const [imageHeight, setImageHeight] = useState<number>(0)
  
  // Configuration states
  const [targetWidth, setTargetWidth] = useState<number>(50) // cm
  const [beadType, setBeadType] = useState<'circular' | 'square'>('circular')
  const [colorCount, setColorCount] = useState<number>(200)
  
  // Bead size configuration
  const [circularSize, setCircularSize] = useState<number>(2.8) // mm
  const [squareSize, setSquareSize] = useState<number>(2.6) // mm
  const [confirmedCircularSize, setConfirmedCircularSize] = useState<number>(2.8)
  const [confirmedSquareSize, setConfirmedSquareSize] = useState<number>(2.6)
  const [beadSettingsConfirmed, setBeadSettingsConfirmed] = useState(false)
  const [optimalColors, setOptimalColors] = useState<number>(0)
  const [maxColors, setMaxColors] = useState<number>(0)

  const [calculatedSize, setCalculatedSize] = useState<{
    actualWidth: number
    actualHeight: number
    beadGridWidth: number
    beadGridHeight: number
    totalBeads: number
  } | null>(null)

  // DMC-first pattern generation (NEW ARCHITECTURE)
  const {
    isGenerating,
    isAnalyzingColors,
    error: patternError,
    pattern,
    previewImageUrl,
    colorStatistics,
    generatePattern,
    calculateColorSuggestions,
    quickColorAnalysis,
    clearPattern,
    getPatternInfo
  } = useDMCFirstPatternGeneration()

  // Track if we're calculating color suggestions 
  const [isCalculatingColors, setIsCalculatingColors] = useState(false)
  const [pendingColorCount, setPendingColorCount] = useState<number>(200) // 확인 전 임시 색상 개수
  const [colorConfirmed, setColorConfirmed] = useState(false) // 색상 설정 확인 여부
  
  // 🎯 NEW: 사용자 지정 색상 관련 state
  const [useCustomColors, setUseCustomColors] = useState<boolean>(false)
  const [customColorCodes, setCustomColorCodes] = useState<string[]>([]) // 사용자가 입력한 DMC 코드들
  
  // PDF generation state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  
  // SVG generation state
  const [isGeneratingSVG, setIsGeneratingSVG] = useState(false)

  
  useEffect(() => {
    // Load image using unlimited storage system
    const loadStoredImage = async () => {
      try {
        const storedData = await getStoredImageUnlimited('uploadedImage')
        
        if (storedData) {
          setImageData(storedData.dataUrl)
          setImageName(storedData.fileName)
          
          console.log(`�� Loaded image: ${storedData.fileName}`)
          if (storedData.metadata?.storageMethod) {
            console.log(`🗄️ Storage method: ${storedData.metadata.storageMethod}`)
          }
          
          // Get image dimensions only (no color calculation yet)
          const img = new Image()
          img.onload = () => {
            setImageWidth(img.width)
            setImageHeight(img.height)
            console.log(`📐 Image dimensions: ${img.width}x${img.height}`)
            // Color suggestions will be calculated after pattern size is set
          }
          img.onerror = () => {
            console.error('Failed to load stored image')
            alert('Failed to load stored image. Please upload again.')
          }
          img.src = storedData.dataUrl
        } else {
          console.warn('No stored image found')
        }
      } catch (error) {
        console.error('Failed to load stored image:', error)
      }
    }
    
    loadStoredImage()
  }, [])


  const handleConfirmColorSettings = async (currentColorCount: number, customColors?: string[]) => {
    if (!imageData || !imageWidth || !imageHeight || !targetWidth || !beadType) {
      alert('Image or pattern settings are not completed.')
      return
    }
    
    setIsCalculatingColors(true)
    
    try {

      if (customColors && customColors.length > 0) {
        setUseCustomColors(true)
        setCustomColorCodes(customColors)
        setPendingColorCount(customColors.length)
        setColorCount(customColors.length)
        

        setOptimalColors(customColors.length)
        setMaxColors(customColors.length)
        setColorConfirmed(true)
        
        alert(`Custom color settings confirmed.\nColors to use: ${customColors.length} (${customColors.slice(0, 5).join(', ')}${customColors.length > 5 ? ' and ' + (customColors.length - 5) + ' more' : ''})`)
        
      } else {

        setUseCustomColors(false)
        setCustomColorCodes([])
        setPendingColorCount(currentColorCount)
        setColorCount(currentColorCount)
        
        // 색상 제안 계산 실행 (실제로는 표시 안 함)
        const currentBeadSize = beadType === 'circular' 
          ? (beadSettingsConfirmed ? confirmedCircularSize : circularSize)
          : (beadSettingsConfirmed ? confirmedSquareSize : squareSize)
        
        const suggestions = await calculateColorSuggestions(
          imageData,
          imageWidth,
          imageHeight,
          targetWidth,
          beadType,
          currentBeadSize
        )
        
        setOptimalColors(suggestions.optimal)
        setMaxColors(suggestions.maximum)
        setColorConfirmed(true)
        
        alert(`Color settings confirmed.\nSelected colors: ${currentColorCount}`)
      }
      
    } catch (error) {
      console.error('Color suggestion calculation failed:', error)
      alert('Color analysis failed. Please try again.')
      setOptimalColors(30)
      setMaxColors(60)
    } finally {
      setIsCalculatingColors(false)
    }
  }
  

  const handleConfirmBeadSettings = () => {

    if (circularSize < 1.0 || circularSize > 10.0) {
      alert('Circular bead diameter must be between 1.0mm and 10.0mm.')
      return
    }
    
    if (squareSize < 1.0 || squareSize > 10.0) {
      alert('Square bead side must be between 1.0mm and 10.0mm.')
      return
    }
    

    setConfirmedCircularSize(circularSize)
    setConfirmedSquareSize(squareSize)
    setBeadSettingsConfirmed(true)
    
    alert(`Bead settings confirmed.\nCircular bead: diameter ${circularSize}mm\nSquare bead: side ${squareSize}mm\nCurrent selection: ${beadType === 'circular' ? 'Circular' : 'Square'} bead`)
  }

  // Handle pattern generation with confirmation
  const handleGeneratePreview = async () => {
    if (!imageData) return
    

    const currentBeadSize = beadType === 'circular' 
      ? (beadSettingsConfirmed ? confirmedCircularSize : circularSize)
      : (beadSettingsConfirmed ? confirmedSquareSize : squareSize)
    

    const colorModeText = useCustomColors 
      ? `🎨 Custom colors: ${colorCount} (${customColorCodes.slice(0, 3).join(', ')}${customColorCodes.length > 3 ? ' etc...' : ''})`
      : `🎨 Selected from all colors: ${colorCount}`
    
    const confirmMessage = `Do you want to generate a pattern with the following settings?\n\n` +
      `📐 Pattern size: ${targetWidth}cm (width)\n` +
      `🔵 Bead type: ${beadType === 'circular' ? 'Circular' : 'Square'} (${currentBeadSize}mm)\n` +
      `${colorModeText}\n\n` +
      `※ If you changed settings, please click the 'Confirm' button for each setting first.`
    
    const confirmed = confirm(confirmMessage)
    if (!confirmed) {
      return
    }
    

    const warnings = []
    if (!colorConfirmed) {
      warnings.push('Color settings are not confirmed')
    }
    if (!beadSettingsConfirmed) {
      warnings.push('Bead settings are not confirmed')
    }
    
    if (warnings.length > 0) {
      const proceedAnyway = confirm(`${warnings.join(', ')}.\nDo you want to proceed anyway?`)
      if (!proceedAnyway) {
        return
      }
    }
    
    try {

      await generatePattern(imageData, {
        targetWidth,
        beadType,
        colorCount,
        imageWidth,
        imageHeight,
        beadSize: currentBeadSize,
        useCustomColors,
        customColorCodes: useCustomColors ? customColorCodes : undefined
      })
    } catch (error) {
      console.error('Pattern generation failed:', error)
    }
  }

  const handleDownloadIntegrated = async () => {
    if (!pattern || !calculatedSize) {
      alert('Pattern has not been generated yet.')
      return
    }
  
    try {
      setIsGeneratingPDF(true)
      
      console.log('📊 Starting DMC TABLE PDF generation...')
      
      await generateRealSizePDF(
        pattern,
        beadType,
        calculatedSize,
        imageName
      )
      
      // Success message
      const message = `✅ DMC TABLE PDF generation completed!\n\n`
      
      alert(message)
      
    } catch (error) {
      console.error('DMC TABLE PDF 생성 실패:', error)
      
      if (error instanceof Error) {
        alert(`DMC TABLE generation failed: ${error.message}`)
      } else {
        alert('DMC TABLE generation failed. Please try again.')
      }
    } finally {
      setIsGeneratingPDF(false)
    }
  }



  const handleDownloadVectorPDF = async () => {
    if (!pattern || !calculatedSize) {
      alert('Pattern has not been generated yet.')
      return
    }
    
    try {
      setIsGeneratingPDF(true)
      
      console.log('🎯 Starting PURE VECTOR PDF generation (infinite resolution)...')
      

      const currentBeadSize = beadType === 'circular' 
        ? (beadSettingsConfirmed ? confirmedCircularSize : circularSize)
        : (beadSettingsConfirmed ? confirmedSquareSize : squareSize)
      
      await generateVectorPDF(
        pattern,
        beadType,
        calculatedSize,
        imageName || 'pattern',
        currentBeadSize 
      )
      
      const message = `✅ Pattern print completed!\n\n` + 
      'Please open the downloaded PDF in Chrome.\n\n' + 
      'Adobe Acrobat Reader may be slow.'
      
      alert(message)
      
    } catch (error) {
      console.error('Vector PDF generation failed:', error)
      alert('Pattern print failed. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }


  const handleDownloadPureSVG = async () => {
    if (!pattern || !calculatedSize) {
      alert('Pattern has not been generated yet.')
      return
    }
    
    try {
      setIsGeneratingSVG(true)
      
      console.log('🎨 Starting PURE SVG generation (lightweight, no margins)...')
      

      const currentBeadSize = beadType === 'circular' 
        ? (beadSettingsConfirmed ? confirmedCircularSize : circularSize)
        : (beadSettingsConfirmed ? confirmedSquareSize : squareSize)
      
      // Generate pure SVG content
      const svgContent = generatePureSVGPattern(
        pattern,
        beadType,
        calculatedSize,
        currentBeadSize
      )
      
      // Generate filename
      const cleanImageName = imageName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9가-힣]/g, '_')
      const fileName = `${cleanImageName}_${calculatedSize.actualWidth}×${calculatedSize.actualHeight}cm.svg`
      
      // Download SVG file
      downloadSVGFile(svgContent, fileName)
      
      const message = `✅ SVG export completed!\n\n` + 
      'Downloaded as lightweight SVG file.\n' + 
      'Can be opened in web browsers or vector editing programs.'
      
      alert(message)
      
    } catch (error) {
      console.error('Pure SVG generation failed:', error)
      alert('SVG export failed. Please try again.')
    } finally {
      setIsGeneratingSVG(false)
    }
  }


  useEffect(() => {

    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  if (!imageData) {
    return (
      <div className="text-center">
        <h1 style={{ marginTop: '5rem', fontSize: '2rem', marginBottom: '2rem', fontFamily: 'Baskervville, serif', fontWeight: 700 }}>Image Conversion</h1>
        <p style={{ fontFamily: 'Baskervville, serif', fontWeight: 500, fontSize: '1.1rem', marginBottom: '2rem' }}>
          No uploaded image found.
        </p>
        <a href="/" style={{ fontFamily: 'Baskervville, serif', fontWeight: 500, color: 'black', textDecoration: 'underline' }}>
          Please return to homepage and upload an image
        </a>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Main Convert Container - Full Screen Layout */}
      <div className="convert-main-container w-screen h-screen">
        <div className="parent convert-grid-layout">
          
          {/* Div1: Original Image Display */}
          <div className="div1 convert-image-display">
            <h2 style={{ fontSize: '1.1rem', fontFamily: 'Baskervville, serif', fontWeight: 700, marginBottom: '0.8rem' }}>
              Uploaded Image
            </h2>
            <img 
              src={imageData} 
              alt={imageName}
              className="convert-uploaded-image"
              style={{ 
                width: '100%',
                height: 'auto',
                maxHeight: '80%',
                objectFit: 'contain'
              }}
            />
            <p style={{ fontFamily: 'Baskervville, serif', fontWeight: 500, fontSize: '0.85rem', marginTop: '0.5rem' }}>
              {imageWidth} × {imageHeight}px
            </p>
          </div>

          {/* Div2: Size & Bead Configuration */}
          <div className="div2 convert-configuration-panel">
            <h2 style={{ fontSize: '1.1rem', fontFamily: 'Baskervville, serif', fontWeight: 700, marginBottom: '1rem', marginTop: '2rem' }}>
              Size & Bead Settings
            </h2>
            
            <SizeConfiguration
              targetWidth={targetWidth}
              onTargetWidthChange={setTargetWidth}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              beadType={beadType}
              beadSize={beadType === 'circular' 
                ? (beadSettingsConfirmed ? confirmedCircularSize : circularSize)
                : (beadSettingsConfirmed ? confirmedSquareSize : squareSize)
              }
              onCalculatedSizeChange={setCalculatedSize}
            />

            <BeadConfiguration
              beadType={beadType}
              onBeadTypeChange={setBeadType}
              circularSize={circularSize}
              squareSize={squareSize}
              onCircularSizeChange={setCircularSize}
              onSquareSizeChange={setSquareSize}
              confirmedCircularSize={confirmedCircularSize}
              confirmedSquareSize={confirmedSquareSize}
              onConfirmBeadSettings={handleConfirmBeadSettings}
              isBeadConfirmed={beadSettingsConfirmed}
            />
          </div>

          {/* Div3: Color Configuration */}
          <div className="div3 convert-color-panel">
            <h2 style={{ fontSize: '1.1rem', fontFamily: 'Baskervville, serif', fontWeight: 700, marginBottom: '0.8rem' }}>
              Color Settings
            </h2>
            
            <ColorConfiguration
              colorCount={pendingColorCount}
              onColorCountChange={setPendingColorCount}
              confirmedColorCount={colorCount}
              onConfirmColorSettings={handleConfirmColorSettings}
              optimalColors={optimalColors}
              maxColors={maxColors}
              isCalculating={isCalculatingColors}
              isConfirmed={colorConfirmed}
            />
          </div>

          {/* Div4: Pattern Generation Button */}
          <div className="div4 convert-generate-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button 
              onClick={handleGeneratePreview}
              disabled={isGenerating}
              className="convert-generate-btn"
              style={{ 
                fontFamily: 'Baskervville, serif',
                fontWeight: 500,
                fontSize: '3rem', 
                padding: '12px 20px',
                width: '100%',
                opacity: isGenerating ? 0.6 : 1,
                cursor: isGenerating ? 'not-allowed' : 'pointer'
              }}
            >
              {isAnalyzingColors ? 'Analyzing DMC Colors...' : isGenerating ? 'Generating Pattern...' : 'Create Pattern'}
            </button>
            
            {/* Error Display */}
            {patternError && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem',
                border: '2px solid red',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                color: 'red',
                fontFamily: 'Baskervville, serif',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}>
                {patternError}
              </div>
            )}

            {/* Progress Message */}
            {(isAnalyzingColors || isGenerating) && (
              <div style={{
                marginTop: '0.5rem',
                color: 'black',
                fontSize: '0.75rem',
                textAlign: 'center',
                fontFamily: 'Baskervville, serif',
                fontWeight: 500
              }}>
                Up to 5 minutes required
              </div>
            )}
          </div>

          {/* Div5: Preview Panel with Statistics */}
          <div className="div5 convert-preview-panel">
            <h2 style={{ color: 'black', fontSize: '1.1rem', fontFamily: 'Baskervville, serif', fontWeight: 700, marginBottom: '0.8rem' }}>
              <br/>
              <br/>
            </h2>
            
            {pattern ? (
              <div style={{ height: 'calc(100% - 3.5rem)' }}>
                <PreviewPanel
                  imageData={imageData}
                  targetWidth={targetWidth}
                  beadType={beadType}
                  colorCount={colorCount}
                  imageWidth={imageWidth}
                  imageHeight={imageHeight}
                  dmcPattern={pattern}
                  dmcPreviewUrl={previewImageUrl}
                  isGeneratingPattern={isGenerating}
                  calculatedSize={calculatedSize}
                  colorStatistics={colorStatistics}
                />
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 'calc(100% - 3.5rem)',
                color: '#666',
                fontFamily: 'Baskervville, serif',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                Preview will be displayed when pattern is generated
              </div>
            )}
          </div>

          {/* Div6: DMC Color Table */}
          <div className="div6 convert-dmc-table-panel">
            <h2 style={{ fontSize: '1.1rem', fontFamily: 'Baskervville, serif', fontWeight: 700, marginBottom: '0.8rem' }}>
              DMC Color Table
            </h2>
            
            {pattern ? (
              <div style={{ height: 'calc(100% - 2rem)', overflow: 'auto' }}>
                <DMCColorTable pattern={pattern} />
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#666',
                fontFamily: 'Baskervville, serif',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                Color table will be displayed after pattern generation
              </div>
            )}
          </div>

          {/* Div7: Download Buttons */}
          <div className="div7 convert-download-panel">
            {pattern ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem', 
                width: '100%',
                justifyContent: 'center', // Center align buttons vertically
                alignItems: 'stretch' // Stretch buttons to full width
              }}>
                <button 
                  onClick={handleDownloadIntegrated}
                  disabled={!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG}
                  className="convert-download-btn convert-dmc-btn"
                  style={{ 
                    fontFamily: 'Baskervville, serif',
                    fontWeight: 700,
                    fontSize: '0.85rem', 
                    padding: '8px 12px',
                    width: '100%', // Full width
                    backgroundColor: (!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG) ? '#EEDF7A' : '#EEDF7A',
                    color: '#343131',
                    border: 'none',
                    borderRadius: '4px',
                    opacity: (!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG) ? 0.6 : 1,
                    cursor: (!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isGeneratingPDF ? 'Generating...' : '📊 DMC TABLE'}
                </button>

                <button 
                  onClick={handleDownloadVectorPDF}
                  disabled={!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG}
                  className="convert-download-btn convert-pattern-btn"
                  style={{ 
                    fontFamily: 'Baskervville, serif',
                    fontWeight: 700,
                    fontSize: '0.85rem', 
                    padding: '8px 12px',
                    width: '100%', // Full width
                    backgroundColor: (!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG) ? '#D8A25E' : '#D8A25E',
                    color: '#343131',
                    border: 'none',
                    borderRadius: '4px',
                    opacity: (!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG) ? 0.6 : 1,
                    cursor: (!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isGeneratingPDF ? 'Generating...' : '📄 Pattern Print'}
                </button>

                <button 
                  onClick={handleDownloadPureSVG}
                  disabled={!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG}
                  className="convert-download-btn convert-svg-btn"
                  style={{ 
                    fontFamily: 'Baskervville, serif',
                    fontWeight: 700,
                    fontSize: '0.85rem', 
                    padding: '8px 12px',
                    width: '100%', // Full width
                    backgroundColor: (!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG) ? '#A04747' : '#A04747',
                    color: '#343131',
                    border: 'none',
                    borderRadius: '4px',
                    opacity: (!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG) ? 0.6 : 1,
                    cursor: (!pattern || isGenerating || isGeneratingPDF || isGeneratingSVG) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isGeneratingSVG ? 'Generating...' : '🎨 SVG Export'}
                </button>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#666',
                fontFamily: 'Baskervville, serif',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                Download available after pattern generation
              </div>
            )}
          </div>

          {/* Div8: Additional Area */}
          <div className="div8">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'black',
              fontFamily: 'Baskervville, serif',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}>
              Additional Area (div8)
            </div>
          </div>

        </div>
      </div>

      {/* PDF/SVG Generation Status */}
      {(isGeneratingPDF || isGeneratingSVG) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '450px',
            width: '90%'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <h3 style={{ fontFamily: 'Baskervville, serif', fontWeight: 700, marginBottom: '0.5rem' }}>
              {isGeneratingPDF ? 'Generating PDF...' : 'Generating SVG...'}
            </h3>
            
            
            <p style={{ fontFamily: 'Baskervville, serif', fontWeight: 500, color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {isGeneratingPDF ? 'PDF generation is in progress.' : 'SVG generation is in progress.'} Please wait a moment.
            </p>
            
            
            {(isGeneratingPDF || isGeneratingSVG) && (
              <div style={{
                fontSize: '0.8rem',
                color: '#999',
                marginTop: '1rem',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.03)',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #eee'
              }}>
                {isGeneratingPDF && (
                  <>
                    <div style={{ fontFamily: 'Baskervville, serif', fontWeight: 700, marginBottom: '0.5rem', color: '#28a745' }}>
                      📊 Generating DMC TABLE
                    </div>
                    • Preparing DMC color table and icon information<br/>
                    • Please wait a moment...
                  </>
                )}
                {isGeneratingSVG && (
                  <>
                    <div style={{ fontFamily: 'Baskervville, serif', fontWeight: 700, marginBottom: '0.5rem', color: '#10b981' }}>
                      🎨 Generating SVG File
                    </div>
                    • Generating lightweight vector file<br/>
                    • Download will start shortly...
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}