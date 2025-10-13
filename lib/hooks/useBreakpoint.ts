/**
 * useBreakpoint Hook
 * 
 * Provides responsive breakpoint detection using Tailwind CSS breakpoints
 */

import { useState, useEffect } from "react"

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("xs")
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const updateBreakpoint = () => {
      const newWidth = window.innerWidth
      setWidth(newWidth)

      // Find the current breakpoint
      const currentBreakpoint = Object.entries(breakpoints)
        .reverse()
        .find(([, value]) => newWidth >= value)?.[0] as Breakpoint || "xs"

      setBreakpoint(currentBreakpoint)
    }

    // Set initial value
    updateBreakpoint()

    // Add event listener
    window.addEventListener("resize", updateBreakpoint)

    // Cleanup
    return () => window.removeEventListener("resize", updateBreakpoint)
  }, [])

  return {
    breakpoint,
    width,
    isXs: breakpoint === "xs",
    isSm: breakpoint === "sm",
    isMd: breakpoint === "md",
    isLg: breakpoint === "lg",
    isXl: breakpoint === "xl",
    is2Xl: breakpoint === "2xl",
    isMobile: breakpoint === "xs" || breakpoint === "sm",
    isTablet: breakpoint === "md",
    isDesktop: breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl",
    isAbove: (bp: Breakpoint) => width >= breakpoints[bp],
    isBelow: (bp: Breakpoint) => width < breakpoints[bp],
  }
}

// Hook for specific breakpoint checks
export function useIsMobile() {
  const { isMobile } = useBreakpoint()
  return isMobile
}

export function useIsTablet() {
  const { isTablet } = useBreakpoint()
  return isTablet
}

export function useIsDesktop() {
  const { isDesktop } = useBreakpoint()
  return isDesktop
}

// Hook for responsive values
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
  const { breakpoint } = useBreakpoint()
  
  // Find the appropriate value for current breakpoint
  const breakpointOrder: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"]
  const currentIndex = breakpointOrder.indexOf(breakpoint)
  
  // Look for the closest smaller or equal breakpoint value
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp]!
    }
  }
  
  return defaultValue
}