import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '../types/auth'

type AuthState = {
  accessToken: string | null
  user: User | null
  setAuth: (accessToken: string, user: User) => void
  clearAuth: () => void
  isAuthenticated: boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) =>
        set({ accessToken, user, isAuthenticated: true }),
      clearAuth: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),
      isAuthenticated: false,
      hasAnyRole: (roles) => {
        const currentRole = get().user?.role
        if (!currentRole) {
          return false
        }
        return roles.includes(currentRole)
      },
    }),
    {
      name: 'pm-auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

