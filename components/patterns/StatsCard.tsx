/**
 * StatsCard Component
 * 
 * Displays key performance indicators and statistics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/loading/Skeletons"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    type: "positive" | "negative" | "neutral"
  }
  loading?: boolean
  className?: string
  variant?: "default" | "success" | "warning" | "destructive"
}

const variantStyles = {
  default: "border-border",
  success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
  warning: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
  destructive: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
}

const trendStyles = {
  positive: "text-green-600 dark:text-green-400",
  negative: "text-red-600 dark:text-red-400",
  neutral: "text-muted-foreground",
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading = false,
  className,
  variant = "default",
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={cn("relative", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          {Icon && <Skeleton className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("relative", variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                trendStyles[trend.type]
              )}
            >
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Preset stats cards for common metrics
export function AttendanceStatsCard({
  present,
  total,
  loading = false,
  className,
}: {
  present: number
  total: number
  loading?: boolean
  className?: string
}) {
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0
  const trend = percentage >= 90 ? "positive" : percentage >= 70 ? "neutral" : "negative"

  return (
    <StatsCard
      title="Attendance Rate"
      value={`${percentage}%`}
      description={`${present} of ${total} employees`}
      trend={{
        value: percentage - 85, // Assuming 85% is baseline
        label: "vs last week",
        type: trend as "positive" | "negative" | "neutral",
      }}
      loading={loading}
      className={className}
      variant={trend === "positive" ? "success" : trend === "negative" ? "destructive" : "default"}
    />
  )
}

export function EmployeeStatsCard({
  count,
  newThisMonth,
  loading = false,
  className,
}: {
  count: number
  newThisMonth: number
  loading?: boolean
  className?: string
}) {
  return (
    <StatsCard
      title="Total Employees"
      value={count.toLocaleString()}
      description={`${newThisMonth} new this month`}
      trend={{
        value: newThisMonth,
        label: "new employees",
        type: "positive",
      }}
      loading={loading}
      className={className}
    />
  )
}

export function LateStatsCard({
  count,
  total,
  loading = false,
  className,
}: {
  count: number
  total: number
  loading?: boolean
  className?: string
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <StatsCard
      title="Late Arrivals"
      value={count}
      description={`${percentage}% of total employees`}
      trend={{
        value: percentage - 10, // Assuming 10% is baseline
        label: "vs yesterday",
        type: percentage > 15 ? "negative" : "positive",
      }}
      loading={loading}
      className={className}
      variant={percentage > 15 ? "destructive" : "warning"}
    />
  )
}