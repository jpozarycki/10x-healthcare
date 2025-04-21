import '@testing-library/jest-dom';
import { expect } from 'vitest';

// Add custom matchers to extend Vitest
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

// Add any custom setup here (e.g., mocks, etc.) 