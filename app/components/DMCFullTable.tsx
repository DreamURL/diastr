'use client'

import { useMemo, useState } from 'react'
import { DMC_COLORS, type DMCColor } from '../utils/dmcColors'

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      case bn:
        h = (rn - gn) / d + 4
        break
    }
    h /= 6
  }

  return [h * 360, s, l]
}

// Sort by color: grayscales first (light → dark), then chromatic by hue → lightness
const DMC_COLORS_SORTED: DMCColor[] = [...DMC_COLORS].sort((a, b) => {
  const [ha, sa, la] = rgbToHsl(a.r, a.g, a.b)
  const [hb, sb, lb] = rgbToHsl(b.r, b.g, b.b)
  const aIsGray = sa < 0.1
  const bIsGray = sb < 0.1

  if (aIsGray && !bIsGray) return -1
  if (!aIsGray && bIsGray) return 1
  if (aIsGray && bIsGray) return lb - la // light → dark

  if (Math.abs(ha - hb) > 1) return ha - hb
  return lb - la
})

export default function DMCFullTable() {
  const [query, setQuery] = useState('')

  const filteredColors = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return DMC_COLORS_SORTED
    return DMC_COLORS_SORTED.filter(
      (c) =>
        c.code.toLowerCase().includes(trimmed) ||
        c.name.toLowerCase().includes(trimmed) ||
        c.hex.toLowerCase().includes(trimmed),
    )
  }, [query])

  const headerCellStyle: React.CSSProperties = {
    padding: '8px',
    textAlign: 'center',
    border: '1px solid white',
    fontFamily: 'Baskervville, serif',
    fontWeight: 500,
  }

  const bodyCellStyle: React.CSSProperties = {
    padding: '6px',
    border: '1px solid black',
    fontFamily: 'Baskervville, serif',
    fontWeight: 500,
  }

  return (
    <div
      className="dmc-full-table"
      style={{ fontFamily: 'Baskervville, serif', fontWeight: 500 }}
    >
      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by DMC code, color name, or hex..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid black',
            backgroundColor: 'white',
            color: 'black',
            fontFamily: 'Baskervville, serif',
            fontWeight: 500,
            fontSize: '1rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Result count */}
      <p
        style={{
          marginBottom: '0.75rem',
          fontSize: '0.85rem',
          opacity: 0.7,
        }}
      >
        Showing <strong>{filteredColors.length.toLocaleString()}</strong> of{' '}
        <strong>{DMC_COLORS_SORTED.length.toLocaleString()}</strong> DMC colors —
        sorted by color
      </p>

      {/* Table — full length, no inner scroll */}
      <div style={{ border: '2px solid black' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem',
          }}
        >
          <thead style={{ backgroundColor: 'black', color: 'white' }}>
            <tr>
              <th style={headerCellStyle}>Color</th>
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>DMC Code</th>
              <th style={{ ...headerCellStyle, textAlign: 'left' }}>Name</th>
              <th style={headerCellStyle}>RGB</th>
              <th style={headerCellStyle}>HEX</th>
            </tr>
          </thead>
          <tbody>
            {filteredColors.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    ...bodyCellStyle,
                    textAlign: 'center',
                    padding: '2rem',
                    opacity: 0.6,
                  }}
                >
                  No DMC colors found for &quot;{query}&quot;
                </td>
              </tr>
            ) : (
              filteredColors.map((color, index) => (
                <tr
                  key={color.code}
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? 'white' : 'rgba(0,0,0,0.04)',
                  }}
                >
                  <td
                    style={{ ...bodyCellStyle, textAlign: 'center', padding: '6px' }}
                  >
                    <div
                      aria-label={`${color.name} swatch`}
                      style={{
                        width: '40px',
                        height: '24px',
                        backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                        border: '1px solid black',
                        margin: '0 auto',
                        borderRadius: '2px',
                      }}
                    />
                  </td>
                  <td style={bodyCellStyle}>DMC {color.code}</td>
                  <td style={bodyCellStyle}>{color.name}</td>
                  <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                    {color.r}, {color.g}, {color.b}
                  </td>
                  <td
                    style={{
                      ...bodyCellStyle,
                      textAlign: 'center',
                      textTransform: 'uppercase',
                    }}
                  >
                    #{color.hex}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
