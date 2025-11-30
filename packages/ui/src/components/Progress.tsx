import * as React from 'react';
import { cn } from '../utils/cn';

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** 진행률 값 (0-100) */
  value?: number;
  /** 크기 옵션 */
  size?: 'sm' | 'md' | 'lg';
  /** 색상 옵션 */
  color?: 'primary' | 'success' | 'warning' | 'error';
  /** 불확정 상태 (로딩 애니메이션) */
  indeterminate?: boolean;
  /** 라벨 표시 여부 */
  showLabel?: boolean;
  /** 접근성 라벨 */
  'aria-label'?: string;
  /** 접근성 라벨 참조 ID */
  'aria-labelledby'?: string;
}

/**
 * Minu 공용 Progress 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <Progress value={50} />
 *
 * // 라벨 표시
 * <Progress value={75} showLabel />
 *
 * // 색상 변경
 * <Progress value={100} color="success" />
 *
 * // 크기 변경
 * <Progress value={30} size="lg" />
 *
 * // 불확정 상태 (로딩)
 * <Progress indeterminate />
 * ```
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      size = 'md',
      color = 'primary',
      indeterminate = false,
      showLabel = false,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      ...props
    },
    ref
  ) => {
    // value를 0-100 범위로 제한
    const clampedValue = React.useMemo(() => {
      return Math.min(Math.max(value, 0), 100);
    }, [value]);

    // 크기 클래스
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    // 색상 클래스
    const colorClasses = {
      primary: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };

    return (
      <div className={cn('relative w-full flex items-center gap-3', className)}>
        {/* 프로그레스 바 */}
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={cn(
            'relative w-full bg-input rounded-full overflow-hidden',
            sizeClasses[size]
          )}
          {...props}
        >
          {/* 진행 인디케이터 */}
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-in-out',
              colorClasses[color],
              indeterminate && 'animate-progress-indeterminate'
            )}
            style={
              indeterminate
                ? undefined
                : {
                    width: `${clampedValue}%`,
                  }
            }
          />
        </div>

        {/* 라벨 표시 */}
        {showLabel && !indeterminate && (
          <div
            className="text-sm font-medium text-foreground select-none min-w-[3rem] text-right"
            aria-live="polite"
          >
            {clampedValue}%
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';
