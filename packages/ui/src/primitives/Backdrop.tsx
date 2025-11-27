import * as React from 'react';
import { cn } from '../utils/cn';

export interface BackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 백드롭 표시 여부 */
  visible?: boolean;
  /** 클릭 시 호출되는 콜백 */
  onClick?: () => void;
}

/**
 * Backdrop 컴포넌트
 *
 * 모달이나 드로어 뒤에 표시되는 반투명 오버레이입니다.
 *
 * @example
 * ```tsx
 * <Backdrop visible={isOpen} onClick={handleClose} />
 * ```
 */
export const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(
  ({ className, visible = true, onClick, ...props }, ref) => {
    if (!visible) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-[80] bg-black/50',
          'animate-in fade-in-0 duration-200',
          className
        )}
        onClick={onClick}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Backdrop.displayName = 'Backdrop';
