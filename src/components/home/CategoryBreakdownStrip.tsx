import React from 'react'
import { formatINR } from '../../lib/utils'
import type { Transaction } from '../../types'
import { useAppStore } from '../../store/useAppStore'

interface CategoryBreakdownStripProps {
  transactions: Transaction[]
}

export function CategoryBreakdownStrip({ transactions }: CategoryBreakdownStripProps) {
  const { categories } = useAppStore()
  const now = new Date()
  
  const categorySpentMap: Record<string, number> = {}
  const categoryTxsMap: Record<string, Transaction[]> = {}
  
  const thisMonthExpenses = transactions.filter(t => {
    const d = new Date(t.date)
    return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  thisMonthExpenses.forEach(t => {
    categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] ?? 0) + t.amount
    if (!categoryTxsMap[t.categoryId]) categoryTxsMap[t.categoryId] = []
    categoryTxsMap[t.categoryId].push(t)
  })

  const topCategories = [...categories]
    .map(cat => ({
      ...cat,
      spent: categorySpentMap[cat.id] ?? 0,
      txs: categoryTxsMap[cat.id] ?? []
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)

  const getFlatColor = (catId: string, defaultColor: string) => {
    const specColors: Record<string, string> = {
      'groceries': 'var(--nest-cat-groceries)',
      'subscriptions': 'var(--nest-cat-subs)',
      'dining': 'var(--nest-cat-dining)',
      'transport': 'var(--nest-cat-transport)',
      'shopping': 'var(--nest-cat-shopping)',
      'bills': 'var(--nest-cat-bills)',
    }
    const key = Object.keys(specColors).find(k => catId.toLowerCase().includes(k))
    return key ? specColors[key] : defaultColor
  }

  return (
    <div className="space-y-3">
      <h3 className="section-title pl-0.5">Category Breakdown</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {topCategories.map(cat => {
          const segments = Array.from({ length: 4 }).map((_, i) => {
            const startDay = i * 7
            const endDay = (i + 1) * 7
            return cat.txs
              .filter(t => {
                const d = new Date(t.date)
                return d.getDate() >= startDay && d.getDate() < endDay
              })
              .reduce((sum, t) => sum + t.amount, 0)
          })

          const maxVal = Math.max(...segments, 1)
          const svgPoints = segments
            .map((val, i) => {
              const x = (i * 30) + 5
              const y = 22 - (val / maxVal) * 18
              return `${x},${y}`
            })
            .join(' ')

          const dotColor = getFlatColor(cat.id, cat.color)

          return (
            <div key={cat.id} className="category-tile flex flex-col justify-between min-h-[140px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-nest-primary truncate max-w-[70%]">{cat.name}</span>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{ backgroundColor: `${dotColor}20`, color: dotColor }}
                >
                  <span className="text-[10px]" style={{ filter: 'grayscale(0)' }}>{cat.icon || '💰'}</span>
                </div>
              </div>

              <div className="mt-2.5">
                <p className="text-lg font-normal tracking-tight font-mono text-nest-primary leading-none truncate">
                  {formatINR(cat.spent)}
                </p>
                
                <div className="h-6 mt-3.5 flex items-center justify-between">
                  <svg className="w-full h-full opacity-60" viewBox="0 0 100 24">
                    <polyline
                      fill="none"
                      stroke={dotColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={svgPoints}
                    />
                  </svg>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryBreakdownStrip
