'use client'

interface BeadConfigurationProps {
  beadType: 'circular' | 'square'
  onBeadTypeChange: (type: 'circular' | 'square') => void
  circularSize: number
  squareSize: number
  onCircularSizeChange: (size: number) => void
  onSquareSizeChange: (size: number) => void
  confirmedCircularSize: number
  confirmedSquareSize: number
  onConfirmBeadSettings: () => void
  isBeadConfirmed?: boolean
}

export default function BeadConfiguration({ 
  beadType, 
  onBeadTypeChange,
  circularSize,
  squareSize,
  onCircularSizeChange,
  onSquareSizeChange,
  confirmedCircularSize,
  confirmedSquareSize,
  onConfirmBeadSettings,
  isBeadConfirmed = false
}: BeadConfigurationProps) {
  return (
    <div className="mb-8">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        비즈 종류
      </h3>
      
      {/* 비즈 종류 선택 */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            name="beadType"
            value="circular"
            checked={beadType === 'circular'}
            onChange={(e) => onBeadTypeChange(e.target.value as 'circular' | 'square')}
            style={{ marginRight: '0.5rem' }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>원형 비즈</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>지름 설정 가능</div>
          </div>
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            name="beadType"
            value="square"
            checked={beadType === 'square'}
            onChange={(e) => onBeadTypeChange(e.target.value as 'circular' | 'square')}
            style={{ marginRight: '0.5rem' }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>사각형 비즈</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>한 변 길이 설정 가능</div>
          </div>
        </label>
      </div>
      
      {/* 비즈 사이즈 설정 */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>비즈 사이즈 설정</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {/* 원형 비즈 사이즈 */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              원형 비즈 지름 (mm)
            </label>
            <input
              type="number"
              min="1.0"
              max="10.0"
              step="0.1"
              value={circularSize}
              onChange={(e) => onCircularSizeChange(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '2px solid black',
                borderRadius: '4px'
              }}
              placeholder="예: 2.8"
            />
          </div>
          
          {/* 사각형 비즈 사이즈 */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              사각형 비즈 한 변 (mm)
            </label>
            <input
              type="number"
              min="1.0"
              max="10.0"
              step="0.1"
              value={squareSize}
              onChange={(e) => onSquareSizeChange(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '2px solid black',
                borderRadius: '4px'
              }}
              placeholder="예: 2.6"
            />
          </div>
        </div>
        
        {/* 확인 버튼 */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onConfirmBeadSettings}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              backgroundColor: 'black',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            비즈 설정 확인
          </button>
        </div>
        
        {/* 확인 상태 표시 */}
        {isBeadConfirmed && (
          <div style={{
            marginTop: '1rem',
            padding: '0.8rem',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            border: '1px solid #28a745',
            borderRadius: '4px',
            fontSize: '0.9rem',
            color: '#28a745'
          }}>
            ✅ <strong>비즈 설정이 확인되었습니다</strong><br/>
            • 원형 비즈: 지름 {confirmedCircularSize}mm<br/>
            • 사각형 비즈: 한 변 {confirmedSquareSize}mm<br/>
            • 현재 선택: {beadType === 'circular' ? '원형' : '사각형'} 비즈
          </div>
        )}
      </div>
      
      {/* 비즈 정보 요약 */}
      <div style={{ 
        padding: '1rem', 
        border: '1px solid black', 
        backgroundColor: 'rgba(0,0,0,0.05)',
        fontSize: '0.9rem'
      }}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📏 비즈 정보 요약</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p><strong>선택된 종류:</strong> {beadType === 'circular' ? '원형 비즈' : '사각형 비즈'}</p>
            <p><strong>적용된 크기:</strong> 
              {beadType === 'circular' 
                ? `지름 ${isBeadConfirmed ? confirmedCircularSize : '미확인'}mm` 
                : `한 변 ${isBeadConfirmed ? confirmedSquareSize : '미확인'}mm`
              }
            </p>
          </div>
          <div>
            <p><strong>센티미터당 개수:</strong> 
              {isBeadConfirmed 
                ? beadType === 'circular' 
                  ? `약 ${(10 / confirmedCircularSize).toFixed(1)}개`
                  : `약 ${(10 / confirmedSquareSize).toFixed(1)}개`
                : '설정 확인 필요'
              }
            </p>
            <p><strong>상태:</strong> 
              <span style={{ 
                color: isBeadConfirmed ? '#28a745' : '#ff6b35',
                fontWeight: 'bold'
              }}>
                {isBeadConfirmed ? '확인됨' : '미확인'}
              </span>
            </p>
          </div>
        </div>
        {!isBeadConfirmed && (
          <p style={{ color: '#ff6b35', fontWeight: 'bold', marginTop: '0.5rem' }}>
            ⚠️ 비즈 설정을 확인해주세요
          </p>
        )}
      </div>
    </div>
  )
}