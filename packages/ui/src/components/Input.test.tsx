import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { Input } from './Input';

describe('Input', () => {
  it('기본 input이 렌더링되어야 한다', () => {
    render(<Input placeholder="입력하세요" />);
    expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
  });

  it('value 변경이 동작해야 한다', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '테스트' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('disabled 상태가 적용되어야 한다', () => {
    render(<Input disabled placeholder="비활성화" />);
    expect(screen.getByPlaceholderText('비활성화')).toBeDisabled();
  });

  describe('type', () => {
    it('type이 지정되지 않으면 textbox로 동작해야 한다', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('email type이 적용되어야 한다', () => {
      render(<Input type="email" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('password type이 적용되어야 한다', () => {
      render(<Input type="password" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('search type이 적용되어야 한다', () => {
      render(<Input type="search" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('type', 'search');
    });
  });

  describe('error 상태', () => {
    it('error 상태에서 스타일이 변경되어야 한다', () => {
      render(<Input error data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-destructive');
    });

    it('errorMessage가 표시되어야 한다', () => {
      render(<Input error errorMessage="필수 입력 항목입니다" />);
      expect(screen.getByText('필수 입력 항목입니다')).toBeInTheDocument();
    });

    it('error가 false이면 errorMessage가 표시되지 않아야 한다', () => {
      render(<Input error={false} errorMessage="필수 입력 항목입니다" />);
      expect(screen.queryByText('필수 입력 항목입니다')).not.toBeInTheDocument();
    });

    it('errorMessage 없이 error만 있으면 메시지가 표시되지 않아야 한다', () => {
      const { container } = render(<Input error />);
      const errorText = container.querySelector('.text-destructive');
      expect(errorText).not.toBeInTheDocument();
    });
  });

  it('커스텀 className이 적용되어야 한다', () => {
    render(<Input className="custom-class" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-class');
  });

  it('ref가 전달되어야 한다', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('추가 HTML 속성이 전달되어야 한다', () => {
    render(<Input data-testid="input" maxLength={10} required />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('maxLength', '10');
    expect(input).toBeRequired();
  });

  describe('접근성', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <label>
          이름
          <Input placeholder="이름을 입력하세요" />
        </label>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
