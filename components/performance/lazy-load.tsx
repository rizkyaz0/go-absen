"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LazyLoadProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function LazyLoad({
  children,
  fallback = <div className="h-32 bg-muted animate-pulse rounded" />,
  threshold = 0.1,
  rootMargin = "50px",
  className,
  onLoad,
  onError,
}: LazyLoadProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isError, setIsError] = React.useState(false)
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true)
          onLoad?.()
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin, onLoad])

  if (isError) {
    return (
      <div className={cn("flex items-center justify-center h-32 text-destructive", className)}>
        <div className="text-center">
          <p className="font-medium">Failed to load</p>
          <p className="text-sm text-muted-foreground">Please try again</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div ref={elementRef} className={className}>
        {fallback}
      </div>
    )
  }

  return <div className={className}>{children}</div>
}

// Lazy image component
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallback?: React.ReactNode
  className?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function LazyImage({
  src,
  alt,
  fallback = <div className="bg-muted animate-pulse rounded" />,
  className,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isError, setIsError] = React.useState(false)
  const [imageSrc, setImageSrc] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    const img = new Image()
    
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
      onLoad?.()
    }
    
    img.onerror = (error) => {
      setIsError(true)
      onError?.(error as any)
    }
    
    img.src = src
  }, [src, onLoad, onError])

  if (isError) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
        <div className="text-center">
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    )
  }

  if (!isLoaded || !imageSrc) {
    return <div className={className}>{fallback}</div>
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      {...props}
    />
  )
}

// Lazy component wrapper
interface LazyComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  delay?: number
}

export function LazyComponent({
  children,
  fallback = <div className="h-32 bg-muted animate-pulse rounded" />,
  className,
  delay = 0,
}: LazyComponentProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setIsLoaded(true), delay)
      return () => clearTimeout(timer)
    } else {
      setIsLoaded(true)
    }
  }, [delay])

  if (!isLoaded) {
    return <div className={className}>{fallback}</div>
  }

  return <div className={className}>{children}</div>
}

// Virtual scrolling component
interface VirtualScrollProps {
  items: any[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: any, index: number) => React.ReactNode
  className?: string
  overscan?: number
}

export function VirtualScroll({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
}: VirtualScrollProps) {
  const [scrollTop, setScrollTop] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + overscan,
    items.length
  )

  const visibleItems = items.slice(visibleStart, visibleEnd)
  const totalHeight = items.length * itemHeight
  const offsetY = visibleStart * itemHeight

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleStart + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Memoized component wrapper
interface MemoizedProps {
  children: React.ReactNode
  dependencies?: any[]
  className?: string
}

export function Memoized({ children, dependencies = [], className }: MemoizedProps) {
  return React.useMemo(
    () => <div className={className}>{children}</div>,
    dependencies
  )
}

// Debounced input component
interface DebouncedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onChange: (value: string) => void
  delay?: number
}

export function DebouncedInput({
  value,
  onChange,
  delay = 300,
  ...props
}: DebouncedInputProps) {
  const [localValue, setLocalValue] = React.useState(value)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, delay)

    return () => clearTimeout(timer)
  }, [localValue, onChange, delay])

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  )
}

// Throttled scroll component
interface ThrottledScrollProps {
  children: React.ReactNode
  onScroll?: (scrollTop: number) => void
  throttleMs?: number
  className?: string
}

export function ThrottledScroll({
  children,
  onScroll,
  throttleMs = 100,
  className,
}: ThrottledScrollProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const lastScrollTime = React.useRef(0)

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const now = Date.now()
    if (now - lastScrollTime.current >= throttleMs) {
      lastScrollTime.current = now
      onScroll?.(e.currentTarget.scrollTop)
    }
  }, [onScroll, throttleMs])

  return (
    <div
      ref={scrollRef}
      className={className}
      onScroll={handleScroll}
    >
      {children}
    </div>
  )
}