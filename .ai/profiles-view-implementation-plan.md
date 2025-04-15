# API Endpoint Implementation Plan: Get User Profile

## 1. Endpoint Overview
This endpoint retrieves the current authenticated user's profile information, providing essential personal and health-related data needed by the medication management application.

## 2. Request Details
- **Method**: GET
- **URL Structure**: `/api/v1/profile`
- **Parameters**: None (user is identified via authentication)
- **Headers**: 
  - `Authorization`: Bearer token (handled by Supabase Auth middleware)

## 3. Types Used
```typescript
// Response type (already defined in src/types.ts)
type GetProfileResponse = Pick<
  DBTables['user_profiles']['Row'],
  | 'id'
  | 'first_name'
  | 'last_name'
  | 'age'
  | 'gender'
  | 'weight'
  | 'weight_unit'
  | 'health_conditions'
  | 'allergies'
  | 'timezone'
>
```

## 4. Response Details
- **Success Response**:
  - **Status Code**: 200 OK
  - **Body Format**:
    ```json
    {
      "id": "uuid",
      "first_name": "string",
      "last_name": "string",
      "age": "number",
      "gender": "string",
      "weight": "number",
      "weight_unit": "string",
      "health_conditions": "object",
      "allergies": "object",
      "timezone": "string"
    }
    ```
- **Error Responses**:
  - **401 Unauthorized**: User is not authenticated
  - **404 Not Found**: Profile doesn't exist for the authenticated user
  - **500 Internal Server Error**: Server-side error occurred

## 5. Data Flow
1. Request arrives at `/api/v1/profile` endpoint
2. Middleware validates the user's authentication token
3. Route handler retrieves the user's ID from the authenticated session
4. ProfileService queries the Supabase database for the user's profile
5. Response mapper transforms database result to API response format
6. API returns the formatted profile data

## 6. Security Considerations
- **Authentication**: Ensure the user is authenticated via Supabase Auth middleware
- **Authorization**: Verify the authenticated user can only access their own profile
- **Data Sanitization**: Validate and sanitize data from the database before returning
- **Error Handling**: Avoid leaking implementation details in error messages

## 7. Error Handling
| Error Scenario | Status Code | Response Message |
|----------------|-------------|------------------|
| User not authenticated | 401 | "Authentication required" |
| User profile not found | 404 | "Profile not found" |
| Database error | 500 | "An error occurred while retrieving the profile" |

## 8. Performance Considerations
- Implement caching for profile data to reduce database load
- Use database indexing on user_id column in user_profiles table
- Monitor query performance and optimize as needed

## 9. Implementation Steps

### 1. Create the API Route Handler
Create the file `app/api/v1/profile/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { GetProfileResponse } from '@/src/types'

export async function GET() {
  try {
    // Create Supabase server client
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Query the user profile
    const { data: profile, error: dbError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        first_name,
        last_name,
        age,
        gender,
        weight,
        weight_unit,
        health_conditions,
        allergies,
        timezone
      `)
      .eq('user_id', user.id)
      .single()
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'An error occurred while retrieving the profile' },
        { status: 500 }
      )
    }
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    // Return the profile data
    return NextResponse.json(profile as GetProfileResponse)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
```

### 2. Create Profile Service (Clean Architecture)
Create the file `app/services/profile/profile.service.ts`:

```typescript
import { createClient } from '@/app/lib/supabase/server'
import { GetProfileResponse } from '@/src/types'

export class ProfileService {
  async getUserProfile(userId: string): Promise<GetProfileResponse | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        first_name,
        last_name,
        age,
        gender,
        weight,
        weight_unit,
        health_conditions,
        allergies,
        timezone
      `)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      throw new Error('Failed to fetch user profile')
    }
    
    return data as GetProfileResponse | null
  }
}
```

### 3. Refactor the API Route to Use the Service
Update `app/api/v1/profile/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { ProfileService } from '@/app/services/profile/profile.service'

export async function GET() {
  try {
    // Create Supabase server client
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Use the profile service to get the user profile
    const profileService = new ProfileService()
    
    try {
      const profile = await profileService.getUserProfile(user.id)
      
      if (!profile) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(profile)
    } catch (serviceError) {
      console.error('Service error:', serviceError)
      return NextResponse.json(
        { error: 'An error occurred while retrieving the profile' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
```

### 4. Add Logging
Implement structured logging for better monitoring and debugging.

### 5. Document the API
Update API documentation to include the new endpoint details.

### 6. Review and Deployment
Perform code review and deploy the changes. 