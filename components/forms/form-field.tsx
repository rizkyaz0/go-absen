"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface FormFieldProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function FormField({ 
  label, 
  error, 
  hint, 
  required, 
  className,
  children 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <div className="flex items-center space-x-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {hint && !error && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

interface FormInputProps extends React.ComponentProps<typeof Input> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

export function FormInput({ 
  label, 
  error, 
  hint, 
  required, 
  className,
  ...props 
}: FormInputProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <Input 
        className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
        {...props} 
      />
    </FormField>
  )
}

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

export function FormTextarea({ 
  label, 
  error, 
  hint, 
  required, 
  className,
  ...props 
}: FormTextareaProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <Textarea 
        className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
        {...props} 
      />
    </FormField>
  )
}

interface FormSelectProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

export function FormSelect({ 
  label, 
  error, 
  hint, 
  required, 
  placeholder = "Select an option",
  options,
  value,
  onValueChange,
  disabled,
  className,
}: FormSelectProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(error && "border-destructive focus:ring-destructive", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}

interface FormCheckboxProps extends React.ComponentProps<typeof Checkbox> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

export function FormCheckbox({ 
  label, 
  error, 
  hint, 
  required, 
  className,
  ...props 
}: FormCheckboxProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div className="flex items-center space-x-2">
        <Checkbox 
          className={cn(error && "border-destructive", className)}
          {...props} 
        />
        {label && (
          <Label 
            htmlFor={props.id}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}
          >
            {label}
          </Label>
        )}
      </div>
    </FormField>
  )
}

interface FormRadioGroupProps extends React.ComponentProps<typeof RadioGroup> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export function FormRadioGroup({ 
  label, 
  error, 
  hint, 
  required, 
  options,
  className,
  ...props 
}: FormRadioGroupProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <RadioGroup className={cn(error && "text-destructive", className)} {...props}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={option.value} 
              id={option.value}
              disabled={option.disabled}
            />
            <Label 
              htmlFor={option.value}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FormField>
  )
}

interface FormSwitchProps extends React.ComponentProps<typeof Switch> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

export function FormSwitch({ 
  label, 
  error, 
  hint, 
  required, 
  className,
  ...props 
}: FormSwitchProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div className="flex items-center space-x-2">
        <Switch 
          className={cn(error && "data-[state=checked]:bg-destructive", className)}
          {...props} 
        />
        {label && (
          <Label 
            htmlFor={props.id}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}
          >
            {label}
          </Label>
        )}
      </div>
    </FormField>
  )
}

interface FormDatePickerProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
}

export function FormDatePicker({ 
  label, 
  error, 
  hint, 
  required, 
  value,
  onChange,
  disabled,
  className,
}: FormDatePickerProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-destructive focus:ring-destructive",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </FormField>
  )
}

interface FormTimePickerProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  value?: string
  onChange?: (time: string) => void
  disabled?: boolean
  className?: string
}

export function FormTimePicker({ 
  label, 
  error, 
  hint, 
  required, 
  value,
  onChange,
  disabled,
  className,
}: FormTimePickerProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div className="relative">
        <Input
          type="time"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            "pr-10",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
        />
        <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </FormField>
  )
}

// Form section component
interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

// Form actions component
interface FormActionsProps {
  children: React.ReactNode
  className?: string
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn("flex items-center justify-end space-x-2 pt-4", className)}>
      {children}
    </div>
  )
}