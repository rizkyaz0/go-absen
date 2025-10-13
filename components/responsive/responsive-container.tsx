"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: "none" | "sm" | "md" | "lg"
  center?: boolean
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full",
}

const paddingClasses = {
  none: "",
  sm: "px-2 sm:px-4",
  md: "px-4 sm:px-6 lg:px-8",
  lg: "px-6 sm:px-8 lg:px-12",
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "2xl",
  padding = "md",
  center = true,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        center && "mx-auto",
        className
      )}
    >
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: "sm" | "md" | "lg"
}

const gapClasses = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
}

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = "md",
}: ResponsiveGridProps) {
  const gridCols = [
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(" ")

  return (
    <div
      className={cn(
        "grid",
        gridCols,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

interface ResponsiveFlexProps {
  children: React.ReactNode
  className?: string
  direction?: {
    default: "row" | "col"
    sm?: "row" | "col"
    md?: "row" | "col"
    lg?: "row" | "col"
  }
  wrap?: boolean
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly"
  align?: "start" | "end" | "center" | "baseline" | "stretch"
  gap?: "sm" | "md" | "lg"
}

const justifyClasses = {
  start: "justify-start",
  end: "justify-end", 
  center: "justify-center",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
}

const textAlignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

export function ResponsiveFlex({
  children,
  className,
  direction = { default: "row" },
  wrap = false,
  justify = "start",
  align = "start",
  gap = "md",
}: ResponsiveFlexProps) {
  const flexDirection = [
    `flex-${direction.default}`,
    direction.sm && `sm:flex-${direction.sm}`,
    direction.md && `md:flex-${direction.md}`,
    direction.lg && `lg:flex-${direction.lg}`,
  ].filter(Boolean).join(" ")

  return (
    <div
      className={cn(
        "flex",
        flexDirection,
        wrap && "flex-wrap",
        justifyClasses[justify],
        alignClasses[align],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  size?: {
    default: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
    sm?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
    md?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
    lg?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
  }
  weight?: "normal" | "medium" | "semibold" | "bold"
  color?: "default" | "muted" | "primary" | "destructive" | "success" | "warning"
  align?: "left" | "center" | "right"
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm", 
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
}

const weightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
}

const colorClasses = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  destructive: "text-destructive",
  success: "text-green-600",
  warning: "text-yellow-600",
}

export function ResponsiveText({
  children,
  className,
  size = { default: "base" },
  weight = "normal",
  color = "default",
  align = "left",
  as: Component = "p",
}: ResponsiveTextProps) {
  const textSize = [
    sizeClasses[size.default],
    size.sm && `sm:${sizeClasses[size.sm]}`,
    size.md && `md:${sizeClasses[size.md]}`,
    size.lg && `lg:${sizeClasses[size.lg]}`,
  ].filter(Boolean).join(" ")

  return (
    <Component
      className={cn(
        textSize,
        weightClasses[weight],
        colorClasses[color],
        textAlignClasses[align],
        className
      )}
    >
      {children}
    </Component>
  )
}

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  className?: string
  aspectRatio?: "square" | "video" | "wide" | "portrait" | "auto"
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  priority?: boolean
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[21/9]",
  portrait: "aspect-[3/4]",
  auto: "",
}

const objectFitClasses = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
  "scale-down": "object-scale-down",
}

export function ResponsiveImage({
  src,
  alt,
  className,
  aspectRatio = "auto",
  objectFit = "cover",
  priority = false,
  ...props
}: ResponsiveImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "w-full h-auto",
        aspectRatioClasses[aspectRatio],
        objectFitClasses[objectFit],
        className
      )}
      loading={priority ? "eager" : "lazy"}
      {...props}
    />
  )
}