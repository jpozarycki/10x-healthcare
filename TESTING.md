# Testing Documentation

This project uses two main testing strategies:

1. Unit tests with Vitest
2. End-to-end tests with Playwright

## Prerequisites

- Bun (package manager used for this project)

## Unit Testing with Vitest

Unit tests focus on testing isolated components and business logic.

### Running Unit Tests

```bash
# Run tests once
bun test

# Run tests in watch mode
bun test:watch

# Run tests with UI
bun test:ui

# Run tests with coverage
bun test:coverage
```

### Writing Unit Tests

- Create test files with `.test.ts` or `.test.tsx` extension
- Place tests in the `__tests__/unit` directory or co-locate with the source files
- Use the testing utilities from `@testing-library/react` for component tests

Example component test:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from '@/path/to/component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## E2E Testing with Playwright

End-to-end tests verify the application from a user's perspective across different browsers.

### Running E2E Tests

```bash
# Run all E2E tests
bun test:e2e

# Run E2E tests with UI
bun test:e2e:ui

# Run E2E tests in debug mode
bun test:e2e:debug
```

### Writing E2E Tests

- Create test files with `.spec.ts` extension in the `e2e/__tests__` directory
- Tests run against your locally running application (automatically started by Playwright)

Example E2E test:
```ts
import { test, expect } from '@playwright/test';

test('navigates to the dashboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page).toHaveURL('/dashboard');
});
```

## CI/CD Integration

Tests run automatically on GitHub Actions:
- On every push to the `main` branch
- On every pull request to the `main` branch

The workflow:
1. Runs unit tests with coverage reporting
2. Runs E2E tests if unit tests pass
3. Uploads test reports as artifacts

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Mocking External Services**: Use mocks for external APIs and services
3. **Coverage**: Aim for high test coverage of critical business logic
4. **Testing UI Components**: Focus on behavior rather than implementation details
5. **Accessibility Testing**: Include tests for accessibility compliance
6. **Performance Testing**: Consider adding performance tests for critical paths 