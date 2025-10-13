"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm as useReactHookForm, UseFormProps, UseFormReturn } from "react-hook-form"
import { z } from "zod"

interface UseFormOptions<T extends z.ZodType> extends Omit<UseFormProps<z.infer<T>>, "resolver"> {
  schema: T
  defaultValues?: Partial<z.infer<T>>
  onSubmit?: (data: z.infer<T>) => void | Promise<void>
}

export function useForm<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  ...options
}: UseFormOptions<T>) {
  const form = useReactHookForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    ...options,
  })

  const handleSubmit = React.useCallback(
    (data: z.infer<T>) => {
      onSubmit?.(data)
    },
    [onSubmit]
  )

  return {
    ...form,
    handleSubmit: form.handleSubmit(handleSubmit),
  } as UseFormReturn<z.infer<T>> & {
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  }
}

// Form state helpers
export function useFormState<T extends Record<string, any>>(form: UseFormReturn<T>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const handleSubmit = React.useCallback(
    async (onSubmit: (data: T) => void | Promise<void>) => {
      try {
        setIsSubmitting(true)
        setSubmitError(null)
        await form.handleSubmit(onSubmit)()
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setIsSubmitting(false)
      }
    },
    [form]
  )

  return {
    isSubmitting,
    submitError,
    handleSubmit,
    clearError: () => setSubmitError(null),
  }
}

// Field validation helpers
export function useFieldValidation<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  fieldName: keyof T
) {
  const field = form.getFieldState(fieldName)
  const value = form.watch(fieldName)

  return {
    value,
    error: field.error?.message,
    isDirty: field.isDirty,
    isTouched: field.isTouched,
    isValid: !field.error,
  }
}

// Form persistence helpers
export function useFormPersistence<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  key: string,
  enabled: boolean = true
) {
  React.useEffect(() => {
    if (!enabled) return

    const savedData = localStorage.getItem(key)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        form.reset(parsedData)
      } catch (error) {
        console.warn("Failed to parse saved form data:", error)
      }
    }
  }, [key, enabled, form])

  React.useEffect(() => {
    if (!enabled) return

    const subscription = form.watch((data) => {
      localStorage.setItem(key, JSON.stringify(data))
    })

    return () => subscription.unsubscribe()
  }, [key, enabled, form])

  const clearSavedData = React.useCallback(() => {
    localStorage.removeItem(key)
  }, [key])

  return { clearSavedData }
}

// Form validation helpers
export function useFormValidation<T extends Record<string, any>>(form: UseFormReturn<T>) {
  const [isValidating, setIsValidating] = React.useState(false)

  const validateField = React.useCallback(
    async (fieldName: keyof T) => {
      setIsValidating(true)
      try {
        await form.trigger(fieldName)
      } finally {
        setIsValidating(false)
      }
    },
    [form]
  )

  const validateAll = React.useCallback(async () => {
    setIsValidating(true)
    try {
      return await form.trigger()
    } finally {
      setIsValidating(false)
    }
  }, [form])

  return {
    isValidating,
    validateField,
    validateAll,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
  }
}