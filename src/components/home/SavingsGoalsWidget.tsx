import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, ArrowRight } from 'lucide-react'
import { useSavingsGoals } from '../../hooks/useSavingsGoals'
import { formatINR } from '../../lib/utils'

export function SavingsGoalsWidget() {
  const navigate = useNavigate()
  const { goals, loading } = useSavingsGoals()

  if (loading || goals.length === 0) return null

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-coral" />
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Savings Goals</h4>
        </div>
        <button
          onClick={() => navigate('/savings')}
          className="text-xs font-bold text-coral hover:opacity-85 flex items-center gap-0.5 transition-colors min-h-[36px]"
          id="view-savings-goals-btn"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>

      <div className="space-y-3">
        {goals.slice(0, 2).map(goal => {
          const pct = Math.min(100, Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100))
          return (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-350 font-medium flex items-center gap-1.5">
                  <span>{goal.icon}</span>
                  <span className="truncate max-w-[120px]">{goal.name}</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100 rupee-amount">
                  {formatINR(goal.currentAmount)} / {formatINR(goal.targetAmount)}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-50 dark:bg-slate-800/40 overflow-hidden border border-border-subtle">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-coral transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              
              <div className="flex justify-between text-[9px] font-bold text-slate-400">
                <span>{pct}% completed</span>
                <span>{formatINR(goal.targetAmount - goal.currentAmount)} remaining</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default SavingsGoalsWidget
