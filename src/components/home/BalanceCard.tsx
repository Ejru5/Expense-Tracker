import React from 'react'
import { Users } from 'lucide-react'
import { useSplits } from '../../hooks/useSplits'
import { formatINR } from '../../lib/utils'

export function BalanceCard() {
  const { splits, unsettledTotal } = useSplits()
  
  const pendingCount = splits.filter(s => s.participants.some(p => !p.settled)).length

  return (
    <div className="hero-card hero-card-neutral flex flex-col justify-between min-h-[220px]">
      <div>
        <div className="flex items-center justify-between opacity-80 text-indigo-950">
          <p className="text-[11px] font-bold uppercase tracking-wider">Pending Sync</p>
          <Users size={16} />
        </div>
        <p className="text-[32px] font-light leading-none mt-5 tracking-tight font-mono text-indigo-950">
          {formatINR(unsettledTotal)}
        </p>
      </div>

      <div className="mt-4">
        <span className="text-[10px] font-bold tracking-widest text-indigo-950 uppercase">
          {pendingCount > 0 ? `${pendingCount} SPLITS PENDING` : 'ALL CLEAR & SYNCED'}
        </span>
        <p className="text-[10px] text-indigo-950/70 mt-1">
          {pendingCount > 0 
            ? "Awaiting other partner's confirmation"
            : 'Co-spending is fully up to date'}
        </p>
      </div>
    </div>
  )
}

export default BalanceCard
