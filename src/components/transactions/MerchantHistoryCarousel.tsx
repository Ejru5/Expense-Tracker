import React from 'react'
import { useTransactions } from '../../hooks/useTransactions'
import { formatINR, formatDate } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import { Sparkles, HelpCircle } from 'lucide-react'

interface MerchantHistoryCarouselProps {
  merchant: string
  currentTransactionId: string
}

export function MerchantHistoryCarousel({ merchant, currentTransactionId }: MerchantHistoryCarouselProps) {
  const { transactions } = useTransactions()
  const { categories } = useAppStore()

  // Filter other transactions with the same merchant
  const history = transactions
    .filter(t => 
      t.merchant && 
      t.merchant.toLowerCase() === merchant.toLowerCase() && 
      t.id !== currentTransactionId
    )
    .slice(0, 5) // max 5 history items

  if (history.length === 0) return null

  return (
    <div className="card">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
        <Sparkles size={12} className="text-violet-500" /> Similar Transactions
      </h4>
      
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x">
        {history.map(tx => {
          const cat = categories.find(c => c.id === tx.categoryId)
          return (
            <div
              key={tx.id}
              className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800
                         rounded-xl p-3 flex-shrink-0 snap-start w-36 select-none"
            >
              <div className="flex justify-between items-start gap-1 mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 rupee-amount">
                  {formatINR(tx.amount)}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {cat?.icon}
                </span>
              </div>
              <p className="text-[9px] text-slate-400">{formatDate(tx.date)}</p>
              {tx.note && <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 truncate">"{tx.note}"</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default MerchantHistoryCarousel
