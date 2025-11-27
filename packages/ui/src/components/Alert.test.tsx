import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { Alert } from './Alert';

describe('Alert', () => {
  it('기본 Alert가 렌더링되어야 한다', () => {
    render(<Alert>메시지</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('메시지')).toBeInTheDocument();
  });

  it('title이 렌더링되어야 한다', () => {
    render(<Alert title="알림 제목">내용</Alert>);
    expect(screen.getByText('알림 제목')).toBeInTheDocument();
  });

  it('description이 렌더링되어야 한다', () => {
    render(<Alert description="설명 텍스트" />);
    expect(screen.getByText('설명 텍스트')).toBeInTheDocument();
  });

  it('title과 description이 함께 렌더링되어야 한다', () => {
    render(<Alert title="제목" description="설명" />);
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('설명')).toBeInTheDocument();
  });

  describe('variant', () => {
    it('default variant가 적용되어야 한다', () => {
      render(<Alert variant="default">메시지</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-background');
    });

    it('success variant가 적용되어야 한다', () => {
      render(<Alert variant="success">성공</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-green-50');
    });

    it('warning variant가 적용되어야 한다', () => {
      render(<Alert variant="warning">경고</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-yellow-50');
    });

    it('error variant가 적용되어야 한다', () => {
      render(<Alert variant="error">오류</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-red-50');
    });

    it('info variant가 적용되어야 한다', () => {
      render(<Alert variant="info">정보</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-blue-50');
    });
  });

  describe('closable', () => {
    it('closable이 false일 때 닫기 버튼이 없어야 한다', () => {
      render(<Alert closable={false}>메시지</Alert>);
      expect(screen.queryByLabelText('닫기')).not.toBeInTheDocument();
    });

    it('closable이 true일 때 닫기 버튼이 표시되어야 한다', () => {
      render(<Alert closable>메시지</Alert>);
      expect(screen.getByLabelText('닫기')).toBeInTheDocument();
    });

    it('닫기 버튼 클릭 시 onClose가 호출되어야 한다', () => {
      const handleClose = vi.fn();
      render(<Alert closable onClose={handleClose}>메시지</Alert>);

      fireEvent.click(screen.getByLabelText('닫기'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('icon', () => {
    it('기본 아이콘이 표시되어야 한다', () => {
      render(<Alert variant="success">성공</Alert>);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('커스텀 아이콘이 표시되어야 한다', () => {
      render(
        <Alert icon={<span data-testid="custom-icon">🎉</span>}>
          메시지
        </Alert>
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('icon이 null일 때 아이콘이 표시되지 않아야 한다', () => {
      render(<Alert icon={null}>메시지</Alert>);
      const alert = screen.getByRole('alert');
      const svg = alert.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });
  });

  it('커스텀 className이 적용되어야 한다', () => {
    render(<Alert className="custom-class">메시지</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-class');
  });

  it('ref가 전달되어야 한다', () => {
    const ref = vi.fn();
    render(<Alert ref={ref}>메시지</Alert>);
    expect(ref).toHaveBeenCalled();
  });

  it('children과 description이 함께 렌더링되어야 한다', () => {
    render(
      <Alert title="제목" description="설명">
        <button>추가 액션</button>
      </Alert>
    );
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('설명')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '추가 액션' })).toBeInTheDocument();
  });

  describe('접근성', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(<Alert title="알림">메시지</Alert>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
