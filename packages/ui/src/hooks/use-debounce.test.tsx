import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from './use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('초기값', () => {
    it('초기 값을 즉시 반환해야 한다', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('숫자 값을 디바운스할 수 있어야 한다', () => {
      const { result } = renderHook(() => useDebounce(0, 500));
      expect(result.current).toBe(0);
    });

    it('객체 값을 디바운스할 수 있어야 한다', () => {
      const obj = { name: 'test', count: 0 };
      const { result } = renderHook(() => useDebounce(obj, 500));
      expect(result.current).toBe(obj);
    });

    it('배열 값을 디바운스할 수 있어야 한다', () => {
      const arr = [1, 2, 3];
      const { result } = renderHook(() => useDebounce(arr, 500));
      expect(result.current).toBe(arr);
    });
  });

  describe('디바운싱 동작', () => {
    it('값이 변경되면 지연 시간 후에 업데이트해야 한다', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBe('initial');

      // 값 변경
      rerender({ value: 'updated' });
      expect(result.current).toBe('initial'); // 아직 업데이트 안 됨

      // 500ms 후
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });

    it('연속된 변경은 마지막 값만 반영해야 한다', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      // 연속 변경
      rerender({ value: 'change1' });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'change2' });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'change3' });

      // 마지막 변경 시점부터 500ms 경과
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('change3');
    });

    it('지연 시간 전에 여러 번 변경해도 타이머는 리셋되어야 한다', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'change1' });
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current).toBe('initial'); // 아직 업데이트 안 됨

      // 타이머 리셋
      rerender({ value: 'change2' });
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current).toBe('initial'); // 여전히 업데이트 안 됨

      // 추가 100ms (총 500ms)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toBe('change2');
    });
  });

  describe('지연 시간 설정', () => {
    it('다양한 지연 시간을 설정할 수 있어야 한다', () => {
      const { result: result300, rerender: rerender300 } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      const { result: result1000, rerender: rerender1000 } = renderHook(
        ({ value }) => useDebounce(value, 1000),
        { initialProps: { value: 'initial' } }
      );

      rerender300({ value: 'updated' });
      rerender1000({ value: 'updated' });

      // 300ms 후
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result300.current).toBe('updated');
      expect(result1000.current).toBe('initial'); // 아직 업데이트 안 됨

      // 추가 700ms (총 1000ms)
      act(() => {
        vi.advanceTimersByTime(700);
      });

      expect(result1000.current).toBe('updated');
    });

    it('0ms 지연도 처리할 수 있어야 한다', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 0),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('언마운트 처리', () => {
    it('언마운트 시 타이머를 정리해야 한다', () => {
      const { rerender, unmount } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'updated' });

      // 언마운트
      unmount();

      // 타이머가 실행되어도 오류 없이 처리되어야 함
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // 테스트가 오류 없이 통과해야 함
      expect(true).toBe(true);
    });
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('기본 동작', () => {
    it('콜백 함수를 지연 시간 후에 호출해야 한다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('test');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith('test');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('연속 호출 시 마지막 호출만 실행해야 한다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('call1');
        result.current('call2');
        result.current('call3');
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith('call3');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('여러 인자를 전달할 수 있어야 한다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, 500)
      );

      act(() => {
        result.current('arg1', 'arg2', 'arg3');
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('타이머 리셋', () => {
    it('지연 시간 내에 다시 호출하면 타이머가 리셋되어야 한다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('first');
      });

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        result.current('second');
      });

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledWith('second');
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('독립적인 호출', () => {
    it('지연 시간이 지난 후의 호출은 독립적으로 처리되어야 한다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      // 첫 번째 호출
      act(() => {
        result.current('first');
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith('first');

      // 두 번째 호출
      act(() => {
        result.current('second');
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith('second');
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('언마운트 처리', () => {
    it('언마운트 시 대기 중인 콜백을 취소해야 한다', () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() =>
        useDebouncedCallback(callback, 500)
      );

      act(() => {
        result.current('test');
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('콜백 참조 변경', () => {
    it('콜백 함수가 변경되면 새 콜백을 사용해야 한다', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const { result, rerender } = renderHook(
        ({ cb }) => useDebouncedCallback(cb, 500),
        { initialProps: { cb: callback1 } }
      );

      act(() => {
        result.current('test');
      });

      // 콜백 변경
      rerender({ cb: callback2 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('test');
    });
  });
});
