import { useEffect, useState } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/useAppStore'
import type { Card } from '../types'

const CARD_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#0ea5e9', '#64748b',
]

export function useCards() {
  const { household } = useAppStore()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!household) { setLoading(false); return }

    const q = query(
      collection(db, `households/${household.id}/cards`),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
      setCards(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      } as Card)))
      setLoading(false)
    })

    return unsub
  }, [household])

  async function addCard(card: Omit<Card, 'id' | 'householdId' | 'createdAt'>) {
    if (!household) return
    // If this is the first card, make it default
    const isDefault = cards.length === 0 ? true : card.isDefault
    await addDoc(collection(db, `households/${household.id}/cards`), {
      ...card,
      isDefault,
      householdId: household.id,
      createdAt: serverTimestamp(),
    })
  }

  async function updateCard(id: string, data: Partial<Card>) {
    if (!household) return
    await updateDoc(doc(db, `households/${household.id}/cards`, id), data)
  }

  async function deleteCard(id: string) {
    if (!household) return
    await deleteDoc(doc(db, `households/${household.id}/cards`, id))
  }

  async function setDefaultCard(id: string) {
    if (!household) return
    // Unset all, then set new default
    await Promise.all(cards.map(c =>
      updateDoc(doc(db, `households/${household.id}/cards`, c.id), { isDefault: c.id === id })
    ))
  }

  const defaultCard = cards.find(c => c.isDefault) ?? cards[0]

  return { cards, loading, addCard, updateCard, deleteCard, setDefaultCard, defaultCard, CARD_COLORS }
}
