import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '../types'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (user: AuthUser) => void
  updateAccessToken: (access: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      updateAccessToken: (access) =>
        set((state) =>
          state.user ? { user: { ...state.user, access } } : {}
        ),

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'attentra-auth',
    }
  )
)
