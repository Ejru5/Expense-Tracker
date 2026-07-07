import React from 'react'
import { Loader2 } from 'lucide-react'

export { DotProgress } from './DotProgress'
export { Button } from './Button'
export { Input, Textarea, Select } from './Input'
export { BottomSheet, Modal } from './BottomSheet'
export { Card } from './Card'

export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin-slow text-nest-lime-text ${className}`} />
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-nest-bg animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <img src="/logo.png" alt="Loading..." className="w-12 h-12 rounded-2xl shadow-fab object-cover animate-pulse-soft" />
        <p className="text-[11px] text-nest-primary font-bold uppercase tracking-widest">Loading</p>
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  rounded?: string
}

export function Skeleton({ className = '', rounded = 'rounded-sm' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-nest-surface-muted ${rounded} ${className}`} />
  )
}

export function Badge({
  children,
  variant = 'neutral',
  className = '',
}: {
  children: React.ReactNode
  variant?: 'income' | 'expense' | 'warning' | 'neutral' | 'primary'
  className?: string
}) {
  const map = {
    income:  'badge badge-income',
    expense: 'badge badge-expense',
    warning: 'badge badge-warning',
    neutral: 'badge badge-neutral',
    primary: 'badge badge-primary',
  }
  return <span className={`${map[variant]} ${className}`}>{children}</span>
}

export function Chip({
  icon,
  label,
  style,
}: {
  icon: string
  label?: string
  style?: React.CSSProperties
}) {
  return (
    <div className="cat-chip" style={style}>
      <span role="img" aria-label={label}>{icon}</span>
    </div>
  )
}
