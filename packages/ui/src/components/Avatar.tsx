import * as React from 'react';
import { cn } from '../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 이미지 URL */
  src?: string;
  /** 대체 텍스트 */
  alt?: string;
  /** 이니셜 표시용 이름 (이미지 없을 때) */
  name?: string;
  /** 아바타 크기 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 상태 표시 */
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const avatarSizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

const statusSizes = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-4 w-4',
};

/**
 * 이름에서 이니셜 추출
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Minu 공용 Avatar 컴포넌트
 *
 * @example
 * ```tsx
 * <Avatar src="/profile.jpg" alt="사용자" />
 * <Avatar name="홍길동" size="lg" />
 * <Avatar name="John Doe" status="online" />
 * ```
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      name,
      size = 'md',
      status,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);
    const showImage = src && !imageError;
    const initials = name ? getInitials(name) : null;

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground',
          avatarSizes[size],
          className
        )}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || name || '아바타'}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : initials ? (
          <span aria-hidden="true">{initials}</span>
        ) : (
          <svg
            className="h-[60%] w-[60%]"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full ring-2 ring-background',
              statusColors[status],
              statusSizes[size]
            )}
            aria-label={`상태: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
