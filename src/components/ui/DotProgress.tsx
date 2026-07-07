import React from 'react'

interface DotProgressProps {
  value: number // 0 to 100
  totalDots?: number
  className?: string
  variant?: 'healthy' | 'warning' | 'alert' | 'neutral'
}

export function DotProgress({ value, totalDots = 20, className = '', variant = 'neutral' }: DotProgressProps) {
  const filledCount = Math.round((Math.max(0, Math.min(100, value)) / 100) * totalDots)
  
  // Map variant to Nest Design System color tokens
  const getFilledColor = () => {
    switch (variant) {
      case 'healthy':
        return 'var(--nest-cat-groceries)' // soft green
      case 'warning':
        return 'var(--nest-cat-dining)'    // soft orange
      case 'alert':
        return 'var(--nest-cat-shopping)'  // soft rose
      case 'neutral':
      default:
        return 'rgba(0,0,0,0.6)'
    }
  }

  const filledColor = getFilledColor()

  return (
    <div className={`dot-progress ${className}`}>
      {Array.from({ length: totalDots }).map((_, i) => {
        const isFilled = i < filledCount
        return (
          <span
            key={i}
            className={`dot ${isFilled ? 'filled' : ''}`}
            style={isFilled ? { backgroundColor: filledColor } : undefined}
          />
        )
      })}
    </div>
  )
}

export default DotProgress

