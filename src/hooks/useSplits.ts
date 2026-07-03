import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/useAppStore'
import type { Split } from '../types'

export function useSplits() {
  const { household } = useAppStore()
  const [splits, setSplits] = useState<Split[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!household) { setLoading(false); return }

    const q = query(
      collection(db, `households/${household.id}/splits`),
      orderBy('date', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      setSplits(snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          householdId: data.householdId,
          totalAmount: data.totalAmount,
          paidBy: data.paidBy,
          date: data.date?.toDate() ?? new Date(),
          note: data.note,
          transactionId: data.transactionId,
          participants: (data.participants ?? []).map((p: any) => ({
            ...p,
            settledAt: p.settledAt?.toDate(),
          })),
          createdAt: data.createdAt?.toDate() ?? new Date(),
        } as Split
      }))
      setLoading(false)
    })

    return unsub
  }, [household])

  async function addSplit(split: Omit<Split, 'id' | 'householdId' | 'createdAt'>) {
    if (!household) return
    await addDoc(collection(db, `households/${household.id}/splits`), {
      ...split,
      householdId: household.id,
      createdAt: serverTimestamp(),
    })
  }

  async function updateSplit(id: string, data: Partial<Split>) {
    if (!household) return
    await updateDoc(doc(db, `households/${household.id}/splits`, id), data)
  }

  async function deleteSplit(id: string) {
    if (!household) return
    await deleteDoc(doc(db, `households/${household.id}/splits`, id))
  }

  async function settleParticipant(splitId: string, participantName: string) {
    const split = splits.find(s => s.id === splitId)
    if (!split) return

    const updatedParticipants = split.participants.map(p => {
      if (p.name === participantName) {
        return { ...p, settled: true, settledAt: new Date() }
      }
      return p
    })

    await updateSplit(splitId, { participants: updatedParticipants })
  }

  // Helper selectors
  const unsettledTotal = splits.reduce((sum, split) => {
    const unsettledForSplit = split.participants
      .filter(p => !p.settled)
      .reduce((s, p) => s + p.amount, 0)
    return sum + unsettledForSplit
  }, 0)

  // Net balance owed to us per friend name
  const balancesByName: Record<string, number> = {}
  splits.forEach(split => {
    split.participants.forEach(p => {
      if (!p.settled) {
        balancesByName[p.name] = (balancesByName[p.name] ?? 0) + p.amount
      }
    })
  })

  return {
    splits,
    loading,
    addSplit,
    updateSplit,
    deleteSplit,
    settleParticipant,
    unsettledTotal,
    balancesByName,
  }
}
