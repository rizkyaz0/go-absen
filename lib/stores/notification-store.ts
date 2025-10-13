"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
  expiresAt?: string
  action?: {
    label: string
    onClick: () => void
  }
  category?: "attendance" | "leave" | "system" | "reminder" | "alert"
  priority: "low" | "medium" | "high" | "urgent"
  userId?: string
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  filters: {
    type?: Notification["type"]
    category?: Notification["category"]
    priority?: Notification["priority"]
    read?: boolean
  }
  sortBy: "createdAt" | "priority" | "type"
  sortOrder: "asc" | "desc"
}

export interface NotificationActions {
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => string
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  markAsUnread: (id: string) => void
  clearAll: () => void
  clearExpired: () => void
  setFilters: (filters: Partial<NotificationState["filters"]>) => void
  setSortBy: (sortBy: NotificationState["sortBy"]) => void
  setSortOrder: (sortOrder: NotificationState["sortOrder"]) => void
  fetchNotifications: () => Promise<void>
  refreshNotifications: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export type NotificationStore = NotificationState & NotificationActions

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  filters: {},
  sortBy: "createdAt",
  sortOrder: "desc",
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: new Date().toISOString(),
          read: false,
        }

        set((state) => {
          state.notifications.unshift(newNotification)
          state.unreadCount += 1
        })

        // Auto-expire notification if expiresAt is set
        if (newNotification.expiresAt) {
          const expiresAt = new Date(newNotification.expiresAt)
          const now = new Date()
          const timeUntilExpiry = expiresAt.getTime() - now.getTime()
          
          if (timeUntilExpiry > 0) {
            setTimeout(() => {
              get().removeNotification(id)
            }, timeUntilExpiry)
          }
        }

        return id
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (notification && !notification.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
          state.notifications = state.notifications.filter(n => n.id !== id)
        })
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (notification && !notification.read) {
            notification.read = true
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        })
      },

      markAllAsRead: () => {
        set((state) => {
          state.notifications.forEach(notification => {
            if (!notification.read) {
              notification.read = true
            }
          })
          state.unreadCount = 0
        })
      },

      markAsUnread: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (notification && notification.read) {
            notification.read = false
            state.unreadCount += 1
          }
        })
      },

      clearAll: () => {
        set((state) => {
          state.notifications = []
          state.unreadCount = 0
        })
      },

      clearExpired: () => {
        const now = new Date()
        set((state) => {
          const beforeCount = state.notifications.length
          state.notifications = state.notifications.filter(notification => {
            if (!notification.expiresAt) return true
            return new Date(notification.expiresAt) > now
          })
          
          // Update unread count
          const unreadCount = state.notifications.filter(n => !n.read).length
          state.unreadCount = unreadCount
        })
      },

      setFilters: (filters) => {
        set((state) => {
          state.filters = { ...state.filters, ...filters }
        })
      },

      setSortBy: (sortBy) => {
        set((state) => {
          state.sortBy = sortBy
        })
      },

      setSortOrder: (sortOrder) => {
        set((state) => {
          state.sortOrder = sortOrder
        })
      },

      fetchNotifications: async () => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock notifications - replace with actual API call
          const mockNotifications: Notification[] = [
            {
              id: "1",
              title: "Attendance Reminder",
              message: "Don't forget to check in for today's work",
              type: "info",
              read: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
              category: "attendance",
              priority: "medium",
            },
            {
              id: "2",
              title: "Leave Request Approved",
              message: "Your vacation request for next week has been approved",
              type: "success",
              read: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
              category: "leave",
              priority: "high",
            },
            {
              id: "3",
              title: "System Maintenance",
              message: "Scheduled maintenance will occur tonight from 11 PM to 1 AM",
              type: "warning",
              read: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
              category: "system",
              priority: "medium",
            },
          ]

          set((state) => {
            state.notifications = mockNotifications
            state.unreadCount = mockNotifications.filter(n => !n.read).length
            state.isLoading = false
            state.error = null
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : "Failed to fetch notifications"
            state.isLoading = false
          })
        }
      },

      refreshNotifications: async () => {
        await get().fetchNotifications()
      },

      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading
        })
      },

      setError: (error) => {
        set((state) => {
          state.error = error
        })
      },

      clearError: () => {
        set((state) => {
          state.error = null
        })
      },
    })),
    {
      name: "notification-store",
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        filters: state.filters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
)

// Selectors
export const useNotifications = () => useNotificationStore((state) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
  isLoading: state.isLoading,
  error: state.error,
}))

export const useNotificationActions = () => useNotificationStore((state) => ({
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  markAsRead: state.markAsRead,
  markAllAsRead: state.markAllAsRead,
  markAsUnread: state.markAsUnread,
  clearAll: state.clearAll,
  clearExpired: state.clearExpired,
  fetchNotifications: state.fetchNotifications,
  refreshNotifications: state.refreshNotifications,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
}))

export const useNotificationFilters = () => useNotificationStore((state) => ({
  filters: state.filters,
  sortBy: state.sortBy,
  sortOrder: state.sortOrder,
  setFilters: state.setFilters,
  setSortBy: state.setSortBy,
  setSortOrder: state.setSortOrder,
}))

// Computed selectors
export const useFilteredNotifications = () => {
  return useNotificationStore((state) => {
    let filtered = [...state.notifications]

    // Apply filters
    if (state.filters.type) {
      filtered = filtered.filter(n => n.type === state.filters.type)
    }
    if (state.filters.category) {
      filtered = filtered.filter(n => n.category === state.filters.category)
    }
    if (state.filters.priority) {
      filtered = filtered.filter(n => n.priority === state.filters.priority)
    }
    if (state.filters.read !== undefined) {
      filtered = filtered.filter(n => n.read === state.filters.read)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (state.sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case "type":
          aValue = a.type
          bValue = b.type
          break
        default:
          return 0
      }

      if (state.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  })
}

// Notification helpers
export const useNotificationHelpers = () => {
  const { addNotification } = useNotificationActions()

  return {
    notify: (notification: Omit<Notification, "id" | "createdAt" | "read">) => 
      addNotification(notification),
    notifySuccess: (title: string, message: string) => 
      addNotification({ title, message, type: "success", priority: "medium" }),
    notifyError: (title: string, message: string) => 
      addNotification({ title, message, type: "error", priority: "high" }),
    notifyWarning: (title: string, message: string) => 
      addNotification({ title, message, type: "warning", priority: "medium" }),
    notifyInfo: (title: string, message: string) => 
      addNotification({ title, message, type: "info", priority: "low" }),
  }
}