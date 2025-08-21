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
    // 핵심 속성만 의존성으로 사용하여 불필요한 재계산 방지
    pattern.config.beadGridWidth,
    pattern.config.beadGridHeight,
    pattern.constrainedPixels.length,
    pattern.dmcPalette.selectedColors.map(c => c.code).join(',') // 색상 변경 감지
  ])

  // Create table data
  const tableData: ColorTableEntry[] = []
  
  // Map 객체가 아닌 일반 객체인 경우를 처리
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
    <div className={`dmc-color-table ${className}`}>
      <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        DMC 색상 및 아이콘 목록
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
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid white' }}>
                색상
              </th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid white' }}>
                아이콘
              </th>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid white' }}>
                DMC 코드
              </th>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid white' }}>
                색상명
              </th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid white' }}>
                사용량
              </th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid white' }}>
                비율
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
                  fontWeight: 'bold'
                }}>
                  DMC {entry.dmcCode}
                </td>
                
                {/* Color Name */}
                <td style={{ 
                  padding: '6px',
                  border: '1px solid black'
                }}>
                  {entry.dmcName}
                </td>
                
                {/* Count */}
                <td style={{ 
                  padding: '6px',
                  textAlign: 'center',
                  border: '1px solid black'
                }}>
                  {entry.count.toLocaleString()}개
                </td>
                
                {/* Percentage */}
                <td style={{ 
                  padding: '6px',
                  textAlign: 'center',
                  border: '1px solid black'
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
        fontSize: '0.8rem'
      }}>
        <p><strong>요약:</strong></p>
        <p>• 총 {tableData.length}개 색상 사용</p>
        <p>• 총 {pattern.statistics.totalPixels.toLocaleString()}개 비즈 필요</p>

        <p>• 가장 많이 사용된 색상: DMC {tableData[0]?.dmcCode} ({tableData[0]?.percentage.toFixed(1)}%)</p>
      </div>
      
      {/* Usage Instructions */}
      <div style={{ 
        marginTop: '1rem',
        padding: '0.5rem',
        backgroundColor: 'rgba(0,0,0,0.02)',
        border: '1px solid #ccc',
        fontSize: '0.75rem',
        color: '#666'
      }}>
        <p><strong>💡 사용법:</strong></p>
        <p>• 도안에서 각 칸의 아이콘을 확인하고 해당하는 DMC 색상의 비즈를 배치하세요</p>
        <p>• 색상별 사용량을 참고하여 필요한 비즈 개수를 미리 준비하세요</p>
        <p>• 비슷한 색상이나 아이콘에 주의하여 정확히 구분해서 작업하세요</p>
      </div>
    </div>
  )
}