"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, RefreshCw, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

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
              <p className="font-medium">Failed to load chart</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
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

// Chart types
export type ChartType = "line" | "bar" | "area" | "pie" | "donut" | "scatter" | "radar"

interface ChartProps {
  type: ChartType
  data: any[]
  options?: any
  className?: string
  height?: string | number
}

export function Chart({ type, data, options, className, height = 300 }: ChartProps) {
  const chartRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Chart implementation would go here
    // This is a placeholder for the actual chart rendering
  }, [type, data, options])

  return (
    <div
      ref={chartRef}
      className={cn("w-full", className)}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    />
  )
}

// Predefined chart components
interface LineChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  xAxisKey?: string
  yAxisKey?: string
  className?: string
  height?: string | number
}

export function LineChart({ data, xAxisKey = "name", yAxisKey = "value", className, height }: LineChartProps) {
  return (
    <Chart
      type="line"
      data={data}
      className={className}
      height={height}
    />
  )
}

interface BarChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  xAxisKey?: string
  yAxisKey?: string
  className?: string
  height?: string | number
}

export function BarChart({ data, xAxisKey = "name", yAxisKey = "value", className, height }: BarChartProps) {
  return (
    <Chart
      type="bar"
      data={data}
      className={className}
      height={height}
    />
  )
}

interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  className?: string
  height?: string | number
}

export function PieChart({ data, className, height }: PieChartProps) {
  return (
    <Chart
      type="pie"
      data={data}
      className={className}
      height={height}
    />
  )
}

interface AreaChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  xAxisKey?: string
  yAxisKey?: string
  className?: string
  height?: string | number
}

export function AreaChart({ data, xAxisKey = "name", yAxisKey = "value", className, height }: AreaChartProps) {
  return (
    <Chart
      type="area"
      data={data}
      className={className}
      height={height}
    />
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

// Chart data helpers
export function transformDataForChart(
  data: any[],
  xKey: string,
  yKey: string,
  groupBy?: string
): any[] {
  if (groupBy) {
    const grouped = data.reduce((acc, item) => {
      const key = item[groupBy]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    }, {})

    return Object.entries(grouped).map(([key, values]) => ({
      name: key,
      value: values.reduce((sum: number, item: any) => sum + item[yKey], 0),
    }))
  }

  return data.map(item => ({
    name: item[xKey],
    value: item[yKey],
  }))
}

// Chart loading and error states
export function ChartLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center h-64", className)}>
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading chart...</p>
      </div>
    </div>
  )
}

export function ChartError({ error, className }: { error: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center h-64", className)}>
      <div className="text-center">
        <p className="font-medium text-destructive">Failed to load chart</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    </div>
  )
}