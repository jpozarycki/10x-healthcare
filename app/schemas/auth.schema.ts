import * as z from 'zod'

export const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export const registerFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  age: z.number().min(18, 'You must be at least 18 years old').nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable(),
  weight: z.number().positive('Weight must be a positive number').nullable(),
  weight_unit: z.enum(['kg', 'lbs']).nullable(),
  health_conditions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).nullable(),
  work_type: z.enum(['office', 'manual_labor', 'mixed', 'remote', 'other']).nullable(),
  communication_preferences: z.enum(['email', 'sms', 'both']).default('email'),
  health_literacy_level: z.enum(['basic', 'intermediate', 'advanced']).default('intermediate'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const recoverPasswordFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordFormSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type LoginFormData = z.infer<typeof loginFormSchema>
export type RegisterFormData = z.infer<typeof registerFormSchema>
export type RecoverPasswordFormData = z.infer<typeof recoverPasswordFormSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema> 