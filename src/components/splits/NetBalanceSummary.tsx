import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import { useSplits } from '../../hooks/useSplits'
import { formatINR } from '../../lib/utils'

export function NetBalanceSummary() {
  const navigate = useNavigate()
  const { unsettledTotal, balancesByName, loading } = useSplits()

  if (loading || unsettledTotal === 0) return null

  // Get names of up to 3 people owing
  const owingPeople = Object.keys(balancesByName).slice(0, 3).join(', ')
  const extraCount = Object.keys(balancesByName).length - 3

  return (
    <div
      onClick={() => navigate('/splits')}
      className="card flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all border-emerald-100 dark:border-emerald-950/20"
      id="splits-home-widget"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
          <Users size={18} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Owed by Friends</h4>
          <p className="text-xs text-slate-400">
            {owingPeople} {extraCount > 0 ? `& ${extraCount} more` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 rupee-amount">
          {formatINR(unsettledTotal)}
        </span>
        <ArrowRight size={14} className="text-slate-400" />
      </div>
    </div>
  )
}
export default NetBalanceSummary
