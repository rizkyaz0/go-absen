/**
 * useApi Hook
 * 
 * Provides data fetching utilities with caching and error handling
 * TODO: implement backend integration
 */

import { useState, useEffect, useCallback } from "react"

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface ApiOptions {
  immediate?: boolean
  cache?: boolean
  cacheTime?: number
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()

export function useApi<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: ApiOptions = {}
) {
  const { immediate = true, cache: useCache = true, cacheTime = 5 * 60 * 1000 } = options

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const fetchData = useCallback(async () => {
    // Check cache first
    if (useCache && cache.has(key)) {
      const cached = cache.get(key)!
      if (Date.now() - cached.timestamp < cacheTime) {
        setState(prev => ({ ...prev, data: cached.data, loading: false }))
        return cached.data
      }
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const data = await fetcher()
      
      // Cache the result
      if (useCache) {
        cache.set(key, { data, timestamp: Date.now() })
      }

      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setState({ data: null, loading: false, error: errorMessage })
      throw error
    }
  }, [key, fetcher, useCache, cacheTime])

  const refetch = useCallback(() => {
    // Clear cache if refetching
    if (useCache) {
      cache.delete(key)
    }
    return fetchData()
  }, [fetchData, key, useCache])

  const clearCache = useCallback(() => {
    cache.delete(key)
  }, [key])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [immediate, fetchData])

  return {
    ...state,
    refetch,
    clearCache,
  }
}

// Mock data generators for development
export const mockData = {
  // Dashboard stats
  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    return {
      totalEmployees: 156,
      presentToday: 142,
      absentToday: 14,
      lateToday: 8,
      onTimePercentage: 89.7,
      averageCheckIn: "08:15",
      averageCheckOut: "17:30",
    }
  },

  // Employee data
  getEmployees: async (page = 1, limit = 10) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const employees = Array.from({ length: limit }, (_, i) => ({
      id: `emp-${page}-${i + 1}`,
      name: `Employee ${(page - 1) * limit + i + 1}`,
      email: `employee${(page - 1) * limit + i + 1}@company.com`,
      department: ["Engineering", "Marketing", "Sales", "HR"][i % 4],
      position: ["Developer", "Manager", "Analyst", "Coordinator"][i % 4],
      status: ["active", "inactive"][i % 2],
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }))
    return {
      data: employees,
      total: 156,
      page,
      limit,
      totalPages: Math.ceil(156 / limit),
    }
  },

  // Attendance data
  getAttendance: async (date: string) => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return {
      date,
      totalEmployees: 156,
      present: 142,
      absent: 14,
      late: 8,
      records: Array.from({ length: 20 }, (_, i) => ({
        id: `att-${i + 1}`,
        employeeId: `emp-${i + 1}`,
        employeeName: `Employee ${i + 1}`,
        checkIn: "08:15",
        checkOut: "17:30",
        status: ["present", "late", "absent"][i % 3],
        hours: 8.25,
      })),
    }
  },

  // Chart data
  getChartData: async (type: "attendance" | "department" | "overtime") => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    switch (type) {
      case "attendance":
        return {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Present",
              data: [95, 92, 88, 94, 96, 45, 30],
              color: "hsl(var(--chart-1))",
            },
            {
              label: "Absent",
              data: [5, 8, 12, 6, 4, 55, 70],
              color: "hsl(var(--chart-2))",
            },
          ],
        }
      
      case "department":
        return {
          labels: ["Engineering", "Marketing", "Sales", "HR", "Finance"],
          datasets: [
            {
              label: "Employees",
              data: [45, 25, 30, 15, 20],
              color: "hsl(var(--chart-3))",
            },
          ],
        }
      
      case "overtime":
        return {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Overtime Hours",
              data: [120, 95, 140, 110, 160, 135],
              color: "hsl(var(--chart-4))",
            },
          ],
        }
      
      default:
        return { labels: [], datasets: [] }
    }
  },

  // Notifications
  getNotifications: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [
      {
        id: "notif-1",
        title: "New Employee Added",
        message: "John Doe has been added to the Engineering department",
        type: "info",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: "notif-2",
        title: "Attendance Alert",
        message: "5 employees are late today",
        type: "warning",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: "notif-3",
        title: "System Update",
        message: "The system will be updated tonight at 11 PM",
        type: "info",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
    ]
  },
}

// Utility functions
export const apiUtils = {
  // Clear all cache
  clearAllCache: () => {
    cache.clear()
  },

  // Get cache size
  getCacheSize: () => {
    return cache.size
  },

  // Preload data
  preload: async (key: string, fetcher: () => Promise<any>) => {
    if (!cache.has(key)) {
      try {
        const data = await fetcher()
        cache.set(key, { data, timestamp: Date.now() })
        return data
      } catch (error) {
        console.warn(`Failed to preload data for key: ${key}`, error)
        return null
      }
    }
    return cache.get(key)?.data
  },
}