import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runAxe, resetAxe } from '../../test-utils';
import { ToastProvider, useToast } from './Toast';

// 테스트용 컴포넌트
function TestComponent() {
  const { toast, dismissAll } = useToast();

  return (
    <div>
      <button onClick={() => toast({ title: '기본 토스트' })}>기본 토스트</button>
      <button onClick={() => toast({ title: '성공', variant: 'success' })}>성공 토스트</button>
      <button onClick={() => toast({ title: '에러', variant: 'error' })}>에러 토스트</button>
      <button onClick={() => toast({ title: '경고', variant: 'warning' })}>경고 토스트</button>
      <button onClick={() => toast({ title: '정보', variant: 'info' })}>정보 토스트</button>
      <button
        onClick={() =>
          toast({
            title: '액션',
            description: '설명',
            action: { label: '실행', onClick: () => {} },
          })
        }
      >
        액션 토스트
      </button>
      <button onClick={dismissAll}>모두 닫기</button>
    </div>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('ToastProvider가 자식 요소를 렌더링한다', () => {
      render(
        <ToastProvider>
          <div>자식 요소</div>
        </ToastProvider>
      );

      expect(screen.getByText('자식 요소')).toBeInTheDocument();
    });

    it('toast 호출 시 토스트가 렌더링된다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: '기본 토스트' }));
      expect(screen.getByRole('alert')).toBeInTheDocument();
      // 버튼과 토스트 모두 '기본 토스트' 텍스트를 포함하므로 getAllByText 사용
      expect(screen.getAllByText('기본 토스트')).toHaveLength(2);
    });

    it('description이 있으면 렌더링된다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('액션 토스트'));
      expect(screen.getByText('설명')).toBeInTheDocument();
    });

    it('action이 있으면 버튼이 렌더링된다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('액션 토스트'));
      expect(screen.getByText('실행')).toBeInTheDocument();
    });
  });

  // ============================================
  // variant 테스트
  // ============================================

  describe('variants', () => {
    it('success variant가 올바르게 렌더링된다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('성공 토스트'));
      expect(screen.getByText('성공')).toBeInTheDocument();
    });

    it('error variant가 올바르게 렌더링된다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('에러 토스트'));
      expect(screen.getByText('에러')).toBeInTheDocument();
    });

    it('warning variant가 올바르게 렌더링된다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('경고 토스트'));
      expect(screen.getByText('경고')).toBeInTheDocument();
    });

    it('info variant가 올바르게 렌더링된다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('정보 토스트'));
      expect(screen.getByText('정보')).toBeInTheDocument();
    });
  });

  // ============================================
  // 상호작용 테스트
  // ============================================

  describe('상호작용', () => {
    it('닫기 버튼 클릭 시 토스트가 사라진다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('기본 토스트'));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('닫기'));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('dismissAll 호출 시 모든 토스트가 사라진다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('기본 토스트'));
      fireEvent.click(screen.getByText('성공 토스트'));
      expect(screen.getAllByRole('alert')).toHaveLength(2);

      fireEvent.click(screen.getByText('모두 닫기'));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('duration 이후 자동으로 사라진다', () => {
      render(
        <ToastProvider defaultDuration={1000}>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('기본 토스트'));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // 최대 개수 테스트
  // ============================================

  describe('최대 개수', () => {
    it('maxToasts를 초과하면 오래된 토스트가 제거된다', () => {
      render(
        <ToastProvider maxToasts={2}>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('기본 토스트'));
      fireEvent.click(screen.getByText('성공 토스트'));
      fireEvent.click(screen.getByText('에러 토스트'));

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('토스트에 role="alert" 속성이 있다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('기본 토스트'));
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('토스트 컨테이너에 aria-live 속성이 있다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const container = document.querySelector('[aria-live="polite"]');
      expect(container).toBeInTheDocument();
    });

    it('닫기 버튼에 aria-label이 있다', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('기본 토스트'));
      expect(screen.getByLabelText('닫기')).toBeInTheDocument();
    });
  });

  // ============================================
  // 에러 처리 테스트
  // ============================================

  describe('에러 처리', () => {
    it('ToastProvider 없이 useToast 호출 시 에러가 발생한다', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      function BrokenComponent() {
        useToast();
        return null;
      }

      expect(() => render(<BrokenComponent />)).toThrow(
        'useToast는 ToastProvider 내부에서 사용해야 합니다.'
      );

      consoleError.mockRestore();
    });
  });

  // ============================================
  // axe 접근성 테스트
  // ============================================

  describe('axe 접근성 테스트', () => {
    afterEach(() => {
      resetAxe();
    });

    it('접근성 위반이 없어야 한다', async () => {
      vi.useRealTimers(); // axe 테스트는 실제 타이머 사용

      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('기본 토스트'));

      await runAxe(container);

      vi.useFakeTimers(); // 다른 테스트를 위해 다시 fake 타이머로
    }, 30000);
  });
});
