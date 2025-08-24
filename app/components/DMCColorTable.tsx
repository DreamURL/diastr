'use client'

import { useMemo } from 'react'
import { DMCFirstPattern } from '../hooks/useDMCFirstPatternGeneration'
import { assignIconsToColors, type Icon } from '../utils/iconPlacement'
import { getCachedSVGIcon } from '../utils/svgIconGenerator'

interface DMCColorTableProps {
  pattern: DMCFirstPattern
  className?: string
}

interface ColorTableEntry {
  dmcCode: string
  dmcName: string
  color: { r: number; g: number; b: number }
  icon: Icon
  count: number
  percentage: number
}

export default function DMCColorTable({ pattern, className = '' }: DMCColorTableProps) {
  // Create pattern grid and assign icons (cached to prevent re-computation on every render)
  const { patternGrid, iconAssignments } = useMemo(() => {
    const createPatternGrid = () => {
      const grid: Array<Array<string>> = []
      const width = pattern.config.beadGridWidth
      const height = pattern.config.beadGridHeight
      
      // Initialize grid
      for (let y = 0; y < height; y++) {
        grid[y] = new Array(width).fill('')
      }
      
      // Fill grid with DMC codes
      for (const pixel of pattern.constrainedPixels) {
        if (pixel.x < width && pixel.y < height) {
          grid[pixel.y][pixel.x] = pixel.selectedDMCColor.code
        }
      }
      
      return grid
    }

    const grid = createPatternGrid()
    const uniqueColors = Array.from(new Set(pattern.constrainedPixels.map(p => p.selectedDMCColor.code)))
    const assignments = assignIconsToColors(uniqueColors, grid)

    return {
      patternGrid: grid,
      iconAssignments: assignments
    }
  }, [
    // Use only core properties as dependencies to prevent unnecessary recalculations
    pattern.config.beadGridWidth,
    pattern.config.beadGridHeight,
    pattern.constrainedPixels.length,
    pattern.dmcPalette.selectedColors.map(c => c.code).join(',') // Detect color changes
  ])

  // Create table data
  const tableData: ColorTableEntry[] = []
  
  // Handle cases where colorUsage is not a Map object
  const colorUsageEntries = pattern.statistics.colorUsage instanceof Map 
    ? Array.from(pattern.statistics.colorUsage.entries())
    : Object.entries(pattern.statistics.colorUsage)

  for (const [dmcCode, count] of colorUsageEntries) {
    const dmcColor = pattern.dmcPalette.selectedColors.find(c => c.code === dmcCode)
    const icon = iconAssignments.get(dmcCode)
    
    if (dmcColor && icon) {
      tableData.push({
        dmcCode,
        dmcName: dmcColor.name,
        color: { r: dmcColor.r, g: dmcColor.g, b: dmcColor.b },
        icon,
        count: Number(count),
        percentage: (Number(count) / pattern.statistics.totalPixels) * 100
      })
    }
  }

  // Sort by usage count (descending)
  tableData.sort((a, b) => b.count - a.count)

  return (
    <div className={`dmc-color-table ${className}`} style={{ fontFamily: 'Baskervville, serif', fontWeight: '500' }}>
      <h4 style={{ 
        fontWeight: '500', 
        marginBottom: '1rem',
        fontFamily: 'Baskervville, serif'
      }}>
        DMC Colors & Icons List
      </h4>
      
      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto',
        border: '2px solid black'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '0.85rem'
        }}>
          <thead style={{ 
            backgroundColor: 'black', 
            color: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <tr>
              <th style={{ 
                padding: '8px', 
                textAlign: 'center', 
                border: '1px solid white',
                fontFamily: 'Baskervville, serif',
                fontWeight: '500'
              }}>
                Color
              </th>
              <th style={{ 
                padding: '8px', 
                textAlign: 'center', 
                border: '1px solid white',
                fontFamily: 'Baskervville, serif',
                fontWeight: '500'
              }}>
                Icon
              </th>
              <th style={{ 
                padding: '8px', 
                textAlign: 'left', 
                border: '1px solid white',
                fontFamily: 'Baskervville, serif',
                fontWeight: '500'
              }}>
                DMC Code
              </th>
              <th style={{ 
                padding: '8px', 
                textAlign: 'left', 
                border: '1px solid white',
                fontFamily: 'Baskervville, serif',
                fontWeight: '500'
              }}>
                Color Name
              </th>
              <th style={{ 
                padding: '8px', 
                textAlign: 'center', 
                border: '1px solid white',
                fontFamily: 'Baskervville, serif',
                fontWeight: '500'
              }}>
                Usage
              </th>
              <th style={{ 
                padding: '8px', 
                textAlign: 'center', 
                border: '1px solid white',
                fontFamily: 'Baskervville, serif',
                fontWeight: '500'
              }}>
                Ratio
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((entry, index) => (
              <tr 
                key={entry.dmcCode}
                style={{ 
                  backgroundColor: index % 2 === 0 ? 'white' : 'rgba(0,0,0,0.05)'
                }}
              >
                {/* Color Swatch */}
                <td style={{ 
                  padding: '6px', 
                  textAlign: 'center',
                  border: '1px solid black'
                }}>
                  <div style={{
                    width: '30px',
                    height: '20px',
                    backgroundColor: `rgb(${entry.color.r}, ${entry.color.g}, ${entry.color.b})`,
                    border: '1px solid black',
                    margin: '0 auto',
                    borderRadius: '2px'
                  }} />
                </td>
                
                {/* Icon - SVG VECTOR (infinite resolution!) */}
                <td style={{ 
                  padding: '6px', 
                  textAlign: 'center',
                  border: '1px solid black'
                }}>
                  <img 
                    src={getCachedSVGIcon(entry.icon, 5)} 
                    alt={entry.icon.symbol}
                    style={{
                      width: '20px',
                      height: '20px',
                      display: 'inline-block'
                    }}
                    title={`Icon: ${entry.icon.symbol}`}
                  />
                </td>
                
                {/* DMC Code */}
                <td style={{ 
                  padding: '6px',
                  border: '1px solid black',
                  fontWeight: '500',
                  fontFamily: 'Baskervville, serif'
                }}>
                  DMC {entry.dmcCode}
                </td>
                
                {/* Color Name */}
                <td style={{ 
                  padding: '6px',
                  border: '1px solid black',
                  fontFamily: 'Baskervville, serif',
                  fontWeight: '500'
                }}>
                  {entry.dmcName}
                </td>
                
                {/* Count */}
                <td style={{ 
                  padding: '6px',
                  textAlign: 'center',
                  border: '1px solid black',
                  fontFamily: 'Baskervville, serif',
                  fontWeight: '500'
                }}>
                  {entry.count.toLocaleString()}
                </td>
                
                {/* Percentage */}
                <td style={{ 
                  padding: '6px',
                  textAlign: 'center',
                  border: '1px solid black',
                  fontFamily: 'Baskervville, serif',
                  fontWeight: '500'
                }}>
                  {entry.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary */}
      <div style={{ 
        marginTop: '1rem',
        padding: '0.5rem',
        backgroundColor: 'rgba(0,0,0,0.05)',
        border: '1px solid black',
        fontSize: '0.8rem',
        fontFamily: 'Baskervville, serif',
        fontWeight: '500'
      }}>
        <p><strong>Summary:</strong></p>
        <p>• Total <span style={{ fontWeight: 'bold', color: 'red' }}>{tableData.length}</span> colors used</p>
        <p>• Total {pattern.statistics.totalPixels.toLocaleString()} beads required</p>

        <p>• Most used color: DMC {tableData[0]?.dmcCode} ({tableData[0]?.percentage.toFixed(1)}%)</p>
      </div>
      
      {/* Usage Instructions */}
      <div style={{ 
        marginTop: '1rem',
        padding: '0.5rem',
        backgroundColor: 'rgba(0,0,0,0.02)',
        border: '1px solid #ccc',
        fontSize: '0.75rem',
        color: '#666',
        fontFamily: 'Baskervville, serif',
        fontWeight: '500'
      }}>
        <p><strong>💡 How to Use:</strong></p>
        <p>• Check the icon in each cell of the pattern and place beads of the corresponding DMC color</p>
        <p>• Refer to the color usage to prepare the required number of beads in advance</p>
        <p>• Pay attention to similar colors or icons and work carefully to distinguish them accurately</p>
      </div>
    </div>
  )
}