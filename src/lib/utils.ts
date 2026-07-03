/** Format a number as Indian Rupee (₹1,20,000) */
export function formatINR(amount: number, compact = false): string {
  if (compact) {
    if (Math.abs(amount) >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(1)}Cr`
    if (Math.abs(amount) >= 1_00_000)   return `₹${(amount / 1_00_000).toFixed(1)}L`
    if (Math.abs(amount) >= 1_000)      return `₹${(amount / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Format just a number in Indian style (no ₹ symbol) */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n)
}

/** Relative time — "2m ago", "1h ago", "yesterday" */
export function timeAgo(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)

  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  if (days < 7)   return `${days}d ago`

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/** Format a date as "1 Jul 2026" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Format a date as "Jul 2026" */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

/** Get month key "2026-07" from a Date */
export function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Get the start/end of a month */
export function monthBounds(year: number, month: number) {
  const start = new Date(year, month, 1)
  const end   = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

/** Clamp a number between min and max */
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

/** Percentage of spent vs budget (0–100) */
export function budgetPercent(spent: number, budget: number) {
  if (!budget) return 0
  return clamp(Math.round((spent / budget) * 100), 0, 100)
}
