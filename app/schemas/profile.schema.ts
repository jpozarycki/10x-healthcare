import { z } from 'zod';

// Schema for validating the user profile data
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  age: z.number().int().positive().nullable(),
  gender: z.string().nullable(),
  weight: z.number().positive().nullable(),
  weight_unit: z.string().nullable(),
  health_conditions: z.array(z.string()).nullable(),
  allergies: z.array(z.string()).nullable(),
  timezone: z.string()
});

// Type derived from the schema
export type UserProfile = z.infer<typeof userProfileSchema>;

// Form schema without the id field
export const userProfileFormSchema = userProfileSchema.omit({ id: true });

// Type for the form
export type UserProfileFormData = z.infer<typeof userProfileFormSchema>;

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string()
});

// Type for error responses
export type ErrorResponse = z.infer<typeof errorResponseSchema>; 