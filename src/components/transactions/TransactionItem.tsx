import React from 'react'
import { useNavigate } from 'react-router-dom'
import { formatINR, timeAgo } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import type { Transaction } from '../../types'
import { Chip } from '../ui'

interface TransactionItemProps {
  tx: Transaction
  showDate?: boolean
}

export function TransactionItem({ tx, showDate }: TransactionItemProps) {
  const { categories } = useAppStore()
  const navigate = useNavigate()
  const cat = categories.find(c => c.id === tx.categoryId) ?? categories[categories.length - 1]

  return (
    <button
      onClick={() => navigate(`/transactions/${tx.id}`)}
      className="flex items-center gap-3 w-full text-left py-2.5 px-3 rounded-xl transition-colors duration-150 hover:bg-surface-warm/50 dark:hover:bg-slate-800/30"
      id={`tx-${tx.id}`}
    >
      {/* Category chip */}
      <Chip
        icon={cat.icon}
        label={cat.name}
        style={{ backgroundColor: cat.bgColor, borderRadius: 'var(--radius-sm)' }}
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
          {tx.merchant || cat.name}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
          {tx.note ? tx.note : showDate
            ? new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : timeAgo(new Date(tx.date))
          }
        </p>
      </div>

      {/* Amount — mint for income, magenta for expense */}
      <span
        className={`text-sm font-bold rupee-amount flex-shrink-0 ${
          tx.type === 'income' ? 'amount-income' : 'amount-expense'
        }`}
      >
        {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
      </span>
    </button>
  )
}
export default TransactionItem
