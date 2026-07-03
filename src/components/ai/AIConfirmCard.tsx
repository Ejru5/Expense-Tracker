import React from 'react'
import { ManualEntryForm } from '../transactions/ManualEntryForm'
import { Sparkles } from 'lucide-react'
import type { TransactionType } from '../../types'

interface AIConfirmCardProps {
  prefill: {
    amount?: number
    categoryId?: string
    merchant?: string
    note?: string
    source?: 'manual' | 'ai-text' | 'ai-receipt'
    receiptImageUrl?: string
    receiptLineItems?: { name: string; amount: number }[]
    type?: TransactionType
    date?: string
  }
  onSuccess: () => void
  onCancel: () => void
}

export function AIConfirmCard({ prefill, onSuccess, onCancel }: AIConfirmCardProps) {
  return (
    <div className="space-y-4">
      <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-violet-600 dark:text-violet-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-violet-800 dark:text-violet-300">Parsed Successfully</h3>
          <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
            AI extracted the details below. Review and adjust if needed before saving.
          </p>
        </div>
      </div>

      <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900">
        <ManualEntryForm prefill={prefill} onSuccess={onSuccess} onCancel={onCancel} />
      </div>
    </div>
  )
}
