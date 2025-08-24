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
    <div className="mb-8" style={{ fontFamily: 'Baskervville, serif', fontWeight: '500' }}>
      <h3 style={{ 
        fontSize: '1.2rem', 
        fontWeight: '500', 
        marginBottom: '1rem',
        fontFamily: 'Baskervville, serif'
      }}>
        Bead Type
      </h3>
      
      {/* Bead Type Selection */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          fontFamily: 'Baskervville, serif',
          fontWeight: '500'
        }}>
          <input
            type="radio"
            name="beadType"
            value="circular"
            checked={beadType === 'circular'}
            onChange={(e) => onBeadTypeChange(e.target.value as 'circular' | 'square')}
            style={{ marginRight: '0.5rem' }}
          />
          <div>
            <div style={{ 
              fontWeight: '500',
              fontFamily: 'Baskervville, serif'
            }}>Circular Beads</div>
          </div>
        </label>
        
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          fontFamily: 'Baskervville, serif',
          fontWeight: '500'
        }}>
          <input
            type="radio"
            name="beadType"
            value="square"
            checked={beadType === 'square'}
            onChange={(e) => onBeadTypeChange(e.target.value as 'circular' | 'square')}
            style={{ marginRight: '0.5rem' }}
          />
          <div>
            <div style={{ 
              fontWeight: '500',
              fontFamily: 'Baskervville, serif'
            }}>Square Beads</div>
          </div>
        </label>
      </div>
      
      {/* Bead Size Configuration */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ 
          fontSize: '1.1rem', 
          fontWeight: '500', 
          marginBottom: '0.8rem',
          fontFamily: 'Baskervville, serif'
        }}>Bead Size Configuration</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {/* Circular Bead Size */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              fontFamily: 'Baskervville, serif'
            }}>
              Circular Bead Diameter (mm)
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
                borderRadius: '4px',
                fontFamily: 'Baskervville, serif',
                fontWeight: '500'
              }}
              placeholder="e.g., 2.8"
            />
          </div>
          
          {/* Square Bead Size */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              fontFamily: 'Baskervville, serif'
            }}>
              Square Bead Side Length (mm)
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
                borderRadius: '4px',
                fontFamily: 'Baskervville, serif',
                fontWeight: '500'
              }}
              placeholder="e.g., 2.6"
            />
          </div>
        </div>
        
        {/* Confirm Button */}
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
              fontWeight: '500',
              fontFamily: 'Baskervville, serif'
            }}
          >
            Confirm Bead Settings
          </button>
        </div>
        
        {/* Confirmation Status Display */}
        {isBeadConfirmed && (
          <div style={{
            marginTop: '1rem',
            padding: '0.8rem',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            border: '1px solid #28a745',
            borderRadius: '4px',
            fontSize: '0.9rem',
            color: '#28a745',
            fontFamily: 'Baskervville, serif',
            fontWeight: '500'
          }}>
            ✅ <strong>Bead settings confirmed</strong><br/>
            • Circular beads: diameter {confirmedCircularSize}mm<br/>
            • Square beads: side length {confirmedSquareSize}mm<br/>
            • Current selection: {beadType === 'circular' ? 'Circular' : 'Square'} beads
          </div>
        )}
      </div> 
    </div>
  )
}