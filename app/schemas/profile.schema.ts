import { z } from 'zod';

// Schema for validating the user profile data
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  age: z.number().int().positive().optional(),
  gender: z.string().optional(),
  weight: z.number().positive().optional(),
  weight_unit: z.string().optional(),
  health_conditions: z.record(z.boolean()).optional(),
  allergies: z.record(z.boolean()).optional(),
  timezone: z.string().optional()
});

// Type derived from the schema
export type UserProfile = z.infer<typeof userProfileSchema>;

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string()
});

// Type for error responses
export type ErrorResponse = z.infer<typeof errorResponseSchema>; 