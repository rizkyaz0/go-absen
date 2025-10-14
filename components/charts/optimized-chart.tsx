"use client";

import { memo, Suspense, lazy } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Lazy load chart components for better performance
const RechartsAreaChart = lazy(() => import("./recharts-area-chart"));
const RechartsBarChart = lazy(() => import("./recharts-bar-chart"));
const RechartsLineChart = lazy(() => import("./recharts-line-chart"));

interface OptimizedChartProps {
  title: string;
  description?: string;
  type: "area" | "bar" | "line";
  data: any[];
  className?: string;
  height?: number;
  loading?: boolean;
}

const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className={`h-${height} w-full`} />
  </div>
);

const OptimizedChartComponent = memo(function OptimizedChart({
  title,
  description,
  type,
  data,
  className,
  height = 300,
  loading = false,
}: OptimizedChartProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartSkeleton height={height} />
        </CardContent>
      </Card>
    );
  }

  const ChartComponent = {
    area: RechartsAreaChart,
    bar: RechartsBarChart,
    line: RechartsLineChart,
  }[type];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Suspense fallback={<ChartSkeleton height={height} />}>
          <div style={{ height: `${height}px` }}>
            <ChartComponent data={data} />
          </div>
        </Suspense>
      </CardContent>
    </Card>
  );
});

export { OptimizedChartComponent as OptimizedChart };