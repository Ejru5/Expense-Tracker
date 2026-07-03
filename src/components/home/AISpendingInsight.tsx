import React, { useEffect, useState } from 'react'
import { Sparkles, Loader2, Key, AlertTriangle, Lightbulb, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
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

  // 1. Check if AI is configured
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

  // 2. Compute programmatic insights
  const computedInsights: { type: 'warning' | 'info' | 'success' | 'trend'; text: string; icon: React.ElementType }[] = []

  // Insight A: Overspending on categories
  const overspentCats = categories
    .map(c => ({ name: c.name, spent: spentByCategory[c.id] ?? 0, budget: budget?.categoryBudgets?.[c.id] ?? 0 }))
    .filter(c => c.budget > 0 && c.spent > c.budget)

  if (overspentCats.length > 0) {
    computedInsights.push({
      type: 'warning',
      text: `You're overspending on ${overspentCats.map(c => c.name).join(', ')}.`,
      icon: AlertTriangle
    })
  }

  // Insight B: Potential savings
  if (budget && budget.totalBudget > 0) {
    const remaining = budget.totalBudget - totalSpent
    if (remaining > 0) {
      computedInsights.push({
        type: 'success',
        text: `You can save ${formatINR(remaining)} this month by staying within budget.`,
        icon: Lightbulb
      })
    }
  }

  // Insight C: Largest expense this week
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentExpenses = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= sevenDaysAgo)
  
  if (recentExpenses.length > 0) {
    const largestTx = recentExpenses.reduce((max, tx) => tx.amount > max.amount ? tx : max, recentExpenses[0])
    const cat = categories.find(c => c.id === largestTx.categoryId)
    computedInsights.push({
      type: 'info',
      text: `Largest expense this week: ${formatINR(largestTx.amount)} for ${largestTx.merchant || cat?.name || 'purchases'}.`,
      icon: TrendingUp
    })
  }

  // Insight D: Spending trend compared to last month
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const thisMonthExpensesSum = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
    .reduce((s, t) => s + t.amount, 0)

  const lastMonthExpensesSum = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === lastMonth && new Date(t.date).getFullYear() === lastMonthYear)
    .reduce((s, t) => s + t.amount, 0)

  if (lastMonthExpensesSum > 0) {
    const pct = ((thisMonthExpensesSum - lastMonthExpensesSum) / lastMonthExpensesSum) * 100
    const isHigher = pct > 0
    computedInsights.push({
      type: 'trend',
      text: `Spending trend: You've spent ${Math.abs(pct).toFixed(0)}% ${isHigher ? 'more' : 'less'} than last month at this point.`,
      icon: isHigher ? TrendingUp : TrendingDown
    })
  }

  const hasInsights = computedInsights.length > 0 || !!insight || fetching

  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
        AI Insights & Nudges
      </h3>

      {/* Grid: AI Nudge & Programmatic list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: AI Assistant Nudge */}
        {isAIConfigured ? (
          <div className="card !p-5 relative overflow-hidden flex gap-4 items-start bg-surface-warm/50 border border-border-subtle">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-coral-50/20 filter blur-xl pointer-events-none" />
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
              style={{
                background: 'var(--gradient-coral-flame)',
              }}
            >
              {fetching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-coral mb-1 flex items-center gap-1.5">
                AI Budget Assistant
              </h4>
              <p className="text-xs leading-relaxed font-semibold text-slate-800 dark:text-slate-200">
                {fetching ? 'AI is analyzing your spending patterns...' : (insight || 'Keep logging transactions to feed the AI models with budget insights.')}
              </p>
            </div>
          </div>
        ) : (
          /* Setup instructions if AI is NOT configured */
          <div className="card !p-5 flex gap-4 items-start border border-border-subtle hover:border-border transition-all">
            <div className="w-10 h-10 rounded-xl bg-surface-warm text-slate-500 border border-border-subtle flex items-center justify-center flex-shrink-0">
              <Key size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Smart Recommendations
              </h4>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed mb-3">
                Unlock smart AI spending insights. Link a Mistral AI API key in settings.
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="text-[10px] font-bold text-coral hover:opacity-85 flex items-center gap-1 min-h-[36px] transition-colors"
              >
                Configure API Key <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Card 2: Automatic Actionable Insights */}
        <div className="card !p-5 space-y-3.5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Actionable Insights
          </h4>
          
          {!hasInsights ? (
            <div className="py-4 text-center text-xs text-slate-400">
              No insights compiled yet. Log transactions to verify trends.
            </div>
          ) : (
            <div className="space-y-3">
              {computedInsights.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs font-medium">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    item.type === 'warning' 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                      : item.type === 'success'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-slate-50 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
                  }`}>
                    <item.icon size={14} />
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
export default AISpendingInsight
