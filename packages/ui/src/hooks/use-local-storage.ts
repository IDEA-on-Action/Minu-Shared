import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage 옵션
 */
export interface UseLocalStorageOptions<T> {
  /** 직렬화 함수 (기본: JSON.stringify) */
  serializer?: (value: T) => string;
  /** 역직렬화 함수 (기본: JSON.parse) */
  deserializer?: (value: string) => T;
  /** 초기화 시 storage 이벤트 동기화 여부 (기본: true) */
  syncOnMount?: boolean;
}

/**
 * localStorage 상태 관리 훅
 *
 * @param key - localStorage 키
 * @param defaultValue - 기본값
 * @param options - 옵션
 * @returns [저장된 값, 값 설정 함수, 값 제거 함수]
 *
 * @example
 * ```tsx
 * // 기본 사용
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 *
 * // 객체 저장
 * const [user, setUser] = useLocalStorage<User | null>('user', null);
 *
 * // 커스텀 직렬화
 * const [date, setDate] = useLocalStorage('lastVisit', new Date(), {
 *   serializer: (d) => d.toISOString(),
 *   deserializer: (s) => new Date(s),
 * });
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncOnMount = true,
  } = options;

  // SSR 안전한 초기값 읽기
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? deserializer(item) : defaultValue;
    } catch (error) {
      console.warn(`useLocalStorage: "${key}" 읽기 실패`, error);
      return defaultValue;
    }
  }, [key, defaultValue, deserializer]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 값 설정
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof window === 'undefined') {
        console.warn('useLocalStorage: 서버 환경에서는 localStorage를 사용할 수 없습니다.');
        return;
      }

      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, serializer(valueToStore));

        // 같은 탭의 다른 컴포넌트에 변경 알림
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: serializer(valueToStore),
            storageArea: window.localStorage,
          })
        );
      } catch (error) {
        console.warn(`useLocalStorage: "${key}" 저장 실패`, error);
      }
    },
    [key, serializer, storedValue]
  );

  // 값 제거
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(defaultValue);

      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: null,
          storageArea: window.localStorage,
        })
      );
    } catch (error) {
      console.warn(`useLocalStorage: "${key}" 제거 실패`, error);
    }
  }, [key, defaultValue]);

  // 다른 탭/윈도우에서 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined' || !syncOnMount) {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key || event.storageArea !== window.localStorage) {
        return;
      }

      try {
        const newValue = event.newValue !== null ? deserializer(event.newValue) : defaultValue;
        setStoredValue(newValue);
      } catch (error) {
        console.warn(`useLocalStorage: "${key}" 동기화 실패`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, defaultValue, deserializer, syncOnMount]);

  // 마운트 시 최신 값으로 동기화
  useEffect(() => {
    if (syncOnMount) {
      setStoredValue(readValue());
    }
  }, [syncOnMount, readValue]);

  return [storedValue, setValue, removeValue];
}
