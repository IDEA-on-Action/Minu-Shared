import { useState, useEffect } from 'react';

/**
 * CSS 미디어 쿼리의 매칭 여부를 추적하는 훅
 *
 * @param query - CSS 미디어 쿼리 문자열
 * @param defaultValue - SSR 환경에서 사용할 기본값 (기본: false)
 * @returns 미디어 쿼리 매칭 여부
 *
 * @example
 * ```tsx
 * // 모바일 감지
 * const isMobile = useMediaQuery('(max-width: 768px)');
 *
 * // 다크 모드 감지
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 *
 * // 화면 방향 감지
 * const isPortrait = useMediaQuery('(orientation: portrait)');
 *
 * // 복잡한 쿼리
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
 *
 * // SSR에서 기본값 지정
 * const isMobile = useMediaQuery('(max-width: 768px)', true);
 * ```
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  // SSR 안전한 초기값 설정
  const getMatches = (query: string): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    // SSR 환경 체크
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // 초기값 동기화 (쿼리가 변경되었을 때)
    setMatches(mediaQuery.matches);

    // 미디어 쿼리 변경 핸들러
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 이벤트 리스너 등록
    mediaQuery.addEventListener('change', handleChange);

    // 정리 함수
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query, defaultValue]);

  return matches;
}
