"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

export interface UIState {
  theme: "light" | "dark" | "system"
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  loading: boolean
  modals: Record<string, boolean>
  toasts: Array<{
    id: string
    title?: string
    description?: string
    type?: "default" | "success" | "error" | "warning" | "info"
    duration?: number
    action?: {
      label: string
      onClick: () => void
    }
  }>
  breadcrumbs: Array<{
    label: string
    href?: string
  }>
  pageTitle: string
  pageDescription?: string
}

export interface UIActions {
  setTheme: (theme: "light" | "dark" | "system") => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  toggleModal: (modalId: string) => void
  isModalOpen: (modalId: string) => boolean
  addToast: (toast: Omit<UIState["toasts"][0], "id">) => string
  removeToast: (toastId: string) => void
  clearToasts: () => void
  setBreadcrumbs: (breadcrumbs: UIState["breadcrumbs"]) => void
  addBreadcrumb: (breadcrumb: UIState["breadcrumbs"][0]) => void
  setPageTitle: (title: string) => void
  setPageDescription: (description: string) => void
  reset: () => void
}

export type UIStore = UIState & UIActions

const initialState: UIState = {
  theme: "system",
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  loading: false,
  modals: {},
  toasts: [],
  breadcrumbs: [],
  pageTitle: "",
  pageDescription: undefined,
}

export const useUIStore = create<UIStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      setTheme: (theme) => {
        set((state) => {
          state.theme = theme
        })
      },

      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen
        })
      },

      setSidebarOpen: (open) => {
        set((state) => {
          state.sidebarOpen = open
        })
      },

      setSidebarCollapsed: (collapsed) => {
        set((state) => {
          state.sidebarCollapsed = collapsed
        })
      },

      toggleMobileMenu: () => {
        set((state) => {
          state.mobileMenuOpen = !state.mobileMenuOpen
        })
      },

      setMobileMenuOpen: (open) => {
        set((state) => {
          state.mobileMenuOpen = open
        })
      },

      setLoading: (loading) => {
        set((state) => {
          state.loading = loading
        })
      },

      openModal: (modalId) => {
        set((state) => {
          state.modals[modalId] = true
        })
      },

      closeModal: (modalId) => {
        set((state) => {
          state.modals[modalId] = false
        })
      },

      toggleModal: (modalId) => {
        set((state) => {
          state.modals[modalId] = !state.modals[modalId]
        })
      },

      isModalOpen: (modalId) => {
        return get().modals[modalId] || false
      },

      addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newToast = { ...toast, id }
        
        set((state) => {
          state.toasts.push(newToast)
        })

        // Auto remove toast after duration
        if (toast.duration !== 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, toast.duration || 5000)
        }

        return id
      },

      removeToast: (toastId) => {
        set((state) => {
          state.toasts = state.toasts.filter(toast => toast.id !== toastId)
        })
      },

      clearToasts: () => {
        set((state) => {
          state.toasts = []
        })
      },

      setBreadcrumbs: (breadcrumbs) => {
        set((state) => {
          state.breadcrumbs = breadcrumbs
        })
      },

      addBreadcrumb: (breadcrumb) => {
        set((state) => {
          state.breadcrumbs.push(breadcrumb)
        })
      },

      setPageTitle: (title) => {
        set((state) => {
          state.pageTitle = title
        })
      },

      setPageDescription: (description) => {
        set((state) => {
          state.pageDescription = description
        })
      },

      reset: () => {
        set((state) => {
          Object.assign(state, {
            ...initialState,
            theme: state.theme, // Keep theme preference
            sidebarOpen: state.sidebarOpen, // Keep sidebar state
            sidebarCollapsed: state.sidebarCollapsed, // Keep sidebar collapsed state
          })
        })
      },
    })),
    {
      name: "ui-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

// Selectors
export const useTheme = () => useUIStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme,
}))

export const useSidebar = () => useUIStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  sidebarCollapsed: state.sidebarCollapsed,
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  setSidebarCollapsed: state.setSidebarCollapsed,
}))

export const useMobileMenu = () => useUIStore((state) => ({
  mobileMenuOpen: state.mobileMenuOpen,
  toggleMobileMenu: state.toggleMobileMenu,
  setMobileMenuOpen: state.setMobileMenuOpen,
}))

export const useModals = () => useUIStore((state) => ({
  modals: state.modals,
  openModal: state.openModal,
  closeModal: state.closeModal,
  toggleModal: state.toggleModal,
  isModalOpen: state.isModalOpen,
}))

export const useToasts = () => useUIStore((state) => ({
  toasts: state.toasts,
  addToast: state.addToast,
  removeToast: state.removeToast,
  clearToasts: state.clearToasts,
}))

export const useBreadcrumbs = () => useUIStore((state) => ({
  breadcrumbs: state.breadcrumbs,
  setBreadcrumbs: state.setBreadcrumbs,
  addBreadcrumb: state.addBreadcrumb,
}))

export const usePageInfo = () => useUIStore((state) => ({
  pageTitle: state.pageTitle,
  pageDescription: state.pageDescription,
  setPageTitle: state.setPageTitle,
  setPageDescription: state.setPageDescription,
}))

// Toast helpers
export const useToast = () => {
  const { addToast, removeToast } = useToasts()

  return {
    toast: (toast: Omit<UIState["toasts"][0], "id">) => addToast(toast),
    success: (title: string, description?: string) => 
      addToast({ title, description, type: "success" }),
    error: (title: string, description?: string) => 
      addToast({ title, description, type: "error" }),
    warning: (title: string, description?: string) => 
      addToast({ title, description, type: "warning" }),
    info: (title: string, description?: string) => 
      addToast({ title, description, type: "info" }),
    dismiss: removeToast,
  }
}