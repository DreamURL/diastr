'use client'

import { useEffect, useRef } from 'react'

interface AdUnitProps {
  slot: string
  format?: string
  layout?: string
  style?: React.CSSProperties
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdUnit({ slot, format = 'auto', layout, style, className }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      if (adRef.current && adRef.current.querySelector('.adsbygoogle')?.childElementCount === 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (e) {
      // AdSense not loaded
    }
  }, [])

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client="ca-pub-2030441326964978"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        {...(format === 'auto' ? { 'data-full-width-responsive': 'true' } : {})}
      />
    </div>
  )
}
