"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePerformance } from "@/hooks/use-performance";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "compact" | "spacious";
  mobileFirst?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  variant = "default",
  mobileFirst = true,
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop } = usePerformance();

  const variantStyles = {
    default: "p-4 md:p-6",
    compact: "p-2 md:p-4",
    spacious: "p-6 md:p-8",
  };

  const responsiveStyles = mobileFirst
    ? {
        // Mobile first approach
        container: "container mx-auto",
        spacing: "space-y-3 md:space-y-4 lg:space-y-6",
        grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        gap: "gap-3 md:gap-4 lg:gap-6",
      }
    : {
        // Desktop first approach
        container: "container mx-auto",
        spacing: "space-y-6 lg:space-y-4 md:space-y-3",
        grid: "xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1",
        gap: "gap-6 lg:gap-4 md:gap-3",
      };

  return (
    <div
      className={cn(
        responsiveStyles.container,
        variantStyles[variant],
        className
      )}
    >
      <div
        className={cn(
          responsiveStyles.spacing,
          isMobile && "space-y-2",
          isTablet && "space-y-3",
          isDesktop && "space-y-4"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Grid container with responsive columns
export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
}: {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile: number;
    tablet: number;
    desktop: number;
    wide: number;
  };
}) {
  const { isMobile, isTablet, isDesktop } = usePerformance();

  const getGridCols = () => {
    if (isMobile) return `grid-cols-${cols.mobile}`;
    if (isTablet) return `grid-cols-${cols.tablet}`;
    if (isDesktop) return `grid-cols-${cols.desktop}`;
    return `grid-cols-${cols.wide}`;
  };

  return (
    <div
      className={cn(
        "grid gap-3 md:gap-4 lg:gap-6",
        getGridCols(),
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive text sizing
export function ResponsiveText({
  children,
  className,
  size = "base",
}: {
  children: ReactNode;
  className?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
}) {
  const { isMobile } = usePerformance();

  const sizeStyles = {
    xs: "text-xs md:text-sm",
    sm: "text-sm md:text-base",
    base: "text-sm md:text-base lg:text-lg",
    lg: "text-base md:text-lg lg:text-xl",
    xl: "text-lg md:text-xl lg:text-2xl",
    "2xl": "text-xl md:text-2xl lg:text-3xl",
    "3xl": "text-2xl md:text-3xl lg:text-4xl",
  };

  return (
    <div
      className={cn(
        sizeStyles[size],
        isMobile && "text-center",
        className
      )}
    >
      {children}
    </div>
  );
}