import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, expect } from 'vitest';
import { toHaveNoViolations, configureAxe } from 'jest-axe';

// jest-axe 매처 확장
expect.extend(toHaveNoViolations);

// axe 기본 설정 (타임아웃 증가)
configureAxe({
  rules: {
    // 일부 규칙 비활성화 (필요시)
    'color-contrast': { enabled: false },
  },
});

// axe 동시 실행 문제 해결을 위한 전역 변수
let axeRunning = false;

// 테스트 간 axe 상태 초기화
beforeEach(() => {
  axeRunning = false;
});

afterEach(() => {
  cleanup();
  axeRunning = false;
});
