'use client'

import AdUnit from './AdUnit'

interface AdSideBannerProps {
  side: 'left' | 'right'
  slot: string
}

export default function AdSideBanner({ side, slot }: AdSideBannerProps) {
  const positionStyle: React.CSSProperties =
    side === 'left' ? { left: '1rem' } : { right: '1rem' }

  return (
    <div
      className="dmc-side-ad"
      style={{
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '160px',
        zIndex: 40,
        ...positionStyle,
      }}
    >
      <AdUnit
        slot={slot}
        format="auto"
        style={{ display: 'block', width: '160px', height: '600px' }}
      />
    </div>
  )
}
