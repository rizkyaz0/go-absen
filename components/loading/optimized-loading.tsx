"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { usePerformance } from "@/hooks/use-performance";

interface OptimizedLoadingProps {
  variant?: "card" | "list" | "chart" | "stats";
  count?: number;
  className?: string;
}

export function OptimizedLoading({
  variant = "card",
  count = 1,
  className,
}: OptimizedLoadingProps) {
  const { isMobile, shouldReduceAnimations } = usePerformance();

  const renderCardSkeleton = () => (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );

  const renderListSkeleton = () => (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );

  const renderChartSkeleton = () => (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`h-${isMobile ? "48" : "64"} w-full`} />
      </CardContent>
    </Card>
  );

  const renderStatsSkeleton = () => (
    <div className={`grid grid-cols-1 ${isMobile ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"} gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return renderCardSkeleton();
      case "list":
        return renderListSkeleton();
      case "chart":
        return renderChartSkeleton();
      case "stats":
        return renderStatsSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <div className={shouldReduceAnimations() ? "" : "animate-pulse"}>
      {renderSkeleton()}
    </div>
  );
}