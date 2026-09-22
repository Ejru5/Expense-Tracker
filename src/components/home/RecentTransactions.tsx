import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Plus, Camera, Sparkles, Upload, FileText, Check, Pencil } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Skeleton } from '../ui'
import { Modal } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { formatINR, timeAgo } from '../../lib/utils'

interface RecentTransactionsProps {
  transactions: any[]
  loading: boolean
}

type DesktopFilter = 'week' | 'month' | 'all'

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now  = new Date()
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const d         = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (d.getTime() === today.getTime())     return 'Today'
  if (d.getTime() === yesterday.getTime()) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export function RecentTransactions({ transactions, loading }: RecentTransactionsProps) {
  const navigate = useNavigate()
  const { categories, setAddSheetOpen, user } = useAppStore()
  const [showImportModal, setShowImportModal] = useState(false)
  const [importing, setImporting]             = useState(false)
  const [importSuccess, setImportSuccess]     = useState(false)
  const [desktopFilter, setDesktopFilter]     = useState<DesktopFilter>('month')

  const handleImportCSV = (e: React.FormEvent) => {
    e.preventDefault()
    setImporting(true)
    setTimeout(() => {
      setImporting(false)
      setImportSuccess(true)
      setTimeout(() => {
        setImportSuccess(false)
        setShowImportModal(false)
      }, 1500)
    }, 2000)
  }

  const getFlatColor = (catId: string, defaultColor: string) => {
    const specColors: Record<string, string> = {
      'groceries':     'var(--nest-cat-groceries)',
      'subscriptions': 'var(--nest-cat-subs)',
      'dining':        'var(--nest-cat-dining)',
      'transport':     'var(--nest-cat-transport)',
      'shopping':      'var(--nest-cat-shopping)',
      'bills':         'var(--nest-cat-bills)',
    }
    const key = Object.keys(specColors).find(k => catId.toLowerCase().includes(k))
    return key ? specColors[key] : defaultColor
  }

  // ── Mobile: first 5 of what's passed in ─────────────────────────
  const mobileTxs = transactions.slice(0, 5)

  // ── Desktop: filter by selected period ──────────────────────────
  const desktopTxs = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)

    let filtered = transactions
    if (desktopFilter === 'week') {
      filtered = transactions.filter(t => new Date(t.date) >= weekAgo)
    } else if (desktopFilter === 'month') {
      filtered = transactions.filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    }
    return filtered.slice(0, 15)
  }, [transactions, desktopFilter])

  const filterTabs: { key: DesktopFilter; label: string }[] = [
    { key: 'week',  label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all',   label: 'All' },
  ]

  // ── Shared row renderer ──────────────────────────────────────────
  const renderRow = (tx: any, isDesktop = false) => {
    const cat           = categories.find(c => c.id === tx.categoryId) ?? categories[categories.length - 1]
    const isCurrentUser = tx.paidBy === user?.uid
    const payerInitial  = isCurrentUser ? user?.displayName?.[0] || 'D' : 'P'
    const dotColor      = getFlatColor(cat.id, cat.color)

    return (
      <div
        key={tx.id}
        className="group flex items-center gap-3 w-full text-left py-3.5 px-3 rounded-xl transition-all duration-150 border border-transparent hover:bg-nest-surface-muted/50 cursor-pointer"
        onClick={() => navigate(`/transactions/${tx.id}`)}
        id={`tx-${tx.id}`}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {tx.merchant ? (
            <div
              className="w-9 h-9 rounded-full border flex items-center justify-center font-extrabold text-sm capitalize"
              style={{ backgroundColor: `${dotColor}12`, borderColor: `${dotColor}25`, color: dotColor }}
            >
              {tx.merchant[0]}
            </div>
          ) : (
            <div
              className="w-9 h-9 rounded-full border flex items-center justify-center text-base"
              style={{ backgroundColor: `${dotColor}12`, borderColor: `${dotColor}25` }}
            >
              {cat.icon}
            </div>
          )}
          {tx.merchant && (
            <span
              className="absolute -bottom-1 -right-1 text-[8px] border rounded-full w-4.5 h-4.5 flex items-center justify-center bg-nest-surface"
              style={{ borderColor: 'var(--nest-border)' }}
            >
              {cat.icon}
            </span>
          )}
          <span
            className="absolute -top-1 -left-1 text-[8px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center bg-nest-surface border"
            style={{ borderColor: 'var(--nest-border)', color: 'var(--nest-text-secondary)' }}
          >
            {payerInitial}
          </span>
        </div>

        {/* Name + category */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-nest-primary truncate">{tx.merchant || cat.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-nest-secondary font-semibold">
            <span>{cat.name}</span>
            {/* Mobile only: time ago */}
            {!isDesktop && <><span>•</span><span>{timeAgo(new Date(tx.date))}</span></>}
          </div>
        </div>

        {/* Desktop-only: date column */}
        {isDesktop && (
          <span className="hidden lg:block text-[11px] font-semibold text-nest-tertiary flex-shrink-0 w-20 text-right">
            {formatShortDate(tx.date)}
          </span>
        )}

        {/* Amount */}
        <span className={`text-xs font-bold rupee-amount flex-shrink-0 ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
          {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
        </span>

        {/* Desktop-only: hover edit affordance */}
        {isDesktop && (
          <button
            onClick={e => { e.stopPropagation(); navigate(`/transactions/${tx.id}`) }}
            className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-opacity duration-150 items-center justify-center w-7 h-7 rounded-lg bg-nest-surface-muted text-nest-tertiary hover:text-nest-primary flex-shrink-0"
            aria-label="Edit transaction"
          >
            <Pencil size={12} strokeWidth={2} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3.5">

      {/* ── Mobile header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 lg:hidden">
        <h3 className="section-title pl-0.5">Recent Transactions</h3>
        {transactions.length > 0 && (
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-bold text-nest-cat-groceries hover:opacity-85 flex items-center gap-0.5 transition-colors min-h-[36px]"
            id="see-all-transactions-btn"
          >
            See All <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* ── Desktop header with filter tabs ───────────────────────── */}
      <div className="hidden lg:flex items-center justify-between px-1">
        <h3 className="section-title pl-0.5">Recent Transactions</h3>
        <div className="flex items-center gap-1.5">
          {/* Filter tabs */}
          <div className="flex items-center gap-0.5 bg-nest-surface-muted rounded-xl p-0.5 border border-nest-border">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setDesktopFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 ${
                  desktopFilter === tab.key
                    ? 'bg-nest-surface text-nest-primary shadow-sm'
                    : 'text-nest-secondary hover:text-nest-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* See All link */}
          {transactions.length > 0 && (
            <button
              onClick={() => navigate('/transactions')}
              className="text-[11px] font-bold text-nest-cat-groceries hover:opacity-85 flex items-center gap-0.5 transition-colors ml-2 min-h-[36px]"
            >
              See All <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile list ───────────────────────────────────────────── */}
      <div className="lg:hidden card !p-2 divide-y divide-nest-border">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))
        ) : mobileTxs.length === 0 ? (
          <EmptyState setAddSheetOpen={setAddSheetOpen} navigate={navigate} onImport={() => setShowImportModal(true)} />
        ) : (
          mobileTxs.map(tx => renderRow(tx, false))
        )}
      </div>

      {/* ── Desktop table ─────────────────────────────────────────── */}
      <div className="hidden lg:block card !p-2 divide-y divide-nest-border">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))
        ) : desktopTxs.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-nest-secondary">No transactions in this period.</p>
          </div>
        ) : (
          desktopTxs.map(tx => renderRow(tx, true))
        )}
      </div>

      {/* CSV Import Modal */}
      <Modal open={showImportModal} onClose={() => setShowImportModal(false)} title="Import CSV Statement">
        {importSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Check size={24} />
            </div>
            <h4 className="font-bold text-nest-primary">Import Complete!</h4>
            <p className="text-xs text-nest-secondary mt-1">Your transaction history has been successfully synchronized.</p>
          </div>
        ) : (
          <form onSubmit={handleImportCSV} className="space-y-4">
            <p className="text-xs text-nest-secondary leading-relaxed">
              Upload bank statements in standard CSV formatting. We will parse and merge transactions into your household ledger.
            </p>
            <div className="border-2 border-dashed border-nest-border hover:border-nest-cat-groceries transition-colors rounded-xl p-6 text-center cursor-pointer">
              <FileText size={32} className="mx-auto text-nest-tertiary mb-2" />
              <p className="text-xs font-bold text-nest-primary">Click to browse or drag & drop CSV file</p>
              <p className="text-[10px] text-nest-secondary mt-0.5">Maximum file size: 5MB</p>
            </div>
            <Button type="submit" loading={importing} fullWidth>
              {importing ? 'Processing File...' : 'Upload & Parse Statement'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  )
}

function EmptyState({ setAddSheetOpen, navigate, onImport }: {
  setAddSheetOpen: (v: boolean) => void
  navigate: (path: string) => void
  onImport: () => void
}) {
  return (
    <div className="py-10 px-4 flex flex-col items-center text-center space-y-6">
      <div className="space-y-1.5">
        <div className="w-12 h-12 rounded-full bg-nest-surface-muted border border-dashed border-nest-border flex items-center justify-center mx-auto text-xl">💸</div>
        <h4 className="font-bold text-nest-primary text-sm">No transactions logged</h4>
        <p className="text-xs text-nest-secondary max-w-[240px] mx-auto leading-relaxed">
          Start tracking manual entries, scan receipts, or use AI.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-md pt-2">
        <button
          onClick={() => setAddSheetOpen(true)}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-nest-border hover:bg-nest-surface-muted active:scale-95 transition-all text-nest-primary min-h-[80px]"
        >
          <Plus size={18} className="text-nest-cat-groceries mb-2" />
          <span className="text-[10px] font-bold">Add Manual</span>
        </button>
        <button
          onClick={() => navigate('/add/ai-receipt')}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-nest-border hover:bg-nest-surface-muted active:scale-95 transition-all text-nest-primary min-h-[80px]"
        >
          <Camera size={18} className="text-nest-cat-subs mb-2" />
          <span className="text-[10px] font-bold">Scan Receipt</span>
        </button>
        <button
          onClick={() => navigate('/add/ai-text')}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-nest-border hover:bg-nest-surface-muted active:scale-95 transition-all text-nest-primary min-h-[80px]"
        >
          <Sparkles size={18} className="text-nest-cat-groceries mb-2" />
          <span className="text-[10px] font-bold">Quick Expense</span>
        </button>
        <button
          onClick={onImport}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-nest-border hover:bg-nest-surface-muted active:scale-95 transition-all text-nest-primary min-h-[80px]"
        >
          <Upload size={18} className="text-nest-cat-dining mb-2" />
          <span className="text-[10px] font-bold">Import CSV</span>
        </button>
      </div>
    </div>
  )
}

export default RecentTransactions
