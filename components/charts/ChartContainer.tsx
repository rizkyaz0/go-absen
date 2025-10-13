/**
 * Chart Container Component
 * 
 * Wrapper for data visualization with loading states and actions
 */

"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, RefreshCw, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/loading/Skeletons"

interface ChartContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  loading?: boolean
  error?: string
  onRefresh?: () => void
  onExport?: () => void
  onSettings?: () => void
  timeRange?: {
    value: string
    onChange: (value: string) => void
    options: Array<{ value: string; label: string }>
  }
  height?: string | number
}

export function ChartContainer({
  title,
  description,
  children,
  className,
  actions,
  loading = false,
  error,
  onRefresh,
  onExport,
  onSettings,
  timeRange,
  height = 300,
}: ChartContainerProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {timeRange && (
            <Select value={timeRange.value} onValueChange={timeRange.onChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRange.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="icon" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onSettings && (
            <Button variant="outline" size="icon" onClick={onSettings}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {actions}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center h-64 text-destructive">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Failed to load chart</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton 
              className="w-full" 
              style={{ height: typeof height === "number" ? `${height}px` : height }}
            />
            <div className="flex justify-center space-x-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ) : (
          <div
            className="w-full"
            style={{ height: typeof height === "number" ? `${height}px` : height }}
          >
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Placeholder chart components
export function LineChartPlaceholder({ 
  data, 
  className, 
  height = 300 
}: { 
  data: any[]
  className?: string
  height?: number 
}) {
  return (
    <div 
      className={cn("flex items-center justify-center bg-muted/50 rounded-lg", className)}
      style={{ height }}
    >
      <div className="text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Line Chart Placeholder</p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.length} data points
        </p>
      </div>
    </div>
  )
}

export function BarChartPlaceholder({ 
  data, 
  className, 
  height = 300 
}: { 
  data: any[]
  className?: string
  height?: number 
}) {
  return (
    <div 
      className={cn("flex items-center justify-center bg-muted/50 rounded-lg", className)}
      style={{ height }}
    >
      <div className="text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Bar Chart Placeholder</p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.length} data points
        </p>
      </div>
    </div>
  )
}

export function PieChartPlaceholder({ 
  data, 
  className, 
  height = 300 
}: { 
  data: any[]
  className?: string
  height?: number 
}) {
  return (
    <div 
      className={cn("flex items-center justify-center bg-muted/50 rounded-lg", className)}
      style={{ height }}
    >
      <div className="text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Pie Chart Placeholder</p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.length} data points
        </p>
      </div>
    </div>
  )
}

// Chart utilities
export const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function getChartColor(index: number): string {
  return chartColors[index % chartColors.length]
}

export function formatChartValue(value: number, type: "number" | "percentage" | "currency" = "number"): string {
  switch (type) {
    case "percentage":
      return `${value}%`
    case "currency":
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value)
    default:
      return value.toLocaleString("id-ID")
  }
}

// Time range options
export const timeRangeOptions = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "1y", label: "1 Year" },
  { value: "all", label: "All Time" },
]