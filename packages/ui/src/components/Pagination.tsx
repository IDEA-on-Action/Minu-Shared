import * as React from 'react';
import { cn } from '../utils/cn';

export interface PaginationProps {
  /** 현재 페이지 (1부터 시작) */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 콜백 */
  onPageChange: (page: number) => void;
  /** 현재 페이지 양옆에 표시할 페이지 수 */
  siblingCount?: number;
  /** 처음/끝 버튼 표시 여부 */
  showFirstLast?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 커스텀 클래스명 */
  className?: string;
}

const DOTS = '...';

/**
 * 페이지네이션 범위를 계산하는 유틸리티 함수
 */
function usePaginationRange({
  currentPage,
  totalPages,
  siblingCount = 1,
}: {
  currentPage: number;
  totalPages: number;
  siblingCount: number;
}): (number | string)[] {
  return React.useMemo(() => {
    // 항상 표시되는 페이지 수: 첫 페이지(1) + 마지막 페이지(1) + 현재 페이지(1) + 양옆 siblings(2 * siblingCount)
    const totalPageNumbers = siblingCount * 2 + 3;

    // 전체 페이지가 표시할 페이지 수보다 적으면 모두 표시
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // 오른쪽에만 ... 표시
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPages];
    }

    // 왼쪽에만 ... 표시
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // 양쪽에 ... 표시
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  }, [currentPage, totalPages, siblingCount]);
}

const paginationStyles = {
  nav: 'flex items-center justify-center gap-1',
  button: {
    base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    default: 'h-9 w-9 border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    current: 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary',
    navigation: 'h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  },
  dots: 'inline-flex items-center justify-center w-9 h-9 text-sm',
};

/**
 * Minu 공용 Pagination 컴포넌트
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={3}
 *   totalPages={10}
 *   onPageChange={(page) => console.log(page)}
 * />
 *
 * <Pagination
 *   currentPage={5}
 *   totalPages={20}
 *   onPageChange={handlePageChange}
 *   siblingCount={2}
 *   showFirstLast={false}
 * />
 * ```
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  disabled = false,
  className,
}) => {
  const paginationRange = usePaginationRange({
    currentPage,
    totalPages,
    siblingCount,
  });

  // 현재 페이지가 유효한 범위인지 확인
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  const handlePageClick = (page: number) => {
    if (disabled) return;
    if (page < 1 || page > totalPages) return;
    if (page === validCurrentPage) return;
    onPageChange(page);
  };

  const handlePrevious = () => {
    handlePageClick(validCurrentPage - 1);
  };

  const handleNext = () => {
    handlePageClick(validCurrentPage + 1);
  };

  const handleFirst = () => {
    handlePageClick(1);
  };

  const handleLast = () => {
    handlePageClick(totalPages);
  };

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn(paginationStyles.nav, className)}
    >
      {/* 처음 버튼 */}
      {showFirstLast && (
        <button
          type="button"
          onClick={handleFirst}
          disabled={disabled || validCurrentPage === 1}
          aria-label="첫 페이지"
          className={cn(paginationStyles.button.base, paginationStyles.button.navigation)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="11 17 6 12 11 7" />
            <polyline points="18 17 13 12 18 7" />
          </svg>
        </button>
      )}

      {/* 이전 버튼 */}
      <button
        type="button"
        onClick={handlePrevious}
        disabled={disabled || validCurrentPage === 1}
        aria-label="이전 페이지"
        className={cn(paginationStyles.button.base, paginationStyles.button.navigation)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* 페이지 번호 */}
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <span key={`dots-${index}`} className={paginationStyles.dots}>
              {DOTS}
            </span>
          );
        }

        const page = pageNumber as number;
        const isCurrent = page === validCurrentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => handlePageClick(page)}
            disabled={disabled || isCurrent}
            aria-label={isCurrent ? `${page} 페이지` : `${page} 페이지로 이동`}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              paginationStyles.button.base,
              isCurrent ? paginationStyles.button.current : paginationStyles.button.default
            )}
          >
            {page}
          </button>
        );
      })}

      {/* 다음 버튼 */}
      <button
        type="button"
        onClick={handleNext}
        disabled={disabled || validCurrentPage === totalPages}
        aria-label="다음 페이지"
        className={cn(paginationStyles.button.base, paginationStyles.button.navigation)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* 끝 버튼 */}
      {showFirstLast && (
        <button
          type="button"
          onClick={handleLast}
          disabled={disabled || validCurrentPage === totalPages}
          aria-label="마지막 페이지"
          className={cn(paginationStyles.button.base, paginationStyles.button.navigation)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        </button>
      )}
    </nav>
  );
};

Pagination.displayName = 'Pagination';
