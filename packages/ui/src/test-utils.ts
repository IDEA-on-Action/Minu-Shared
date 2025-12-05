import { axe, toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

expect.extend(toHaveNoViolations);

// axe 동시 실행 방지를 위한 전역 큐
let axeQueue: Promise<void> = Promise.resolve();
let isAxeRunning = false;

/**
 * axe 접근성 테스트를 안전하게 실행합니다.
 * 이전 axe 실행이 완료될 때까지 대기합니다.
 */
export async function runAxe(container: Element): Promise<void> {
  // 큐에 새 작업 추가 - 이전 작업이 완료된 후 실행
  const currentTask = axeQueue.then(async () => {
    // 추가 안전장치: 이미 실행 중이면 대기
    while (isAxeRunning) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    isAxeRunning = true;
    try {
      const results = await axe(container, {
        rules: {
          // color-contrast 규칙은 jsdom에서 정확하지 않음
          'color-contrast': { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    } finally {
      isAxeRunning = false;
    }
  });

  axeQueue = currentTask.catch(() => {
    // 에러 발생해도 큐는 계속 진행
    isAxeRunning = false;
  });

  await currentTask;
}

/**
 * axe 상태를 초기화합니다.
 * 테스트 간 격리를 위해 사용합니다.
 */
export function resetAxe(): void {
  isAxeRunning = false;
}
