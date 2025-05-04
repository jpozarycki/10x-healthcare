# Feature Flags Module

Dokumentacja modułu Feature Flags w TypeScript dla aplikacji Next.js, działającego zarówno na frontendzie, jak i backendzie.

## 1. Implementacja modułu

```typescript
// app/features/featureFlags.ts
import { z } from 'zod'

/**
 * Dozwolone środowiska w ENV_NAME/NEXT_PUBLIC_ENV_NAME.
 */
const EnvironmentSchema = z.enum(['local', 'integration', 'production'])
export type Environment = z.infer<typeof EnvironmentSchema>

/**
 * Surowa nazwa środowiska z process.env.
 * Priorytet: NEXT_PUBLIC_ENV_NAME → ENV_NAME → 'local'
 */
const rawEnv = process.env.NEXT_PUBLIC_ENV_NAME ?? process.env.ENV_NAME ?? 'local'

/**
 * Aktualne środowisko. Walidujemy, domyślnie 'local'.
 */
export const currentEnvironment: Environment = (() => {
  const parsed = EnvironmentSchema.safeParse(rawEnv)
  if (parsed.success) return parsed.data
  console.warn(
    `⚠️ Invalid ENV_NAME "${rawEnv}", defaulting to "local".`
  )
  return 'local'
})();

/**
 * Prefiksy, po których wykrywamy flagi:
 * - FEATURE_*            → serwerowa zmienna
 * - NEXT_PUBLIC_FEATURE_* → clientowa (Next.js)
 */
const SERVER_PREFIX = 'FEATURE_'
const CLIENT_PREFIX = 'NEXT_PUBLIC_FEATURE_'

/**
 * Parsuje "true"/"1" → true, wszystko inne → false
 */
function parseBoolean(val: string | undefined): boolean {
  return val === 'true' || val === '1'
}

/**
 * Mapa wszystkich flag załadowanych z process.env.
 * Klucze → nazwa funkcjonalności w lowercase
 */
const featureFlagMap: Record<string, boolean> = {}
Object.keys(process.env).forEach((key) => {
  let featureKey: string | null = null

  if (key.startsWith(CLIENT_PREFIX)) {
    featureKey = key.slice(CLIENT_PREFIX.length)
  } else if (key.startsWith(SERVER_PREFIX)) {
    featureKey = key.slice(SERVER_PREFIX.length)
  }

  if (featureKey) {
    const name = featureKey.toLowerCase()
    featureFlagMap[name] = parseBoolean(process.env[key])
  }
})

/**
 * Sprawdza, czy dana feature jest włączona.
 * Jeśli nie ma wpisu w mapie, loguje ostrzeżenie i zwraca false.
 */
export function isFeatureEnabled(feature: string): boolean {
  const key = feature.toLowerCase()
  if (Object.prototype.hasOwnProperty.call(featureFlagMap, key)) {
    return featureFlagMap[key]
  }

  console.warn(
    `⚠️ Feature flag "${feature}" is not defined for environment "${currentEnvironment}". Defaulting to false.`
  )
  return false
}

/**
 * Zwraca wszystkie załadowane flagi jako obiekt.
 */
export function getAllFeatureFlags(): Record<string, boolean> {
  return { ...featureFlagMap }
}
```

---

## 2. Konfiguracja plików `.env`

W katalogu projektu (lub w ustawieniach Vercel/CI) dodaj:

```bash
# środowisko dla backendu (NODE)
ENV_NAME=local
FEATURE_DASHBOARD=true
FEATURE_EDUCATION=false
FEATURE_ALERTS=false

# jeśli chcesz używać flag na froncie (Next.js)
NEXT_PUBLIC_ENV_NAME=local
NEXT_PUBLIC_FEATURE_DASHBOARD=true
NEXT_PUBLIC_FEATURE_EDUCATION=false
NEXT_PUBLIC_FEATURE_ALERTS=false
```

---

## 3. Użycie w kodzie

### 3.1. W API Routes

```typescript
import { isFeatureEnabled } from '@/app/features/featureFlags'

export function GET(req: Request) {
  if (!isFeatureEnabled('alerts')) {
    return new Response(null, { status: 404 })
  }
  // ... obsługa endpointu
}
```

### 3.2. W Komponentach React

```tsx
import { isFeatureEnabled } from '@/app/features/featureFlags'

export function EducationSection() {
  return isFeatureEnabled('education')
    ? <EducationForm />
    : <ComingSoonBanner />
}
```

### 3.3. W `@/components/ui/header.tsx`

```tsx
import { isFeatureEnabled } from '@/app/features/featureFlags'

const filteredNav = navItems.filter(item => isFeatureEnabled(item.name.toLowerCase()))
```

---

> ⚠️ Jeśli flaga nie jest zdefiniowana, domyślnie zwraca `false` i loguje ostrzeżenie w konsoli. 