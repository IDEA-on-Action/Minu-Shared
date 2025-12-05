import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { runAxe, resetAxe } from '../test-utils';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  afterEach(() => {
    resetAxe();
  });
  it('기본 textarea가 렌더링되어야 한다', () => {
    render(<Textarea placeholder="입력하세요" />);
    expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
  });

  it('value 변경이 동작해야 한다', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '테스트' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('disabled 상태가 적용되어야 한다', () => {
    render(<Textarea disabled placeholder="비활성화" />);
    expect(screen.getByPlaceholderText('비활성화')).toBeDisabled();
  });

  describe('rows', () => {
    it('기본 rows는 3이어야 한다', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('rows', '3');
    });

    it('커스텀 rows가 적용되어야 한다', () => {
      render(<Textarea rows={5} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('rows', '5');
    });
  });

  describe('resize', () => {
    it('기본 resize는 vertical이어야 한다', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('resize-y');
    });

    it('resize none이 적용되어야 한다', () => {
      render(<Textarea resize="none" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('resize-none');
    });

    it('resize horizontal이 적용되어야 한다', () => {
      render(<Textarea resize="horizontal" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('resize-x');
    });

    it('resize both가 적용되어야 한다', () => {
      render(<Textarea resize="both" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('resize');
    });
  });

  describe('error 상태', () => {
    it('error 상태에서 스타일이 변경되어야 한다', () => {
      render(<Textarea error data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('border-destructive');
    });

    it('errorMessage가 표시되어야 한다', () => {
      render(<Textarea error errorMessage="필수 입력 항목입니다" />);
      expect(screen.getByText('필수 입력 항목입니다')).toBeInTheDocument();
    });

    it('error가 false이면 errorMessage가 표시되지 않아야 한다', () => {
      render(<Textarea error={false} errorMessage="필수 입력 항목입니다" />);
      expect(
        screen.queryByText('필수 입력 항목입니다')
      ).not.toBeInTheDocument();
    });

    it('errorMessage 없이 error만 있으면 메시지가 표시되지 않아야 한다', () => {
      const { container } = render(<Textarea error />);
      const errorText = container.querySelector('.text-destructive');
      expect(errorText).not.toBeInTheDocument();
    });

    it('error 상태에서 aria-invalid가 true여야 한다', () => {
      render(<Textarea error data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('errorMessage가 있을 때 aria-describedby가 설정되어야 한다', () => {
      render(
        <Textarea error errorMessage="오류 메시지" data-testid="textarea" />
      );
      const textarea = screen.getByTestId('textarea');
      const describedById = textarea.getAttribute('aria-describedby');
      expect(describedById).toBeTruthy();
      expect(screen.getByText('오류 메시지')).toHaveAttribute(
        'id',
        describedById
      );
    });
  });

  describe('maxLength와 글자 수 표시', () => {
    it('maxLength만 있으면 글자 수가 표시되지 않아야 한다', () => {
      render(<Textarea maxLength={100} defaultValue="테스트" />);
      expect(screen.queryByText(/4 \/ 100/)).not.toBeInTheDocument();
    });

    it('showCount가 true이면 글자 수가 표시되어야 한다', () => {
      render(
        <Textarea maxLength={100} showCount defaultValue="test" />
      );
      expect(screen.getByText('4 / 100')).toBeInTheDocument();
    });

    it('입력 시 글자 수가 업데이트되어야 한다', () => {
      render(<Textarea maxLength={100} showCount defaultValue="" />);
      const textarea = screen.getByRole('textbox');

      expect(screen.getByText('0 / 100')).toBeInTheDocument();

      fireEvent.change(textarea, { target: { value: '안녕하세요' } });
      expect(screen.getByText('5 / 100')).toBeInTheDocument();
    });

    it('maxLength 초과 시 글자 수가 빨간색으로 표시되어야 한다', () => {
      render(<Textarea maxLength={5} showCount defaultValue="123456" />);
      const countElement = screen.getByText('6 / 5');
      expect(countElement).toHaveClass('text-destructive');
    });

    it('maxLength 이내일 때 글자 수가 회색으로 표시되어야 한다', () => {
      render(<Textarea maxLength={10} showCount defaultValue="1234" />);
      const countElement = screen.getByText('4 / 10');
      expect(countElement).toHaveClass('text-muted-foreground');
      expect(countElement).not.toHaveClass('text-destructive');
    });
  });

  it('커스텀 className이 적용되어야 한다', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('custom-class');
  });

  it('ref가 전달되어야 한다', () => {
    const ref = vi.fn();
    render(<Textarea ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('추가 HTML 속성이 전달되어야 한다', () => {
    render(<Textarea data-testid="textarea" required />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeRequired();
  });

  describe('접근성', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <label>
          내용
          <Textarea placeholder="내용을 입력하세요" />
        </label>
      );
      await runAxe(container);
    });

    it('에러 메시지와 함께 접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <label>
          내용
          <Textarea
            error
            errorMessage="필수 입력 항목입니다"
            placeholder="내용을 입력하세요"
          />
        </label>
      );
      await runAxe(container);
    });
  });
});
