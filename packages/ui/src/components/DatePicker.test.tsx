import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { runAxe, resetAxe } from '../test-utils';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  afterEach(() => {
    resetAxe();
  });
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('기본 DatePicker가 렌더링된다', () => {
      render(<DatePicker />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('placeholder가 렌더링된다', () => {
      render(<DatePicker placeholder="날짜를 선택하세요" />);
      expect(screen.getByPlaceholderText('날짜를 선택하세요')).toBeInTheDocument();
    });

    it('기본 placeholder가 렌더링된다', () => {
      render(<DatePicker />);
      expect(screen.getByPlaceholderText('날짜 선택')).toBeInTheDocument();
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = { current: null } as React.RefObject<HTMLInputElement>;
      render(<DatePicker ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  // ============================================
  // 제어/비제어 모드 테스트
  // ============================================

  describe('제어/비제어 모드', () => {
    it('비제어 모드: defaultValue가 적용된다', () => {
      const defaultDate = new Date(2025, 0, 15); // 2025-01-15
      render(<DatePicker defaultValue={defaultDate} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('2025-01-15');
    });

    it('제어 모드: value prop이 적용된다', () => {
      const date = new Date(2025, 0, 20); // 2025-01-20
      render(<DatePicker value={date} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('2025-01-20');
    });

    it('제어 모드: onChange가 호출된다', async () => {
      const handleChange = vi.fn();
      const value = new Date(2025, 0, 15);
      render(<DatePicker value={value} onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      // 캘린더가 열리고 다른 날짜 선택
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dateButton = screen.getByRole('button', { name: '2025-01-20' });
      fireEvent.click(dateButton);

      expect(handleChange).toHaveBeenCalled();
      const calledDate = handleChange.mock.calls[0][0];
      expect(calledDate?.getDate()).toBe(20);
    });
  });

  // ============================================
  // 캘린더 팝업 테스트
  // ============================================

  describe('캘린더 팝업', () => {
    it('입력 필드 클릭 시 캘린더가 표시된다', async () => {
      render(<DatePicker />);
      const input = screen.getByRole('textbox');

      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('ESC 키로 캘린더를 닫을 수 있다', async () => {
      render(<DatePicker />);
      const input = screen.getByRole('textbox');

      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('외부 클릭 시 캘린더가 닫힌다', async () => {
      render(
        <div>
          <DatePicker />
          <div data-testid="outside">Outside</div>
        </div>
      );

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // 날짜 선택 테스트
  // ============================================

  describe('날짜 선택', () => {
    it('날짜 클릭으로 선택할 수 있다', async () => {
      const handleChange = vi.fn();
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      render(<DatePicker onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 15일 버튼 찾기 - formatDate 형식으로
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-15`;
      const dateButton = screen.getByRole('button', { name: dateStr });
      fireEvent.click(dateButton);

      expect(handleChange).toHaveBeenCalled();
    });

    it('선택한 날짜가 입력 필드에 표시된다', async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      render(<DatePicker />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-15`;
      const dateButton = screen.getByRole('button', { name: dateStr });
      fireEvent.click(dateButton);

      await waitFor(() => {
        const inputValue = (input as HTMLInputElement).value;
        expect(inputValue).toContain('-15');
      });
    });

    it('선택된 날짜가 하이라이트된다', async () => {
      const selectedDate = new Date(2025, 0, 15);
      render(<DatePicker value={selectedDate} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const selectedButton = screen.getByRole('button', { name: '2025-01-15' });
      expect(selectedButton).toHaveAttribute('aria-selected', 'true');
    });
  });

  // ============================================
  // 월 네비게이션 테스트
  // ============================================

  describe('월 네비게이션', () => {
    it('이전 월 버튼이 동작한다', async () => {
      render(<DatePicker value={new Date(2025, 1, 1)} />); // 2025년 2월

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /이전 월/i });
      fireEvent.click(prevButton);

      // 2025년 1월로 변경됨
      expect(screen.getByText('2025년 1월')).toBeInTheDocument();
    });

    it('다음 월 버튼이 동작한다', async () => {
      render(<DatePicker value={new Date(2025, 0, 1)} />); // 2025년 1월

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /다음 월/i });
      fireEvent.click(nextButton);

      // 2025년 2월로 변경됨
      expect(screen.getByText('2025년 2월')).toBeInTheDocument();
    });
  });

  // ============================================
  // 년도 선택 테스트
  // ============================================

  describe('년도 선택', () => {
    it('년도 선택 드롭다운이 표시된다', async () => {
      render(<DatePicker value={new Date(2025, 0, 1)} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const yearSelect = screen.getByRole('combobox');
      expect(yearSelect).toBeInTheDocument();
    });

    it('년도 선택이 동작한다', async () => {
      render(<DatePicker value={new Date(2025, 0, 1)} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const yearSelect = screen.getByRole('combobox');
      fireEvent.change(yearSelect, { target: { value: '2024' } });

      expect(screen.getByText('2024년 1월')).toBeInTheDocument();
    });
  });

  // ============================================
  // min/max 제약 테스트
  // ============================================

  describe('min/max 제약', () => {
    it('min 날짜 이전은 비활성화된다', async () => {
      const min = new Date(2025, 0, 10); // 2025-01-10
      render(<DatePicker value={new Date(2025, 0, 15)} min={min} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const disabledButton = screen.getByRole('button', { name: '2025-01-05' });
      expect(disabledButton).toBeDisabled();
    });

    it('max 날짜 이후는 비활성화된다', async () => {
      const max = new Date(2025, 0, 20); // 2025-01-20
      render(<DatePicker value={new Date(2025, 0, 15)} max={max} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const disabledButton = screen.getByRole('button', { name: '2025-01-25' });
      expect(disabledButton).toBeDisabled();
    });
  });

  // ============================================
  // disabled 상태 테스트
  // ============================================

  describe('disabled', () => {
    it('disabled 상태가 적용된다', () => {
      render(<DatePicker disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('disabled 상태에서는 캘린더가 열리지 않는다', () => {
      render(<DatePicker disabled />);
      const input = screen.getByRole('textbox');

      fireEvent.click(input);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // 키보드 네비게이션 테스트
  // ============================================

  describe('키보드 네비게이션', () => {
    it('ArrowRight로 다음 날짜로 이동한다', async () => {
      render(<DatePicker value={new Date(2025, 0, 15)} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const selectedButton = screen.getByRole('button', { name: '2025-01-15' });
      selectedButton.focus();
      fireEvent.keyDown(selectedButton, { key: 'ArrowRight' });

      const nextButton = screen.getByRole('button', { name: '2025-01-16' });
      expect(nextButton).toHaveFocus();
    });

    it('ArrowLeft로 이전 날짜로 이동한다', async () => {
      render(<DatePicker value={new Date(2025, 0, 15)} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const selectedButton = screen.getByRole('button', { name: '2025-01-15' });
      selectedButton.focus();
      fireEvent.keyDown(selectedButton, { key: 'ArrowLeft' });

      const prevButton = screen.getByRole('button', { name: '2025-01-14' });
      expect(prevButton).toHaveFocus();
    });

    it('ArrowDown으로 다음 주로 이동한다', async () => {
      render(<DatePicker value={new Date(2025, 0, 15)} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const selectedButton = screen.getByRole('button', { name: '2025-01-15' });
      selectedButton.focus();
      fireEvent.keyDown(selectedButton, { key: 'ArrowDown' });

      const nextWeekButton = screen.getByRole('button', { name: '2025-01-22' });
      expect(nextWeekButton).toHaveFocus();
    });

    it('ArrowUp으로 이전 주로 이동한다', async () => {
      render(<DatePicker value={new Date(2025, 0, 15)} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const selectedButton = screen.getByRole('button', { name: '2025-01-15' });
      selectedButton.focus();
      fireEvent.keyDown(selectedButton, { key: 'ArrowUp' });

      const prevWeekButton = screen.getByRole('button', { name: '2025-01-08' });
      expect(prevWeekButton).toHaveFocus();
    });
  });

  // ============================================
  // 포맷팅 테스트
  // ============================================

  describe('포맷팅', () => {
    it('기본 포맷(yyyy-MM-dd)으로 표시된다', () => {
      const date = new Date(2025, 0, 15);
      render(<DatePicker value={date} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('2025-01-15');
    });

    it('locale이 적용된다', () => {
      const date = new Date(2025, 0, 15);
      render(<DatePicker value={date} locale="en-US" />);
      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      // 영어로 월 표시 확인
      expect(screen.getByText(/January/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('입력 필드에 role="textbox"가 설정된다', () => {
      render(<DatePicker />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('캘린더에 role="dialog"가 설정된다', async () => {
      render(<DatePicker />);
      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('날짜 버튼에 aria-selected가 설정된다', async () => {
      const selectedDate = new Date(2025, 0, 15);
      render(<DatePicker value={selectedDate} />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const selectedButton = screen.getByRole('button', { name: '2025-01-15' });
      expect(selectedButton).toHaveAttribute('aria-selected', 'true');
    });

    it('aria-label이 적용된다', async () => {
      render(<DatePicker />);
      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-label');
      });
    });
  });

  // ============================================
  // axe 접근성 테스트
  // ============================================

  describe('axe 접근성 테스트', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(<DatePicker />);
      await runAxe(container);
    });

    it('캘린더 팝업에 접근성 위반이 없어야 한다', async () => {
      const { container } = render(<DatePicker />);
      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await runAxe(container);
    });
  });

  // ============================================
  // 오늘 날짜 하이라이트 테스트
  // ============================================

  describe('오늘 날짜 하이라이트', () => {
    it('오늘 날짜가 하이라이트된다', async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      render(<DatePicker />);

      const input = screen.getByRole('textbox');
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const todayButton = screen.getByRole('button', { name: todayStr });
      expect(todayButton).toHaveClass('font-bold');
    });
  });
});
