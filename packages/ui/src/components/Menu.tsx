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

export interface MenuItemData {
  value: string;
  disabled?: boolean;
  element: HTMLDivElement | null;
}

// ============================================
// Context
// ============================================

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  highlightedIndex: number;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  items: MenuItemData[];
  registerItem: (item: MenuItemData) => void;
  unregisterItem: (value: string) => void;
}

const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenuContext() {
  const context = React.useContext(MenuContext);
  if (!context) {
    throw new Error('Menu 컴포넌트는 Menu 내부에서 사용해야 합니다.');
  }
  return context;
}

// ============================================
// SubMenu Context
// ============================================

interface SubMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const SubMenuContext = React.createContext<SubMenuContextValue | null>(null);

function useSubMenuContext() {
  const context = React.useContext(SubMenuContext);
  return context;
}

// ============================================
// Menu (Root)
// ============================================

export interface MenuProps {
  /** 자식 요소 */
  children: React.ReactNode;
  /** 메뉴 열림 상태 (제어 모드) */
  open?: boolean;
  /** 기본 열림 상태 (비제어 모드) */
  defaultOpen?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Menu 컴포넌트
 *
 * 컨텍스트 메뉴나 드롭다운 메뉴를 구현합니다.
 * 키보드 네비게이션과 접근성을 지원합니다.
 *
 * @example
 * ```tsx
 * <Menu>
 *   <MenuTrigger>메뉴</MenuTrigger>
 *   <MenuContent>
 *     <MenuItem icon={<Icon />}>항목 1</MenuItem>
 *     <MenuSeparator />
 *     <MenuItem destructive>삭제</MenuItem>
 *   </MenuContent>
 * </Menu>
 * ```
 */
export function Menu({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: MenuProps) {
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [items, setItems] = React.useState<MenuItemData[]>([]);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const registerItem = React.useCallback((item: MenuItemData) => {
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
    <MenuContext.Provider
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
    </MenuContext.Provider>
  );
}

// ============================================
// MenuTrigger
// ============================================

export interface MenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 자식 요소를 래핑하지 않고 직접 사용 */
  asChild?: boolean;
}

export const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useMenuContext();
    const generatedId = useId('menu-trigger');

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

MenuTrigger.displayName = 'MenuTrigger';

// ============================================
// MenuContent
// ============================================

export interface MenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 메뉴 정렬 */
  align?: 'start' | 'center' | 'end';
  /** 메뉴 위치 */
  side?: 'top' | 'bottom';
}

export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  ({ className, children, align = 'start', side = 'bottom', ...props }, ref) => {
    const {
      open,
      setOpen,
      triggerRef,
      contentRef,
      highlightedIndex,
      setHighlightedIndex,
      items,
    } = useMenuContext();

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
            'absolute z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
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

MenuContent.displayName = 'MenuContent';

// ============================================
// MenuItem
// ============================================

export interface MenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 항목 선택 시 호출되는 콜백 */
  onSelect?: () => void;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 아이콘 */
  icon?: React.ReactNode;
  /** 파괴적 작업 스타일 (예: 삭제) */
  destructive?: boolean;
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  (
    { className, children, onSelect, disabled = false, icon, destructive = false, ...props },
    ref
  ) => {
    const {
      setOpen,
      triggerRef,
      highlightedIndex,
      items,
      registerItem,
      unregisterItem,
    } = useMenuContext();

    const itemRef = React.useRef<HTMLDivElement>(null);
    const itemId = useId('menu-item');

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
        data-destructive={destructive}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
          'transition-colors',
          'data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground',
          'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
          'data-[destructive=true]:text-destructive data-[destructive=true]:focus:bg-destructive/10',
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
      </div>
    );
  }
);

MenuItem.displayName = 'MenuItem';

// ============================================
// MenuSeparator
// ============================================

export type MenuSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export const MenuSeparator = React.forwardRef<HTMLDivElement, MenuSeparatorProps>(
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

MenuSeparator.displayName = 'MenuSeparator';

// ============================================
// MenuSub (서브메뉴)
// ============================================

export interface MenuSubProps {
  /** 자식 요소 */
  children: React.ReactNode;
}

/**
 * MenuSub 컴포넌트
 *
 * 중첩된 서브메뉴를 구현합니다.
 *
 * @example
 * ```tsx
 * <MenuSub>
 *   <MenuSubTrigger>더보기</MenuSubTrigger>
 *   <MenuSubContent>
 *     <MenuItem>서브항목 1</MenuItem>
 *   </MenuSubContent>
 * </MenuSub>
 * ```
 */
export function MenuSub({ children }: MenuSubProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <SubMenuContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      {children}
    </SubMenuContext.Provider>
  );
}

// ============================================
// MenuSubTrigger
// ============================================

export interface MenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 아이콘 */
  icon?: React.ReactNode;
}

export const MenuSubTrigger = React.forwardRef<HTMLDivElement, MenuSubTriggerProps>(
  ({ className, children, disabled = false, icon, ...props }, ref) => {
    const subContext = useSubMenuContext();
    const menuContext = useMenuContext();

    if (!subContext) {
      throw new Error('MenuSubTrigger는 MenuSub 내부에서 사용해야 합니다.');
    }

    const { open, setOpen, triggerRef } = subContext;
    const {
      highlightedIndex,
      items,
      registerItem,
      unregisterItem,
    } = menuContext;

    const itemId = useId('menu-sub-trigger');

    // ref 병합
    React.useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

    // 항목 등록
    React.useEffect(() => {
      registerItem({
        value: itemId,
        disabled,
        element: triggerRef.current,
      });

      return () => {
        unregisterItem(itemId);
      };
    }, [itemId, disabled, registerItem, unregisterItem]);

    const enabledItems = items.filter((item) => !item.disabled);
    const itemIndex = enabledItems.findIndex((item) => item.value === itemId);
    const isHighlighted = itemIndex === highlightedIndex;

    const handleMouseEnter = () => {
      if (disabled) return;
      setOpen(true);
    };

    const handleMouseLeave = () => {
      setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
      } else if (e.key === 'ArrowLeft' && open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    };

    React.useEffect(() => {
      if (isHighlighted) {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            setOpen(true);
          }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    }, [isHighlighted, setOpen]);

    return (
      <div
        ref={triggerRef}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={open}
        aria-disabled={disabled}
        data-highlighted={isHighlighted}
        data-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
          'transition-colors',
          'data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground',
          'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ml-auto h-4 w-4"
        >
          <path
            d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }
);

MenuSubTrigger.displayName = 'MenuSubTrigger';

// ============================================
// MenuSubContent
// ============================================

export type MenuSubContentProps = React.HTMLAttributes<HTMLDivElement>;

export const MenuSubContent = React.forwardRef<HTMLDivElement, MenuSubContentProps>(
  ({ className, children, ...props }, ref) => {
    const subContext = useSubMenuContext();

    if (!subContext) {
      throw new Error('MenuSubContent는 MenuSub 내부에서 사용해야 합니다.');
    }

    const { open, setOpen, triggerRef, contentRef } = subContext;

    // ref 병합
    React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

    // 포지셔닝 계산
    const [position, setPosition] = React.useState({ top: 0, left: 0 });

    React.useEffect(() => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const gap = 4;

        const top = rect.top + window.scrollY;
        const left = rect.right + window.scrollX + gap;

        setPosition({ top, left });
      }
    }, [open, triggerRef]);

    // ArrowLeft로 서브메뉴 닫기
    React.useEffect(() => {
      if (!open) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, setOpen, triggerRef]);

    if (!open) return null;

    return (
      <Portal>
        <div
          ref={contentRef}
          role="menu"
          className={cn(
            'absolute z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
            'animate-in fade-in-0 zoom-in-95',
            className
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  }
);

MenuSubContent.displayName = 'MenuSubContent';
