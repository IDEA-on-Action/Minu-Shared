import * as React from 'react';
import { cn } from '../utils/cn';

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  /** 스피너 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 스피너 색상 */
  color?: 'primary' | 'secondary' | 'current';
  /** 접근성 레이블 */
  label?: string;
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const spinnerColors = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  current: 'text-current',
};

/**
 * Minu 공용 Spinner 컴포넌트
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" color="primary" />
 * <Spinner label="데이터 로딩 중" />
 * ```
 */
export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = 'md', color = 'current', label = '로딩 중', ...props }, ref) => {
    return (
      <svg
        ref={ref}
        className={cn('animate-spin', spinnerSizes[size], spinnerColors[color], className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
        aria-label={label}
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }
);

Spinner.displayName = 'Spinner';
