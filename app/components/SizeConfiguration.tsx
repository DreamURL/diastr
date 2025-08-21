'use client'
import { useEffect } from 'react'

interface SizeConfigurationProps {
  targetWidth: number
  onTargetWidthChange: (width: number) => void
  imageWidth: number
  imageHeight: number
  beadType: 'circular' | 'square'
  beadSize: number // mm
  onCalculatedSizeChange: (calculatedSize: {
    actualWidth: number
    actualHeight: number
    beadGridWidth: number
    beadGridHeight: number
    totalBeads: number
  }) => void
}

export default function SizeConfiguration({ 
  targetWidth, 
  onTargetWidthChange, 
  imageWidth, 
  imageHeight,
  beadType,
  beadSize,
  onCalculatedSizeChange
}: SizeConfigurationProps) {
  // 비즈 타입에 따른 크기 계산
  const beadSizeMm = beadSize
  const beadsPerCm = 10 / beadSizeMm
  
  // Generate size options (5cm to 200cm in 5cm increments)
  const sizeOptions = Array.from({ length: 40 }, (_, i) => (i + 1) * 5)
  
  // Calculate aspect ratio
  const aspectRatio = imageHeight / imageWidth
  
  // Calculate dimensions that align with bead grid
  const beadGridWidth = Math.round(targetWidth * beadsPerCm)
  const targetHeight = targetWidth * aspectRatio
  const beadGridHeight = Math.round(targetHeight * beadsPerCm)
  
  // Calculate actual physical dimensions that align with bead grid
  const actualWidth = beadGridWidth / beadsPerCm
  const actualHeight = beadGridHeight / beadsPerCm
  
  // Calculate total beads
  const totalBeads = beadGridWidth * beadGridHeight
  
  // Notify parent component of calculated values
  useEffect(() => {
    onCalculatedSizeChange({
      actualWidth,
      actualHeight,
      beadGridWidth,
      beadGridHeight,
      totalBeads
    })
  }, [actualWidth, actualHeight, beadGridWidth, beadGridHeight, totalBeads, onCalculatedSizeChange])
  
  
  // Calculate maximum possible beads for the given width
  const maxBeadsForWidth = Math.floor(targetWidth * beadsPerCm)
  const maxBeadsForHeight = Math.floor((targetWidth * beadsPerCm) * aspectRatio)
  const maxTotalBeads = maxBeadsForWidth * maxBeadsForHeight
  
  return (
    <div className="mb-8">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        크기 설정
      </h3>
      
      <div className="form-group">
        <label>가로 길이 (cm)</label>
        <select 
          value={targetWidth} 
          onChange={(e) => onTargetWidthChange(Number(e.target.value))}
          style={{ width: '100%' }}
        >
          {sizeOptions.map(size => (
            <option key={size} value={size}>
              {size}cm
            </option>
          ))}
        </select>
      </div>
      
      <div style={{ 
        padding: '1rem', 
        border: '1px solid black', 
        backgroundColor: 'rgba(0,0,0,0.05)',
        fontSize: '0.9rem'
      }}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>계산된 크기</h4>
        
        <div style={{ marginBottom: '1rem' }}>
          <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>목표 크기</h5>
          <p>가로: {targetWidth}cm</p>
          <p>세로: {targetHeight.toFixed(1)}cm</p>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#666' }}>비즈 격자에 맞춘 실제 크기</h5>
          <p>가로: {actualWidth.toFixed(2)}cm</p>
          <p>세로: {actualHeight.toFixed(2)}cm</p>
          <p style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
            (비즈 {beadType === 'circular' ? '원형' : '사각형'} {beadSizeMm.toFixed(1)}mm 기준)
          </p>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#0066cc' }}>비즈 격자 정보</h5>
          <p>가로 격자: {beadGridWidth}개</p>
          <p>세로 격자: {beadGridHeight}개</p>
          <p>1cm당 비즈: {beadsPerCm.toFixed(2)}개</p>
        </div>
        
        <div>
          <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#cc6600' }}>비즈 개수</h5>
          <p>총 비즈 개수: {totalBeads.toLocaleString()}개</p>
          <p style={{ fontSize: '0.8rem', color: '#888' }}>
            최대 가능: {maxTotalBeads.toLocaleString()}개
          </p>
        </div>
      </div>
    </div>
  )
}