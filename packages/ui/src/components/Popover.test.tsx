import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';

// 기본 Popover 래퍼
function BasicPopover({
  defaultOpen,
  onOpenChange,
  side = 'bottom',
  align = 'center',
}: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
} = {}) {
  return (
    <Popover defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger data-testid="trigger">클릭하세요</PopoverTrigger>
      <PopoverContent data-testid="content" side={side} align={align}>
        <div>팝오버 내용</div>
      </PopoverContent>
    </Popover>
  );
}

describe('Popover', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('PopoverTrigger가 렌더링된다', () => {
      render(<BasicPopover />);
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('초기에는 PopoverContent가 보이지 않는다', () => {
      render(<BasicPopover />);
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('트리거 클릭 시 PopoverContent가 열린다', () => {
      render(<BasicPopover />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('PopoverContent 내용이 렌더링된다', () => {
      render(<BasicPopover />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByText('팝오버 내용')).toBeInTheDocument();
    });
  });

  // ============================================
  // 열기/닫기 테스트
  // ============================================

  describe('열기/닫기', () => {
    it('트리거 클릭으로 팝오버를 열 수 있다', () => {
      render(<BasicPopover />);
      const trigger = screen.getByTestId('trigger');

      fireEvent.click(trigger);
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('트리거 재클릭으로 팝오버를 닫을 수 있다', () => {
      render(<BasicPopover />);
      const trigger = screen.getByTestId('trigger');

      fireEvent.click(trigger);
      expect(screen.getByTestId('content')).toBeInTheDocument();

      fireEvent.click(trigger);
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('ESC 키로 팝오버를 닫을 수 있다', () => {
      render(<BasicPopover />);

      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('content')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('외부 클릭 시 팝오버가 닫힌다', () => {
      render(
        <div>
          <BasicPopover />
          <button data-testid="outside">외부</button>
        </div>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('content')).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('팝오버 콘텐츠 내부 클릭 시 팝오버가 닫히지 않는다', () => {
      render(<BasicPopover />);

      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('content')).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByText('팝오버 내용'));
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('defaultOpen prop으로 초기 열림 상태를 설정할 수 있다', () => {
      render(<BasicPopover defaultOpen />);
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('onOpenChange 콜백이 호출된다', () => {
      const handleOpenChange = vi.fn();
      render(<BasicPopover onOpenChange={handleOpenChange} />);

      fireEvent.click(screen.getByTestId('trigger'));
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      fireEvent.click(screen.getByTestId('trigger'));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ============================================
  // 제어 모드 테스트
  // ============================================

  describe('제어 모드', () => {
    it('open prop으로 제어할 수 있다', () => {
      const { rerender } = render(
        <Popover open={false}>
          <PopoverTrigger data-testid="trigger">클릭</PopoverTrigger>
          <PopoverContent data-testid="content">내용</PopoverContent>
        </Popover>
      );

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();

      rerender(
        <Popover open={true}>
          <PopoverTrigger data-testid="trigger">클릭</PopoverTrigger>
          <PopoverContent data-testid="content">내용</PopoverContent>
        </Popover>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('트리거에 aria-haspopup 속성이 있다', () => {
      render(<BasicPopover />);
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('트리거에 aria-expanded 속성이 상태에 따라 변경된다', () => {
      render(<BasicPopover />);
      const trigger = screen.getByTestId('trigger');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('트리거와 콘텐츠가 aria-controls로 연결된다', () => {
      render(<BasicPopover />);
      const trigger = screen.getByTestId('trigger');

      fireEvent.click(trigger);

      const controlsId = trigger.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('id', controlsId);
    });

    it('콘텐츠에 role="dialog" 속성이 있다', () => {
      render(<BasicPopover />);
      fireEvent.click(screen.getByTestId('trigger'));

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('role', 'dialog');
    });

    it('콘텐츠에 aria-modal 속성이 없다 (모달이 아님)', () => {
      render(<BasicPopover />);
      fireEvent.click(screen.getByTestId('trigger'));

      const content = screen.getByTestId('content');
      expect(content).not.toHaveAttribute('aria-modal');
    });
  });

  // ============================================
  // 포지셔닝 테스트
  // ============================================

  describe('포지셔닝', () => {
    it('side prop으로 위치를 설정할 수 있다 - top', () => {
      render(<BasicPopover side="top" />);
      fireEvent.click(screen.getByTestId('trigger'));

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-side', 'top');
    });

    it('side prop으로 위치를 설정할 수 있다 - bottom', () => {
      render(<BasicPopover side="bottom" />);
      fireEvent.click(screen.getByTestId('trigger'));

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-side', 'bottom');
    });

    it('side prop으로 위치를 설정할 수 있다 - left', () => {
      render(<BasicPopover side="left" />);
      fireEvent.click(screen.getByTestId('trigger'));

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-side', 'left');
    });

    it('side prop으로 위치를 설정할 수 있다 - right', () => {
      render(<BasicPopover side="right" />);
      fireEvent.click(screen.getByTestId('trigger'));

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-side', 'right');
    });

    it('align prop으로 정렬을 설정할 수 있다 - start', () => {
      render(<BasicPopover align="start" />);
      fireEvent.click(screen.getByTestId('trigger'));

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-align', 'start');
    });

    it('align prop으로 정렬을 설정할 수 있다 - center', () => {
      render(<BasicPopover align="center" />);
      fireEvent.click(screen.getByTestId('trigger'));

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-align', 'center');
    });

    it('align prop으로 정렬을 설정할 수 있다 - end', () => {
      render(<BasicPopover align="end" />);
      fireEvent.click(screen.getByTestId('trigger'));

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-align', 'end');
    });

    it('기본값은 bottom과 center이다', () => {
      render(<BasicPopover />);
      fireEvent.click(screen.getByTestId('trigger'));

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-side', 'bottom');
      expect(content).toHaveAttribute('data-align', 'center');
    });
  });

  // ============================================
  // 에러 처리 테스트
  // ============================================

  describe('에러 처리', () => {
    it('Popover 없이 PopoverTrigger 사용 시 에러가 발생한다', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<PopoverTrigger>테스트</PopoverTrigger>)).toThrow(
        'Popover 컴포넌트는 Popover 내부에서 사용해야 합니다.'
      );

      consoleError.mockRestore();
    });

    it('Popover 없이 PopoverContent 사용 시 에러가 발생한다', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() =>
        render(
          <PopoverContent>
            <div>내용</div>
          </PopoverContent>
        )
      ).toThrow('Popover 컴포넌트는 Popover 내부에서 사용해야 합니다.');

      consoleError.mockRestore();
    });
  });

  // ============================================
  // Portal 테스트
  // ============================================

  describe('Portal', () => {
    it('팝오버 콘텐츠가 body에 렌더링된다', () => {
      render(<BasicPopover />);
      fireEvent.click(screen.getByTestId('trigger'));

      const content = screen.getByTestId('content');
      // Portal로 렌더링되므로 document.body의 자식 중 하나
      expect(document.body.contains(content)).toBe(true);
    });
  });

  // ============================================
  // axe 접근성 테스트
  // ============================================

  describe('axe 접근성 테스트', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <Popover>
          <PopoverTrigger data-testid="trigger">클릭</PopoverTrigger>
          <PopoverContent>
            <div>팝오버 내용</div>
          </PopoverContent>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('trigger'));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
