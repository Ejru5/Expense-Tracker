import React from 'react'
import { Receipt } from 'lucide-react'
import { formatINR } from '../../lib/utils'

interface LineItem {
  name: string
  amount: number
}

interface ReceiptLineItemsCardProps {
  merchant: string
  lineItems: LineItem[]
  tax: number
  total: number
}

export function ReceiptLineItemsCard({ merchant, lineItems, tax, total }: ReceiptLineItemsCardProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Receipt size={16} className="text-emerald-500" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Receipt Breakdown</h4>
      </div>

      <div className="mb-3">
        <p className="text-xs text-slate-400">Merchant</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{merchant}</p>
      </div>

      <div className="space-y-2 divider border-slate-200 dark:border-slate-700 pt-3">
        {lineItems.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100 ml-4 flex-shrink-0">
              {formatINR(item.amount)}
            </span>
          </div>
        ))}

        {tax > 0 && (
          <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Tax</span>
            <span>{formatINR(tax)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Total</span>
          <span>{formatINR(total)}</span>
        </div>
      </div>
    </div>
  )
}
export default ReceiptLineItemsCard
