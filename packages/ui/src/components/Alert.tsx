import * as React from 'react';
import { cn } from '../utils/cn';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alert 변형 스타일 */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Alert 제목 */
  title?: string;
  /** Alert 설명 */
  description?: string;
  /** 닫기 버튼 표시 여부 */
  closable?: boolean;
  /** 닫기 버튼 클릭 시 콜백 */
  onClose?: () => void;
  /** 커스텀 아이콘 */
  icon?: React.ReactNode;
}

const alertVariants = {
  base: 'relative w-full rounded-lg border p-4',
  variants: {
    default: 'bg-background text-foreground border-border',
    success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800',
    error: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800',
    info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800',
  },
};

const iconVariants = {
  default: 'text-foreground',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
};

const DefaultIcon = ({ variant }: { variant: AlertProps['variant'] }) => {
  switch (variant) {
    case 'success':
      return (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      );
    case 'error':
      return (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
      );
  }
};

const CloseButton = ({ onClick, variant }: { onClick?: () => void; variant: AlertProps['variant'] }) => (
  <button
    type="button"
    className={cn(
      'absolute right-2 top-2 rounded-md p-1.5 inline-flex items-center justify-center',
      'hover:bg-black/10 dark:hover:bg-white/10',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      variant === 'success' && 'focus:ring-green-500',
      variant === 'warning' && 'focus:ring-yellow-500',
      variant === 'error' && 'focus:ring-red-500',
      variant === 'info' && 'focus:ring-blue-500',
      variant === 'default' && 'focus:ring-ring'
    )}
    onClick={onClick}
    aria-label="닫기"
  >
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  </button>
);

/**
 * Alert 컴포넌트
 *
 * 사용자에게 중요한 메시지를 전달하는 피드백 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Alert variant="success" title="성공">
 *   작업이 완료되었습니다.
 * </Alert>
 *
 * <Alert
 *   variant="error"
 *   title="오류 발생"
 *   description="다시 시도해주세요."
 *   closable
 *   onClose={() => console.log('closed')}
 * />
 * ```
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      title,
      description,
      closable = false,
      onClose,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const showIcon = icon !== null;
    const iconElement = icon ?? <DefaultIcon variant={variant} />;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          alertVariants.base,
          alertVariants.variants[variant],
          closable && 'pr-10',
          className
        )}
        {...props}
      >
        <div className="flex">
          {showIcon && (
            <div className={cn('flex-shrink-0', iconVariants[variant])}>
              {iconElement}
            </div>
          )}
          <div className={cn('flex-1', showIcon && 'ml-3')}>
            {title && (
              <h3 className="text-sm font-medium">{title}</h3>
            )}
            {description && (
              <div className={cn('text-sm', title && 'mt-1', 'opacity-90')}>
                {description}
              </div>
            )}
            {children && (
              <div className={cn('text-sm', (title || description) && 'mt-2')}>
                {children}
              </div>
            )}
          </div>
        </div>
        {closable && <CloseButton onClick={onClose} variant={variant} />}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
