import { z } from "zod"

// User schemas
export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  role: z.enum(["admin", "manager", "employee"]).default("employee"),
})

export const createUserSchema = userSchema.omit({ id: true })
export const updateUserSchema = userSchema.partial()

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Attendance schemas
export const attendanceSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  date: z.string().min(1, "Date is required"),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.enum(["present", "absent", "late", "half-day"]).default("present"),
  notes: z.string().optional(),
  location: z.string().optional(),
})

export const createAttendanceSchema = attendanceSchema.omit({ id: true })
export const updateAttendanceSchema = attendanceSchema.partial()

// Leave schemas
export const leaveSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(["sick", "vacation", "personal", "emergency", "other"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  days: z.number().min(1, "Days must be at least 1"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  comments: z.string().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
})

export const createLeaveSchema = leaveSchema.omit({ id: true, approvedBy: true, approvedAt: true })
export const updateLeaveSchema = leaveSchema.partial()

// Report schemas
export const reportSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(["attendance", "leave", "overtime", "summary"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  department: z.string().optional(),
  userId: z.string().optional(),
  format: z.enum(["pdf", "excel", "csv"]).default("pdf"),
  filters: z.record(z.any()).optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
})

export const createReportSchema = reportSchema.omit({ id: true })

// Settings schemas
export const companySettingsSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Invalid website URL").optional(),
  timezone: z.string().min(1, "Timezone is required"),
  workingHours: z.object({
    start: z.string().min(1, "Start time is required"),
    end: z.string().min(1, "End time is required"),
    days: z.array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])),
  }),
  attendanceSettings: z.object({
    allowLateCheckIn: z.boolean().default(true),
    lateThreshold: z.number().min(0).default(15), // minutes
    requireLocation: z.boolean().default(false),
    allowRemoteWork: z.boolean().default(false),
  }),
})

// Form validation helpers
export const validateEmail = (email: string) => {
  return z.string().email().safeParse(email)
}

export const validatePhone = (phone: string) => {
  return z.string().min(10).max(15).regex(/^[\+]?[1-9][\d]{0,15}$/).safeParse(phone)
}

export const validatePassword = (password: string) => {
  return z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).safeParse(password)
}

// Common validation messages
export const validationMessages = {
  required: "This field is required",
  email: "Please enter a valid email address",
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be no more than ${max}`,
  url: "Please enter a valid URL",
  phone: "Please enter a valid phone number",
  password: "Password must contain at least 8 characters, including uppercase, lowercase, and number",
  confirmPassword: "Passwords do not match",
  dateRange: "End date must be after start date",
} as const

// Type exports
export type User = z.infer<typeof userSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>

export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>

export type Attendance = z.infer<typeof attendanceSchema>
export type CreateAttendance = z.infer<typeof createAttendanceSchema>
export type UpdateAttendance = z.infer<typeof updateAttendanceSchema>

export type Leave = z.infer<typeof leaveSchema>
export type CreateLeave = z.infer<typeof createLeaveSchema>
export type UpdateLeave = z.infer<typeof updateLeaveSchema>

export type Report = z.infer<typeof reportSchema>
export type CreateReport = z.infer<typeof createReportSchema>

export type CompanySettings = z.infer<typeof companySettingsSchema>