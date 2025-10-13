/**
 * UI Store - Zustand store for UI state management
 * 
 * Manages theme, sidebar, modals, and other UI-related state
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
  // Theme
  theme: "light" | "dark" | "system"
  
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Mobile
  mobileMenuOpen: boolean
  
  // Loading states
  loading: boolean
  
  // Modals
  modals: Record<string, boolean>
  
  // Toasts (managed by sonner, but we track count)
  toastCount: number
  
  // Breadcrumbs
  breadcrumbs: Array<{
    label: string
    href?: string
  }>
  
  // Page info
  pageTitle: string
  pageDescription?: string
}

interface UIActions {
  // Theme actions
  setTheme: (theme: "light" | "dark" | "system") => void
  toggleTheme: () => void
  
  // Sidebar actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // Mobile actions
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  
  // Loading actions
  setLoading: (loading: boolean) => void
  
  // Modal actions
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  toggleModal: (modalId: string) => void
  isModalOpen: (modalId: string) => boolean
  
  // Toast actions
  incrementToastCount: () => void
  decrementToastCount: () => void
  resetToastCount: () => void
  
  // Breadcrumb actions
  setBreadcrumbs: (breadcrumbs: UIState["breadcrumbs"]) => void
  addBreadcrumb: (breadcrumb: UIState["breadcrumbs"][0]) => void
  clearBreadcrumbs: () => void
  
  // Page info actions
  setPageTitle: (title: string) => void
  setPageDescription: (description: string) => void
  clearPageInfo: () => void
  
  // Reset all
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
  toastCount: 0,
  breadcrumbs: [],
  pageTitle: "",
  pageDescription: undefined,
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Theme actions
      setTheme: (theme) => {
        set({ theme })
        // Update document class for theme
        if (typeof window !== "undefined") {
          const root = window.document.documentElement
          root.classList.remove("light", "dark")
          if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
            root.classList.add(systemTheme)
          } else {
            root.classList.add(theme)
          }
        }
      },

      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === "light" ? "dark" : "light"
        get().setTheme(newTheme)
      },

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
      },

      // Mobile actions
      toggleMobileMenu: () => {
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }))
      },

      setMobileMenuOpen: (open) => {
        set({ mobileMenuOpen: open })
      },

      // Loading actions
      setLoading: (loading) => {
        set({ loading })
      },

      // Modal actions
      openModal: (modalId) => {
        set((state) => ({
          modals: { ...state.modals, [modalId]: true }
        }))
      },

      closeModal: (modalId) => {
        set((state) => ({
          modals: { ...state.modals, [modalId]: false }
        }))
      },

      toggleModal: (modalId) => {
        set((state) => ({
          modals: { 
            ...state.modals, 
            [modalId]: !state.modals[modalId] 
          }
        }))
      },

      isModalOpen: (modalId) => {
        return get().modals[modalId] || false
      },

      // Toast actions
      incrementToastCount: () => {
        set((state) => ({ toastCount: state.toastCount + 1 }))
      },

      decrementToastCount: () => {
        set((state) => ({ 
          toastCount: Math.max(0, state.toastCount - 1) 
        }))
      },

      resetToastCount: () => {
        set({ toastCount: 0 })
      },

      // Breadcrumb actions
      setBreadcrumbs: (breadcrumbs) => {
        set({ breadcrumbs })
      },

      addBreadcrumb: (breadcrumb) => {
        set((state) => ({
          breadcrumbs: [...state.breadcrumbs, breadcrumb]
        }))
      },

      clearBreadcrumbs: () => {
        set({ breadcrumbs: [] })
      },

      // Page info actions
      setPageTitle: (title) => {
        set({ pageTitle: title })
        // Update document title
        if (typeof window !== "undefined") {
          document.title = title ? `${title} - Go Absen` : "Go Absen"
        }
      },

      setPageDescription: (description) => {
        set({ pageDescription: description })
      },

      clearPageInfo: () => {
        set({ pageTitle: "", pageDescription: undefined })
        if (typeof window !== "undefined") {
          document.title = "Go Absen"
        }
      },

      // Reset all
      reset: () => {
        set({
          ...initialState,
          // Keep theme preference
          theme: get().theme,
        })
      },
    }),
    {
      name: "go-absen-ui-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

// Selectors for better performance
export const useTheme = () => useUIStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
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

export const useBreadcrumbs = () => useUIStore((state) => ({
  breadcrumbs: state.breadcrumbs,
  setBreadcrumbs: state.setBreadcrumbs,
  addBreadcrumb: state.addBreadcrumb,
  clearBreadcrumbs: state.clearBreadcrumbs,
}))

export const usePageInfo = () => useUIStore((state) => ({
  pageTitle: state.pageTitle,
  pageDescription: state.pageDescription,
  setPageTitle: state.setPageTitle,
  setPageDescription: state.setPageDescription,
  clearPageInfo: state.clearPageInfo,
}))