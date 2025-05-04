# Improved Feature Flags System

This is a simpler, more reliable feature flag implementation for Next.js applications that works consistently on both client and server.

## Core Implementation

```typescript
// app/features/featureFlags.ts
import { z } from 'zod'

/**
 * Available environments
 */
const EnvironmentSchema = z.enum(['local', 'integration', 'production'])
export type Environment = z.infer<typeof EnvironmentSchema>

/**
 * Feature configuration per environment
 */
const FEATURES_CONFIG = {
  dashboard: {
    local: false,
    integration: false,
    production: false
  },
  medications: {
    local: true,
    integration: true,
    production: true
  },
  education: {
    local: false,
    integration: false,
    production: false
  },
  alerts: {
    local: false,
    integration: false,
    production: false
  },
  profile: {
    local: true,
    integration: true,
    production: true
  }
} as const

export type FeatureFlagKey = keyof typeof FEATURES_CONFIG

/**
 * Get current environment
 */
export const currentEnvironment: Environment = (() => {
  const rawEnv = process.env.NEXT_PUBLIC_ENV_NAME ?? process.env.ENV_NAME ?? 'local'
  const parsed = EnvironmentSchema.safeParse(rawEnv)
  return parsed.success ? parsed.data : 'local'
})()

/**
 * Check if a feature is enabled in current environment
 */
export function isFeatureEnabled(feature: FeatureFlagKey): boolean {
  return FEATURES_CONFIG[feature][currentEnvironment]
}

/**
 * Get all feature flags
 */
export function getAllFeatureFlags(): Record<FeatureFlagKey, boolean> {
  const flags: Record<FeatureFlagKey, boolean> = {}
  for (const key in FEATURES_CONFIG) {
    flags[key as FeatureFlagKey] = FEATURES_CONFIG[key as FeatureFlagKey][currentEnvironment]
  }
  return flags
}
```

## Usage

### 1. Environment Configuration

Only one environment variable is needed:
```env
NEXT_PUBLIC_ENV_NAME=local  # or 'integration' or 'production'
```

### 2. Current Feature Status

| Feature      | Local | Integration | Production |
|--------------|-------|-------------|------------|
| dashboard    | ❌    | ❌         | ❌         |
| medications  | ✅    | ✅         | ✅         |
| education    | ❌    | ❌         | ❌         |
| alerts       | ❌    | ❌         | ❌         |
| profile      | ✅    | ✅         | ✅         |

### 3. In React Components

```tsx
import { isFeatureEnabled } from '@/app/features/featureFlags'

function MyComponent() {
  // TypeScript will validate that 'dashboard' is a valid feature flag
  if (isFeatureEnabled('dashboard')) {
    return <DashboardFeature />
  }
  
  return <FeatureDisabled />
}
```

### 4. For Conditional Rendering

```tsx
import { isFeatureEnabled } from '@/app/features/featureFlags'

function FeatureWrapper() {
  return (
    <>
      {isFeatureEnabled('medications') && <MedicationsSection />}
      {isFeatureEnabled('profile') && <ProfileSection />}
    </>
  )
}
```

## Key Benefits

1. **Type Safety**: TypeScript ensures you only use valid feature flag names
2. **Simplicity**: Single source of truth in `FEATURES_CONFIG`
3. **Predictability**: Clear status for each feature in each environment
4. **No ENV Complexity**: Only needs `NEXT_PUBLIC_ENV_NAME`
5. **Consistent Behavior**: Same results on client and server

## Adding a New Feature Flag

To add a new feature flag:

1. Add it to the `FEATURES_CONFIG` object with settings for each environment:
```typescript
const FEATURES_CONFIG = {
  newFeature: {
    local: false,
    integration: false,
    production: false
  },
  // ... existing features
}
```

TypeScript will automatically update the `FeatureFlagKey` type.

## Implementation Notes

1. **Why use a central `FEATURES_CONFIG` object?**
   - Type safety - ensures you only use valid feature flag names
   - Self-documentation - easy to see all available flags in one place
   - Maintainability - adding a new flag is just adding an entry to the object

2. **Why use environment variables?**
   - Config changes without code changes
   - Different configurations per environment
   - Works with most deployment platforms

3. **Why all `NEXT_PUBLIC_` prefixes?**
   - Ensures consistent behavior between client and server
   - Simplifies the code by having one source of truth

## Testing Strategy

For unit tests, you can mock the feature flags module:

```typescript
// In your test
jest.mock('@/app/features/featureFlags', () => ({
  isFeatureEnabled: (feature: string) => feature === 'dashboard',
  getAllFeatureFlags: () => ({ dashboard: true, medications: false }),
  currentEnvironment: 'local'
}))
``` 