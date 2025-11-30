import * as React from 'react';
import { cn } from '../utils/cn';

// ============================================
// Breadcrumb (Root)
// ============================================

export type BreadcrumbProps = React.ComponentPropsWithoutRef<'nav'>;

/**
 * Breadcrumb 컴포넌트
 *
 * 사용자의 현재 위치를 표시하는 네비게이션 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Breadcrumb>
 *   <BreadcrumbList>
 *     <BreadcrumbItem>
 *       <BreadcrumbLink href="/">홈</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbLink href="/products">제품</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>상세</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 * ```
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={className}
        {...props}
      />
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

// ============================================
// BreadcrumbList
// ============================================

export type BreadcrumbListProps = React.ComponentPropsWithoutRef<'ol'>;

/**
 * BreadcrumbList - Breadcrumb 항목들을 감싸는 리스트
 */
export const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, ...props }, ref) => {
    return (
      <ol
        ref={ref}
        role="list"
        className={cn(
          'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
          className
        )}
        {...props}
      />
    );
  }
);

BreadcrumbList.displayName = 'BreadcrumbList';

// ============================================
// BreadcrumbItem
// ============================================

export type BreadcrumbItemProps = React.ComponentPropsWithoutRef<'li'>;

/**
 * BreadcrumbItem - 개별 Breadcrumb 항목
 */
export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        role="listitem"
        className={cn('inline-flex items-center gap-1.5', className)}
        {...props}
      />
    );
  }
);

BreadcrumbItem.displayName = 'BreadcrumbItem';

// ============================================
// BreadcrumbLink
// ============================================

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  /** 자식 요소를 직접 렌더링할지 여부 */
  asChild?: boolean;
}

/**
 * BreadcrumbLink - Breadcrumb 링크
 */
export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, asChild, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        className: cn(
          'transition-colors hover:text-foreground',
          (children as React.ReactElement).props.className
        ),
      });
    }

    return (
      <a
        ref={ref}
        className={cn('transition-colors hover:text-foreground', className)}
        {...props}
      >
        {children}
      </a>
    );
  }
);

BreadcrumbLink.displayName = 'BreadcrumbLink';

// ============================================
// BreadcrumbSeparator
// ============================================

export type BreadcrumbSeparatorProps = React.ComponentPropsWithoutRef<'li'>;

/**
 * BreadcrumbSeparator - Breadcrumb 구분자
 */
export const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('[&>svg]:size-3.5', className)}
        {...props}
      >
        {children ?? '/'}
      </li>
    );
  }
);

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

// ============================================
// BreadcrumbPage
// ============================================

export type BreadcrumbPageProps = React.ComponentPropsWithoutRef<'span'>;

/**
 * BreadcrumbPage - 현재 페이지 (링크가 아님)
 */
export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="link"
        aria-current="page"
        className={cn('font-normal text-foreground', className)}
        {...props}
      />
    );
  }
);

BreadcrumbPage.displayName = 'BreadcrumbPage';
