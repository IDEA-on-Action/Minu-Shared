import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { axe } from 'jest-axe';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('기본 툴팁이 렌더링된다', () => {
      render(
        <Tooltip content="툴팁 내용">
          <button>호버하세요</button>
        </Tooltip>
      );
      expect(screen.getByRole('button', { name: '호버하세요' })).toBeInTheDocument();
    });

    it('초기에는 툴팁이 숨겨져 있다', () => {
      render(
        <Tooltip content="툴팁 내용">
          <button>호버하세요</button>
        </Tooltip>
      );
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = { current: null } as React.RefObject<HTMLButtonElement>;
      render(
        <Tooltip content="툴팁">
          <button ref={ref}>버튼</button>
        </Tooltip>
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  // ============================================
  // 인터랙션 테스트 (Hover)
  // ============================================

  describe('인터랙션 (Hover)', () => {
    it('마우스 hover 시 툴팁이 표시된다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('마우스 leave 시 툴팁이 숨겨진다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(trigger);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('delay 시간 후에 툴팁이 표시된다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={200}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      // delay 전에는 표시되지 않음
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // delay 후 표시
      vi.runAllTimers();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('delay 전에 마우스가 떠나면 툴팁이 표시되지 않는다', () => {
      render(
        <Tooltip content="툴팁 내용" delay={200}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.advanceTimersByTime(100); // delay의 절반만 진행

      fireEvent.mouseLeave(trigger);

      vi.runAllTimers(); // 나머지 시간 진행

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // 인터랙션 테스트 (Focus)
  // ============================================

  describe('인터랙션 (Focus)', () => {
    it('focus 시 툴팁이 표시된다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>포커스하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.focus(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('blur 시 툴팁이 숨겨진다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>포커스하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.focus(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.blur(trigger);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // disabled 상태 테스트
  // ============================================

  describe('disabled', () => {
    it('disabled일 때 툴팁이 표시되지 않는다 (hover)', () => {
      render(
        <Tooltip content="툴팁 내용" disabled delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('disabled일 때 툴팁이 표시되지 않는다 (focus)', () => {
      render(
        <Tooltip content="툴팁 내용" disabled delay={100}>
          <button>포커스하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.focus(trigger);

      vi.runAllTimers();

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // side 위치 테스트
  // ============================================

  describe('side 위치', () => {
    it('side="top"이 기본값으로 적용된다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('data-side', 'top');
      });
    });

    it('side="bottom"이 적용된다', async () => {
      render(
        <Tooltip content="툴팁 내용" side="bottom" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('data-side', 'bottom');
      });
    });

    it('side="left"이 적용된다', async () => {
      render(
        <Tooltip content="툴팁 내용" side="left" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('data-side', 'left');
      });
    });

    it('side="right"이 적용된다', async () => {
      render(
        <Tooltip content="툴팁 내용" side="right" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('data-side', 'right');
      });
    });
  });

  // ============================================
  // align 정렬 테스트
  // ============================================

  describe('align 정렬', () => {
    it('align="center"가 기본값으로 적용된다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('data-align', 'center');
      });
    });

    it('align="start"가 적용된다', async () => {
      render(
        <Tooltip content="툴팁 내용" align="start" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('data-align', 'start');
      });
    });

    it('align="end"가 적용된다', async () => {
      render(
        <Tooltip content="툴팁 내용" align="end" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('data-align', 'end');
      });
    });
  });

  // ============================================
  // 툴팁 내용 테스트
  // ============================================

  describe('툴팁 내용', () => {
    it('문자열 content가 렌더링된다', async () => {
      render(
        <Tooltip content="간단한 툴팁" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        expect(screen.getByText('간단한 툴팁')).toBeInTheDocument();
      });
    });

    it('ReactNode content가 렌더링된다', async () => {
      render(
        <Tooltip
          content={
            <div>
              <strong>제목</strong>
              <p>설명</p>
            </div>
          }
          delay={100}
        >
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        expect(screen.getByText('제목')).toBeInTheDocument();
        expect(screen.getByText('설명')).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('role="tooltip"이 설정된다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('aria-describedby가 올바르게 연결된다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const tooltipId = tooltip.getAttribute('id');
        expect(trigger).toHaveAttribute('aria-describedby', tooltipId);
      });
    });

    it('툴팁이 숨겨지면 aria-describedby가 제거된다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-describedby');
      });

      fireEvent.mouseLeave(trigger);

      await waitFor(() => {
        expect(trigger).not.toHaveAttribute('aria-describedby');
      });
    });
  });

  // ============================================
  // 애니메이션 테스트
  // ============================================

  describe('애니메이션', () => {
    it('툴팁이 fade-in 애니메이션을 가진다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('animate-in');
        expect(tooltip).toHaveClass('fade-in');
      });
    });
  });

  // ============================================
  // Portal 테스트
  // ============================================

  describe('Portal', () => {
    it('툴팁이 body에 렌더링된다', async () => {
      render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip.parentElement).toBe(document.body);
      });
    });
  });

  // ============================================
  // axe 접근성 테스트
  // ============================================

  describe('axe 접근성 테스트', () => {
    it('툴팁이 표시되지 않았을 때 접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <Tooltip content="툴팁 내용">
          <button>호버하세요</button>
        </Tooltip>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('툴팁이 표시되었을 때 접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <Tooltip content="툴팁 내용" delay={100}>
          <button>호버하세요</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      vi.runAllTimers();

      await waitFor(async () => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });
});
