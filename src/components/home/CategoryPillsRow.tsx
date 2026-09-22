import React from 'react'
import { useNavigate } from 'react-router-dom'
import { formatINR } from '../../lib/utils'
import type { Transaction } from '../../types'
import { useAppStore } from '../../store/useAppStore'

interface CategoryPillsRowProps {
  transactions: Transaction[]
}

const CAT_COLORS: Record<string, string> = {
  groceries:     'var(--nest-cat-groceries)',
  subscriptions: 'var(--nest-cat-subs)',
  dining:        'var(--nest-cat-dining)',
  transport:     'var(--nest-cat-transport)',
  shopping:      'var(--nest-cat-shopping)',
  bills:         'var(--nest-cat-bills)',
}

function getCatColor(catId: string, fallback: string): string {
  const key = Object.keys(CAT_COLORS).find(k => catId.toLowerCase().includes(k))
  return key ? CAT_COLORS[key] : fallback
}

export function CategoryPillsRow({ transactions }: CategoryPillsRowProps) {
  const navigate  = useNavigate()
  const { categories } = useAppStore()
  const now = new Date()

  // Sum this month's expenses per category
  const spentMap: Record<string, number> = {}
  transactions.forEach(t => {
    const d = new Date(t.date)
    if (t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      spentMap[t.categoryId] = (spentMap[t.categoryId] ?? 0) + t.amount
    }
  })

  // Only show categories with actual spend, sorted desc
  const activeCats = categories
    .map(cat => ({ ...cat, spent: spentMap[cat.id] ?? 0 }))
    .filter(cat => cat.spent > 0)
    .sort((a, b) => b.spent - a.spent)

  if (activeCats.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="section-title pl-0.5">Categories</h3>
        <button
          onClick={() => navigate('/spending')}
          className="text-[11px] font-bold text-nest-cat-groceries hover:opacity-80 transition-colors min-h-[36px] flex items-center"
        >
          See All →
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5 -mx-4 px-4">
        {activeCats.map(cat => {
          const color = getCatColor(cat.id, cat.color)
          return (
            <div
              key={cat.id}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border"
              style={{
                backgroundColor: `${color}10`,
                borderColor: `${color}30`,
              }}
            >
              <span className="text-sm leading-none">{cat.icon || '💰'}</span>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-nest-primary truncate max-w-[72px]">
                  {cat.name}
                </span>
                <span
                  className="text-[10px] font-mono font-semibold mt-0.5"
                  style={{ color }}
                >
                  {formatINR(cat.spent)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryPillsRow
