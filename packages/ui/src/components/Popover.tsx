import * as React from 'react';
import { cn } from '../utils/cn';
import { useControllableState } from '../hooks/use-controllable-state';
import { useEscapeKey } from '../hooks/use-escape-key';
import { useId } from '../hooks/use-id';
import { Portal } from '../primitives/Portal';

// ============================================
// Types
// ============================================

// ============================================
// Context
// ============================================

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  contentId: string;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover 컴포넌트는 Popover 내부에서 사용해야 합니다.');
  }
  return context;
}

// ============================================
// Popover (Root)
// ============================================

export interface PopoverProps {
  /** 자식 요소 */
  children: React.ReactNode;
  /** 팝오버 열림 상태 (제어 모드) */
  open?: boolean;
  /** 기본 열림 상태 (비제어 모드) */
  defaultOpen?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Popover 컴포넌트
 *
 * @example
 * ```tsx
 * <Popover>
 *   <PopoverTrigger>클릭하세요</PopoverTrigger>
 *   <PopoverContent>
 *     <div>팝오버 내용</div>
 *   </PopoverContent>
 * </Popover>
 * ```
 */
export function Popover({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: PopoverProps) {
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const contentId = useId('popover-content');

  return (
    <PopoverContext.Provider
      value={{
        open: open ?? false,
        setOpen,
        triggerRef,
        contentRef,
        contentId,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

// ============================================
// PopoverTrigger
// ============================================

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 자식 요소를 래핑하지 않고 직접 사용 */
  asChild?: boolean;
}

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { open, setOpen, triggerRef, contentId } = usePopoverContext();

    // ref 병합
    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    const handleClick = () => {
      setOpen(!open);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref: triggerRef,
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-controls': contentId,
        onClick: handleClick,
      });
    }

    return (
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PopoverTrigger.displayName = 'PopoverTrigger';

// ============================================
// PopoverContent
// ============================================

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 팝오버 정렬 */
  align?: 'start' | 'center' | 'end';
  /** 팝오버 위치 */
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, children, align = 'center', side = 'bottom', ...props }, ref) => {
    const { open, setOpen, triggerRef, contentRef, contentId } = usePopoverContext();

    // ref 병합
    React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

    // 외부 클릭 시 닫기 (트리거와 콘텐츠 제외)
    React.useEffect(() => {
      if (!open) return;

      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const target = event.target as Node;
        const triggerElement = triggerRef.current;
        const contentElement = contentRef.current;

        // 트리거나 콘텐츠 내부 클릭이 아닌 경우에만 닫기
        if (
          triggerElement &&
          !triggerElement.contains(target) &&
          contentElement &&
          !contentElement.contains(target)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }, [open, setOpen, triggerRef, contentRef]);

    // ESC 키로 닫기
    useEscapeKey(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, open);

    // 포지셔닝 계산
    const [position, setPosition] = React.useState({ top: 0, left: 0 });

    React.useEffect(() => {
      if (open && triggerRef.current && contentRef.current) {
        const updatePosition = () => {
          if (!triggerRef.current) return;

          const triggerRect = triggerRef.current.getBoundingClientRect();
          const contentRect = contentRef.current?.getBoundingClientRect();
          const gap = 8;

          let top = 0;
          let left = 0;

          // side에 따른 기본 위치 계산
          switch (side) {
            case 'top':
              top =
                triggerRect.top +
                window.scrollY -
                (contentRect?.height || 0) -
                gap;
              left =
                triggerRect.left +
                window.scrollX +
                triggerRect.width / 2 -
                (contentRect?.width || 0) / 2;
              break;
            case 'bottom':
              top = triggerRect.bottom + window.scrollY + gap;
              left =
                triggerRect.left +
                window.scrollX +
                triggerRect.width / 2 -
                (contentRect?.width || 0) / 2;
              break;
            case 'left':
              top =
                triggerRect.top +
                window.scrollY +
                triggerRect.height / 2 -
                (contentRect?.height || 0) / 2;
              left =
                triggerRect.left +
                window.scrollX -
                (contentRect?.width || 0) -
                gap;
              break;
            case 'right':
              top =
                triggerRect.top +
                window.scrollY +
                triggerRect.height / 2 -
                (contentRect?.height || 0) / 2;
              left = triggerRect.right + window.scrollX + gap;
              break;
          }

          // align에 따른 위치 조정
          if (side === 'top' || side === 'bottom') {
            if (align === 'start') {
              left = triggerRect.left + window.scrollX;
            } else if (align === 'end') {
              left =
                triggerRect.right +
                window.scrollX -
                (contentRect?.width || 0);
            }
          } else if (side === 'left' || side === 'right') {
            if (align === 'start') {
              top = triggerRect.top + window.scrollY;
            } else if (align === 'end') {
              top =
                triggerRect.bottom +
                window.scrollY -
                (contentRect?.height || 0);
            }
          }

          setPosition({ top, left });
        };

        // 초기 위치 설정
        updatePosition();

        // 렌더링 후 정확한 위치 재계산
        const timeoutId = setTimeout(updatePosition, 0);

        return () => clearTimeout(timeoutId);
      }
    }, [open, side, align, triggerRef]);

    if (!open) return null;

    return (
      <Portal>
        <div
          ref={contentRef}
          id={contentId}
          role="dialog"
          data-side={side}
          data-align={align}
          className={cn(
            'absolute z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
            'animate-in fade-in-0 zoom-in-95',
            side === 'top' && 'slide-in-from-bottom-2',
            side === 'bottom' && 'slide-in-from-top-2',
            side === 'left' && 'slide-in-from-right-2',
            side === 'right' && 'slide-in-from-left-2',
            className
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  }
);

PopoverContent.displayName = 'PopoverContent';
