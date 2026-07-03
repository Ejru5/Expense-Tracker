import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/useAppStore'
import type { TransactionTemplate } from '../types'

export function useTemplates() {
  const { household } = useAppStore()
  const [templates, setTemplates] = useState<TransactionTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!household) { setLoading(false); return }

    const q = query(
      collection(db, `households/${household.id}/templates`),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      setTemplates(snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          householdId: data.householdId,
          label: data.label,
          amount: data.amount,
          categoryId: data.categoryId,
          merchant: data.merchant,
          cardId: data.cardId,
          createdAt: data.createdAt?.toDate() ?? new Date(),
        } as TransactionTemplate
      }))
      setLoading(false)
    })

    return unsub
  }, [household])

  async function addTemplate(template: Omit<TransactionTemplate, 'id' | 'householdId' | 'createdAt'>) {
    if (!household) return
    await addDoc(collection(db, `households/${household.id}/templates`), {
      ...template,
      householdId: household.id,
      createdAt: serverTimestamp(),
    })
  }

  async function deleteTemplate(id: string) {
    if (!household) return
    await deleteDoc(doc(db, `households/${household.id}/templates`, id))
  }

  return { templates, loading, addTemplate, deleteTemplate }
}
export default useTemplates
