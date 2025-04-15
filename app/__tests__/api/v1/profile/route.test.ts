import { NextResponse } from 'next/server';
import { GET } from '../../../../api/v1/profile/route';
import { ProfileService } from '../../../../services/profile/profile.service';
import { ZodError } from 'zod';

// Mock dependencies
jest.mock('../../../../lib/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    auth: {
      getUser: jest.fn()
    }
  }))
}));

jest.mock('../../../../services/profile/profile.service');
jest.mock('../../../../utils/logger', () => ({
  logger: {
    withContext: jest.fn().mockReturnValue({
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    })
  }
}));

describe('Profile API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', async () => {
    // Mock Supabase auth returning no user
    const mockSupabase = require('../../../../lib/supabase/server').createClient;
    mockSupabase().auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' }
    });

    // Call the API route
    const response = await GET();
    
    // Verify response
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: 'Authentication required' });
  });

  it('should return 404 when profile is not found', async () => {
    // Mock Supabase auth returning a user
    const mockSupabase = require('../../../../lib/supabase/server').createClient;
    mockSupabase().auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Mock ProfileService returning null (profile not found)
    const mockGetProfile = jest.fn().mockResolvedValue(null);
    (ProfileService as jest.Mock).mockImplementation(() => ({
      getUserProfile: mockGetProfile
    }));

    // Call the API route
    const response = await GET();
    
    // Verify response
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: 'Profile not found' });
    expect(mockGetProfile).toHaveBeenCalledWith('test-user-id');
  });

  it('should return 200 with profile data when successful', async () => {
    // Mock Supabase auth returning a user
    const mockSupabase = require('../../../../lib/supabase/server').createClient;
    mockSupabase().auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Mock profile data
    const mockProfileData = {
      id: 'profile-id',
      first_name: 'John',
      last_name: 'Doe',
      age: 30,
      gender: 'male',
      weight: 75,
      weight_unit: 'kg',
      health_conditions: { condition1: true },
      allergies: { allergy1: true },
      timezone: 'UTC'
    };

    // Mock ProfileService returning the profile
    const mockGetProfile = jest.fn().mockResolvedValue(mockProfileData);
    (ProfileService as jest.Mock).mockImplementation(() => ({
      getUserProfile: mockGetProfile
    }));

    // Call the API route
    const response = await GET();
    
    // Verify response
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(mockProfileData);
    expect(mockGetProfile).toHaveBeenCalledWith('test-user-id');
  });

  it('should return 422 when profile validation fails', async () => {
    // Mock Supabase auth returning a user
    const mockSupabase = require('../../../../lib/supabase/server').createClient;
    mockSupabase().auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Mock ProfileService throwing a validation error
    const validationError = new Error('Profile data validation failed: Invalid data');
    const mockGetProfile = jest.fn().mockRejectedValue(validationError);
    (ProfileService as jest.Mock).mockImplementation(() => ({
      getUserProfile: mockGetProfile
    }));

    // Call the API route
    const response = await GET();
    
    // Verify response
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body).toEqual({ error: 'Invalid profile data structure' });
  });

  it('should return 422 when a ZodError occurs', async () => {
    // Mock Supabase auth returning a user
    const mockSupabase = require('../../../../lib/supabase/server').createClient;
    mockSupabase().auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Create a ZodError
    const zodError = new ZodError([{
      code: 'invalid_type',
      expected: 'string',
      received: 'number',
      path: ['first_name'],
      message: 'Expected string, received number'
    }]);

    // Mock ProfileService throwing a ZodError
    const mockGetProfile = jest.fn().mockRejectedValue(zodError);
    (ProfileService as jest.Mock).mockImplementation(() => ({
      getUserProfile: mockGetProfile
    }));

    // Call the API route
    const response = await GET();
    
    // Verify response
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error).toBe('Invalid data format');
    expect(body.details).toHaveLength(1);
    expect(body.details[0].code).toBe('invalid_type');
  });

  it('should return 500 when service throws a non-validation error', async () => {
    // Mock Supabase auth returning a user
    const mockSupabase = require('../../../../lib/supabase/server').createClient;
    mockSupabase().auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Mock ProfileService throwing a general error
    const mockGetProfile = jest.fn().mockImplementation(() => {
      throw new Error('Database error');
    });
    (ProfileService as jest.Mock).mockImplementation(() => ({
      getUserProfile: mockGetProfile
    }));

    // Call the API route
    const response = await GET();
    
    // Verify response
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: 'An error occurred while retrieving the profile' });
  });
}); 