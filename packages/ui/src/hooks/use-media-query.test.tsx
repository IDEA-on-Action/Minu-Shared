import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './use-media-query';

// matchMedia mock
const createMatchMediaMock = (matches: boolean) => {
  const listeners: Array<(event: MediaQueryListEvent) => void> = [];

  return {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        listeners.push(handler);
      }
    }),
    removeEventListener: vi.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        const index = listeners.indexOf(handler);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }),
    dispatchEvent: vi.fn((event: MediaQueryListEvent) => {
      listeners.forEach((listener) => listener(event));
      return true;
    }),
    _listeners: listeners,
  };
};

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    matchMediaMock = createMatchMediaMock(false);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => matchMediaMock),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 동작', () => {
    it('미디어 쿼리가 매칭되지 않으면 false를 반환해야 한다', () => {
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
      expect(result.current).toBe(false);
    });

    it('미디어 쿼리가 매칭되면 true를 반환해야 한다', () => {
      matchMediaMock.matches = true;
      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
      expect(result.current).toBe(true);
    });

    it('matchMedia를 올바른 쿼리로 호출해야 한다', () => {
      const query = '(min-width: 1024px)';
      renderHook(() => useMediaQuery(query));
      expect(window.matchMedia).toHaveBeenCalledWith(query);
    });
  });

  describe('SSR 지원', () => {
    it('matchMedia가 없는 환경에서 false를 반환해야 한다', () => {
      // matchMedia를 undefined로 만들어 SSR 환경 시뮬레이션
      const originalMatchMedia = window.matchMedia;
      // @ts-expect-error - SSR 테스트를 위해 matchMedia를 undefined로 설정
      delete window.matchMedia;

      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
      expect(result.current).toBe(false);

      // 복원
      window.matchMedia = originalMatchMedia;
    });

    it('기본값을 지정할 수 있어야 한다', () => {
      // matchMedia를 undefined로 만들어 SSR 환경 시뮬레이션
      const originalMatchMedia = window.matchMedia;
      // @ts-expect-error - SSR 테스트를 위해 matchMedia를 undefined로 설정
      delete window.matchMedia;

      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)', true));
      expect(result.current).toBe(true);

      // 복원
      window.matchMedia = originalMatchMedia;
    });
  });

  describe('반응형 업데이트', () => {
    it('미디어 쿼리 변경 시 자동으로 업데이트되어야 한다', () => {
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

      expect(result.current).toBe(false);

      // 미디어 쿼리 변경 시뮬레이션
      act(() => {
        matchMediaMock.matches = true;
        const event = new Event('change') as MediaQueryListEvent;
        Object.defineProperty(event, 'matches', { value: true });
        Object.defineProperty(event, 'media', { value: '(max-width: 768px)' });
        matchMediaMock.dispatchEvent(event);
      });

      expect(result.current).toBe(true);
    });

    it('언마운트 시 이벤트 리스너를 정리해야 한다', () => {
      const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));

      expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );

      unmount();

      expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });
  });

  describe('다양한 미디어 쿼리', () => {
    it('prefers-color-scheme을 감지해야 한다', () => {
      matchMediaMock.matches = true;
      const { result } = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'));
      expect(result.current).toBe(true);
    });

    it('orientation을 감지해야 한다', () => {
      matchMediaMock.matches = true;
      const { result } = renderHook(() => useMediaQuery('(orientation: portrait)'));
      expect(result.current).toBe(true);
    });

    it('prefers-reduced-motion을 감지해야 한다', () => {
      matchMediaMock.matches = true;
      const { result } = renderHook(() => useMediaQuery('(prefers-reduced-motion: reduce)'));
      expect(result.current).toBe(true);
    });

    it('복잡한 미디어 쿼리를 지원해야 한다', () => {
      matchMediaMock.matches = true;
      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
      );
      expect(result.current).toBe(true);
    });
  });

  describe('쿼리 변경', () => {
    it('쿼리가 변경되면 새 쿼리를 평가해야 한다', () => {
      const { rerender } = renderHook(
        ({ query }) => useMediaQuery(query),
        { initialProps: { query: '(max-width: 768px)' } }
      );

      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');

      rerender({ query: '(min-width: 1024px)' });

      expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
    });

    it('쿼리 변경 시 이전 리스너를 정리해야 한다', () => {
      const { rerender } = renderHook(
        ({ query }) => useMediaQuery(query),
        { initialProps: { query: '(max-width: 768px)' } }
      );

      const firstCallCount = matchMediaMock.addEventListener.mock.calls.length;

      rerender({ query: '(min-width: 1024px)' });

      // 이전 리스너가 제거되고 새 리스너가 추가되어야 함
      expect(matchMediaMock.removeEventListener).toHaveBeenCalled();
      expect(matchMediaMock.addEventListener.mock.calls.length).toBeGreaterThan(firstCallCount);
    });
  });

  describe('여러 쿼리 동시 사용', () => {
    it('여러 인스턴스가 독립적으로 작동해야 한다', () => {
      matchMediaMock.matches = false;
      const { result: result1 } = renderHook(() => useMediaQuery('(max-width: 768px)'));

      // 두 번째 쿼리를 위한 새 mock
      const matchMediaMock2 = createMatchMediaMock(true);
      const matchMediaFn = vi.fn((query: string) => {
        if (query === '(min-width: 1024px)') {
          return matchMediaMock2;
        }
        return matchMediaMock;
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaFn,
      });

      const { result: result2 } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

      expect(result1.current).toBe(false);
      expect(result2.current).toBe(true);
    });
  });

  describe('에지 케이스', () => {
    it('빈 문자열 쿼리를 처리해야 한다', () => {
      const { result } = renderHook(() => useMediaQuery(''));
      expect(result.current).toBe(false);
    });

    it('잘못된 쿼리를 처리해야 한다', () => {
      matchMediaMock.matches = false;
      const { result } = renderHook(() => useMediaQuery('invalid query'));
      expect(result.current).toBe(false);
    });
  });
});
