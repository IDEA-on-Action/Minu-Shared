import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'jest-axe';
import { Progress } from './Progress';

describe('Progress', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('기본 프로그레스 바가 렌더링된다', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(<Progress value={50} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('showLabel이 true일 때 퍼센트가 표시된다', () => {
      render(<Progress value={75} showLabel />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('showLabel이 false일 때 퍼센트가 표시되지 않는다', () => {
      render(<Progress value={75} />);
      expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // value prop 테스트
  // ============================================

  describe('value', () => {
    it('value가 0일 때 올바르게 렌더링된다', () => {
      render(<Progress value={0} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });

    it('value가 100일 때 올바르게 렌더링된다', () => {
      render(<Progress value={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    });

    it('value가 50일 때 올바르게 렌더링된다', () => {
      render(<Progress value={50} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    });

    it('value가 0 미만일 때 0으로 제한된다', () => {
      render(<Progress value={-10} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });

    it('value가 100 초과일 때 100으로 제한된다', () => {
      render(<Progress value={150} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  // ============================================
  // 크기 옵션 테스트
  // ============================================

  describe('size', () => {
    it('기본 크기는 md이다', () => {
      render(<Progress value={50} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('h-2');
    });

    it('sm 크기가 적용된다', () => {
      render(<Progress value={50} size="sm" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('h-1');
    });

    it('md 크기가 적용된다', () => {
      render(<Progress value={50} size="md" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('h-2');
    });

    it('lg 크기가 적용된다', () => {
      render(<Progress value={50} size="lg" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('h-3');
    });
  });

  // ============================================
  // 색상 옵션 테스트
  // ============================================

  describe('color', () => {
    it('기본 색상은 primary이다', () => {
      const { container } = render(<Progress value={50} />);
      const indicator = container.querySelector('[role="progressbar"] > div');
      expect(indicator).toHaveClass('bg-primary');
    });

    it('primary 색상이 적용된다', () => {
      const { container } = render(<Progress value={50} color="primary" />);
      const indicator = container.querySelector('[role="progressbar"] > div');
      expect(indicator).toHaveClass('bg-primary');
    });

    it('success 색상이 적용된다', () => {
      const { container } = render(<Progress value={50} color="success" />);
      const indicator = container.querySelector('[role="progressbar"] > div');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('warning 색상이 적용된다', () => {
      const { container } = render(<Progress value={50} color="warning" />);
      const indicator = container.querySelector('[role="progressbar"] > div');
      expect(indicator).toHaveClass('bg-yellow-500');
    });

    it('error 색상이 적용된다', () => {
      const { container } = render(<Progress value={50} color="error" />);
      const indicator = container.querySelector('[role="progressbar"] > div');
      expect(indicator).toHaveClass('bg-red-500');
    });
  });

  // ============================================
  // 불확정 상태 테스트
  // ============================================

  describe('indeterminate', () => {
    it('indeterminate가 true일 때 aria-valuenow가 없다', () => {
      render(<Progress indeterminate />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
    });

    it('indeterminate가 true일 때 애니메이션 클래스가 적용된다', () => {
      const { container } = render(<Progress indeterminate />);
      const indicator = container.querySelector('[role="progressbar"] > div');
      expect(indicator).toHaveClass('animate-progress-indeterminate');
    });

    it('indeterminate가 false일 때 value에 따라 렌더링된다', () => {
      render(<Progress value={50} indeterminate={false} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    });

    it('indeterminate가 true일 때 showLabel이 무시된다', () => {
      render(<Progress indeterminate showLabel />);
      expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('role="progressbar"가 설정된다', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('aria-valuenow가 올바르게 설정된다', () => {
      const { rerender } = render(<Progress value={25} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');

      rerender(<Progress value={75} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    });

    it('aria-valuemin이 0으로 설정된다', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0');
    });

    it('aria-valuemax가 100으로 설정된다', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
    });

    it('aria-label이 설정된다', () => {
      render(<Progress value={50} aria-label="다운로드 진행률" />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', '다운로드 진행률');
    });

    it('aria-labelledby가 설정된다', () => {
      render(
        <>
          <div id="progress-label">파일 업로드</div>
          <Progress value={50} aria-labelledby="progress-label" />
        </>
      );
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-labelledby', 'progress-label');
    });
  });

  // ============================================
  // 스타일 테스트
  // ============================================

  describe('스타일', () => {
    it('커스텀 className이 적용된다', () => {
      const { container } = render(<Progress value={50} className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('기본 스타일이 적용된다', () => {
      render(<Progress value={50} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('w-full');
      expect(progressbar).toHaveClass('bg-input');
      expect(progressbar).toHaveClass('rounded-full');
    });

    it('overflow-hidden 클래스가 적용된다', () => {
      render(<Progress value={50} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('overflow-hidden');
    });
  });

  // ============================================
  // axe 접근성 테스트
  // ============================================

  describe('axe 접근성 테스트', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(<Progress value={50} aria-label="진행률" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('showLabel이 있을 때 접근성 위반이 없어야 한다', async () => {
      const { container } = render(<Progress value={50} showLabel aria-label="진행률" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('indeterminate 상태에서 접근성 위반이 없어야 한다', async () => {
      const { container } = render(<Progress indeterminate aria-label="로딩 중" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
