import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/useAppStore'
import type { SavingsGoal } from '../types'

export function useSavingsGoals() {
  const { household } = useAppStore()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!household) { setLoading(false); return }

    const q = query(
      collection(db, `households/${household.id}/savingsGoals`),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
      setGoals(snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          householdId: data.householdId,
          name: data.name,
          icon: data.icon ?? '🎯',
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount ?? 0,
          targetDate: data.targetDate?.toDate(),
          createdAt: data.createdAt?.toDate() ?? new Date(),
        } as SavingsGoal
      }))
      setLoading(false)
    })

    return unsub
  }, [household])

  async function addGoal(goal: Omit<SavingsGoal, 'id' | 'householdId' | 'createdAt'>) {
    if (!household) return
    addDoc(collection(db, `households/${household.id}/savingsGoals`), {
      ...goal,
      householdId: household.id,
      createdAt: serverTimestamp(),
    })
  }

  async function updateGoal(id: string, data: Partial<SavingsGoal>) {
    if (!household) return
    updateDoc(doc(db, `households/${household.id}/savingsGoals`, id), data)
  }

  async function deleteGoal(id: string) {
    if (!household) return
    deleteDoc(doc(db, `households/${household.id}/savingsGoals`, id))
  }

  async function addContribution(id: string, amount: number) {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    updateGoal(id, {
      currentAmount: (goal.currentAmount || 0) + amount,
    })
  }

  return { goals, loading, addGoal, updateGoal, deleteGoal, addContribution }
}
