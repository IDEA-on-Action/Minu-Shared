import * as React from 'react';
import { cn } from '../utils/cn';
import { useControllableState } from '../hooks/use-controllable-state';
import { useClickOutside } from '../hooks/use-click-outside';
import { useEscapeKey } from '../hooks/use-escape-key';
import { useId } from '../hooks/use-id';
import { Portal } from '../primitives/Portal';

// ============================================
// Types
// ============================================

export interface DropdownItemData {
  value: string;
  disabled?: boolean;
  element: HTMLDivElement | null;
}

// ============================================
// Context
// ============================================

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  highlightedIndex: number;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  items: DropdownItemData[];
  registerItem: (item: DropdownItemData) => void;
  unregisterItem: (value: string) => void;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown 컴포넌트는 Dropdown 내부에서 사용해야 합니다.');
  }
  return context;
}

// ============================================
// Dropdown (Root)
// ============================================

export interface DropdownProps {
  /** 자식 요소 */
  children: React.ReactNode;
  /** 드롭다운 열림 상태 (제어 모드) */
  open?: boolean;
  /** 기본 열림 상태 (비제어 모드) */
  defaultOpen?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Dropdown 컴포넌트
 *
 * @example
 * ```tsx
 * <Dropdown>
 *   <DropdownTrigger>메뉴</DropdownTrigger>
 *   <DropdownContent>
 *     <DropdownLabel>그룹</DropdownLabel>
 *     <DropdownItem onSelect={() => console.log('항목 1')}>
 *       항목 1
 *     </DropdownItem>
 *     <DropdownSeparator />
 *     <DropdownItem onSelect={() => console.log('항목 2')}>
 *       항목 2
 *     </DropdownItem>
 *   </DropdownContent>
 * </Dropdown>
 * ```
 */
export function Dropdown({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: DropdownProps) {
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [items, setItems] = React.useState<DropdownItemData[]>([]);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const registerItem = React.useCallback((item: DropdownItemData) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.value === item.value);
      if (exists) {
        return prev.map((i) => (i.value === item.value ? item : i));
      }
      return [...prev, item];
    });
  }, []);

  const unregisterItem = React.useCallback((value: string) => {
    setItems((prev) => prev.filter((i) => i.value !== value));
  }, []);

  // 열릴 때 초기화
  React.useEffect(() => {
    if (open) {
      setHighlightedIndex(-1);
    }
  }, [open]);

  return (
    <DropdownContext.Provider
      value={{
        open: open ?? false,
        setOpen,
        triggerRef,
        contentRef,
        highlightedIndex,
        setHighlightedIndex,
        items,
        registerItem,
        unregisterItem,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
}

// ============================================
// DropdownTrigger
// ============================================

export interface DropdownTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 자식 요소를 래핑하지 않고 직접 사용 */
  asChild?: boolean;
}

export const DropdownTrigger = React.forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDropdownContext();
    const generatedId = useId('dropdown-trigger');

    // ref 병합
    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    const handleClick = () => {
      setOpen(!open);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref: triggerRef,
        'aria-haspopup': 'true',
        'aria-expanded': open,
        'aria-controls': `${generatedId}-content`,
        onClick: handleClick,
      });
    }

    return (
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={`${generatedId}-content`}
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

DropdownTrigger.displayName = 'DropdownTrigger';

// ============================================
// DropdownContent
// ============================================

export interface DropdownContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 드롭다운 정렬 */
  align?: 'start' | 'center' | 'end';
  /** 드롭다운 위치 */
  side?: 'top' | 'bottom';
}

export const DropdownContent = React.forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ className, children, align = 'start', side = 'bottom', ...props }, ref) => {
    const {
      open,
      setOpen,
      triggerRef,
      contentRef,
      highlightedIndex,
      setHighlightedIndex,
      items,
    } = useDropdownContext();

    // ref 병합
    React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

    // 외부 클릭 시 닫기
    useClickOutside(contentRef, () => setOpen(false), open);

    // ESC 키로 닫기
    useEscapeKey(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, open);

    // 키보드 네비게이션
    React.useEffect(() => {
      if (!open) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        const enabledItems = items.filter((item) => !item.disabled);

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setHighlightedIndex((prev) => {
              if (prev < enabledItems.length - 1) {
                return prev + 1;
              }
              return 0;
            });
            break;
          case 'ArrowUp':
            event.preventDefault();
            setHighlightedIndex((prev) => {
              if (prev > 0) {
                return prev - 1;
              }
              return enabledItems.length - 1;
            });
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < enabledItems.length) {
              const highlightedItem = enabledItems[highlightedIndex];
              highlightedItem.element?.click();
            }
            break;
          case 'Home':
            event.preventDefault();
            setHighlightedIndex(0);
            break;
          case 'End':
            event.preventDefault();
            setHighlightedIndex(enabledItems.length - 1);
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, highlightedIndex, items, setHighlightedIndex]);

    // 포지셔닝 계산
    const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });

    React.useEffect(() => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const gap = 4;

        let top = 0;
        let left = rect.left + window.scrollX;
        const width = rect.width;

        if (side === 'bottom') {
          top = rect.bottom + window.scrollY + gap;
        } else {
          top = rect.top + window.scrollY - gap;
        }

        // 정렬 조정
        if (align === 'center') {
          left = rect.left + window.scrollX + rect.width / 2;
        } else if (align === 'end') {
          left = rect.right + window.scrollX;
        }

        setPosition({ top, left, width });
      }
    }, [open, triggerRef, align, side]);

    if (!open) return null;

    return (
      <Portal>
        <div
          ref={contentRef}
          role="menu"
          data-side={side}
          data-align={align}
          className={cn(
            'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
            'animate-in fade-in-0 zoom-in-95',
            align === 'start' && 'origin-top-left',
            align === 'center' && 'origin-top -translate-x-1/2',
            align === 'end' && 'origin-top-right -translate-x-full',
            className
          )}
          style={{
            top: position.top,
            left: position.left,
            minWidth: align === 'start' ? position.width : undefined,
          }}
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  }
);

DropdownContent.displayName = 'DropdownContent';

// ============================================
// DropdownItem
// ============================================

export interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 항목 선택 시 호출되는 콜백 */
  onSelect?: () => void;
  /** 비활성화 상태 */
  disabled?: boolean;
}

export const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ className, children, onSelect, disabled = false, ...props }, ref) => {
    const {
      setOpen,
      triggerRef,
      highlightedIndex,
      items,
      registerItem,
      unregisterItem,
    } = useDropdownContext();

    const itemRef = React.useRef<HTMLDivElement>(null);
    const itemId = useId('dropdown-item');

    // ref 병합
    React.useImperativeHandle(ref, () => itemRef.current as HTMLDivElement);

    // 항목 등록
    React.useEffect(() => {
      registerItem({
        value: itemId,
        disabled,
        element: itemRef.current,
      });

      return () => {
        unregisterItem(itemId);
      };
    }, [itemId, disabled, registerItem, unregisterItem]);

    const enabledItems = items.filter((item) => !item.disabled);
    const itemIndex = enabledItems.findIndex((item) => item.value === itemId);
    const isHighlighted = itemIndex === highlightedIndex;

    const handleClick = () => {
      if (disabled) return;

      onSelect?.();
      setOpen(false);
      triggerRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div
        ref={itemRef}
        role="menuitem"
        aria-disabled={disabled}
        data-highlighted={isHighlighted}
        data-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          'transition-colors',
          'data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground',
          'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownItem.displayName = 'DropdownItem';

// ============================================
// DropdownSeparator
// ============================================

export type DropdownSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export const DropdownSeparator = React.forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn('-mx-1 my-1 h-px bg-muted', className)}
        {...props}
      />
    );
  }
);

DropdownSeparator.displayName = 'DropdownSeparator';

// ============================================
// DropdownLabel
// ============================================

export type DropdownLabelProps = React.HTMLAttributes<HTMLDivElement>;

export const DropdownLabel = React.forwardRef<HTMLDivElement, DropdownLabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="presentation"
        className={cn('px-2 py-1.5 text-sm font-semibold text-foreground', className)}
        {...props}
      />
    );
  }
);

DropdownLabel.displayName = 'DropdownLabel';
