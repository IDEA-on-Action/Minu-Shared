import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 비동기 함수 상태
 */
export interface AsyncState<T, E = Error> {
  /** 로딩 중 여부 */
  loading: boolean;
  /** 에러 */
  error: E | null;
  /** 데이터 */
  data: T | null;
}

/**
 * useAsync 옵션
 */
export interface UseAsyncOptions {
  /** 마운트 시 자동 실행 여부 (기본: false) */
  immediate?: boolean;
}

/**
 * useAsync 반환 타입
 */
export interface UseAsyncReturn<T, A extends unknown[] = unknown[], E = Error> {
  /** 로딩 중 여부 */
  loading: boolean;
  /** 에러 */
  error: E | null;
  /** 데이터 */
  data: T | null;
  /** 비동기 함수 실행 */
  execute: (...args: A) => Promise<T | null>;
  /** 상태 초기화 */
  reset: () => void;
}

/**
 * 비동기 함수의 상태를 관리하는 훅
 *
 * @param asyncFunction - 비동기 함수
 * @param options - 옵션
 * @returns 비동기 상태 및 제어 함수
 *
 * @example
 * ```tsx
 * // 기본 사용
 * function UserProfile({ userId }: { userId: string }) {
 *   const { loading, error, data, execute } = useAsync(
 *     async (id: string) => {
 *       const response = await fetch(`/api/users/${id}`);
 *       return response.json();
 *     }
 *   );
 *
 *   useEffect(() => {
 *     execute(userId);
 *   }, [userId, execute]);
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   if (!data) return null;
 *
 *   return <div>{data.name}</div>;
 * }
 *
 * // immediate 옵션으로 자동 실행
 * function Dashboard() {
 *   const { loading, data, reset } = useAsync(
 *     async () => {
 *       const response = await fetch('/api/dashboard');
 *       return response.json();
 *     },
 *     { immediate: true }
 *   );
 *
 *   return (
 *     <div>
 *       {loading ? <Spinner /> : <DashboardContent data={data} />}
 *       <button onClick={reset}>Refresh</button>
 *     </div>
 *   );
 * }
 *
 * // 여러 인자 전달
 * function SearchResults() {
 *   const [query, setQuery] = useState('');
 *   const { loading, data, execute } = useAsync(
 *     async (searchQuery: string, limit: number) => {
 *       const response = await fetch(
 *         `/api/search?q=${searchQuery}&limit=${limit}`
 *       );
 *       return response.json();
 *     }
 *   );
 *
 *   const handleSearch = () => {
 *     execute(query, 10);
 *   };
 *
 *   return (
 *     <div>
 *       <input value={query} onChange={(e) => setQuery(e.target.value)} />
 *       <button onClick={handleSearch}>Search</button>
 *       {loading && <Spinner />}
 *       {data && <ResultsList items={data} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAsync<T, A extends unknown[] = unknown[], E = Error>(
  asyncFunction: (...args: A) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T, A, E> {
  const { immediate = false } = options;

  const [state, setState] = useState<AsyncState<T, E>>({
    loading: immediate, // immediate가 true면 초기 loading도 true
    error: null,
    data: null,
  });

  // 마운트 상태 추적
  const isMountedRef = useRef(true);

  // 비동기 함수 참조 유지
  const asyncFunctionRef = useRef(asyncFunction);

  // 요청 ID로 race condition 방지
  const requestIdRef = useRef(0);

  // 최신 비동기 함수 참조 유지
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  // 실행 함수
  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      // 새 요청 ID 생성
      const currentRequestId = ++requestIdRef.current;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunctionRef.current(...args);

        // 언마운트되었거나 이후에 다른 요청이 시작된 경우 무시
        if (isMountedRef.current && currentRequestId === requestIdRef.current) {
          setState({ loading: false, error: null, data: result });
        }

        return result;
      } catch (err) {
        // 언마운트되었거나 이후에 다른 요청이 시작된 경우 무시
        if (isMountedRef.current && currentRequestId === requestIdRef.current) {
          setState({ loading: false, error: err as E, data: null });
        }

        return null;
      }
    },
    []
  );

  // 초기화 함수
  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  // immediate 옵션 처리
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as A));
    }
  }, [immediate, execute]);

  // 언마운트 처리
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
