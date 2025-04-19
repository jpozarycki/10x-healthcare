import * as z from 'zod'
import { Database } from '../db/database.types'

type DBEnums = Database['public']['Enums']

// Schedule pattern schema
export const schedulePatternSchema = z.object({
  type: z.string(),
  pattern: z.record(z.unknown()),
  times: z.array(z.string()),
  with_food: z.boolean()
})

// Create medication request schema
export const createMedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  form: z.string().min(1, 'Medication form is required'),
  strength: z.string().optional(),
  strength_unit_id: z.string().uuid().optional(),
  category: z.enum(['prescription', 'otc', 'supplement', 'other'] as [string, ...string[]]),
  purpose: z.string().optional(),
  instructions: z.string().optional(),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Please use ISO format (YYYY-MM-DD)',
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Please use ISO format (YYYY-MM-DD)',
  }).optional(),
  refill_reminder_days: z.number().int().positive().optional(),
  pills_per_refill: z.number().int().positive().optional(),
  schedule: schedulePatternSchema
})

// Validation error response schema
export const validationErrorResponseSchema = z.object({
  error: z.string(),
  details: z.array(z.object({
    path: z.array(z.string().or(z.number())),
    message: z.string()
  })).optional()
})

// Success response schema
export const createMedicationResponseSchema = z.object({
  id: z.string().uuid(),
  message: z.string()
})

// Validation Interaction Request Schema
export const validateMedicationInteractionsSchema = z.object({
  medications: z.array(z.object({
    id: z.string(),
    name: z.string(),
    strength: z.string(),
    form: z.string()
  })),
  new_medication: z.object({
    name: z.string(),
    strength: z.string(),
    form: z.string()
  }),
  user_context: z.object({
    health_conditions: z.array(z.string()),
    allergies: z.array(z.string()),
    age: z.number()
  })
}) 