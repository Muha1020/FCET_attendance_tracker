import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    identifier: z.string().min(1, 'Identifier is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    level: z
      .number()
      .refine((v) => [100, 200, 300, 400, 500].includes(v), 'Select a valid level')
      .optional(),
    department: z.string().optional(),
  })

export const createCourseSchema = z.object({
  course_code: z.string().min(2, 'Course code is required'),
  course_name: z.string().min(2, 'Course name is required'),
  session_name: z.string()
    .regex(/^\d{4}\/\d{4}$/, 'Use YYYY/YYYY format, e.g. 2026/2027')
    .refine((v) => {
      const [start, end] = v.split('/').map(Number)
      return end === start + 1
    }, 'End year must be one after start year'),
  semester_type: z.enum(['Harmattan', 'Rain']),
  target_levels: z
    .array(z.number())
    .min(1, 'Select at least one target level'),
  target_departments: z
    .array(z.string())
    .min(1, 'Select at least one target department'),
})

export const markAttendanceSchema = z.object({
  pin: z
    .string()
    .length(6, 'PIN must be exactly 6 digits')
    .regex(/^\d{6}$/, 'PIN must be 6 digits'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type CreateCourseFormValues = z.infer<typeof createCourseSchema>
export type MarkAttendanceFormValues = z.infer<typeof markAttendanceSchema>
