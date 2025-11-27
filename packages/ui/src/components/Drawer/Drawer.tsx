import * as React from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useEscapeKey } from '../../hooks/use-escape-key';
import { useBodyScrollLock } from '../../hooks/use-body-scroll-lock';
import { useId } from '../../hooks/use-id';
import { Portal } from '../../primitives/Portal';
import { Backdrop } from '../../primitives/Backdrop';
import { FocusScope } from '../../primitives/FocusScope';
import { cn } from '../../utils/cn';

// ============================================
// Context
// ============================================

interface DrawerContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: DrawerSide;
  titleId: string;
  descriptionId: string;
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawerContext() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error('Drawer 하위 컴포넌트는 Drawer 내부에서 사용해야 합니다.');
  }
  return context;
}

// ============================================
// Types
// ============================================

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

// ============================================
// Drawer (Root)
// ============================================

export interface DrawerProps {
  /** 드로어 열림 상태 (제어 모드) */
  open?: boolean;
  /** 기본 열림 상태 (비제어 모드) */
  defaultOpen?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 드로어가 나타나는 방향 */
  side?: DrawerSide;
  /** 자식 요소 */
  children: React.ReactNode;
}

/**
 * Drawer 컴포넌트
 *
 * 화면 측면에서 슬라이드되어 나오는 패널 컴포넌트입니다.
 * 네비게이션 메뉴, 필터 패널, 상세 정보 등에 사용됩니다.
 *
 * @example
 * ```tsx
 * <Drawer open={isOpen} onOpenChange={setIsOpen} side="right">
 *   <Drawer.Content>
 *     <Drawer.Header>
 *       <Drawer.Title>메뉴</Drawer.Title>
 *       <Drawer.Close />
 *     </Drawer.Header>
 *     <Drawer.Body>내용</Drawer.Body>
 *   </Drawer.Content>
 * </Drawer>
 * ```
 */
export function Drawer({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = 'right',
  children,
}: DrawerProps) {
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const titleId = useId('drawer-title');
  const descriptionId = useId('drawer-description');

  return (
    <DrawerContext.Provider
      value={{
        open: open ?? false,
        onOpenChange: setOpen,
        side,
        titleId,
        descriptionId,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

Drawer.displayName = 'Drawer';

// ============================================
// Drawer.Content
// ============================================

export type DrawerContentProps = React.HTMLAttributes<HTMLDivElement>;

const sideStyles: Record<DrawerSide, string> = {
  left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm animate-in slide-in-from-left duration-300',
  right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm animate-in slide-in-from-right duration-300',
  top: 'inset-x-0 top-0 w-full h-auto max-h-[80vh] animate-in slide-in-from-top duration-300',
  bottom: 'inset-x-0 bottom-0 w-full h-auto max-h-[80vh] animate-in slide-in-from-bottom duration-300',
};

const borderStyles: Record<DrawerSide, string> = {
  left: 'border-r',
  right: 'border-l',
  top: 'border-b',
  bottom: 'border-t',
};

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange, side, titleId, descriptionId } = useDrawerContext();

    // ESC 키로 닫기
    useEscapeKey(() => onOpenChange(false), open);

    // 스크롤 잠금
    useBodyScrollLock(open);

    if (!open) return null;

    return (
      <Portal>
        <div className="fixed inset-0 z-[90]">
          <Backdrop visible onClick={() => onOpenChange(false)} />
          <FocusScope trapped={open}>
            <div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className={cn(
                'fixed z-[90] bg-background shadow-lg',
                'flex flex-col',
                borderStyles[side],
                sideStyles[side],
                className
              )}
              {...props}
            >
              {children}
            </div>
          </FocusScope>
        </div>
      </Portal>
    );
  }
);

DrawerContent.displayName = 'Drawer.Content';

// ============================================
// Drawer.Header
// ============================================

export type DrawerHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between p-4 border-b border-border', className)}
        {...props}
      />
    );
  }
);

DrawerHeader.displayName = 'Drawer.Header';

// ============================================
// Drawer.Title
// ============================================

export type DrawerTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const DrawerTitle = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  ({ className, ...props }, ref) => {
    const { titleId } = useDrawerContext();

    return (
      <h2
        ref={ref}
        id={titleId}
        className={cn('text-lg font-semibold text-foreground', className)}
        {...props}
      />
    );
  }
);

DrawerTitle.displayName = 'Drawer.Title';

// ============================================
// Drawer.Description
// ============================================

export type DrawerDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const DrawerDescription = React.forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { descriptionId } = useDrawerContext();

    return (
      <p
        ref={ref}
        id={descriptionId}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    );
  }
);

DrawerDescription.displayName = 'Drawer.Description';

// ============================================
// Drawer.Close
// ============================================

export interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 커스텀 닫기 아이콘 */
  icon?: React.ReactNode;
}

export const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(
  ({ className, icon, onClick, ...props }, ref) => {
    const { onOpenChange } = useDrawerContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onOpenChange(false);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'rounded-md p-1.5 text-muted-foreground',
          'hover:bg-muted hover:text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'transition-colors',
          className
        )}
        onClick={handleClick}
        aria-label="닫기"
        {...props}
      >
        {icon ?? (
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        )}
      </button>
    );
  }
);

DrawerClose.displayName = 'Drawer.Close';

// ============================================
// Drawer.Body
// ============================================

export type DrawerBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const DrawerBody = React.forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('flex-1 overflow-y-auto p-4', className)} {...props} />;
  }
);

DrawerBody.displayName = 'Drawer.Body';

// ============================================
// Drawer.Footer
// ============================================

export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-end gap-2 p-4 border-t border-border', className)}
        {...props}
      />
    );
  }
);

DrawerFooter.displayName = 'Drawer.Footer';

// ============================================
// 복합 컴포넌트 내보내기
// ============================================

Drawer.Content = DrawerContent;
Drawer.Header = DrawerHeader;
Drawer.Title = DrawerTitle;
Drawer.Description = DrawerDescription;
Drawer.Close = DrawerClose;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;
