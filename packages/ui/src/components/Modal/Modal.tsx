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

interface ModalContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

function useModalContext() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('Modal 하위 컴포넌트는 Modal 내부에서 사용해야 합니다.');
  }
  return context;
}

// ============================================
// Modal (Root)
// ============================================

export interface ModalProps {
  /** 모달 열림 상태 (제어 모드) */
  open?: boolean;
  /** 기본 열림 상태 (비제어 모드) */
  defaultOpen?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 자식 요소 */
  children: React.ReactNode;
}

/**
 * Modal 컴포넌트
 *
 * 사용자의 주의를 집중시키는 대화 상자 컴포넌트입니다.
 * 접근성: 포커스 트랩, ESC 키 닫기, 스크린 리더 지원
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onOpenChange={setIsOpen}>
 *   <Modal.Content>
 *     <Modal.Header>
 *       <Modal.Title>제목</Modal.Title>
 *       <Modal.Close />
 *     </Modal.Header>
 *     <Modal.Body>본문 내용</Modal.Body>
 *     <Modal.Footer>
 *       <Button onClick={handleClose}>닫기</Button>
 *     </Modal.Footer>
 *   </Modal.Content>
 * </Modal>
 * ```
 */
export function Modal({ open: openProp, defaultOpen = false, onOpenChange, children }: ModalProps) {
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const titleId = useId('modal-title');
  const descriptionId = useId('modal-description');

  return (
    <ModalContext.Provider
      value={{
        open: open ?? false,
        onOpenChange: setOpen,
        titleId,
        descriptionId,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

Modal.displayName = 'Modal';

// ============================================
// Modal.Content
// ============================================

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 컨텐츠 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[95vw] h-[95vh]',
};

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, size = 'md', children, ...props }, ref) => {
    const { open, onOpenChange, titleId, descriptionId } = useModalContext();

    // ESC 키로 닫기
    useEscapeKey(() => onOpenChange(false), open);

    // 스크롤 잠금
    useBodyScrollLock(open);

    if (!open) return null;

    return (
      <Portal>
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <Backdrop visible onClick={() => onOpenChange(false)} />
          <FocusScope trapped={open}>
            <div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className={cn(
                'relative z-[90] w-full bg-background rounded-lg shadow-lg',
                'animate-in fade-in-0 zoom-in-95 duration-200',
                sizeStyles[size],
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

ModalContent.displayName = 'Modal.Content';

// ============================================
// Modal.Header
// ============================================

export type ModalHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
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

ModalHeader.displayName = 'Modal.Header';

// ============================================
// Modal.Title
// ============================================

export type ModalTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => {
    const { titleId } = useModalContext();

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

ModalTitle.displayName = 'Modal.Title';

// ============================================
// Modal.Description
// ============================================

export type ModalDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const ModalDescription = React.forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { descriptionId } = useModalContext();

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

ModalDescription.displayName = 'Modal.Description';

// ============================================
// Modal.Close
// ============================================

export interface ModalCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 커스텀 닫기 아이콘 */
  icon?: React.ReactNode;
}

export const ModalClose = React.forwardRef<HTMLButtonElement, ModalCloseProps>(
  ({ className, icon, onClick, ...props }, ref) => {
    const { onOpenChange } = useModalContext();

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

ModalClose.displayName = 'Modal.Close';

// ============================================
// Modal.Body
// ============================================

export type ModalBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('p-4', className)} {...props} />;
  }
);

ModalBody.displayName = 'Modal.Body';

// ============================================
// Modal.Footer
// ============================================

export type ModalFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-2 p-4 border-t border-border',
          className
        )}
        {...props}
      />
    );
  }
);

ModalFooter.displayName = 'Modal.Footer';

// ============================================
// 복합 컴포넌트 내보내기
// ============================================

Modal.Content = ModalContent;
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
Modal.Close = ModalClose;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
