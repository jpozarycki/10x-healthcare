import { describe, it, expect } from 'vitest';
import { userProfileSchema, userProfileFormSchema } from './profile.schema';

describe('Profile Schemas', () => {
  describe('userProfileSchema', () => {
    const validProfileData = {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      first_name: 'John',
      last_name: 'Doe',
      age: 30,
      gender: 'Male',
      weight: 75.5,
      weight_unit: 'kg',
      health_conditions: ['Hypertension'],
      allergies: ['Pollen'],
      timezone: 'Europe/Warsaw',
    };

    it('should validate correct profile data', () => {
      const result = userProfileSchema.safeParse(validProfileData);
      expect(result.success).toBe(true);
    });

    it('should allow nullable fields', () => {
      const result = userProfileSchema.safeParse({
        ...validProfileData,
        age: null,
        gender: null,
        weight: null,
        weight_unit: null,
        health_conditions: null,
        allergies: null,
      });
      expect(result.success).toBe(true);
    });
    
    it('should allow empty arrays for conditions and allergies', () => {
      const result = userProfileSchema.safeParse({
        ...validProfileData,
        health_conditions: [],
        allergies: [],
      });
      expect(result.success).toBe(true);
    });

    it('should fail validation if id is not a UUID', () => {
      const result = userProfileSchema.safeParse({ ...validProfileData, id: 'invalid-id' });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toEqual(['id']);
    });

    it('should fail validation if first_name is empty', () => {
      const result = userProfileSchema.safeParse({ ...validProfileData, first_name: '' });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toEqual(['first_name']);
    });
    
    it('should fail validation if last_name is empty', () => {
      const result = userProfileSchema.safeParse({ ...validProfileData, last_name: '' });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toEqual(['last_name']);
    });

    it('should fail validation if age is not a positive integer', () => {
      const resultInt = userProfileSchema.safeParse({ ...validProfileData, age: -5 });
      const resultFloat = userProfileSchema.safeParse({ ...validProfileData, age: 30.5 });
      expect(resultInt.success).toBe(false);
      expect(resultInt.error?.errors[0]?.path).toEqual(['age']);
      expect(resultFloat.success).toBe(false);
      expect(resultFloat.error?.errors[0]?.path).toEqual(['age']);
    });
    
    it('should fail validation if weight is not positive', () => {
      const result = userProfileSchema.safeParse({ ...validProfileData, weight: -10 });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toEqual(['weight']);
    });
    
    it('should fail validation if timezone is missing', () => {
      const { timezone, ...invalidData } = validProfileData;
      const result = userProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toEqual(['timezone']);
    });
  });

  describe('userProfileFormSchema', () => {
    const validFormData = {
      first_name: 'Jane',
      last_name: 'Smith',
      age: 25,
      gender: 'Female',
      weight: 60,
      weight_unit: 'kg',
      health_conditions: [],
      allergies: ['Peanuts'],
      timezone: 'America/New_York',
    };

    it('should validate correct form data', () => {
      const result = userProfileFormSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    it('should fail if required fields are missing (e.g., first_name)', () => {
      const { first_name, ...invalidData } = validFormData;
      const result = userProfileFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toEqual(['first_name']);
    });

    it('should not have the id field', () => {
      const result = userProfileFormSchema.safeParse({
        ...validFormData,
        id: 'some-id', // ID should be omitted
      });
      // Zod strips unknown keys by default unless .passthrough() is used
      expect(result.success).toBe(true); 
      if (result.success) {
        expect(result.data).not.toHaveProperty('id');
      }
    });
  });
}); 