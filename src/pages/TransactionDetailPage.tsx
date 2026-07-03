import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Trash2, Receipt, CreditCard } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useCards } from '../hooks/useCards'
import { useAppStore } from '../store/useAppStore'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui'
import { formatINR, formatDate } from '../lib/utils'
import { MerchantHistoryCarousel } from '../components/transactions/MerchantHistoryCarousel'

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { transactions, deleteTransaction } = useTransactions()
  const { cards } = useCards()
  const { categories, household } = useAppStore()

  const tx = transactions.find(t => t.id === id)

  if (!tx) {
    return (
      <div className="page-content px-4 lg:px-8 pt-6 max-w-lg lg:max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="btn-ghost !pl-0 mb-4"><ChevronLeft size={20} /> Back</button>
        <p className="text-slate-400 text-center py-12">Transaction not found.</p>
      </div>
    )
  }

  const cat  = categories.find(c => c.id === tx.categoryId) ?? categories[categories.length - 1]
  const card = cards.find(c => c.id === tx.cardId)
  const memberName = household?.memberNames?.[tx.paidBy] ?? 'Unknown'

  async function handleDelete() {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(tx!.id)
    navigate(-1)
  }

  return (
    <div className="page-content px-4 lg:px-8 pt-4 animate-fade-in max-w-lg lg:max-w-3xl mx-auto space-y-4">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost !pl-0 mb-1 flex items-center">
        <ChevronLeft size={20} /> Back
      </button>

      {/* Amount Hero */}
      <div className="text-center mb-2 animate-scale-in">
        <Chip
          icon={cat.icon}
          label={cat.name}
          style={{ backgroundColor: cat.bgColor, width: 64, height: 64, borderRadius: 20, fontSize: 28, margin: '0 auto 12px' }}
        />
        <p className={`text-4xl font-extrabold rupee-amount ${tx.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
          {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
        </p>
        <p className="text-sm mt-1" style={{ color: '#a86157' }}>{cat.name}</p>
      </div>

      {/* Details card */}
      <div className="card !p-0 divide-y divide-slate-50 dark:divide-slate-800">
        <Row label="Merchant" value={tx.merchant || '—'} />
        <Row label="Date" value={formatDate(new Date(tx.date))} />
        <Row label="Paid by" value={memberName} />
        {card && <Row label="Card" icon={<CreditCard size={14} className="text-slate-400" />} value={`${card.label}${card.last4 ? ' ···' + card.last4 : ''}`} />}
        {tx.note && <Row label="Note" value={tx.note} />}
        <Row label="Source" value={tx.source === 'manual' ? 'Manual entry' : tx.source === 'ai-text' ? 'AI (text)' : 'AI (receipt scan)'} />
      </div>

      {/* Merchant Similar Transactions History */}
      {tx.merchant && (
        <MerchantHistoryCarousel merchant={tx.merchant} currentTransactionId={tx.id} />
      )}


      {/* Receipt line items */}
      {tx.receiptLineItems && tx.receiptLineItems.length > 0 && (
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Receipt size={16} className="text-emerald-500" />
            <h2 className="font-semibold text-slate-800 text-sm">AI Receipt Scan</h2>
          </div>
          <div className="space-y-2">
            {tx.receiptLineItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-semibold text-slate-800 ml-4 flex-shrink-0">{formatINR(item.amount)}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-sm">
              <span>Total</span>
              <span>{formatINR(tx.amount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Receipt image */}
      {tx.receiptImageUrl && (
        <div className="card mb-4 !p-3">
          <p className="text-xs text-slate-400 mb-2 font-medium">Receipt Photo</p>
          <img src={tx.receiptImageUrl} alt="Receipt" className="rounded-xl w-full object-cover max-h-64" />
        </div>
      )}

      {/* Delete */}
      <Button variant="danger" fullWidth leftIcon={<Trash2 size={16} />} onClick={handleDelete}>
        Delete Transaction
      </Button>
    </div>
  )
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm font-medium" style={{ color: '#a86157' }}>{label}</span>
      <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#360802' }}>
        {icon}{value}
      </span>
    </div>
  )
}
