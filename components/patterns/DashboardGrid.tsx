/**
 * DashboardGrid Component
 * 
 * Responsive grid layout for dashboard components
 */

import { cn } from "@/lib/utils"
import { useBreakpoint } from "@/lib/hooks/useBreakpoint"

interface DashboardGridProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "compact" | "spacious"
}

const variantStyles = {
  default: "gap-4",
  compact: "gap-2",
  spacious: "gap-6",
}

export function DashboardGrid({ 
  children, 
  className, 
  variant = "default" 
}: DashboardGridProps) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint()

  return (
    <div
      className={cn(
        "grid",
        // Mobile: single column
        "grid-cols-1",
        // Tablet: 2 columns
        "md:grid-cols-2",
        // Desktop: 3-4 columns depending on content
        "lg:grid-cols-3 xl:grid-cols-4",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  )
}

// KPI Row - horizontal layout for key metrics
export function KpiRow({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-4",
        className
      )}
    >
      {children}
    </div>
  )
}

// Widget Card - container for dashboard widgets
export function WidgetCard({ 
  children, 
  className,
  title,
  description,
  actions,
}: {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6",
        className
      )}
    >
      {(title || description || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

// Activity Timeline - for recent activities
export function ActivityTimeline({ 
  activities,
  className,
  loading = false,
}: {
  activities: Array<{
    id: string
    title: string
    description: string
    timestamp: string
    type: "info" | "success" | "warning" | "error"
  }>
  className?: string
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex space-x-3">
            <div className="w-2 h-2 bg-muted rounded-full mt-2" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const typeStyles = {
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  return (
    <div className={cn("space-y-4", className)}>
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex space-x-3">
          <div
            className={cn(
              "w-2 h-2 rounded-full mt-2 flex-shrink-0",
              typeStyles[activity.type]
            )}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Quick Actions - for common actions
export function QuickActions({ 
  actions,
  className,
}: {
  actions: Array<{
    id: string
    label: string
    icon: React.ReactNode
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
  }>
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4", className)}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className={cn(
            "flex flex-col items-center space-y-2 p-3 md:p-4 rounded-lg border transition-all duration-200",
            "hover:bg-accent hover:text-accent-foreground hover:shadow-md",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "active:scale-95",
            action.variant === "outline" && "border-border",
            action.variant === "secondary" && "bg-secondary text-secondary-foreground"
          )}
        >
          <div className="text-primary">{action.icon}</div>
          <span className="text-xs md:text-sm font-medium text-center">{action.label}</span>
        </button>
      ))}
    </div>
  )
}

// Responsive wrapper that adapts to screen size
export function ResponsiveDashboard({ 
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { isMobile, isTablet } = useBreakpoint()

  return (
    <div
      className={cn(
        "space-y-6",
        isMobile && "space-y-4",
        isTablet && "space-y-5",
        className
      )}
    >
      {children}
    </div>
  )
}