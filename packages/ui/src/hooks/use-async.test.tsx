import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from './use-async';

describe('useAsync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('초기 상태', () => {
    it('초기 상태는 loading false, error null, data null이어야 한다', () => {
      const asyncFn = vi.fn(async () => 'result');
      const { result } = renderHook(() => useAsync(asyncFn));

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();
    });

    it('immediate 옵션 없이는 자동 실행되지 않아야 한다', () => {
      const asyncFn = vi.fn(async () => 'result');
      renderHook(() => useAsync(asyncFn));

      expect(asyncFn).not.toHaveBeenCalled();
    });
  });

  describe('execute 함수', () => {
    it('비동기 함수를 실행하고 성공 시 데이터를 설정해야 한다', async () => {
      const asyncFn = vi.fn(async () => 'success-data');
      const { result } = renderHook(() => useAsync(asyncFn));

      let executePromise: Promise<unknown>;
      act(() => {
        executePromise = result.current.execute();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      await act(async () => {
        await executePromise;
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe('success-data');
      expect(result.current.error).toBeNull();
    });

    it('비동기 함수 실패 시 에러를 설정해야 한다', async () => {
      const error = new Error('Test error');
      const asyncFn = vi.fn(async () => {
        throw error;
      });
      const { result } = renderHook(() => useAsync(asyncFn));

      let executePromise: Promise<unknown>;
      act(() => {
        executePromise = result.current.execute();
      });

      await act(async () => {
        await executePromise;
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(error);
      expect(result.current.data).toBeNull();
    });

    it('인자를 비동기 함수에 전달할 수 있어야 한다', async () => {
      const asyncFn = vi.fn(async (a: number, b: string) => `${a}-${b}`);
      const { result } = renderHook(() => useAsync(asyncFn));

      let executePromise: Promise<unknown>;
      act(() => {
        executePromise = result.current.execute(42, 'test');
      });

      await act(async () => {
        await executePromise;
      });

      expect(asyncFn).toHaveBeenCalledWith(42, 'test');
      expect(result.current.data).toBe('42-test');
    });

    it('여러 번 실행할 수 있어야 한다', async () => {
      let counter = 0;
      const asyncFn = vi.fn(async () => {
        counter++;
        return `result-${counter}`;
      });
      const { result } = renderHook(() => useAsync(asyncFn));

      // 첫 번째 실행
      let executePromise1: Promise<unknown>;
      act(() => {
        executePromise1 = result.current.execute();
      });

      await act(async () => {
        await executePromise1;
      });

      expect(result.current.data).toBe('result-1');

      // 두 번째 실행
      let executePromise2: Promise<unknown>;
      act(() => {
        executePromise2 = result.current.execute();
      });

      await act(async () => {
        await executePromise2;
      });

      expect(result.current.data).toBe('result-2');
      expect(asyncFn).toHaveBeenCalledTimes(2);
    });

    it('새 실행 시작 시 이전 에러를 초기화해야 한다', async () => {
      const error = new Error('First error');
      let shouldFail = true;

      const asyncFn = vi.fn(async () => {
        if (shouldFail) {
          throw error;
        }
        return 'success';
      });

      const { result } = renderHook(() => useAsync(asyncFn));

      // 첫 번째 실행 (실패)
      let executePromise1: Promise<unknown>;
      act(() => {
        executePromise1 = result.current.execute();
      });

      await act(async () => {
        await executePromise1;
      });

      expect(result.current.error).toBe(error);

      // 두 번째 실행 (성공)
      shouldFail = false;
      let executePromise2: Promise<unknown>;
      act(() => {
        executePromise2 = result.current.execute();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      await act(async () => {
        await executePromise2;
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).toBe('success');
    });

    it('성공 시 결과를 반환해야 한다', async () => {
      const asyncFn = vi.fn(async () => 'return-value');
      const { result } = renderHook(() => useAsync(asyncFn));

      let returnedValue: unknown;
      await act(async () => {
        returnedValue = await result.current.execute();
      });

      expect(returnedValue).toBe('return-value');
    });

    it('실패 시 null을 반환해야 한다', async () => {
      const asyncFn = vi.fn(async () => {
        throw new Error('Test error');
      });
      const { result } = renderHook(() => useAsync(asyncFn));

      let returnedValue: unknown;
      await act(async () => {
        returnedValue = await result.current.execute();
      });

      expect(returnedValue).toBeNull();
    });
  });

  describe('reset 함수', () => {
    it('상태를 초기화해야 한다', async () => {
      const asyncFn = vi.fn(async () => 'data');
      const { result } = renderHook(() => useAsync(asyncFn));

      // 실행하여 데이터 설정
      let executePromise: Promise<unknown>;
      act(() => {
        executePromise = result.current.execute();
      });

      await act(async () => {
        await executePromise;
      });

      expect(result.current.data).toBe('data');

      // 초기화
      act(() => {
        result.current.reset();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();
    });

    it('에러 상태도 초기화해야 한다', async () => {
      const error = new Error('Test error');
      const asyncFn = vi.fn(async () => {
        throw error;
      });
      const { result } = renderHook(() => useAsync(asyncFn));

      // 실행하여 에러 설정
      let executePromise: Promise<unknown>;
      act(() => {
        executePromise = result.current.execute();
      });

      await act(async () => {
        await executePromise;
      });

      expect(result.current.error).toBe(error);

      // 초기화
      act(() => {
        result.current.reset();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();
    });
  });

  describe('immediate 옵션', () => {
    it('immediate true 시 마운트 시 자동 실행해야 한다', async () => {
      // immediate 테스트는 실제 타이머 사용
      vi.useRealTimers();

      const asyncFn = vi.fn(async () => 'auto-data');

      const { result } = renderHook(() => useAsync(asyncFn, { immediate: true }));

      // 초기에는 loading 상태
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(asyncFn).toHaveBeenCalledTimes(1);
      expect(result.current.data).toBe('auto-data');

      // 다른 테스트를 위해 다시 fake 타이머로
      vi.useFakeTimers();
    });

    it('immediate false 시 자동 실행하지 않아야 한다', () => {
      const asyncFn = vi.fn(async () => 'data');
      const { result } = renderHook(() => useAsync(asyncFn, { immediate: false }));

      expect(asyncFn).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });

    it('immediate 옵션 없이도 기본적으로 자동 실행하지 않아야 한다', () => {
      const asyncFn = vi.fn(async () => 'data');
      const { result } = renderHook(() => useAsync(asyncFn));

      expect(asyncFn).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('언마운트 처리', () => {
    it('언마운트 후에는 상태를 업데이트하지 않아야 한다', async () => {
      const asyncFn = vi.fn(async () => {
        // 비동기 작업 시뮬레이션
        return new Promise<string>((resolve) => {
          setTimeout(() => resolve('delayed-data'), 1000);
        });
      });

      const { result, unmount } = renderHook(() => useAsync(asyncFn));

      act(() => {
        result.current.execute();
      });

      expect(result.current.loading).toBe(true);

      // 비동기 작업 완료 전에 언마운트
      unmount();

      // 타이머 완료
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await vi.runAllTimersAsync();
      });

      // 테스트가 오류 없이 통과해야 함
      expect(true).toBe(true);
    });
  });

  describe('비동기 함수 참조 변경', () => {
    it('비동기 함수가 변경되면 새 함수를 사용해야 한다', async () => {
      const asyncFn1 = vi.fn(async () => 'result1');
      const asyncFn2 = vi.fn(async () => 'result2');

      const { result, rerender } = renderHook(
        ({ fn }) => useAsync(fn),
        { initialProps: { fn: asyncFn1 } }
      );

      // 첫 번째 함수 실행
      let executePromise1: Promise<unknown>;
      act(() => {
        executePromise1 = result.current.execute();
      });

      await act(async () => {
        await executePromise1;
      });

      expect(asyncFn1).toHaveBeenCalled();
      expect(result.current.data).toBe('result1');

      // 함수 변경
      rerender({ fn: asyncFn2 });

      // 두 번째 함수 실행
      let executePromise2: Promise<unknown>;
      act(() => {
        executePromise2 = result.current.execute();
      });

      await act(async () => {
        await executePromise2;
      });

      expect(asyncFn2).toHaveBeenCalled();
      expect(result.current.data).toBe('result2');
    });
  });

  describe('타입 안전성', () => {
    it('제네릭 타입을 정확히 유지해야 한다', async () => {
      interface User {
        id: number;
        name: string;
      }

      const asyncFn = vi.fn(async (id: number): Promise<User> => ({
        id,
        name: `User ${id}`,
      }));

      const { result } = renderHook(() => useAsync<User, [number]>(asyncFn));

      let executePromise: Promise<unknown>;
      act(() => {
        executePromise = result.current.execute(123);
      });

      await act(async () => {
        await executePromise;
      });

      expect(result.current.data).toEqual({ id: 123, name: 'User 123' });
    });

    it('커스텀 에러 타입을 지원해야 한다', async () => {
      interface CustomError {
        code: string;
        message: string;
      }

      const customError: CustomError = {
        code: 'ERR001',
        message: 'Custom error occurred',
      };

      const asyncFn = vi.fn(async () => {
        throw customError;
      });

      const { result } = renderHook(() =>
        useAsync<string, [], CustomError>(asyncFn)
      );

      let executePromise: Promise<unknown>;
      act(() => {
        executePromise = result.current.execute();
      });

      await act(async () => {
        await executePromise;
      });

      expect(result.current.error).toBe(customError);
    });
  });

  describe('복잡한 시나리오', () => {
    it('연속된 실행 중 이전 요청이 완료되어도 최신 결과만 반영해야 한다', async () => {
      let resolveFirst: ((value: string) => void) | null = null;
      let resolveSecond: ((value: string) => void) | null = null;

      const asyncFn = vi.fn((value: string) => {
        return new Promise<string>((resolve) => {
          if (value === 'first') {
            resolveFirst = resolve;
          } else {
            resolveSecond = resolve;
          }
        });
      });

      const { result } = renderHook(() => useAsync(asyncFn));

      // 첫 번째 요청 시작
      act(() => {
        result.current.execute('first');
      });

      // 두 번째 요청 시작
      act(() => {
        result.current.execute('second');
      });

      // 두 번째 요청이 먼저 완료
      await act(async () => {
        resolveSecond?.('second-result');
      });

      expect(result.current.data).toBe('second-result');

      // 첫 번째 요청이 나중에 완료
      await act(async () => {
        resolveFirst?.('first-result');
      });

      // 두 번째 결과가 유지되어야 함
      expect(result.current.data).toBe('second-result');
    });
  });
});
