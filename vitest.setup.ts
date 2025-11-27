import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// jest-axe 매처 확장
expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});
