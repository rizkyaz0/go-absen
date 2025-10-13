/**
 * Skeleton Loading Components
 * 
 * Provides skeleton loading states for various UI components
 */

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Page-level skeletons
export function PageSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

// Card skeleton
export function CardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)} {...props}>
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className, 
  ...props 
}: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
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

// List skeleton
export function ListSkeleton({ 
  items = 3, 
  className, 
  ...props 
}: SkeletonProps & { items?: number }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Avatar skeleton
export function AvatarSkeleton({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} {...props} />
}

// Text skeleton
export function TextSkeleton({ 
  lines = 1, 
  className, 
  ...props 
}: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

// Chart skeleton
export function ChartSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

// Form skeleton
export function FormSkeleton({ 
  fields = 3, 
  className, 
  ...props 
}: SkeletonProps & { fields?: number }) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
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

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      {/* Chart */}
      <CardSkeleton className="h-80" />
      
      {/* Table */}
      <CardSkeleton>
        <TableSkeleton rows={8} columns={5} />
      </CardSkeleton>
    </div>
  )
}

// Button skeleton
export function ButtonSkeleton({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-20", className)} {...props} />
}

// Input skeleton
export function InputSkeleton({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-full", className)} {...props} />
}

// Badge skeleton
export function BadgeSkeleton({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-6 w-16 rounded-full", className)} {...props} />
}

export { Skeleton }