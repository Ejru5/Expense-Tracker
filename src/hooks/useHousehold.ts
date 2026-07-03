import { useEffect, useState } from 'react'
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, query, where, getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/useAppStore'
import type { Household } from '../types'

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function useHousehold() {
  const { user, household, setHousehold } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    // Find the household this user belongs to
    const q = query(
      collection(db, 'households'),
      where('members', 'array-contains', user.uid)
    )

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0]
        const data = d.data()
        setHousehold({
          id: d.id,
          name: data.name,
          currency: data.currency ?? 'INR',
          members: data.members,
          memberNames: data.memberNames ?? {},
          inviteCode: data.inviteCode,
          createdAt: data.createdAt?.toDate() ?? new Date(),
        })
      } else {
        setHousehold(null)
      }
      setLoading(false)
    }, (err) => {
      console.error(err)
      setError(err.message)
      setLoading(false)
    })

    return unsub
  }, [user, setHousehold])

  /** Create a new household and set the current user as first member */
  async function createHousehold(name: string) {
    if (!user) throw new Error('Not authenticated')
    const inviteCode = generateInviteCode()
    const ref = doc(collection(db, 'households'))
    await setDoc(ref, {
      name,
      currency: 'INR',
      members: [user.uid],
      memberNames: { [user.uid]: user.displayName ?? user.email ?? 'User 1' },
      inviteCode,
      createdAt: serverTimestamp(),
    })
    return ref.id
  }

  /** Join an existing household via invite code */
  async function joinHousehold(inviteCode: string) {
    if (!user) throw new Error('Not authenticated')
    const q = query(collection(db, 'households'), where('inviteCode', '==', inviteCode.toUpperCase()))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('Invalid invite code')
    const hDoc = snap.docs[0]
    const data = hDoc.data()
    if (data.members.length >= 2) throw new Error('Household is already full (max 2 members)')
    await updateDoc(hDoc.ref, {
      members: [...data.members, user.uid],
      [`memberNames.${user.uid}`]: user.displayName ?? user.email ?? 'User 2',
    })
  }

  return { household, loading, error, createHousehold, joinHousehold }
}
