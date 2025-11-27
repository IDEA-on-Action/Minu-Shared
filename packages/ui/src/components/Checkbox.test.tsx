import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('기본 체크박스가 렌더링된다', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('label이 렌더링된다', () => {
      render(<Checkbox label="라벨 텍스트" />);
      expect(screen.getByText('라벨 텍스트')).toBeInTheDocument();
    });

    it('description이 렌더링된다', () => {
      render(<Checkbox label="라벨" description="설명 텍스트" />);
      expect(screen.getByText('설명 텍스트')).toBeInTheDocument();
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = { current: null } as React.RefObject<HTMLInputElement>;
      render(<Checkbox ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  // ============================================
  // 제어/비제어 모드 테스트
  // ============================================

  describe('제어/비제어 모드', () => {
    it('비제어 모드: 클릭 시 체크 상태가 토글된다', () => {
      render(<Checkbox label="테스트" />);
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('비제어 모드: defaultChecked가 적용된다', () => {
      render(<Checkbox defaultChecked label="테스트" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('제어 모드: checked prop이 적용된다', () => {
      render(<Checkbox checked={true} label="테스트" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('제어 모드: onCheckedChange가 호출된다', () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onCheckedChange={handleChange} label="테스트" />);
      const checkbox = screen.getByRole('checkbox');

      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  // ============================================
  // indeterminate 상태 테스트
  // ============================================

  describe('indeterminate', () => {
    it('indeterminate 상태가 적용된다', () => {
      render(<Checkbox indeterminate label="전체 선택" />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });

    it('indeterminate가 false면 적용되지 않는다', () => {
      render(<Checkbox indeterminate={false} label="테스트" />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);
    });
  });

  // ============================================
  // disabled 상태 테스트
  // ============================================

  describe('disabled', () => {
    it('disabled 상태가 적용된다', () => {
      render(<Checkbox disabled label="비활성화" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('disabled 상태에서는 체크박스가 비활성화된다', () => {
      render(<Checkbox disabled label="테스트" />);
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).toBeDisabled();
    });

    it('disabled 상태에서 라벨에 opacity 클래스가 적용된다', () => {
      render(<Checkbox disabled label="비활성화" />);
      const label = screen.getByText('비활성화');
      expect(label).toHaveClass('opacity-50');
    });
  });

  // ============================================
  // error 상태 테스트
  // ============================================

  describe('error', () => {
    it('error 상태에서 aria-invalid가 true이다', () => {
      render(<Checkbox error label="에러" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('error 상태에서 라벨에 에러 스타일이 적용된다', () => {
      render(<Checkbox error label="에러" />);
      const label = screen.getByText('에러');
      expect(label).toHaveClass('text-destructive');
    });

    it('error 상태에서 description에 에러 스타일이 적용된다', () => {
      render(<Checkbox error label="에러" description="에러 설명" />);
      const description = screen.getByText('에러 설명');
      expect(description).toHaveClass('text-destructive');
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('label을 클릭하면 체크박스가 토글된다', () => {
      render(<Checkbox label="클릭 라벨" />);
      const label = screen.getByText('클릭 라벨');
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).not.toBeChecked();
      fireEvent.click(label);
      expect(checkbox).toBeChecked();
    });

    it('aria-describedby가 description과 연결된다', () => {
      render(<Checkbox label="라벨" description="설명" />);
      const checkbox = screen.getByRole('checkbox');
      const description = screen.getByText('설명');

      expect(checkbox).toHaveAttribute('aria-describedby', description.id);
    });

    it('커스텀 id가 적용된다', () => {
      render(<Checkbox id="my-checkbox" label="테스트" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'my-checkbox');
    });
  });

  // ============================================
  // 스타일 테스트
  // ============================================

  describe('스타일', () => {
    it('커스텀 className이 래퍼에 적용된다', () => {
      const { container } = render(<Checkbox className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
      expect(wrapper).toHaveClass('flex');
    });
  });

  // ============================================
  // Props 전달 테스트
  // ============================================

  describe('props 전달', () => {
    it('name 속성이 전달된다', () => {
      render(<Checkbox name="agree" label="동의" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('name', 'agree');
    });

    it('value 속성이 전달된다', () => {
      render(<Checkbox value="yes" label="예" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('value', 'yes');
    });

    it('required 속성이 전달된다', () => {
      render(<Checkbox required label="필수" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeRequired();
    });
  });

  describe('axe 접근성 테스트', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(<Checkbox label="동의합니다" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
