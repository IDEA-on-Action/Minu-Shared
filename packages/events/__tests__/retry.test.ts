import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isRetryableError,
  calculateBackoffDelay,
  delay,
  withRetry,
} from '../src/client/retry';
import { DEFAULT_RETRY_CONFIG } from '../src/client/config';

describe('isRetryableError', () => {
  describe('HTTP 상태 코드 기반 판단', () => {
    it('500번대 서버 에러는 재시도 가능해야 한다', () => {
      expect(isRetryableError(new Error(), 500)).toBe(true);
      expect(isRetryableError(new Error(), 502)).toBe(true);
      expect(isRetryableError(new Error(), 503)).toBe(true);
      expect(isRetryableError(new Error(), 599)).toBe(true);
    });

    it('429 Too Many Requests는 재시도 가능해야 한다', () => {
      expect(isRetryableError(new Error(), 429)).toBe(true);
    });

    it('408 Request Timeout은 재시도 가능해야 한다', () => {
      expect(isRetryableError(new Error(), 408)).toBe(true);
    });

    it('4xx 클라이언트 에러 (429, 408 제외)는 재시도 불가해야 한다', () => {
      expect(isRetryableError(new Error(), 400)).toBe(false);
      expect(isRetryableError(new Error(), 401)).toBe(false);
      expect(isRetryableError(new Error(), 403)).toBe(false);
      expect(isRetryableError(new Error(), 404)).toBe(false);
      expect(isRetryableError(new Error(), 422)).toBe(false);
    });

    it('200번대 성공 코드는 재시도 불가해야 한다', () => {
      expect(isRetryableError(new Error(), 200)).toBe(false);
      expect(isRetryableError(new Error(), 201)).toBe(false);
      expect(isRetryableError(new Error(), 204)).toBe(false);
    });
  });

  describe('에러 타입 기반 판단', () => {
    it('네트워크 에러 (TypeError: fetch)는 재시도 가능해야 한다', () => {
      const fetchError = new TypeError('Failed to fetch');
      expect(isRetryableError(fetchError)).toBe(true);
    });

    it('네트워크 에러 (TypeError: network)는 재시도 가능해야 한다', () => {
      const networkError = new TypeError('network error');
      expect(isRetryableError(networkError)).toBe(true);
    });

    it('일반 TypeError는 재시도 불가해야 한다', () => {
      const typeError = new TypeError('Cannot read property of undefined');
      expect(isRetryableError(typeError)).toBe(false);
    });

    it('일반 Error는 재시도 불가해야 한다', () => {
      expect(isRetryableError(new Error('Some error'))).toBe(false);
    });
  });

  describe('에러 객체의 statusCode 속성', () => {
    it('에러 객체에 statusCode가 있으면 해당 값으로 판단해야 한다', () => {
      const error = new Error('Server error') as Error & { statusCode?: number };
      error.statusCode = 500;
      expect(isRetryableError(error)).toBe(true);
    });
  });
});

describe('calculateBackoffDelay', () => {
  it('첫 번째 시도(attempt=0)는 initialDelayMs 근처 값을 반환해야 한다', () => {
    const config = { ...DEFAULT_RETRY_CONFIG };
    const delay = calculateBackoffDelay(0, config);

    // 지터가 있으므로 범위로 검증 (initialDelay ~ initialDelay * 1.2)
    expect(delay).toBeGreaterThanOrEqual(config.initialDelayMs);
    expect(delay).toBeLessThanOrEqual(config.initialDelayMs * 1.2);
  });

  it('시도 횟수가 증가하면 지연 시간이 지수적으로 증가해야 한다', () => {
    const config = { ...DEFAULT_RETRY_CONFIG };
    const delay0 = calculateBackoffDelay(0, config);
    const delay1 = calculateBackoffDelay(1, config);
    const delay2 = calculateBackoffDelay(2, config);

    // 대략적으로 2배씩 증가해야 함 (지터 때문에 정확하지 않음)
    expect(delay1).toBeGreaterThan(delay0);
    expect(delay2).toBeGreaterThan(delay1);
  });

  it('지연 시간은 maxDelayMs를 초과하지 않아야 한다', () => {
    const config = { ...DEFAULT_RETRY_CONFIG, maxDelayMs: 5000 };

    // 많은 재시도 횟수에도 maxDelayMs를 초과하지 않아야 함
    for (let attempt = 0; attempt < 20; attempt++) {
      const delay = calculateBackoffDelay(attempt, config);
      expect(delay).toBeLessThanOrEqual(config.maxDelayMs);
    }
  });

  it('지터가 적용되어 매번 다른 값을 반환할 수 있어야 한다', () => {
    const config = { ...DEFAULT_RETRY_CONFIG };
    const delays = new Set<number>();

    // 여러 번 호출해서 다양한 값이 나오는지 확인
    for (let i = 0; i < 100; i++) {
      delays.add(calculateBackoffDelay(0, config));
    }

    // 모든 값이 완전히 같지는 않아야 함 (지터 때문에)
    expect(delays.size).toBeGreaterThan(1);
  });
});

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('지정된 시간만큼 지연되어야 한다', async () => {
    const delayMs = 1000;
    let resolved = false;

    const promise = delay(delayMs).then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);

    vi.advanceTimersByTime(delayMs - 1);
    await Promise.resolve(); // 마이크로태스크 플러시
    expect(resolved).toBe(false);

    vi.advanceTimersByTime(1);
    await promise;
    expect(resolved).toBe(true);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('성공하면 결과를 반환해야 한다', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn, DEFAULT_RETRY_CONFIG);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('재시도 가능한 에러 시 maxRetries까지 재시도해야 한다', async () => {
    const error = new Error('Server error') as Error & { statusCode?: number };
    error.statusCode = 500;

    const fn = vi.fn().mockRejectedValue(error);
    const config = { ...DEFAULT_RETRY_CONFIG, maxRetries: 3 };

    // Promise를 미리 생성하고 catch로 에러 처리 준비
    let caughtError: Error | null = null;
    const promise = withRetry(fn, config).catch((e) => {
      caughtError = e;
    });

    // 각 재시도마다 타이머 진행
    for (let i = 0; i < config.maxRetries; i++) {
      await vi.runAllTimersAsync();
    }

    await promise;
    expect(caughtError).not.toBeNull();
    expect(caughtError?.message).toBe('Server error');
    expect(fn).toHaveBeenCalledTimes(config.maxRetries + 1); // 초기 시도 + 재시도
  });

  it('재시도 불가능한 에러 시 즉시 throw해야 한다', async () => {
    const error = new Error('Bad request') as Error & { statusCode?: number };
    error.statusCode = 400;

    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, DEFAULT_RETRY_CONFIG)).rejects.toThrow('Bad request');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('재시도 중 성공하면 결과를 반환해야 한다', async () => {
    const error = new Error('Server error') as Error & { statusCode?: number };
    error.statusCode = 500;

    const fn = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');

    const promise = withRetry(fn, DEFAULT_RETRY_CONFIG);

    // 타이머 진행
    await vi.runAllTimersAsync();
    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('커스텀 isRetryable 함수를 사용할 수 있어야 한다', async () => {
    const error = new Error('Custom error');
    const fn = vi.fn().mockRejectedValue(error);
    const customIsRetryable = vi.fn().mockReturnValue(false);

    await expect(
      withRetry(fn, DEFAULT_RETRY_CONFIG, customIsRetryable)
    ).rejects.toThrow('Custom error');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(customIsRetryable).toHaveBeenCalledWith(error);
  });
});
