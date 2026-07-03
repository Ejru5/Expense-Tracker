import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  noPadding?: boolean
}

export function Card({ children, className = '', glass, noPadding, ...props }: CardProps) {
  const base = glass ? 'card-glass' : 'card transition-card'
  const pad  = noPadding ? '' : 'p-5'
  return (
    <div className={`${base} ${pad} ${className}`} {...props}>
      {children}
    </div>
  )
}
