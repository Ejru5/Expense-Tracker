import React, { useState } from 'react'
import { ChevronLeft, BarChart2, TrendingUp, DollarSign, Award, Target, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useReports, type PeriodType } from '../hooks/useReports'
import { formatINR, budgetPercent } from '../lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
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

  // AI Savings estimate based on budget leaks
  const totalSavingsFound = budgetVsActual
    .filter(item => item.over)
    .reduce((sum, item) => sum + item.diff, 0)

  return (
    <div className="page-content px-4 lg:px-8 pt-4 animate-fade-in max-w-2xl lg:max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost !p-2 !rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold flex-1" style={{ color: '#360802' }}>Analytics</h1>
      </div>

      {/* Period Toggles */}
      <div className="flex p-1 mb-5" style={{ background: '#fef5f3', borderRadius: '16px', border: '1.5px solid #f3c5bb' }}>
        {(['week', 'month', 'year'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="flex-1 py-2 text-xs font-semibold capitalize rounded-xl transition-all"
            style={
              period === p
                ? { background: '#ffffff', color: '#f73b20', boxShadow: 'rgba(247,59,32,0.1) 0 4px 12px' }
                : { color: '#a86157' }
            }
          >
            {p}
          </button>
        ))}
      </div>

      {/* Month picker (only show if period is month) */}
      {period === 'month' && (
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="btn-ghost !px-3 !py-1 text-xs">← Prev</button>
          <h2 className="font-bold text-sm" style={{ color: '#6b3229' }}>
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
          iconColor="text-[#fb2d54] rgba(251,45,84,0.1)"
          label="Total Spent"
          value={formatINR(totalSpent)}
        />
        <StatTile
          icon={DollarSign}
          iconColor="text-[#477ee9] rgba(71,126,233,0.1)"
          label="Daily Average"
          value={formatINR(dailyAverage)}
        />
        <StatTile
          icon={Award}
          iconColor="text-[#f73b20] rgba(247,59,32,0.1)"
          label="Top Category"
          value={`${biggestCategory.icon} ${biggestCategory.name}`}
          subtext={`Spent ${formatINR(biggestCategory.amount)}`}
        />
        <StatTile
          icon={Target}
          iconColor="text-[#34c771] rgba(52,199,113,0.1)"
          label="AI Savings Found"
          value={totalSavingsFound > 0 ? formatINR(totalSavingsFound) : '₹0'}
          subtext="Potential monthly savings"
        />
      </div>

      {/* Charts - Two column on desktop */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6">

        {/* Spending Trend Line Chart */}
        <div className="card mb-6">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Spending Trend</h3>
          <div className="h-56">
            {spendingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingTrend}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f73b20" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#f73b20" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: any) => [formatINR(Number(value)), 'Spent']}
                    contentStyle={{ background: 'var(--surface-subtle)', borderRadius: '16px', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#f73b20" strokeWidth={2} fillOpacity={1} fill="url(#trendGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-xl bg-[#fef5f3] dark:bg-[#250d09] flex items-center justify-center mb-2 border border-[#fae0da] dark:border-[#3d1a14] border-dashed">
                  <BarChart2 size={18} style={{ color: 'var(--color-coral-flame)' }} />
                </div>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>No spending data</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Add transactions to see daily trends</p>
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown pie chart */}
        <div className="card mb-6">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Category Breakdown</h3>
          <div className="h-56 flex justify-center">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 w-full">
                <div className="w-12 h-12 rounded-xl bg-[#fef5f3] dark:bg-[#250d09] flex items-center justify-center mb-2 border border-[#fae0da] dark:border-[#3d1a14] border-dashed">
                  <BarChart2 size={18} className="rotate-90" style={{ color: 'var(--color-coral-flame)' }} />
                </div>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>No categories logged</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Your category breakdown will appear here</p>
              </div>
            )}
          </div>
        </div>

      </div>{/* end charts 2-col grid */}

      {/* Budget vs Actual list */}
      {budgetVsActual.length > 0 && (
        <div className="card">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: '#a86157' }}>Budget vs Actual</h3>
          <div className="space-y-4">
            {budgetVsActual.map(item => (
              <div key={item.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold flex items-center gap-1.5" style={{ color: '#360802' }}>
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-100" style={{ backgroundColor: item.bgColor }}>
                      {item.icon}
                    </span>
                    {item.name}
                  </span>
                  
                  <div className="text-right">
                    <span className="font-bold" style={{ color: '#360802' }}>{formatINR(item.spent)}</span>
                    {item.budget > 0 && (
                      <span style={{ color: '#a86157' }}> of {formatINR(item.budget)}</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {item.budget > 0 && (
                  <div>
                    <div className="w-full h-1.5 rounded-full bg-[#fef5f3] dark:bg-[#3d1a14] overflow-hidden border border-[#fae0da] dark:border-[#3d1a14]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${Math.min(item.pct, 100)}%`,
                          backgroundColor: item.pct >= 100 ? 'var(--color-magenta-spark)' : item.pct >= 80 ? 'var(--warning)' : 'var(--color-mint-action)'
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] mt-0.5 font-semibold">
                      <span style={{ color: item.pct >= 100 ? 'var(--color-magenta-spark)' : item.pct >= 80 ? 'var(--warning)' : 'var(--color-mint-action)' }}>
                        {item.pct}% used
                      </span>
                      {item.over ? (
                        <span style={{ color: 'var(--color-magenta-spark)' }}>Over by {formatINR(item.diff)}</span>
                      ) : (
                        <span style={{ color: 'var(--color-mint-action)' }}>{formatINR(item.diff)} remaining</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#a86157' }}>{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ background: iconColor.split(' ')[1] || 'transparent' }}>
          <Icon size={16} className={iconColor.split(' ')[0]} />
        </div>
      </div>
      <div>
        <p className="text-lg font-extrabold truncate rupee-amount" style={{ color: '#360802' }}>{value}</p>
        {subtext && <p className="text-[10px] mt-0.5 truncate" style={{ color: '#a86157' }}>{subtext}</p>}
      </div>
    </div>
  )
}
export default ReportsPage
