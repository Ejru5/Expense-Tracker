import React, { useEffect, useState } from 'react'
import { Sparkles, Loader2, AlertTriangle, Lightbulb, ArrowRight, Ban, Wallet, Sparkle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getSpendingInsight } from '../../lib/mistral'
import { useBudgets } from '../../hooks/useBudgets'
import { useAppStore } from '../../store/useAppStore'
import { useTransactions } from '../../hooks/useTransactions'
import { formatINR } from '../../lib/utils'

export function AISpendingInsight() {
  const navigate = useNavigate()
  const { categories } = useAppStore()
  const { budget, totalSpent, spentByCategory, loading: budgetLoading } = useBudgets()
  const { transactions, loading: txLoading } = useTransactions()
  const [insight, setInsight] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)

  const apiKey = localStorage.getItem('mistral_api_key') || import.meta.env.VITE_MISTRAL_API_KEY
  const useFunctions = import.meta.env.VITE_USE_FUNCTIONS === 'true'
  const isAIConfigured = !!apiKey || useFunctions

  useEffect(() => {
    if (budgetLoading || !budget || !isAIConfigured) return

    const summary = {
      totalBudget: budget.totalBudget,
      totalSpent: totalSpent,
      categoryBudgets: categories
        .filter(c => (budget.categoryBudgets?.[c.id] ?? 0) > 0)
        .map(c => ({
          name: c.name,
          budget: budget.categoryBudgets[c.id],
          spent: spentByCategory[c.id] ?? 0,
        }))
    }

    const cacheKey = `spending-insight-${budget.id}-${totalSpent}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      setInsight(cached)
      return
    }

    async function fetchInsight() {
      setFetching(true)
      try {
        const text = await getSpendingInsight(summary)
        setInsight(text)
        sessionStorage.setItem(cacheKey, text)
      } catch (err) {
        console.error('Failed to get spending insight:', err)
      } finally {
        setFetching(false)
      }
    }

    fetchInsight()
  }, [budget, totalSpent, spentByCategory, categories, budgetLoading, isAIConfigured])

  if (budgetLoading || txLoading) return null

  const suggestions: {
    title: string
    desc: string
    badgeText: string
    bgColor: string
    textColor: string
    badgeBg?: string
    badgeColor?: string
    icon: React.ElementType
  }[] = []

  const overspentCats = categories
    .map(c => ({ name: c.name, spent: spentByCategory[c.id] ?? 0, budget: budget?.categoryBudgets?.[c.id] ?? 0 }))
    .filter(c => c.budget > 0 && c.spent > c.budget)

  if (overspentCats.length > 0) {
    suggestions.push({
      title: 'Adjust Budget',
      desc: `You are over dining/shopping budgets. Limit extra dining.`,
      badgeText: 'OVER BUDGET',
      bgColor: 'rgba(242, 166, 90, 0.12)',
      textColor: 'var(--nest-cat-dining)',
      badgeBg: 'rgba(242, 166, 90, 0.15)',
      badgeColor: '#7A3F05',
      icon: AlertTriangle
    })
  }

  if (budget && budget.totalBudget > 0) {
    const remaining = budget.totalBudget - totalSpent
    if (remaining > 2000) {
      suggestions.push({
        title: 'Save Surplus',
        desc: `Move ₹2,000 to your active Savings Goal.`,
        badgeText: 'SAVE GOAL',
        bgColor: 'rgba(139, 197, 63, 0.12)',
        textColor: 'var(--nest-cat-groceries)',
        badgeBg: 'var(--nest-accent-lime)',
        badgeColor: 'var(--nest-accent-lime-text)',
        icon: Wallet
      })
    }
  }

  const subscriptions = transactions.filter(t => t.categoryId.toLowerCase().includes('sub') || t.categoryId.toLowerCase().includes('bill'))
  if (subscriptions.length > 3) {
    suggestions.push({
      title: 'Cancel Subscription',
      desc: `Save ₹399/mo by cancelling unused co-subscriptions.`,
      badgeText: 'CANCEL SUB',
      bgColor: 'rgba(242, 135, 154, 0.12)',
      textColor: 'var(--nest-cat-shopping)',
      badgeBg: 'rgba(242, 135, 154, 0.15)',
      badgeColor: '#8B2040',
      icon: Ban
    })
  }

  if (suggestions.length === 0) {
    suggestions.push({
      title: 'Co-spend Clean',
      desc: 'All budgets are within limits. Great job tracking!',
      badgeText: 'HEALTHY',
      bgColor: 'rgba(139, 197, 63, 0.12)',
      textColor: 'var(--nest-cat-groceries)',
      badgeBg: 'var(--nest-accent-lime)',
      badgeColor: 'var(--nest-accent-lime-text)',
      icon: Sparkle
    })
  }

  return (
    <div className="space-y-3.5">
      <h3 className="section-title pl-0.5">Suggested Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 gap-4">
          {suggestions.slice(0, 2).map((s, idx) => (
            <div key={idx} className="suggestion-card flex items-center gap-4 text-left">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: s.bgColor, color: s.textColor }}
              >
                <s.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-nest-primary truncate">{s.title}</h4>
                  <span 
                    className="nest-pill text-[9px] px-2 py-0.5 font-bold leading-none"
                    style={s.badgeBg ? { backgroundColor: s.badgeBg, color: s.badgeColor } : undefined}
                  >
                    {s.badgeText}
                  </span>
                </div>
                <p className="text-xs text-nest-secondary leading-normal">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card !p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-nest-accent-lime/10 filter blur-xl pointer-events-none" />
          
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-nest-surface-muted border border-nest-border flex items-center justify-center flex-shrink-0 text-nest-primary shadow-sm">
              {fetching ? (
                <Loader2 size={18} className="animate-spin text-nest-primary" />
              ) : (
                <Sparkles size={18} className="text-nest-cat-groceries" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-nest-secondary mb-1">
                AI Budget Assistant
              </h4>
              <p className="text-xs leading-relaxed font-semibold text-nest-primary">
                {fetching ? 'AI is analyzing co-spending patterns...' : (insight || 'Log more transactions to get co-budgeting nudges.')}
              </p>
            </div>
          </div>

          {!isAIConfigured && (
            <button
              onClick={() => navigate('/profile')}
              className="text-[10px] font-bold text-nest-cat-groceries hover:opacity-80 flex items-center gap-1 mt-4 min-h-[36px] transition-colors"
            >
              Configure AI Key <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AISpendingInsight
