import * as React from 'react';

// React 18+의 useId 지원 여부 확인
const useReactId: (() => string) | undefined = (React as { useId?: () => string }).useId;

let idCounter = 0;

/**
 * 고유 ID 생성 훅
 *
 * 접근성을 위해 안정적인 고유 ID를 생성합니다.
 * React 18+에서는 useId를, 이전 버전에서는 폴백을 사용합니다.
 *
 * @param prefix - ID 접두사 (선택)
 * @returns 고유 ID 문자열
 *
 * @example
 * ```tsx
 * const id = useId('modal');
 * // 결과: 'modal-1' 또는 ':r0:-modal'
 * ```
 */
export function useId(prefix?: string): string {
  // React 18+에서는 내장 useId 사용
  if (useReactId) {
    const reactId = useReactId();
    return prefix ? `${prefix}-${reactId}` : reactId;
  }

  // React 17 이하를 위한 폴백
  const [id] = React.useState(() => {
    idCounter += 1;
    return idCounter;
  });

  return prefix ? `${prefix}-${id}` : String(id);
}
