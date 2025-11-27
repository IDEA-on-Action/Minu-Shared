import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * 포커스 트랩 훅
 *
 * 컨테이너 내부로 포커스를 가두어 모달/드로어에서 키보드 내비게이션을 제한합니다.
 *
 * @param enabled - 포커스 트랩 활성화 여부
 * @returns 컨테이너에 연결할 ref
 *
 * @example
 * ```tsx
 * const containerRef = useFocusTrap(isOpen);
 * return <div ref={containerRef}>...</div>;
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  enabled: boolean
): RefObject<T | null> {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 현재 포커스된 요소 저장
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // 컨테이너 내 첫 번째 포커스 가능 요소로 포커스 이동
    const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);
    const firstElement = focusableElements[0];

    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const currentFocusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);
      const firstFocusable = currentFocusableElements[0];
      const lastFocusable = currentFocusableElements[currentFocusableElements.length - 1];

      if (!firstFocusable || !lastFocusable) return;

      // Shift + Tab: 첫 번째 요소에서 마지막으로 순환
      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
      // Tab: 마지막 요소에서 첫 번째로 순환
      else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // 이전 포커스 복원
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled]);

  return containerRef;
}
