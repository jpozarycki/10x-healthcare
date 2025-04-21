import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import { ProfileService } from './profile.service';
import { createClient } from '../../lib/supabase/server';
import { UserProfile } from '../../schemas/profile.schema';
import { UpdateProfileRequest } from '../../types';

// Mock the Supabase client factory
vi.mock('../../lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock the logger
vi.mock('../../utils/logger', () => ({
  logger: {
    withContext: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    })),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('ProfileService', () => {
  let profileService: ProfileService;
  let mockSupabaseClient: any;

  const mockUserId = 'test-user-id';
  const mockUserProfileData: UserProfile = {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Valid UUID format
    first_name: 'Test',
    last_name: 'User',
    age: 35,
    gender: 'Other',
    weight: 80,
    weight_unit: 'kg',
    health_conditions: ['Asthma'],
    allergies: ['Pollen'],
    timezone: 'UTC',
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Setup mock Supabase client and its methods
    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    (createClient as Mock).mockResolvedValue(mockSupabaseClient);
    
    profileService = new ProfileService();
  });

  describe('getUserProfile', () => {
    it('should return user profile if found and valid', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({ data: mockUserProfileData, error: null });
      
      // Act
      const profile = await profileService.getUserProfile(mockUserId);
      
      // Assert
      expect(createClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith(expect.stringContaining('first_name')); // Basic check
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
      expect(profile).toEqual(mockUserProfileData);
    });

    it('should return null if user profile not found', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });
      
      // Act
      const profile = await profileService.getUserProfile(mockUserId);
      
      // Assert
      expect(profile).toBeNull();
      expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
    });

    it('should throw error if Supabase fetch fails', async () => {
      // Arrange
      const dbError = { message: 'DB Connection Error', code: '500' };
      mockSupabaseClient.single.mockResolvedValue({ data: null, error: dbError });
      
      // Act & Assert
      await expect(profileService.getUserProfile(mockUserId))
        .rejects.toThrow('Failed to fetch user profile');
      expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
    });
    
    it('should throw validation error if fetched data is invalid', async () => {
      // Arrange
      const invalidData = { ...mockUserProfileData, first_name: null }; // first_name is required
      mockSupabaseClient.single.mockResolvedValue({ data: invalidData, error: null });
      
      // Act & Assert
      await expect(profileService.getUserProfile(mockUserId))
        .rejects.toThrow(/Profile data validation failed: \[[\s\S]*"first_name"[\s\S]*\]/);
      expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUserProfile', () => {
    const updateData: UpdateProfileRequest = {
      first_name: 'Updated',
      last_name: mockUserProfileData.last_name,
      age: 36,
      gender: mockUserProfileData.gender,
      weight: mockUserProfileData.weight,
      weight_unit: mockUserProfileData.weight_unit,
      health_conditions: mockUserProfileData.health_conditions,
      allergies: mockUserProfileData.allergies,
      timezone: mockUserProfileData.timezone,
    };
    
    const expectedUpdatedProfileData = { 
      ...mockUserProfileData, 
      ...updateData 
    };

    it('should update and return the user profile if data is valid', async () => {
      // Arrange
      mockSupabaseClient.single.mockResolvedValue({ 
        data: expectedUpdatedProfileData, 
        error: null 
      });
      
      // Act
      const updatedProfile = await profileService.updateUserProfile(mockUserId, updateData);
      
      // Assert
      expect(createClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateData);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockSupabaseClient.select).toHaveBeenCalledWith(expect.stringContaining('first_name'));
      expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
      expect(updatedProfile).toEqual(expectedUpdatedProfileData);
    });

    it('should throw error if Supabase update fails', async () => {
      // Arrange
      const dbError = { message: 'Update Conflict', code: '409' };
      mockSupabaseClient.single.mockResolvedValue({ data: null, error: dbError });
      
      // Act & Assert
      await expect(profileService.updateUserProfile(mockUserId, updateData))
        .rejects.toThrow('Failed to update user profile');
      expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
    });

    it('should throw validation error if updated data from DB is invalid', async () => {
      // Arrange
      const invalidReturnData = { 
        ...expectedUpdatedProfileData, 
        last_name: null // Make returned data invalid
      }; 
      mockSupabaseClient.single.mockResolvedValue({ data: invalidReturnData, error: null });
      
      // Act & Assert
      await expect(profileService.updateUserProfile(mockUserId, updateData))
        .rejects.toThrow(/Profile data validation failed: \[[\s\S]*"last_name"[\s\S]*\]/);
      expect(mockSupabaseClient.single).toHaveBeenCalledTimes(1);
    });
    
  });
}); 