import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('기본 스피너가 렌더링된다', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('SVG 요소로 렌더링된다', () => {
      render(<Spinner data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner.tagName.toLowerCase()).toBe('svg');
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = { current: null } as React.RefObject<SVGSVGElement>;
      render(<Spinner ref={ref} />);
      expect(ref.current).toBeInstanceOf(SVGSVGElement);
    });
  });

  // ============================================
  // size 테스트
  // ============================================

  describe('sizes', () => {
    it('sm 크기가 적용된다', () => {
      render(<Spinner size="sm" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-4');
      expect(spinner).toHaveClass('w-4');
    });

    it('md 크기가 적용된다 (기본값)', () => {
      render(<Spinner size="md" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-6');
      expect(spinner).toHaveClass('w-6');
    });

    it('lg 크기가 적용된다', () => {
      render(<Spinner size="lg" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-8');
      expect(spinner).toHaveClass('w-8');
    });

    it('size 미지정 시 md가 기본값이다', () => {
      render(<Spinner data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-6');
      expect(spinner).toHaveClass('w-6');
    });
  });

  // ============================================
  // color 테스트
  // ============================================

  describe('colors', () => {
    it('primary 색상이 적용된다', () => {
      render(<Spinner color="primary" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('text-primary');
    });

    it('secondary 색상이 적용된다', () => {
      render(<Spinner color="secondary" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('text-secondary');
    });

    it('current 색상이 적용된다 (기본값)', () => {
      render(<Spinner color="current" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('text-current');
    });

    it('color 미지정 시 current가 기본값이다', () => {
      render(<Spinner data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('text-current');
    });
  });

  // ============================================
  // 애니메이션 테스트
  // ============================================

  describe('애니메이션', () => {
    it('animate-spin 클래스가 적용된다', () => {
      render(<Spinner data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('role="status" 속성이 있다', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('기본 aria-label이 있다', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', '로딩 중');
    });

    it('커스텀 label이 aria-label로 적용된다', () => {
      render(<Spinner label="데이터 로딩 중" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', '데이터 로딩 중');
    });
  });

  // ============================================
  // 스타일 테스트
  // ============================================

  describe('스타일', () => {
    it('커스텀 className이 병합된다', () => {
      render(<Spinner className="custom-class" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('custom-class');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  // ============================================
  // Props 전달 테스트
  // ============================================

  describe('props 전달', () => {
    it('HTML 속성이 올바르게 전달된다', () => {
      render(<Spinner data-testid="spinner" id="my-spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('id', 'my-spinner');
    });
  });
});
