"use client"

import * as React from "react"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "./skeleton"

interface LoadingStateProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

export function LoadingSpinner({ className, size = "md", text }: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

export function LoadingPage({ className, text = "Loading..." }: LoadingStateProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center", className)}>
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">{text}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function LoadingCard({ className, title, description }: LoadingStateProps & { title?: string; description?: string }) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
}

interface RetryableLoadingProps {
  onRetry: () => void
  error?: string
  isLoading: boolean
  className?: string
}

export function RetryableLoading({ onRetry, error, isLoading, className }: RetryableLoadingProps) {
  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4 p-8", className)}>
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <LoadingSpinner text="Loading..." />
    </div>
  )
}

// Suspense fallback components
export function SuspenseFallback({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <LoadingSpinner text="Loading content..." />
    </div>
  )
}

// Inline loading states
export function InlineLoading({ className, text }: LoadingStateProps) {
  return (
    <div className={cn("inline-flex items-center space-x-2", className)}>
      <LoadingSpinner size="sm" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

// Button loading state
interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  isLoading: boolean
  loadingText?: string
}

export function LoadingButton({ 
  isLoading, 
  loadingText = "Loading...", 
  children, 
  disabled,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

// Table loading state
export function TableLoading({ columns = 4, rows = 5, className }: { columns?: number; rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header skeleton */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Form loading state
export function FormLoading({ fields = 3, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
}