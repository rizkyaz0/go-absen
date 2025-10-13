"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface TimePickerProps extends React.ComponentProps<typeof Input> {
  value?: string
  onValueChange?: (value: string) => void
}

export function TimePicker({ 
  value, 
  onValueChange, 
  className,
  ...props 
}: TimePickerProps) {
  return (
    <div className="relative">
      <Input
        type="time"
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn("pr-10", className)}
        {...props}
      />
      <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  )
}