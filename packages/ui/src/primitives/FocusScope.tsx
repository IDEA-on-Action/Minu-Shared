import * as React from 'react';
import { useFocusTrap } from '../hooks/use-focus-trap';
import { cn } from '../utils/cn';

export interface FocusScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 포커스 트랩 활성화 여부 */
  trapped?: boolean;
  /** 자식 요소 */
  children: React.ReactNode;
}

/**
 * FocusScope 컴포넌트
 *
 * 자식 요소 내에서 포커스를 가두는 컨테이너입니다.
 * 모달, 드로어 등에서 키보드 접근성을 보장합니다.
 *
 * @example
 * ```tsx
 * <FocusScope trapped={isOpen}>
 *   <button>첫 번째 버튼</button>
 *   <button>두 번째 버튼</button>
 * </FocusScope>
 * ```
 */
export const FocusScope = React.forwardRef<HTMLDivElement, FocusScopeProps>(
  ({ className, trapped = true, children, ...props }, forwardedRef) => {
    const focusTrapRef = useFocusTrap<HTMLDivElement>(trapped);

    // ref 병합을 위한 콜백 ref
    const setRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        // focusTrapRef 업데이트
        (focusTrapRef as React.MutableRefObject<HTMLDivElement | null>).current = node;

        // forwardedRef 업데이트
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef, focusTrapRef]
    );

    return (
      <div ref={setRef} className={cn(className)} {...props}>
        {children}
      </div>
    );
  }
);

FocusScope.displayName = 'FocusScope';
