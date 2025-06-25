import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, RegisterData } from '../types'
import { apiService } from '../services/api'

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  clearError: () => void
  checkAuth: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiService.login(credentials)
          if (response.success && response.data) {
            const { user, token } = response.data
            localStorage.setItem('token', token)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error(response.message || 'Login failed')
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Login failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiService.register(userData)
          if (response.success && response.data) {
            const { user, token } = response.data
            localStorage.setItem('token', token)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error(response.message || 'Registration failed')
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Registration failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ isAuthenticated: false })
          return
        }

        set({ isLoading: true })
        try {
          const response = await apiService.getProfile()
          if (response.success && response.data) {
            set({
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            throw new Error('Failed to get profile')
          }
        } catch {
          localStorage.removeItem('token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiService.updateProfile(userData)
          if (response.success && response.data) {
            set({
              user: response.data,
              isLoading: false,
            })
          } else {
            throw new Error(response.message || 'Update failed')
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Update failed'
          set({
            error: errorMessage,
            isLoading: false,
          })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
