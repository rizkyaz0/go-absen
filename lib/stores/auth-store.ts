"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  position: string
  department: string
  hireDate: string
  status: "active" | "inactive" | "suspended"
  role: "admin" | "manager" | "employee"
  avatar?: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  permissions: string[]
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  setUser: (user: User | null) => void
  checkPermission: (permission: string) => boolean
}

export type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: [],
}

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock user data - replace with actual API call
          const mockUser: User = {
            id: "1",
            name: "John Doe",
            email,
            phone: "+1234567890",
            position: "Software Engineer",
            department: "Engineering",
            hireDate: "2023-01-15",
            status: "active",
            role: "employee",
            avatar: "/avatars/01.png",
            lastLogin: new Date().toISOString(),
            createdAt: "2023-01-15T00:00:00Z",
            updatedAt: new Date().toISOString(),
          }

          const permissions = getPermissionsForRole(mockUser.role)

          set((state) => {
            state.user = mockUser
            state.isAuthenticated = true
            state.permissions = permissions
            state.isLoading = false
            state.error = null
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : "Login failed"
            state.isLoading = false
          })
        }
      },

      logout: () => {
        set((state) => {
          state.user = null
          state.isAuthenticated = false
          state.permissions = []
          state.error = null
        })
      },

      register: async (userData) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const newUser: User = {
            ...userData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          set((state) => {
            state.user = newUser
            state.isAuthenticated = true
            state.permissions = getPermissionsForRole(newUser.role)
            state.isLoading = false
            state.error = null
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : "Registration failed"
            state.isLoading = false
          })
        }
      },

      updateProfile: async (userData) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))
          
          set((state) => {
            if (state.user) {
              state.user = {
                ...state.user,
                ...userData,
                updatedAt: new Date().toISOString(),
              }
            }
            state.isLoading = false
            state.error = null
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : "Profile update failed"
            state.isLoading = false
          })
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))
          
          set((state) => {
            state.isLoading = false
            state.error = null
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : "Password change failed"
            state.isLoading = false
          })
        }
      },

      refreshToken: async () => {
        set((state) => {
          state.isLoading = true
        })

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))
          
          set((state) => {
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : "Token refresh failed"
            state.isLoading = false
            state.isAuthenticated = false
            state.user = null
          })
        }
      },

      clearError: () => {
        set((state) => {
          state.error = null
        })
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading
        })
      },

      setUser: (user: User | null) => {
        set((state) => {
          state.user = user
          state.isAuthenticated = !!user
          state.permissions = user ? getPermissionsForRole(user.role) : []
        })
      },

      checkPermission: (permission: string) => {
        const { permissions } = get()
        return permissions.includes(permission)
      },
    })),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }
  )
)

// Helper function to get permissions based on role
function getPermissionsForRole(role: string): string[] {
  const basePermissions = ["read:profile", "update:profile"]
  
  switch (role) {
    case "admin":
      return [
        ...basePermissions,
        "read:users",
        "create:users",
        "update:users",
        "delete:users",
        "read:attendance",
        "create:attendance",
        "update:attendance",
        "delete:attendance",
        "read:reports",
        "create:reports",
        "read:settings",
        "update:settings",
      ]
    case "manager":
      return [
        ...basePermissions,
        "read:users",
        "read:attendance",
        "create:attendance",
        "update:attendance",
        "read:reports",
        "create:reports",
      ]
    case "employee":
      return [
        ...basePermissions,
        "read:attendance",
        "create:attendance",
        "update:attendance",
      ]
    default:
      return basePermissions
  }
}

// Selectors
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
}))

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  register: state.register,
  updateProfile: state.updateProfile,
  changePassword: state.changePassword,
  refreshToken: state.refreshToken,
  clearError: state.clearError,
  setLoading: state.setLoading,
  setUser: state.setUser,
}))

export const usePermissions = () => useAuthStore((state) => ({
  permissions: state.permissions,
  checkPermission: state.checkPermission,
}))