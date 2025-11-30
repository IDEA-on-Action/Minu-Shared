import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * 값의 변경을 지연시키는 디바운스 훅
 *
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (ms)
 * @returns 디바운스된 값
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // API 호출
 *       fetchSearchResults(debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 *
 *   return (
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *     />
 *   );
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 지연 시간 후에 값 업데이트
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 클린업: 값이 변경되거나 언마운트 시 타이머 제거
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 콜백 함수를 디바운스하는 훅
 *
 * @param callback - 디바운스할 콜백 함수
 * @param delay - 지연 시간 (ms)
 * @returns 디바운스된 콜백 함수
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const debouncedSearch = useDebouncedCallback((term: string) => {
 *     fetchSearchResults(term);
 *   }, 300);
 *
 *   return (
 *     <input
 *       onChange={(e) => debouncedSearch(e.target.value)}
 *     />
 *   );
 * }
 * ```
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef<T>(callback);

  // 최신 콜백 참조 유지
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      // 이전 타이머 취소
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      // 새 타이머 설정
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
