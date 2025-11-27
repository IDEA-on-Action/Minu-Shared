import { useEffect } from 'react';

/**
 * body 스크롤을 잠그는 훅
 *
 * 모달이나 드로어가 열릴 때 배경 스크롤을 방지합니다.
 *
 * @param locked - 스크롤 잠금 여부
 *
 * @example
 * ```tsx
 * useBodyScrollLock(isModalOpen);
 * ```
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;

    // 스크롤바 너비 계산 (레이아웃 시프트 방지)
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [locked]);
}
