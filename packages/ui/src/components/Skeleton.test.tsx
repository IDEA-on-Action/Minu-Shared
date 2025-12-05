import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { runAxe, resetAxe } from '../test-utils';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  afterEach(() => {
    resetAxe();
  });
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('기본 스켈레톤이 렌더링된다', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('div 요소로 렌더링된다', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.tagName.toLowerCase()).toBe('div');
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(<Skeleton ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  // ============================================
  // variant 테스트
  // ============================================

  describe('variants', () => {
    it('text variant가 적용된다 (기본값)', () => {
      render(<Skeleton variant="text" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded');
    });

    it('circular variant가 적용된다', () => {
      render(<Skeleton variant="circular" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('rectangular variant가 적용된다', () => {
      render(<Skeleton variant="rectangular" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-md');
    });

    it('variant 미지정 시 text가 기본값이다', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded');
    });
  });

  // ============================================
  // animate 테스트
  // ============================================

  describe('animations', () => {
    it('pulse 애니메이션이 적용된다 (기본값)', () => {
      render(<Skeleton animate="pulse" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('wave 애니메이션이 적용된다', () => {
      render(<Skeleton animate="wave" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-shimmer');
    });

    it('none으로 애니메이션을 비활성화할 수 있다', () => {
      render(<Skeleton animate="none" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).not.toHaveClass('animate-pulse');
      expect(skeleton).not.toHaveClass('animate-shimmer');
    });

    it('animate 미지정 시 pulse가 기본값이다', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });

  // ============================================
  // 크기 테스트
  // ============================================

  describe('크기', () => {
    it('width를 숫자로 지정할 수 있다', () => {
      render(<Skeleton width={200} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '200px' });
    });

    it('width를 문자열로 지정할 수 있다', () => {
      render(<Skeleton width="100%" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '100%' });
    });

    it('height를 숫자로 지정할 수 있다', () => {
      render(<Skeleton height={40} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ height: '40px' });
    });

    it('height를 문자열로 지정할 수 있다', () => {
      render(<Skeleton height="2rem" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ height: '2rem' });
    });

    it('width와 height를 동시에 지정할 수 있다', () => {
      render(<Skeleton width={100} height={50} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('aria-hidden="true" 속성이 있다', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ============================================
  // 스타일 테스트
  // ============================================

  describe('스타일', () => {
    it('bg-muted 클래스가 적용된다', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('bg-muted');
    });

    it('커스텀 className이 병합된다', () => {
      render(<Skeleton className="custom-class" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('custom-class');
      expect(skeleton).toHaveClass('bg-muted');
    });

    it('커스텀 style이 병합된다', () => {
      render(
        <Skeleton
          width={100}
          height={50}
          data-testid="skeleton"
        />
      );
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
    });
  });

  // ============================================
  // Props 전달 테스트
  // ============================================

  describe('props 전달', () => {
    it('HTML 속성이 올바르게 전달된다', () => {
      render(<Skeleton data-testid="skeleton" id="my-skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('id', 'my-skeleton');
    });
  });

  describe('axe 접근성 테스트', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(<Skeleton width={200} height={20} />);
      await runAxe(container);
    });
  });
});
