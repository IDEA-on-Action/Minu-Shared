import { useEffect } from 'react';

/**
 * ESC 키 입력을 감지하는 훅
 *
 * @param onEscape - ESC 키 입력 시 호출되는 콜백
 * @param enabled - 훅 활성화 여부 (기본값: true)
 *
 * @example
 * ```tsx
 * useEscapeKey(() => {
 *   setIsOpen(false);
 * }, isOpen);
 * ```
 */
export function useEscapeKey(onEscape: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, enabled]);
}
