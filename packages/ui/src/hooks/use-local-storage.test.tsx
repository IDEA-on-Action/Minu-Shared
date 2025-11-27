import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './use-local-storage';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('초기값', () => {
    it('localStorage에 값이 없으면 기본값을 반환해야 한다', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      expect(result.current[0]).toBe('default');
    });

    it('localStorage에 값이 있으면 해당 값을 반환해야 한다', () => {
      localStorageMock.setItem('test-key', JSON.stringify('stored-value'));
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      expect(result.current[0]).toBe('stored-value');
    });

    it('객체를 기본값으로 사용할 수 있어야 한다', () => {
      const defaultValue = { name: 'test', count: 0 };
      const { result } = renderHook(() => useLocalStorage('test-key', defaultValue));
      expect(result.current[0]).toEqual(defaultValue);
    });

    it('배열을 기본값으로 사용할 수 있어야 한다', () => {
      const defaultValue = [1, 2, 3];
      const { result } = renderHook(() => useLocalStorage('test-key', defaultValue));
      expect(result.current[0]).toEqual(defaultValue);
    });

    it('null을 기본값으로 사용할 수 있어야 한다', () => {
      const { result } = renderHook(() => useLocalStorage<string | null>('test-key', null));
      expect(result.current[0]).toBeNull();
    });
  });

  describe('setValue', () => {
    it('값을 설정하고 localStorage에 저장해야 한다', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
    });

    it('함수 업데이터를 지원해야 한다', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(1);

      act(() => {
        result.current[1]((prev) => prev + 5);
      });

      expect(result.current[0]).toBe(6);
    });

    it('객체를 저장할 수 있어야 한다', () => {
      const { result } = renderHook(() =>
        useLocalStorage('user', { name: '', age: 0 })
      );

      act(() => {
        result.current[1]({ name: 'John', age: 30 });
      });

      expect(result.current[0]).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('removeValue', () => {
    it('값을 제거하고 기본값으로 되돌려야 한다', () => {
      localStorageMock.setItem('test-key', JSON.stringify('stored'));
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

      expect(result.current[0]).toBe('stored');

      act(() => {
        result.current[2]();
      });

      expect(result.current[0]).toBe('default');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('커스텀 직렬화', () => {
    it('커스텀 serializer를 사용해야 한다', () => {
      const customSerializer = vi.fn((value: Date) => value.toISOString());
      const date = new Date('2024-01-01');

      const { result } = renderHook(() =>
        useLocalStorage('date-key', date, {
          serializer: customSerializer,
          deserializer: (s) => new Date(s),
        })
      );

      act(() => {
        result.current[1](new Date('2024-06-15'));
      });

      expect(customSerializer).toHaveBeenCalled();
    });

    it('커스텀 deserializer를 사용해야 한다', () => {
      const dateString = '2024-01-01T00:00:00.000Z';
      localStorageMock.setItem('date-key', dateString);

      const customDeserializer = vi.fn((s: string) => new Date(s));

      const { result } = renderHook(() =>
        useLocalStorage('date-key', new Date(), {
          serializer: (d) => d.toISOString(),
          deserializer: customDeserializer,
        })
      );

      expect(customDeserializer).toHaveBeenCalledWith(dateString);
      expect(result.current[0]).toBeInstanceOf(Date);
    });
  });

  describe('storage 이벤트', () => {
    it('storage 이벤트에 반응해야 한다', () => {
      const { result } = renderHook(() => useLocalStorage('sync-key', 'initial'));

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'sync-key',
            newValue: JSON.stringify('from-other-tab'),
            storageArea: localStorage,
          })
        );
      });

      expect(result.current[0]).toBe('from-other-tab');
    });

    it('다른 키의 storage 이벤트는 무시해야 한다', () => {
      const { result } = renderHook(() => useLocalStorage('my-key', 'initial'));

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'other-key',
            newValue: JSON.stringify('other-value'),
            storageArea: localStorage,
          })
        );
      });

      expect(result.current[0]).toBe('initial');
    });

    it('syncOnMount가 false면 storage 이벤트를 무시해야 한다', () => {
      const { result } = renderHook(() =>
        useLocalStorage('sync-key', 'initial', { syncOnMount: false })
      );

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'sync-key',
            newValue: JSON.stringify('from-other-tab'),
            storageArea: localStorage,
          })
        );
      });

      expect(result.current[0]).toBe('initial');
    });

    it('newValue가 null이면 기본값으로 되돌려야 한다', () => {
      localStorageMock.setItem('delete-key', JSON.stringify('stored'));
      const { result } = renderHook(() => useLocalStorage('delete-key', 'default'));

      expect(result.current[0]).toBe('stored');

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'delete-key',
            newValue: null,
            storageArea: localStorage,
          })
        );
      });

      expect(result.current[0]).toBe('default');
    });
  });

  describe('에러 처리', () => {
    it('잘못된 JSON을 파싱할 때 기본값을 반환해야 한다', () => {
      localStorageMock.setItem('bad-json', 'not-valid-json');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useLocalStorage('bad-json', 'default'));

      expect(result.current[0]).toBe('default');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('키 변경', () => {
    it('키가 변경되면 새 키의 값을 읽어야 한다', () => {
      localStorageMock.setItem('key-a', JSON.stringify('value-a'));
      localStorageMock.setItem('key-b', JSON.stringify('value-b'));

      const { result, rerender } = renderHook(
        ({ key }) => useLocalStorage(key, 'default'),
        { initialProps: { key: 'key-a' } }
      );

      expect(result.current[0]).toBe('value-a');

      rerender({ key: 'key-b' });

      expect(result.current[0]).toBe('value-b');
    });
  });
});
