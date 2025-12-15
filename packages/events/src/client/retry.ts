import type { RetryConfig } from './config';

/**
 * HTTP 에러 인터페이스
 */
export interface HttpError extends Error {
  statusCode?: number;
}

/**
 * 재시도 가능한 에러인지 판단
 *
 * @param error - 발생한 에러
 * @param statusCode - HTTP 상태 코드 (옵션)
 * @returns 재시도 가능 여부
 */
export function isRetryableError(error: unknown, statusCode?: number): boolean {
  // 네트워크 에러 (fetch 실패)
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    if (message.includes('fetch') || message.includes('network')) {
      return true;
    }
  }

  // HTTP 상태 코드 기반 판단
  const code = statusCode ?? (error as HttpError)?.statusCode;
  if (code !== undefined) {
    // 5xx 서버 에러
    if (code >= 500 && code < 600) {
      return true;
    }
    // 429 Too Many Requests
    if (code === 429) {
      return true;
    }
    // 408 Request Timeout
    if (code === 408) {
      return true;
    }
  }

  return false;
}

/**
 * 지수 백오프 지연 시간 계산
 *
 * @param attempt - 현재 재시도 횟수 (0부터 시작)
 * @param config - 재시도 설정
 * @returns 지연 시간 (ms)
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig
): number {
  const { initialDelayMs, maxDelayMs, backoffMultiplier } = config;

  // 지수 백오프: initialDelay * multiplier^attempt
  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt);

  // 지터 추가 (0-20% 랜덤) - thundering herd 방지
  const jitter = exponentialDelay * Math.random() * 0.2;

  // maxDelay 상한선 적용
  return Math.min(exponentialDelay + jitter, maxDelayMs);
}

/**
 * 지연 실행
 *
 * @param ms - 지연 시간 (ms)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 재시도 결과
 */
export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

/**
 * 재시도 래퍼
 *
 * @param fn - 실행할 비동기 함수
 * @param config - 재시도 설정
 * @param isRetryable - 재시도 가능 여부 판단 함수
 * @returns 실행 결과
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  isRetryable: (error: unknown) => boolean = isRetryableError
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 마지막 시도이거나 재시도 불가능한 에러면 즉시 throw
      if (attempt === config.maxRetries || !isRetryable(error)) {
        throw error;
      }

      // 백오프 지연
      const delayMs = calculateBackoffDelay(attempt, config);
      await delay(delayMs);
    }
  }

  // 이 코드에 도달하면 안 되지만, TypeScript 타입 안전성을 위해
  throw lastError;
}
