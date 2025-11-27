/**
 * Debounce 옵션
 */
export interface DebounceOptions {
  /** 첫 호출 즉시 실행 (기본 false) */
  leading?: boolean;
  /** 마지막 호출 실행 (기본 true) */
  trailing?: boolean;
  /** 최대 대기 시간 (ms) */
  maxWait?: number;
}

/**
 * Debounce된 함수 타입
 */
export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  /** 대기 중인 호출 취소 */
  cancel: () => void;
  /** 대기 중인 호출 즉시 실행 */
  flush: () => void;
  /** 대기 중 여부 */
  pending: () => boolean;
}

/**
 * 함수 호출을 지연시키는 debounce 함수
 *
 * @example
 * ```tsx
 * const debouncedSearch = debounce((query: string) => {
 *   fetchSearchResults(query);
 * }, 300);
 *
 * // 입력할 때마다 호출하지만 실제 검색은 300ms 후
 * input.addEventListener('input', (e) => {
 *   debouncedSearch(e.target.value);
 * });
 *
 * // 취소
 * debouncedSearch.cancel();
 *
 * // 즉시 실행
 * debouncedSearch.flush();
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const { leading = false, trailing = true, maxWait } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let maxTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;

  const invokeFunc = () => {
    const args = lastArgs;
    lastArgs = null;
    lastInvokeTime = Date.now();

    if (args) {
      fn(...args);
    }
  };

  const startTimer = (pendingFunc: () => void, wait: number) => {
    return setTimeout(pendingFunc, wait);
  };

  const cancelTimer = (id: ReturnType<typeof setTimeout> | null) => {
    if (id !== null) {
      clearTimeout(id);
    }
  };

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - (lastCallTime ?? 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };

  const shouldInvoke = (time: number) => {
    if (lastCallTime === null) {
      return true;
    }

    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  const timerExpired = () => {
    const time = Date.now();

    if (shouldInvoke(time)) {
      return trailingEdge();
    }

    timeoutId = startTimer(timerExpired, remainingWait(time));
  };

  const trailingEdge = () => {
    timeoutId = null;

    if (trailing && lastArgs) {
      invokeFunc();
    }

    lastArgs = null;
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime = time;

    if (maxWait !== undefined) {
      maxTimeoutId = startTimer(() => {
        if (lastArgs) {
          invokeFunc();
        }
      }, maxWait);
    }

    if (leading) {
      invokeFunc();
    }
  };

  const debounced = (...args: Parameters<T>): void => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        leadingEdge(time);
        if (!leading) {
          timeoutId = startTimer(timerExpired, wait);
        }
        return;
      }

      if (maxWait !== undefined) {
        timeoutId = startTimer(timerExpired, wait);
        return;
      }
    }

    if (timeoutId === null) {
      timeoutId = startTimer(timerExpired, wait);
    }
  };

  debounced.cancel = () => {
    cancelTimer(timeoutId);
    cancelTimer(maxTimeoutId);
    timeoutId = null;
    maxTimeoutId = null;
    lastArgs = null;
    lastCallTime = null;
  };

  debounced.flush = () => {
    if (timeoutId !== null && lastArgs) {
      invokeFunc();
      cancelTimer(timeoutId);
      cancelTimer(maxTimeoutId);
      timeoutId = null;
      maxTimeoutId = null;
    }
  };

  debounced.pending = () => {
    return timeoutId !== null;
  };

  return debounced;
}
