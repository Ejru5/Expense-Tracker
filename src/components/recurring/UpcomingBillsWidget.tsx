import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import { useRecurringBills } from '../../hooks/useRecurringBills'
import { formatINR, formatDate } from '../../lib/utils'

export function UpcomingBillsWidget() {
  const navigate = useNavigate()
  const { bills, loading } = useRecurringBills()

  // Filter bills due within next 7 days
  const today = new Date()
  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(today.getDate() + 7)

  const upcoming = bills.filter(b => {
    const due = new Date(b.nextDueDate)
    return due >= today && due <= sevenDaysLater
  }).slice(0, 3)

  if (loading || bills.length === 0) return null

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-coral" />
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Upcoming Bills</h4>
        </div>
        <button
          onClick={() => navigate('/recurring')}
          className="text-xs font-semibold text-coral-600 flex items-center gap-0.5 hover:underline"
          id="view-recurring-bills-btn"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2">No bills due in the next 7 days 🎉</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map(bill => (
            <div key={bill.id} className="flex justify-between items-center text-xs py-1">
              <span className="text-slate-600 dark:text-slate-300 font-medium">{bill.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Due {formatDate(bill.nextDueDate)}</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 rupee-amount">{formatINR(bill.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default UpcomingBillsWidget
