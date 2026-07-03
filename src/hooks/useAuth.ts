import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { useAppStore } from '../store/useAppStore'

export function useAuth() {
  const { user, setUser } = useAppStore()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return unsub
  }, [setUser])

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)

  const register = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    return cred
  }

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider)

  const logout = () => signOut(auth)

  return { user, login, register, loginWithGoogle, logout }
}
