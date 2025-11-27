import * as React from 'react';
import { cn } from '../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 스켈레톤 형태 */
  variant?: 'text' | 'circular' | 'rectangular';
  /** 애니메이션 타입 */
  animate?: 'pulse' | 'wave' | 'none';
  /** 너비 (CSS 값) */
  width?: string | number;
  /** 높이 (CSS 값) */
  height?: string | number;
}

const skeletonVariants = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-md',
};

const skeletonAnimations = {
  pulse: 'animate-pulse',
  wave: 'animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]',
  none: '',
};

/**
 * Minu 공용 Skeleton 컴포넌트
 *
 * @example
 * ```tsx
 * <Skeleton width={200} height={20} />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" width="100%" height={100} />
 * ```
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'text',
      animate = 'pulse',
      width,
      height,
      style,
      ...props
    },
    ref
  ) => {
    const computedStyle: React.CSSProperties = {
      ...style,
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-muted',
          skeletonVariants[variant],
          skeletonAnimations[animate],
          className
        )}
        style={computedStyle}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
