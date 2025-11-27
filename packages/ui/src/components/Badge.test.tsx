import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'jest-axe';
import { Badge } from './Badge';

describe('Badge', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('기본 뱃지가 렌더링된다', () => {
      render(<Badge>테스트</Badge>);
      expect(screen.getByText('테스트')).toBeInTheDocument();
    });

    it('children이 올바르게 렌더링된다', () => {
      render(<Badge>뱃지 내용</Badge>);
      expect(screen.getByText('뱃지 내용')).toBeInTheDocument();
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = { current: null } as React.RefObject<HTMLSpanElement>;
      render(<Badge ref={ref}>테스트</Badge>);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  // ============================================
  // variant 테스트
  // ============================================

  describe('variants', () => {
    it('default variant가 적용된다', () => {
      render(<Badge variant="default">기본</Badge>);
      const badge = screen.getByText('기본');
      expect(badge).toHaveClass('bg-primary');
    });

    it('secondary variant가 적용된다', () => {
      render(<Badge variant="secondary">보조</Badge>);
      const badge = screen.getByText('보조');
      expect(badge).toHaveClass('bg-secondary');
    });

    it('outline variant가 적용된다', () => {
      render(<Badge variant="outline">외곽선</Badge>);
      const badge = screen.getByText('외곽선');
      expect(badge).toHaveClass('border');
    });

    it('destructive variant가 적용된다', () => {
      render(<Badge variant="destructive">삭제</Badge>);
      const badge = screen.getByText('삭제');
      expect(badge).toHaveClass('bg-destructive');
    });

    it('success variant가 적용된다', () => {
      render(<Badge variant="success">성공</Badge>);
      const badge = screen.getByText('성공');
      expect(badge).toHaveClass('bg-green-500');
    });
  });

  // ============================================
  // size 테스트
  // ============================================

  describe('sizes', () => {
    it('sm 크기가 적용된다', () => {
      render(<Badge size="sm">작은</Badge>);
      const badge = screen.getByText('작은');
      expect(badge).toHaveClass('text-xs');
    });

    it('md 크기가 적용된다 (기본값)', () => {
      render(<Badge size="md">중간</Badge>);
      const badge = screen.getByText('중간');
      expect(badge).toHaveClass('text-sm');
    });

    it('size 미지정 시 md가 기본값이다', () => {
      render(<Badge>기본 크기</Badge>);
      const badge = screen.getByText('기본 크기');
      expect(badge).toHaveClass('text-sm');
    });
  });

  // ============================================
  // 스타일 테스트
  // ============================================

  describe('스타일', () => {
    it('기본 스타일이 적용된다', () => {
      render(<Badge>스타일</Badge>);
      const badge = screen.getByText('스타일');
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('items-center');
      expect(badge).toHaveClass('rounded-full');
      expect(badge).toHaveClass('font-medium');
    });

    it('커스텀 className이 병합된다', () => {
      render(<Badge className="custom-class">커스텀</Badge>);
      const badge = screen.getByText('커스텀');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('inline-flex');
    });
  });

  // ============================================
  // Props 전달 테스트
  // ============================================

  describe('props 전달', () => {
    it('HTML 속성이 올바르게 전달된다', () => {
      render(
        <Badge data-testid="badge" id="my-badge">
          속성
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('id', 'my-badge');
    });

    it('aria 속성이 올바르게 전달된다', () => {
      render(<Badge aria-label="상태 뱃지">상태</Badge>);
      const badge = screen.getByText('상태');
      expect(badge).toHaveAttribute('aria-label', '상태 뱃지');
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(<Badge>뱃지</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
