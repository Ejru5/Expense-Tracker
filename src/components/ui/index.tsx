import React from 'react'
import { Loader2 } from 'lucide-react'

export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin-slow text-coral ${className}`} />
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-surface-subtle">
      <div className="flex flex-col items-center gap-3">
        <img src="/logo.png" alt="Loading..." className="w-12 h-12 rounded-2xl shadow-fab object-cover animate-pulse-soft" />
        <p className="text-sm text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  rounded?: string
}

export function Skeleton({ className = '', rounded = 'rounded-xl' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${rounded} ${className}`} />
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
    income:  'badge-income',
    expense: 'badge-expense',
    warning: 'badge-warning',
    neutral: 'badge-neutral',
    primary: 'badge bg-primary-100 text-primary-700',
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
