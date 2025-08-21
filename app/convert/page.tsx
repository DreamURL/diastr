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
  
  // PDF generation state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  
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

  // 색상 설정 확인 처리 함수 (현재 입력값을 파라미터로 받음)
  const handleConfirmColorSettings = async (currentColorCount: number) => {
    if (!imageData || !imageWidth || !imageHeight || !targetWidth || !beadType) {
      alert('이미지 또는 도안 설정이 완료되지 않았습니다.')
      return
    }
    
    setIsCalculatingColors(true)
    
    try {
      // 현재 입력된 색상 개수를 pending과 confirmed 모두에 적용
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
      
      alert(`색상 설정이 확인되었습니다.\n선택된 색상: ${currentColorCount}개`)
      
    } catch (error) {
      console.error('Color suggestion calculation failed:', error)
      alert('색상 분석에 실패했습니다. 다시 시도해주세요.')
      setOptimalColors(30)
      setMaxColors(60)
    } finally {
      setIsCalculatingColors(false)
    }
  }
  
  // 비즈 설정 확인 처리 함수
  const handleConfirmBeadSettings = () => {
    // 입력 값 유효성 검사
    if (circularSize < 1.0 || circularSize > 10.0) {
      alert('원형 비즈 지름은 1.0mm에서 10.0mm 사이여야 합니다.')
      return
    }
    
    if (squareSize < 1.0 || squareSize > 10.0) {
      alert('사각형 비즈 한 변은 1.0mm에서 10.0mm 사이여야 합니다.')
      return
    }
    
    // 확인된 값 적용
    setConfirmedCircularSize(circularSize)
    setConfirmedSquareSize(squareSize)
    setBeadSettingsConfirmed(true)
    
    alert(`비즈 설정이 확인되었습니다.\n원형 비즈: 지름 ${circularSize}mm\n사각형 비즈: 한 변 ${squareSize}mm\n현재 선택: ${beadType === 'circular' ? '원형' : '사각형'} 비즈`)
  }

  // Handle pattern generation with confirmation
  const handleGeneratePreview = async () => {
    if (!imageData) return
    
    // 현재 설정된 비즈 사이즈 가져오기
    const currentBeadSize = beadType === 'circular' 
      ? (beadSettingsConfirmed ? confirmedCircularSize : circularSize)
      : (beadSettingsConfirmed ? confirmedSquareSize : squareSize)
    
    // 확인 다이얼로그 표시
    const confirmMessage = `다음 설정으로 도안을 생성하시겠습니까?\n\n` +
      `📐 도안 크기: ${targetWidth}cm (가로 기준)\n` +
      `🔵 비즈 종류: ${beadType === 'circular' ? '원형' : '사각형'} (${currentBeadSize}mm)\n` +
      `🎨 색상 개수: ${colorCount}개\n\n` +
      `※ 설정을 변경하신 경우 먼저 각각의 '확인' 버튼을 눌러주세요.`
    
    const confirmed = confirm(confirmMessage)
    if (!confirmed) {
      return
    }
    
    // 설정 확인 상태 체크
    const warnings = []
    if (!colorConfirmed) {
      warnings.push('색상 설정이 확인되지 않았습니다')
    }
    if (!beadSettingsConfirmed) {
      warnings.push('비즈 설정이 확인되지 않았습니다')
    }
    
    if (warnings.length > 0) {
      const proceedAnyway = confirm(`${warnings.join(', ')}.\n그대로 진행하시겠습니까?`)
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
        // 비즈 사이즈 정보 추가
        beadSize: currentBeadSize
      })
    } catch (error) {
      console.error('Pattern generation failed:', error)
    }
  }

  const handleDownloadIntegrated = async () => {
    if (!pattern || !calculatedSize) {
      alert('도안이 아직 생성되지 않았습니다.')
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
      
      // 성공 메시지
      const message = `✅ DMC TABLE PDF 생성 완료!\n\n`
      
      alert(message)
      
    } catch (error) {
      console.error('DMC TABLE PDF 생성 실패:', error)
      
      if (error instanceof Error) {
        alert(`DMC TABLE 생성 실패: ${error.message}`)
      } else {
        alert('DMC TABLE 생성에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setIsGeneratingPDF(false)
    }
  }


  // 🚀 NEW: Vector PDF download handler (INFINITE RESOLUTION!)
  const handleDownloadVectorPDF = async () => {
    if (!pattern || !calculatedSize) {
      alert('도안이 아직 생성되지 않았습니다.')
      return
    }
    
    try {
      setIsGeneratingPDF(true)
      
      console.log('🎯 Starting PURE VECTOR PDF generation (infinite resolution)...')
      
      // 현재 설정된 비즈 사이즈 가져오기
      const currentBeadSize = beadType === 'circular' 
        ? (beadSettingsConfirmed ? confirmedCircularSize : circularSize)
        : (beadSettingsConfirmed ? confirmedSquareSize : squareSize)
      
      await generateVectorPDF(
        pattern,
        beadType,
        calculatedSize,
        imageName || 'pattern',
        currentBeadSize // 실제 비즈 크기 전달
      )
      
      const message = `✅ 도안 출력 완료!\n\n` + 
      '다운 받은 pdf 는 크롬에서 열어주세요.\n\n' + 
      'Adobe Acrobat Reader로 열면 렉걸려요.'
      
      alert(message)
      
    } catch (error) {
      console.error('Vector PDF generation failed:', error)
      alert('도안 출력에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // 제거된 기능: 실제 도안 확인 기능
  // Google Fonts 로드
  useEffect(() => {
    // Google Fonts CSS 링크 추가
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  if (!imageData) {
    return (
      <div className="text-center">
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>이미지 변환</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          업로드된 이미지가 없습니다.
        </p>
        <a href="/" style={{ color: 'black', textDecoration: 'underline' }}>
          홈페이지로 돌아가서 이미지를 업로드하세요
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
      
      <div style={{ height: '100px' }}></div>
      
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          이미지 변환
        </h1>
      
      {/* 상단 섹션: 이미지와 설정 */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* 왼쪽: 업로드된 이미지 */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              업로드된 이미지
            </h2>
            <img 
              src={imageData} 
              alt={imageName}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '300px',
                border: '2px solid black'
              }}
            />
            <p className="mt-4">
              파일명: {imageName}<br/>
              원본 크기: {imageWidth} × {imageHeight}px
            </p>
          </div>

          {/* 오른쪽: 설정 옵션들 */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              도안 설정
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
        </div>

        {/* 도안 만들기 버튼 */}
        <div className="text-center mt-6">
          <button 
            onClick={handleGeneratePreview}
            disabled={isGenerating}
            style={{ 
              fontSize: '1.1rem', 
              padding: '15px 30px',
              marginRight: '1rem',
              opacity: isGenerating ? 0.6 : 1,
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            {isAnalyzingColors ? 'DMC 색상 분석 중...' : isGenerating ? '도안 생성 중...' : '도안 만들기'}
          </button>
          
          {/* 진행 상태 안내 메시지 */}
          {(isAnalyzingColors || isGenerating) && (
            <div style={{
              marginTop: '1rem',
              color: 'black',
              fontSize: '0.9rem'
            }}>
              이미지가 클수록 최대 5분까지 시간이 소요됩니다.
            </div>
          )}
        </div>

        {/* Error Display */}
        {patternError && (
          <div style={{ 
            marginTop: '1rem',
            padding: '1rem',
            border: '2px solid red',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            color: 'red',
            fontWeight: 'bold'
          }}>
            오류: {patternError}
          </div>
        )}

        {/* Pattern Statistics */}
        {pattern && colorStatistics && (
          <div style={{ 
            marginTop: '2rem',
            padding: '1rem',
            border: '2px solid black',
            backgroundColor: 'rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
              도안 통계
            </h3>
            <div style={{ fontSize: '0.9rem' }}>
              <p><strong>설정된 DMC 색상 개수:</strong> {pattern.statistics.guaranteedColors}개</p>
              <p><strong>선택 품질:</strong> {(pattern.statistics.selectionQuality * 100).toFixed(1)}%</p>
              <p><strong>총 비즈 개수:</strong> {pattern.statistics.totalPixels.toLocaleString()}개</p>
              <p><strong>분석 전략:</strong> {pattern.dmcPalette.analysisData.selectionStrategy}</p>
            </div>
            
            <h4 style={{ fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem' }}>
              색상별 사용량 (상위 5개)
            </h4>
            <div style={{ fontSize: '0.8rem' }}>
              {colorStatistics.slice(0, 5).map((stat, index) => (
                <div key={stat.dmcColor.code} style={{ marginBottom: '0.3rem' }}>
                  <strong>DMC {stat.dmcColor.code}</strong> ({stat.dmcColor.name}): {stat.count}개 ({stat.percentage.toFixed(1)}%)
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 섹션: 도안 미리보기와 색상 테이블 */}
      {pattern && (
        <div>
          {/* 도안 미리보기 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              도안 미리보기
            </h2>
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
              calculatedSize={calculatedSize} // 계산된 크기 정보 전달
            />
          </div>

          {/* 색상 테이블 */}
          <div>
            <DMCColorTable pattern={pattern} />
          </div>



          <div style={{ height: '30px' }}></div>
          {/* 도안 다운로드 버튼들 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            marginTop: '1rem',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={handleDownloadIntegrated}
              disabled={!pattern || isGenerating || isGeneratingPDF}
              style={{ 
                fontSize: '1rem', 
                padding: '12px 24px',
                backgroundColor: (!pattern || isGenerating || isGeneratingPDF) ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                opacity: (!pattern || isGenerating || isGeneratingPDF) ? 0.6 : 1,
                cursor: (!pattern || isGenerating || isGeneratingPDF) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isGeneratingPDF ? 'DMC TABLE 생성 중...' : '📊 DMC TABLE'}
            </button>

            <button 
              onClick={handleDownloadVectorPDF}
              disabled={!pattern || isGenerating || isGeneratingPDF}
              style={{ 
                fontSize: '1rem', 
                padding: '12px 24px',
                backgroundColor: (!pattern || isGenerating || isGeneratingPDF) ? '#ccc' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                opacity: (!pattern || isGenerating || isGeneratingPDF) ? 0.6 : 1,
                cursor: (!pattern || isGenerating || isGeneratingPDF) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isGeneratingPDF ? '도안 출력 생성 중...' : '📄 도안 출력'}
            </button>
            
          </div>
          
          {/* 사용법 안내 */}
          <div style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            color: '#666',
            maxWidth: '800px',
            margin: '1.5rem auto 0'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'rgba(40,167,69,0.1)', borderRadius: '4px' }}>
                <strong>📊 DMC TABLE</strong><br/>
                DMC 컬러표만 포함
              </div>
              <div style={{ padding: '0.5rem', backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: '4px' }}>
                <strong>📄 도안 출력</strong><br/>
                무한확대 가능한 완벽 벡터
              </div>
            </div>
          </div>
          <div style={{ height: '100px' }}></div>
        </div>
      )}
      </div>

      {/* PDF Generation Status */}
      {isGeneratingPDF && (
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
            <h3 style={{ marginBottom: '0.5rem' }}>
              PDF 생성 중...
            </h3>
            
            
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
              PDF 생성이 진행 중입니다. 잠시만 기다려주세요.
            </p>
            
            
            {isGeneratingPDF && (
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
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#28a745' }}>
                  📊 DMC TABLE 생성 중
                </div>
                • DMC 색상표와 아이콘 정보 준비 중<br/>
                • 잠시만 기다려주세요...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}