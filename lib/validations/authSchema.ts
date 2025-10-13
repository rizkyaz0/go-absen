/**
 * Authentication Validation Schemas
 * 
 * Zod schemas for form validation
 */

import { z } from "zod"

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
})

// Register schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
  position: z
    .string()
    .min(1, "Position is required"),
  department: z
    .string()
    .min(1, "Department is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .optional(),
  position: z
    .string()
    .min(1, "Position is required")
    .optional(),
  department: z
    .string()
    .min(1, "Department is required")
    .optional(),
})

// Attendance schema
export const attendanceSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required"),
  checkIn: z
    .string()
    .min(1, "Check-in time is required"),
  checkOut: z
    .string()
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
})

// Leave request schema
export const leaveRequestSchema = z.object({
  type: z
    .enum(["sick", "vacation", "personal", "emergency", "other"]),
  startDate: z
    .string()
    .min(1, "Start date is required"),
  endDate: z
    .string()
    .min(1, "End date is required"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must be less than 500 characters"),
  emergencyContact: z
    .string()
    .min(10, "Emergency contact must be at least 10 characters")
    .optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
})

// Employee schema
export const employeeSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z
    .string()
    .email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .optional(),
  position: z
    .string()
    .min(1, "Position is required"),
  department: z
    .string()
    .min(1, "Department is required"),
  hireDate: z
    .string()
    .min(1, "Hire date is required"),
  status: z
    .enum(["active", "inactive", "suspended"])
    .default("active"),
  role: z
    .enum(["admin", "manager", "employee"])
    .default("employee"),
})

// Settings schema
export const settingsSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  timezone: z
    .string()
    .min(1, "Timezone is required"),
  workingHours: z.object({
    start: z
      .string()
      .min(1, "Start time is required"),
    end: z
      .string()
      .min(1, "End time is required"),
  }),
  allowLateCheckIn: z.boolean().default(true),
  lateThreshold: z
    .number()
    .min(0, "Late threshold must be positive")
    .max(120, "Late threshold must be less than 120 minutes")
    .default(15),
  requireLocation: z.boolean().default(false),
  allowRemoteWork: z.boolean().default(false),
})

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type AttendanceFormData = z.infer<typeof attendanceSchema>
export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>
export type EmployeeFormData = z.infer<typeof employeeSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>