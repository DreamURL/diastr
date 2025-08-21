'use client'

import { useState, useEffect } from 'react'

interface ColorConfigurationProps {
  colorCount: number
  onColorCountChange: (count: number) => void
  confirmedColorCount: number
  onConfirmColorSettings: (count: number) => void
  optimalColors: number
  maxColors: number
  isCalculating?: boolean
  isConfirmed?: boolean
}

export default function ColorConfiguration({ 
  colorCount, 
  onColorCountChange,
  confirmedColorCount,
  onConfirmColorSettings,
  optimalColors,
  maxColors,
  isCalculating = false,
  isConfirmed = false
}: ColorConfigurationProps) {
  // 로컬 state로 입력값 관리
  const [localColorCount, setLocalColorCount] = useState<number>(colorCount)
  
  // colorCount prop이 변경되면 로컬 state 업데이트
  useEffect(() => {
    setLocalColorCount(colorCount)
  }, [colorCount])
  
  // 확인 버튼 클릭 시 현재 입력값을 직접 전달
  const handleConfirm = () => {
    onConfirmColorSettings(localColorCount)
  }
  
  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="mb-8">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        색상 설정
      </h3>
      
      <div className="form-group">
        <label>사용할 색상 개수</label>
        <p>200부터 시작해서 점차 낮춰가보세요. 실제 색상 개수는 더 적을 수 있습니다.</p>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="number"
            min="8"
            max="447"
            value={localColorCount}
            onChange={(e) => setLocalColorCount(Number(e.target.value))}
            disabled={isCalculating}
            style={{ 
              flex: 1,
              padding: '8px',
              border: '2px solid black',
              borderRadius: '4px',
              opacity: isCalculating ? 0.6 : 1
            }}
            placeholder="8-447 (전체 DMC 색상)"
          />
          
          <button
            onClick={handleConfirm}
            disabled={isCalculating || (isConfirmed && localColorCount === confirmedColorCount)}
            style={{
              padding: '8px 16px',
              fontSize: '1rem',
              backgroundColor: (isCalculating || (isConfirmed && localColorCount === confirmedColorCount)) ? '#ccc' : 'black',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isCalculating || (isConfirmed && localColorCount === confirmedColorCount)) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              minWidth: '60px'
            }}
          >
            {isCalculating ? '진행중...' : '확인'}
          </button>
        </div>
        
        {/* 진행 중 상태 표시 */}
        {isCalculating && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            fontSize: '0.9rem',
            color: '#856404',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #ffc107',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            🔄 색상 분석 진행중... 이미지 크기에 따라 시간이 소요될 수 있습니다.
          </div>
        )}
        
        {/* 확인 완료 상태 표시 */}
        {isConfirmed && !isCalculating && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            border: '1px solid #28a745',
            borderRadius: '4px',
            fontSize: '0.9rem',
            color: '#28a745'
          }}>
            ✅ 색상 설정이 확인되었습니다: {confirmedColorCount}개
          </div>
        )}
        
        <p style={{ 
          fontSize: '0.8rem', 
          color: '#666', 
          marginTop: '0.5rem',
          fontStyle: 'italic'
        }}>
          📏 8개부터 447개까지 설정 가능합니다. 설정 후 "확인" 버튼을 눌러주세요.
        </p>
      </div>
      
      
      <div style={{ 
        padding: '1rem', 
        border: '1px solid black', 
        backgroundColor: 'rgba(0,0,0,0.05)',
        fontSize: '0.9rem',
        marginTop: '1rem'
      }}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🔧 처리 방식</h4>
        <p><strong>현재 설정:</strong> {isConfirmed ? confirmedColorCount : '미확인'}개</p>
        <p><strong>DMC 선택:</strong> 이미지 전체 분석 → 최적 DMC 색상 선택</p>
        <p><strong>픽셀화 방식:</strong> 선택된 DMC 색상으로만 제약 픽셀화</p>
        {!isConfirmed && (
          <p style={{ color: '#ff6b35', fontWeight: 'bold', marginTop: '0.5rem' }}>
            ⚠️ 색상 설정을 확인해주세요
          </p>
        )}
      </div>
    </div>
    </>
  )
}