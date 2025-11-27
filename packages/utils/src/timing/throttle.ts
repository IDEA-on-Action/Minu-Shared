/**
 * Throttle 옵션
 */
export interface ThrottleOptions {
  /** 첫 호출 즉시 실행 (기본 true) */
  leading?: boolean;
  /** 마지막 호출 실행 (기본 true) */
  trailing?: boolean;
}

/**
 * Throttle된 함수 타입
 */
export interface ThrottledFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  /** 대기 중인 호출 취소 */
  cancel: () => void;
  /** 대기 중 여부 */
  pending: () => boolean;
}

/**
 * 함수 호출 빈도를 제한하는 throttle 함수
 *
 * @example
 * ```tsx
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition();
 * }, 100);
 *
 * // 스크롤할 때마다 호출하지만 100ms마다 한 번만 실행
 * window.addEventListener('scroll', throttledScroll);
 *
 * // 취소
 * throttledScroll.cancel();
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options: ThrottleOptions = {}
): ThrottledFunction<T> {
  const { leading = true, trailing = true } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;

  const invokeFunc = (args: Parameters<T>) => {
    lastCallTime = Date.now();
    fn(...args);
  };

  const trailingEdge = () => {
    timeoutId = null;

    if (trailing && lastArgs) {
      invokeFunc(lastArgs);
      lastArgs = null;

      // trailing 호출 후 다시 wait 시간 대기
      timeoutId = setTimeout(trailingEdge, wait);
    }
  };

  const throttled = (...args: Parameters<T>): void => {
    const now = Date.now();
    const timeSinceLastCall = lastCallTime ? now - lastCallTime : wait;

    // 마지막 호출 저장 (trailing용)
    lastArgs = args;

    // wait 시간이 지났거나 첫 호출인 경우
    if (timeSinceLastCall >= wait) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (leading) {
        invokeFunc(args);
        lastArgs = null;
      }

      // trailing을 위한 타이머 설정
      if (trailing) {
        timeoutId = setTimeout(trailingEdge, wait);
      }
    } else if (timeoutId === null && trailing) {
      // 아직 wait 시간이 안 지났고, 타이머가 없으면 설정
      const remainingTime = wait - timeSinceLastCall;
      timeoutId = setTimeout(trailingEdge, remainingTime);
    }
  };

  throttled.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastCallTime = null;
  };

  throttled.pending = () => {
    return timeoutId !== null;
  };

  return throttled;
}
