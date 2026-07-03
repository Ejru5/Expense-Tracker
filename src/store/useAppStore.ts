import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from 'firebase/auth'
import type { Household, Category } from '../types'
import { DEFAULT_CATEGORIES } from '../types'

interface AppState {
  // Auth
  user: User | null
  setUser: (user: User | null) => void

  // Household
  household: Household | null
  setHousehold: (h: Household | null) => void

  // Categories (merged: defaults + custom from Firestore)
  categories: Category[]
  setCategories: (cats: Category[]) => void

  // Theme
  darkMode: boolean
  toggleDarkMode: () => void

  // Active filters
  filterMemberId: string | null   // uid or null for all
  filterCardId: string | null
  setFilterMember: (uid: string | null) => void
  setFilterCard: (cardId: string | null) => void

  // UI state
  addSheetOpen: boolean
  setAddSheetOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      household: null,
      setHousehold: (household) => set({ household }),

      categories: DEFAULT_CATEGORIES,
      setCategories: (categories) => set({ categories }),

      darkMode: false,
      toggleDarkMode: () =>
        set((s) => {
          const next = !s.darkMode
          document.documentElement.classList.toggle('dark', next)
          return { darkMode: next }
        }),

      filterMemberId: null,
      filterCardId: null,
      setFilterMember: (uid) => set({ filterMemberId: uid }),
      setFilterCard: (cardId) => set({ filterCardId: cardId }),

      addSheetOpen: false,
      setAddSheetOpen: (open) => set({ addSheetOpen: open }),
    }),
    {
      name: 'expense-tracker-store',
      // Only persist theme preference and filters — auth/household comes from Firebase
      partialize: (s) => ({ darkMode: s.darkMode }),
    }
  )
)
