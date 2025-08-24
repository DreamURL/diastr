'use client'

import { useState, useEffect } from 'react'
import { DMC_COLOR_MAP, type DMCColor } from '../utils/dmcColors'

interface ColorConfigurationProps {
  colorCount: number
  onColorCountChange: (count: number) => void
  confirmedColorCount: number
  onConfirmColorSettings: (count: number, customColors?: string[]) => void
  optimalColors: number
  maxColors: number
  isCalculating?: boolean
  isConfirmed?: boolean
}

interface ValidationResult {
  isValid: boolean
  validCodes: string[]
  invalidCodes: string[]
  colors: DMCColor[]
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
  // Local state
  const [localColorCount, setLocalColorCount] = useState<number>(colorCount)
  
  // 🎯 NEW: User-owned colors related state
  const [useCustomColors, setUseCustomColors] = useState<boolean>(false)
  const [customColorInput, setCustomColorInput] = useState<string>('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showCustomPanel, setShowCustomPanel] = useState<boolean>(false)
  
  // Update local state when colorCount prop changes
  useEffect(() => {
    setLocalColorCount(colorCount)
  }, [colorCount])
  
  // 🎯 DMC code validation function
  const validateDMCCodes = (input: string): ValidationResult => {
    if (!input.trim()) {
      return { isValid: false, validCodes: [], invalidCodes: [], colors: [] }
    }
    
    const codes = input.split(',').map(code => code.trim()).filter(code => code.length > 0)
    const validCodes: string[] = []
    const invalidCodes: string[] = []
    const colors: DMCColor[] = []
    
    codes.forEach(code => {
      const dmcColor = DMC_COLOR_MAP.get(code)
      if (dmcColor) {
        validCodes.push(code)
        colors.push(dmcColor)
      } else {
        invalidCodes.push(code)
      }
    })
    
    return {
      isValid: invalidCodes.length === 0 && validCodes.length > 0,
      validCodes,
      invalidCodes,
      colors
    }
  }
  
  // 🎯 Real-time validation on input change
  useEffect(() => {
    if (customColorInput.trim()) {
      const result = validateDMCCodes(customColorInput)
      setValidationResult(result)
    } else {
      setValidationResult(null)
    }
  }, [customColorInput])
  
  // 🎯 Mode toggle function
  const handleModeToggle = () => {
    const newMode = !useCustomColors
    setUseCustomColors(newMode)
    setShowCustomPanel(newMode)
    
    if (!newMode) {
      // Switch to full color mode
      setCustomColorInput('')
      setValidationResult(null)
    }
  }
  
  // 🎯 Confirm button click handler
  const handleConfirm = () => {
    if (useCustomColors && validationResult?.isValid) {
      onConfirmColorSettings(validationResult.validCodes.length, validationResult.validCodes)
    } else {
      onConfirmColorSettings(localColorCount)
    }
  }
  
  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
      
      <div className="mb-8" style={{ 
        position: 'relative',
        fontFamily: 'Baskervville, serif',
        fontWeight: '500'
      }}>
        <h3 style={{ 
          fontSize: '1.2rem', 
          fontWeight: '500', 
          marginBottom: '1rem',
          fontFamily: 'Baskervville, serif'
        }}>
          Color Configuration
        </h3>
        
        {/* 🎯 Mode Selection Toggle */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button
              onClick={() => {
                if (useCustomColors) {
                  handleModeToggle()
                }
              }}
              style={{
                padding: '10px 20px',
                fontSize: '0.95rem',
                backgroundColor: !useCustomColors ? 'black' : 'white',
                color: !useCustomColors ? 'white' : 'black',
                border: '2px solid black',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                width: '100%',
                fontFamily: 'Baskervville, serif'
              }}
            >
              Use All DMC Colors (447)
            </button>
            
            <button
              onClick={handleModeToggle}
              style={{
                padding: '10px 20px',
                fontSize: '0.95rem',
                backgroundColor: useCustomColors ? 'black' : 'white',
                color: useCustomColors ? 'white' : 'black',
                border: '2px solid black',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                width: '100%',
                fontFamily: 'Baskervville, serif'
              }}
            >
              Use Only My Color Codes
            </button>
          </div>
          
          <p style={{ 
            fontSize: '0.85rem', 
            color: '#666', 
            fontStyle: 'italic',
            fontFamily: 'Baskervville, serif',
            fontWeight: '500'
          }}>
            {useCustomColors 
              ? 'Enter your DMC color codes to generate patterns using only those colors.'
              : 'Automatically select optimal colors from all 447 DMC colors for your image.'
            }
          </p>
        </div>
        
        {/* Main Configuration Area */}
        {!useCustomColors ? (
          // Full Color Mode - Original Layout
          <div style={{ minHeight: '200px' }}>
            <div className="form-group">
              <label style={{ fontFamily: 'Baskervville, serif', fontWeight: '500' }}>Number of Colors to Use</label>
              <p style={{ fontFamily: 'Baskervville, serif', fontWeight: '500' }}>Start with 200 and gradually reduce. The actual number of colors may be less.</p>
              
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
                    opacity: isCalculating ? 0.6 : 1,
                    fontFamily: 'Baskervville, serif',
                    fontWeight: '500'
                  }}
                  placeholder="8-447 (All DMC Colors)"
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
                    fontWeight: '500',
                    minWidth: '60px',
                    fontFamily: 'Baskervville, serif'
                  }}
                >
                  {isCalculating ? 'Processing...' : 'Confirm'}
                </button>
              </div>
              
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#666', 
                marginTop: '0.5rem',
                fontStyle: 'italic',
                fontFamily: 'Baskervville, serif',
                fontWeight: '500'
              }}>
                Configurable from 8 to 447 colors. Please click "Confirm" after setting.
              </p>
            </div>
          </div>
        ) : (
          // User Color Mode - Vertical Layout
          <div style={{ minHeight: '300px' }}>
            {/* Code Input Section */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <p style={{ marginBottom: '1.0rem', fontFamily: 'Baskervville, serif', fontWeight: '500' }}>Enter DMC color codes separated by commas. Example: 310,817,666,700</p>
              
              {/* Code input area with horizontal arrangement */}
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'flex-start',
                marginBottom: '0.5rem' 
              }}>
                <textarea
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  disabled={isCalculating}
                  placeholder="Example: 310,817,666,700,501,3346,3348"
                  style={{
                    flex: 1,
                    minHeight: '120px',
                    padding: '12px',
                    border: '2px solid black',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
                
                <button
                  onClick={handleConfirm}
                  disabled={isCalculating || !validationResult?.isValid}
                  style={{
                    padding: '12px 20px',
                    fontSize: '1rem',
                    backgroundColor: (isCalculating || !validationResult?.isValid) ? '#ccc' : 'black',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (isCalculating || !validationResult?.isValid) ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    minWidth: '100px',
                    height: 'fit-content',
                    fontFamily: 'Baskervville, serif',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isCalculating ? 'Processing...' : validationResult?.isValid ? `Apply (${validationResult.validCodes.length})` : 'Apply'}
                </button>
              </div>
            </div>

            {/* Color Validation & Preview Section - Below Code Input */}
            <div style={{ 
              border: '2px solid black',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: 'rgba(0,0,0,0.02)',
              animation: showCustomPanel ? 'slideIn 0.3s ease-out' : 'slideOut 0.3s ease-out'
            }}>
              <h4 style={{ 
                fontWeight: '500', 
                marginBottom: '1rem', 
                fontSize: '1rem',
                fontFamily: 'Baskervville, serif'
              }}>
                Color Validation & Preview
              </h4>
              
              {/* Validation Result */}
              {validationResult ? (
                <div style={{ marginBottom: '1rem' }}>
                  {validationResult.isValid ? (
                    <div style={{ 
                      padding: '0.5rem',
                      backgroundColor: 'rgba(40, 167, 69, 0.1)',
                      border: '1px solid #28a745',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontFamily: 'Baskervville, serif',
                      fontWeight: '500'
                    }}>
                      <strong>{validationResult.validCodes.length} colors</strong> confirmed.
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '0.5rem',
                      backgroundColor: 'rgba(220, 53, 69, 0.1)',
                      border: '1px solid #dc3545',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontFamily: 'Baskervville, serif',
                      fontWeight: '500'
                    }}>
                      Invalid codes: <strong>{validationResult.invalidCodes.join(', ')}</strong>
                    </div>
                  )}
                </div>
              ) : (
                customColorInput.trim() === '' && (
                  <div style={{ 
                    padding: '1rem',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    color: '#0056b3',
                    fontFamily: 'Baskervville, serif',
                    fontWeight: '500'
                  }}>
                    Please enter DMC color codes
                  </div>
                )
              )}
              
              {/* Color Preview Table */}
              {validationResult?.isValid && validationResult.colors.length > 0 && (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <h5 style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '500', 
                    marginBottom: '0.5rem',
                    fontFamily: 'Baskervville, serif'
                  }}>
                    Color Preview:
                  </h5>
                  <table style={{ width: '100%', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid black' }}>
                        <th style={{ 
                          padding: '0.3rem', 
                          textAlign: 'left',
                          fontFamily: 'Baskervville, serif',
                          fontWeight: '500'
                        }}>Code</th>
                        <th style={{ 
                          padding: '0.3rem', 
                          textAlign: 'left',
                          fontFamily: 'Baskervville, serif',
                          fontWeight: '500'
                        }}>Color</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.colors.map((color) => (
                        <tr key={color.code}>
                          <td style={{ 
                            padding: '0.3rem',
                            fontFamily: 'Baskervville, serif',
                            fontWeight: '500'
                          }}>{color.code}</td>
                          <td style={{ padding: '0.3rem' }}>
                            <div style={{
                              width: '30px',
                              height: '20px',
                              backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                              border: '1px solid black',
                              borderRadius: '2px'
                            }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 🎯 Status Display Area */}
        <div style={{ marginTop: '0.5rem' }}>
          {/* Processing Status Display */}
          {isCalculating && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid #ffc107',
              borderRadius: '4px',
              fontSize: '0.9rem',
              color: '#856404',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              fontFamily: 'Baskervville, serif',
              fontWeight: '500'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #ffc107',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              {useCustomColors ? 'Analyzing with user colors...' : 'Analyzing optimal colors from all colors...'} Processing time may vary depending on image size.
            </div>
          )}
          
          {/* Confirmation Complete Status Display */}
          {isConfirmed && !isCalculating && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              border: '1px solid #28a745',
              borderRadius: '4px',
              fontSize: '0.9rem',
              color: '#28a745',
              marginBottom: '1rem',
              fontFamily: 'Baskervville, serif',
              fontWeight: '500'
            }}>
              Color configuration confirmed: <strong>{confirmedColorCount} colors</strong> 
              {useCustomColors ? ' (User-specified colors)' : ' (Selected from all DMC colors)'}
            </div>
          )}
          
          {/* 🎯 Processing Method Explanation */}
          <div style={{ 
            padding: '1rem', 
            border: '1px solid black', 
            backgroundColor: 'rgba(0,0,0,0.05)',
            fontSize: '0.9rem',
            borderRadius: '4px',
            fontFamily: 'Baskervville, serif',
            fontWeight: '500'
          }}>
            <h4 style={{ 
              fontWeight: '500', 
              marginBottom: '0.75rem',
              fontFamily: 'Baskervville, serif'
            }}>🔧 Processing Method</h4>
            
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>Current Mode:</strong></span>
                <span style={{ fontWeight: '500', color: useCustomColors ? '#28a745' : '#007bff' }}>
                  {useCustomColors ? 'User-owned Colors' : 'All DMC Colors'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>Configuration Status:</strong></span>
                <span style={{ fontWeight: '500', color: isConfirmed ? '#28a745' : '#ff6b35' }}>
                  {isConfirmed ? `${confirmedColorCount} colors` : 'Unconfirmed'}
                </span>
              </div>
            </div>
            
            {!isConfirmed && (
              <div style={{ 
                marginTop: '0.75rem', 
                padding: '0.5rem',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                border: '1px solid #ff6b35',
                borderRadius: '3px'
              }}>
                <p style={{ 
                  color: '#ff6b35', 
                  fontWeight: '500', 
                  margin: 0, 
                  fontSize: '0.85rem',
                  fontFamily: 'Baskervville, serif'
                }}>
                  Please {useCustomColors ? 'enter DMC codes and click "Apply"' : 'set the number of colors and click "Confirm"'}
                </p>
              </div>
            )}
          </div>
        </div>
    </div>
    </>
  )
}