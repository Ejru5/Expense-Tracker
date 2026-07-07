import React, { useState } from 'react'
import { ChevronLeft, BarChart2, TrendingUp, DollarSign, Award, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useReports, type PeriodType } from '../hooks/useReports'
import { formatINR, budgetPercent } from '../lib/utils'
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

export function ReportsPage() {
  const navigate = useNavigate()
  const now = new Date()

  const [period, setPeriod] = useState<PeriodType>('month')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const {
    totalSpent, totalIncome, dailyAverage, biggestCategory,
    categoryBreakdown, spendingTrend, budgetVsActual
  } = useReports(period, year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (year === now.getFullYear() && month === now.getMonth()) return
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const totalSavingsFound = budgetVsActual
    .filter(item => item.over)
    .reduce((sum, item) => sum + item.diff, 0)

  const getFlatColor = (catId: string, defaultColor: string) => {
    const specColors: Record<string, string> = {
      'groceries': 'var(--nest-cat-groceries)',
      'subscriptions': 'var(--nest-cat-subs)',
      'dining': 'var(--nest-cat-dining)',
      'transport': 'var(--nest-cat-transport)',
      'shopping': 'var(--nest-cat-shopping)',
      'bills': 'var(--nest-cat-bills)',
    }
    const key = Object.keys(specColors).find(k => catId.toLowerCase().includes(k))
    return key ? specColors[key] : defaultColor
  }

  return (
    <div className="page-content px-4 lg:px-8 pt-4 animate-fade-in max-w-2xl lg:max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost !p-2 !rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold flex-1 text-nest-primary">Analytics</h1>
      </div>

      {/* Period Toggles */}
      <div className="flex p-1 mb-5 bg-nest-surface-muted rounded-xl border border-nest-border">
        {(['week', 'month', 'year'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="flex-1 py-2 text-xs font-semibold capitalize rounded-xl transition-all"
            style={
              period === p
                ? { background: 'var(--nest-surface)', color: 'var(--nest-text-primary)', boxShadow: 'var(--shadow-card)' }
                : { color: 'var(--nest-text-secondary)' }
            }
          >
            {p}
          </button>
        ))}
      </div>

      {/* Month picker */}
      {period === 'month' && (
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="btn-ghost !px-3 !py-1 text-xs">← Prev</button>
          <h2 className="font-bold text-sm text-nest-primary">
            {new Date(year, month).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={nextMonth}
            disabled={year === now.getFullYear() && month === now.getMonth()}
            className="btn-ghost !px-3 !py-1 text-xs disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}

      {/* Stat Tiles Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <StatTile
          icon={TrendingUp}
          iconColor="var(--expense)"
          label="Total Spent"
          value={formatINR(totalSpent)}
        />
        <StatTile
          icon={DollarSign}
          iconColor="var(--nest-cat-subs)"
          label="Daily Average"
          value={formatINR(dailyAverage)}
        />
        <StatTile
          icon={Award}
          iconColor="var(--nest-cat-dining)"
          label="Top Category"
          value={`${biggestCategory.icon} ${biggestCategory.name}`}
          subtext={`Spent ${formatINR(biggestCategory.amount)}`}
        />
        <StatTile
          icon={Target}
          iconColor="var(--income)"
          label="AI Savings Found"
          value={totalSavingsFound > 0 ? formatINR(totalSavingsFound) : '₹0'}
          subtext="Potential savings"
        />
      </div>

      {/* Charts */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6">

        {/* Spending Trend Line Chart */}
        <div className="card mb-6">
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-nest-secondary">Spending Trend</h3>
          <div className="h-56">
            {spendingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingTrend}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--nest-cat-groceries)" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="var(--nest-cat-groceries)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--nest-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: any) => [formatINR(Number(value)), 'Spent']}
                    contentStyle={{ background: 'var(--nest-surface)', borderRadius: '12px', border: '1px solid var(--nest-border)', color: 'var(--nest-text-primary)' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--nest-cat-groceries)" strokeWidth={2} fillOpacity={1} fill="url(#trendGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-xl bg-nest-surface-muted flex items-center justify-center mb-2 border border-nest-border border-dashed">
                  <BarChart2 size={18} className="text-nest-text-tertiary" />
                </div>
                <p className="text-xs font-bold text-nest-primary">No spending data</p>
                <p className="text-[10px] text-nest-secondary">Add transactions to see daily trends</p>
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown pie chart */}
        <div className="card mb-6">
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-nest-secondary">Category Breakdown</h3>
          <div className="h-56 flex justify-center">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown.map(c => ({ ...c, color: getFlatColor(c.name, c.color) }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getFlatColor(entry.name, entry.color)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-bold text-nest-primary">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 w-full">
                <div className="w-12 h-12 rounded-xl bg-nest-surface-muted flex items-center justify-center mb-2 border border-nest-border border-dashed">
                  <BarChart2 size={18} className="rotate-90 text-nest-text-tertiary" />
                </div>
                <p className="text-xs font-bold text-nest-primary">No categories logged</p>
                <p className="text-[10px] text-nest-secondary">Your category breakdown will appear here</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Budget vs Actual list */}
      {budgetVsActual.length > 0 && (
        <div className="card">
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4 text-nest-secondary">Budget vs Actual</h3>
          <div className="space-y-4">
            {budgetVsActual.map(item => {
              const dotColor = getFlatColor(item.id, item.bgColor)
              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold flex items-center gap-1.5 text-nest-primary">
                      <span 
                        className="w-6 h-6 rounded-full flex items-center justify-center border"
                        style={{ backgroundColor: `${dotColor}12`, borderColor: `${dotColor}25`, color: dotColor }}
                      >
                        {item.icon}
                      </span>
                      {item.name}
                    </span>
                    
                    <div className="text-right text-xs">
                      <span className="font-bold text-nest-primary rupee-amount">{formatINR(item.spent)}</span>
                      {item.budget > 0 && (
                        <span className="text-nest-secondary"> of <span className="rupee-amount">{formatINR(item.budget)}</span></span>
                      )}
                    </div>
                  </div>

                  {item.budget > 0 && (
                    <div>
                      <div className="w-full h-1.5 rounded-full bg-nest-surface-muted overflow-hidden border border-nest-border">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ 
                            width: `${Math.min(item.pct, 100)}%`,
                            backgroundColor: item.pct >= 100 ? 'var(--expense)' : item.pct >= 80 ? 'var(--warning)' : 'var(--income)'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] mt-0.5 font-bold">
                        <span className={item.pct >= 100 ? 'text-rose-500' : 'text-emerald-500'}>
                          {item.pct}% used
                        </span>
                        {item.over ? (
                          <span className="text-rose-500">Over by {formatINR(item.diff)}</span>
                        ) : (
                          <span className="text-nest-secondary">{formatINR(item.diff)} remaining</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function StatTile({
  icon: Icon,
  iconColor,
  label,
  value,
  subtext,
}: {
  icon: React.ElementType
  iconColor: string
  label: string
  value: string
  subtext?: string
}) {
  return (
    <div className="card !p-4 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-nest-secondary">{label}</span>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}12`, color: iconColor }}
        >
          <Icon size={16} />
        </div>
      </div>
      <div>
        <p className="text-lg font-bold truncate rupee-amount text-nest-primary">{value}</p>
        {subtext && <p className="text-[10px] mt-0.5 truncate text-nest-secondary">{subtext}</p>}
      </div>
    </div>
  )
}
export default ReportsPage
