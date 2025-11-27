import * as React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 뱃지 변형 스타일 */
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
  /** 뱃지 크기 */
  size?: 'sm' | 'md';
}

const badgeVariants = {
  base: 'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  variants: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background text-foreground hover:bg-accent',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    success: 'bg-green-500 text-white hover:bg-green-500/80',
  },
  sizes: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  },
};

/**
 * Minu 공용 Badge 컴포넌트
 *
 * @example
 * ```tsx
 * <Badge variant="default">기본</Badge>
 * <Badge variant="success" size="sm">완료</Badge>
 * <Badge variant="destructive">삭제됨</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants.base,
          badgeVariants.variants[variant],
          badgeVariants.sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
