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
  // Calculate bead size based on type
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
    <div className="mb-8" style={{ fontFamily: 'Baskervville, serif', fontWeight: '500' }}>
      <h3 style={{ 
        fontSize: '1.2rem', 
        fontWeight: '500', 
        marginBottom: '1rem',
        fontFamily: 'Baskervville, serif'
      }}>
        Size Configuration
      </h3>
      
      <div className="form-group">
        <label style={{ fontFamily: 'Baskervville, serif', fontWeight: '500' }}>Width (cm)</label>
        <select 
          value={targetWidth} 
          onChange={(e) => onTargetWidthChange(Number(e.target.value))}
          style={{ 
            width: '100%',
            fontFamily: 'Baskervville, serif',
            fontWeight: '500'
          }}
        >
          {sizeOptions.map(size => (
            <option key={size} value={size}>
              {size}cm
            </option>
          ))}
        </select>
      </div>
      
      {/* <div style={{ 
        padding: '1rem', 
        border: '1px solid black', 
        backgroundColor: 'rgba(0,0,0,0.05)',
        fontSize: '0.9rem'
      }}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Calculated Size</h4>
        
        <div style={{ marginBottom: '1rem' }}>
          <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>Target Size</h5>
          <p>Width: {targetWidth}cm</p>
          <p>Height: {targetHeight.toFixed(1)}cm</p>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#666' }}>Actual Size Aligned with Bead Grid</h5>
          <p>Width: {actualWidth.toFixed(2)}cm</p>
          <p>Height: {actualHeight.toFixed(2)}cm</p>
          <p style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
            (Based on {beadType === 'circular' ? 'circular' : 'square'} beads {beadSizeMm.toFixed(1)}mm)
          </p>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#0066cc' }}>Bead Grid Information</h5>
          <p>Width Grid: {beadGridWidth} beads</p>
          <p>Height Grid: {beadGridHeight} beads</p>
          <p>Beads per cm: {beadsPerCm.toFixed(2)}</p>
        </div>
        
        <div>
          <h5 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#cc6600' }}>Bead Count</h5>
          <p>Total Beads: {totalBeads.toLocaleString()}</p>
          <p style={{ fontSize: '0.8rem', color: '#888' }}>
            Maximum Possible: {maxTotalBeads.toLocaleString()}
          </p>
        </div>
      </div> */}
    </div>
  )
}