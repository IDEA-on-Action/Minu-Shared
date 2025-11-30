import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { Switch } from './Switch';

describe('Switch', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('기본 스위치가 렌더링된다', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('label이 렌더링된다', () => {
      render(<Switch label="알림 설정" />);
      expect(screen.getByText('알림 설정')).toBeInTheDocument();
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = { current: null } as React.RefObject<HTMLButtonElement>;
      render(<Switch ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  // ============================================
  // 제어/비제어 모드 테스트
  // ============================================

  describe('제어/비제어 모드', () => {
    it('비제어 모드: 클릭 시 체크 상태가 토글된다', () => {
      render(<Switch label="테스트" />);
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(switchElement);
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
      fireEvent.click(switchElement);
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('비제어 모드: defaultChecked가 적용된다', () => {
      render(<Switch defaultChecked label="테스트" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('제어 모드: checked prop이 적용된다', () => {
      render(<Switch checked={true} label="테스트" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('제어 모드: onCheckedChange가 호출된다', () => {
      const handleChange = vi.fn();
      render(<Switch checked={false} onCheckedChange={handleChange} label="테스트" />);
      const switchElement = screen.getByRole('switch');

      fireEvent.click(switchElement);
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  // ============================================
  // size 변형 테스트
  // ============================================

  describe('size 변형', () => {
    it('sm 사이즈가 적용된다', () => {
      render(<Switch size="sm" label="작은 스위치" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('h-5');
      expect(switchElement).toHaveClass('w-9');
    });

    it('md 사이즈가 기본값으로 적용된다', () => {
      render(<Switch label="기본 스위치" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('h-6');
      expect(switchElement).toHaveClass('w-11');
    });

    it('lg 사이즈가 적용된다', () => {
      render(<Switch size="lg" label="큰 스위치" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('h-7');
      expect(switchElement).toHaveClass('w-14');
    });
  });

  // ============================================
  // disabled 상태 테스트
  // ============================================

  describe('disabled', () => {
    it('disabled 상태가 적용된다', () => {
      render(<Switch disabled label="비활성화" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });

    it('disabled 상태에서는 클릭이 동작하지 않는다', () => {
      const handleChange = vi.fn();
      render(<Switch disabled onCheckedChange={handleChange} label="비활성화" />);
      const switchElement = screen.getByRole('switch');

      fireEvent.click(switchElement);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('disabled 상태에서 라벨에 opacity 클래스가 적용된다', () => {
      render(<Switch disabled label="비활성화" />);
      const label = screen.getByText('비활성화');
      expect(label).toHaveClass('opacity-50');
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('role="switch"가 설정된다', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('aria-checked가 올바르게 설정된다', () => {
      const { rerender } = render(<Switch checked={false} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');

      rerender(<Switch checked={true} />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('label을 클릭하면 스위치가 토글된다', () => {
      render(<Switch label="클릭 라벨" />);
      const label = screen.getByText('클릭 라벨');
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(label);
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('커스텀 id가 적용된다', () => {
      render(<Switch id="my-switch" label="테스트" />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('id', 'my-switch');
    });

    it('Space 키로 토글할 수 있다', () => {
      render(<Switch label="키보드 테스트" />);
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-checked', 'false');
      fireEvent.keyDown(switchElement, { key: ' ' });
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('Enter 키로 토글할 수 있다', () => {
      render(<Switch label="키보드 테스트" />);
      const switchElement = screen.getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-checked', 'false');
      fireEvent.keyDown(switchElement, { key: 'Enter' });
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });
  });

  // ============================================
  // 스타일 테스트
  // ============================================

  describe('스타일', () => {
    it('커스텀 className이 래퍼에 적용된다', () => {
      const { container } = render(<Switch className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
      expect(wrapper).toHaveClass('flex');
    });

    it('checked 상태에서 활성 스타일이 적용된다', () => {
      render(<Switch checked={true} />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('bg-primary');
    });

    it('unchecked 상태에서 비활성 스타일이 적용된다', () => {
      render(<Switch checked={false} />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('bg-input');
    });
  });

  // ============================================
  // Props 전달 테스트
  // ============================================

  describe('props 전달', () => {
    it('name 속성이 숨겨진 input에 전달된다', () => {
      render(<Switch name="notifications" label="알림" />);
      const input = document.querySelector('input[name="notifications"]');
      expect(input).toBeInTheDocument();
    });

    it('name과 value 속성이 함께 전달된다', () => {
      render(<Switch name="toggle" value="enabled" label="활성화" />);
      const input = document.querySelector('input[name="toggle"][value="enabled"]');
      expect(input).toBeInTheDocument();
    });

    it('name과 required 속성이 함께 전달된다', () => {
      render(<Switch name="required-switch" required label="필수" />);
      const input = document.querySelector('input[name="required-switch"][required]');
      expect(input).toBeInTheDocument();
    });
  });

  // ============================================
  // axe 접근성 테스트
  // ============================================

  describe('axe 접근성 테스트', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(<Switch label="알림 받기" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
