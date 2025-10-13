"use client"

import * as React from "react"

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items
  storage?: "memory" | "localStorage" | "sessionStorage"
}

class CacheManager<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private maxSize: number
  private defaultTTL: number
  private storage: "memory" | "localStorage" | "sessionStorage"

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100
    this.defaultTTL = options.ttl || 5 * 60 * 1000 // 5 minutes
    this.storage = options.storage || "memory"
    
    if (this.storage !== "memory") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const storage = this.storage === "localStorage" ? localStorage : sessionStorage
      const data = storage.getItem("cache")
      if (data) {
        const parsed = JSON.parse(data)
        this.cache = new Map(parsed)
      }
    } catch (error) {
      console.warn("Failed to load cache from storage:", error)
    }
  }

  private saveToStorage() {
    if (this.storage === "memory") return

    try {
      const storage = this.storage === "localStorage" ? localStorage : sessionStorage
      const data = Array.from(this.cache.entries())
      storage.setItem("cache", JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to save cache to storage:", error)
    }
  }

  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  private evictOldest() {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }

  set(key: string, data: T, ttl?: number): void {
    this.evictOldest()
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })

    this.saveToStorage()
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.saveToStorage()
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    return item ? !this.isExpired(item) : false
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    this.saveToStorage()
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.saveToStorage()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
    this.saveToStorage()
  }

  // Get or set pattern
  async getOrSet<K>(
    key: string,
    fetcher: () => Promise<K>,
    ttl?: number
  ): Promise<K> {
    const cached = this.get(key)
    if (cached !== null) {
      return cached as K
    }

    const data = await fetcher()
    this.set(key, data, ttl)
    return data
  }

  // Batch operations
  mget(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {}
    for (const key of keys) {
      result[key] = this.get(key)
    }
    return result
  }

  mset(items: Record<string, T>, ttl?: number): void {
    for (const [key, data] of Object.entries(items)) {
      this.set(key, data, ttl)
    }
  }

  // Cache statistics
  getStats() {
    const now = Date.now()
    let expired = 0
    let totalSize = 0

    for (const item of this.cache.values()) {
      if (this.isExpired(item)) {
        expired++
      }
      totalSize += JSON.stringify(item.data).length
    }

    return {
      size: this.cache.size,
      expired,
      totalSize,
      hitRate: 0, // Would need to track hits/misses
    }
  }
}

// Global cache instances
export const memoryCache = new CacheManager({ storage: "memory" })
export const localStorageCache = new CacheManager({ storage: "localStorage" })
export const sessionStorageCache = new CacheManager({ storage: "sessionStorage" })

// Cache hooks for React
export function useCache<T = any>(key: string, fetcher?: () => Promise<T>, ttl?: number) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (!fetcher) return

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await memoryCache.getOrSet(key, fetcher, ttl)
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [key, fetcher, ttl])

  const refresh = React.useCallback(async () => {
    if (!fetcher) return

    setLoading(true)
    setError(null)

    try {
      memoryCache.delete(key)
      const result = await memoryCache.getOrSet(key, fetcher, ttl)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl])

  return { data, loading, error, refresh }
}

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    const cached = memoryCache.get(key)
    if (cached !== null) {
      return cached
    }

    const result = fn(...args)
    
    // Handle promises
    if (result instanceof Promise) {
      return result.then((resolved) => {
        memoryCache.set(key, resolved, ttl)
        return resolved
      })
    }

    memoryCache.set(key, result, ttl)
    return result
  }) as T
}

// Cache invalidation patterns
export class CacheInvalidator {
  private patterns: Map<string, string[]> = new Map()

  addPattern(pattern: string, keys: string[]) {
    this.patterns.set(pattern, keys)
  }

  invalidatePattern(pattern: string) {
    const keys = this.patterns.get(pattern)
    if (keys) {
      keys.forEach(key => {
        memoryCache.delete(key)
        localStorageCache.delete(key)
        sessionStorageCache.delete(key)
      })
    }
  }

  invalidateAll() {
    memoryCache.clear()
    localStorageCache.clear()
    sessionStorageCache.clear()
  }
}

export const cacheInvalidator = new CacheInvalidator()

// Cleanup expired items periodically
if (typeof window !== "undefined") {
  setInterval(() => {
    memoryCache.cleanup()
    localStorageCache.cleanup()
    sessionStorageCache.cleanup()
  }, 60000) // Cleanup every minute
}

export default CacheManager