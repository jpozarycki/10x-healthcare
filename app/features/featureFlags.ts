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
