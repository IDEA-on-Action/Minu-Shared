import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectSearch,
  SelectItem,
  SelectEmpty,
} from './Select';

// 기본 Select 래퍼
function BasicSelect({
  defaultValue,
  onValueChange,
  multiple,
  searchable,
  disabled,
}: {
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
}) {
  return (
    <Select
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      multiple={multiple}
      searchable={searchable}
      disabled={disabled}
    >
      <SelectTrigger data-testid="trigger">
        <SelectValue placeholder="선택하세요" />
      </SelectTrigger>
      <SelectContent data-testid="content">
        {searchable && <SelectSearch data-testid="search" />}
        <SelectItem value="option1">옵션 1</SelectItem>
        <SelectItem value="option2">옵션 2</SelectItem>
        <SelectItem value="option3" disabled>
          옵션 3 (비활성)
        </SelectItem>
        <SelectEmpty />
      </SelectContent>
    </Select>
  );
}

describe('Select', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('SelectTrigger가 렌더링된다', () => {
      render(<BasicSelect />);
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('placeholder가 표시된다', () => {
      render(<BasicSelect />);
      expect(screen.getByText('선택하세요')).toBeInTheDocument();
    });

    it('트리거 클릭 시 SelectContent가 열린다', () => {
      render(<BasicSelect />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('SelectItem이 렌더링된다', () => {
      render(<BasicSelect />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByText('옵션 1')).toBeInTheDocument();
      expect(screen.getByText('옵션 2')).toBeInTheDocument();
    });
  });

  // ============================================
  // 단일 선택 테스트
  // ============================================

  describe('단일 선택', () => {
    it('옵션 클릭 시 선택된다', () => {
      const handleChange = vi.fn();
      render(<BasicSelect onValueChange={handleChange} />);

      fireEvent.click(screen.getByTestId('trigger'));
      fireEvent.click(screen.getByText('옵션 1'));

      expect(handleChange).toHaveBeenCalledWith('option1');
    });

    it('선택 후 드롭다운이 닫힌다', () => {
      render(<BasicSelect />);

      fireEvent.click(screen.getByTestId('trigger'));
      fireEvent.click(screen.getByText('옵션 1'));

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('defaultValue가 적용된다', () => {
      render(<BasicSelect defaultValue="option2" />);
      fireEvent.click(screen.getByTestId('trigger'));
      const option = screen.getByRole('option', { name: /옵션 2/ });
      expect(option).toHaveAttribute('aria-selected', 'true');
    });

    it('선택된 옵션에 체크 표시가 있다', () => {
      render(<BasicSelect defaultValue="option1" />);
      fireEvent.click(screen.getByTestId('trigger'));

      const option = screen.getByRole('option', { name: /옵션 1/ });
      expect(option).toHaveAttribute('aria-selected', 'true');
    });
  });

  // ============================================
  // 다중 선택 테스트
  // ============================================

  describe('다중 선택', () => {
    it('multiple 모드에서 여러 옵션을 선택할 수 있다', () => {
      const handleChange = vi.fn();
      render(<BasicSelect multiple onValueChange={handleChange} />);

      fireEvent.click(screen.getByTestId('trigger'));
      fireEvent.click(screen.getByText('옵션 1'));

      // 다중 선택에서는 드롭다운이 열린 상태 유지
      fireEvent.click(screen.getByText('옵션 2'));

      expect(handleChange).toHaveBeenCalledWith(['option1']);
      expect(handleChange).toHaveBeenCalledWith(['option1', 'option2']);
    });

    it('다중 선택 시 선택 개수가 표시된다', () => {
      render(<BasicSelect multiple defaultValue={['option1', 'option2']} />);
      expect(screen.getByText('2개 선택됨')).toBeInTheDocument();
    });

    it('선택된 옵션을 다시 클릭하면 선택 해제된다', () => {
      const handleChange = vi.fn();
      render(<BasicSelect multiple defaultValue={['option1']} onValueChange={handleChange} />);

      fireEvent.click(screen.getByTestId('trigger'));
      const option1 = screen.getByRole('option', { name: /옵션 1/ });
      fireEvent.click(option1);

      expect(handleChange).toHaveBeenCalledWith([]);
    });
  });

  // ============================================
  // 검색 기능 테스트
  // ============================================

  describe('검색', () => {
    it('searchable 모드에서 검색 입력창이 표시된다', () => {
      render(<BasicSelect searchable />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('search')).toBeInTheDocument();
    });

    it('검색어로 옵션을 필터링할 수 있다', () => {
      render(<BasicSelect searchable />);
      fireEvent.click(screen.getByTestId('trigger'));

      const searchInput = screen.getByTestId('search');
      fireEvent.change(searchInput, { target: { value: '옵션 1' } });

      expect(screen.getByText('옵션 1')).toBeInTheDocument();
      expect(screen.queryByText('옵션 2')).not.toBeInTheDocument();
    });

    it('검색 결과가 없으면 빈 상태 메시지가 표시된다', () => {
      render(<BasicSelect searchable />);
      fireEvent.click(screen.getByTestId('trigger'));

      const searchInput = screen.getByTestId('search');
      fireEvent.change(searchInput, { target: { value: '없는 옵션' } });

      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  // ============================================
  // disabled 상태 테스트
  // ============================================

  describe('disabled', () => {
    it('disabled 상태에서 트리거가 비활성화된다', () => {
      render(<BasicSelect disabled />);
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeDisabled();
    });

    it('disabled 옵션은 클릭해도 선택되지 않는다', () => {
      const handleChange = vi.fn();
      render(<BasicSelect onValueChange={handleChange} />);

      fireEvent.click(screen.getByTestId('trigger'));
      fireEvent.click(screen.getByText('옵션 3 (비활성)'));

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('disabled 옵션에 aria-disabled가 적용된다', () => {
      render(<BasicSelect />);
      fireEvent.click(screen.getByTestId('trigger'));

      const disabledOption = screen.getByRole('option', { name: /옵션 3/ });
      expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // ============================================
  // 키보드 네비게이션 테스트
  // ============================================

  describe('키보드 네비게이션', () => {
    it('ESC 키로 드롭다운을 닫을 수 있다', () => {
      render(<BasicSelect />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('content')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('ArrowDown으로 옵션을 탐색할 수 있다', () => {
      render(<BasicSelect />);
      fireEvent.click(screen.getByTestId('trigger'));

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('data-highlighted', 'true');
    });

    it('Enter로 옵션을 선택할 수 있다', () => {
      const handleChange = vi.fn();
      render(<BasicSelect onValueChange={handleChange} />);
      fireEvent.click(screen.getByTestId('trigger'));

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'Enter' });

      expect(handleChange).toHaveBeenCalledWith('option1');
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('트리거에 role="combobox" 속성이 있다', () => {
      render(<BasicSelect />);
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('role', 'combobox');
    });

    it('트리거에 aria-expanded 속성이 있다', () => {
      render(<BasicSelect />);
      const trigger = screen.getByTestId('trigger');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('콘텐츠에 role="listbox" 속성이 있다', () => {
      render(<BasicSelect />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('옵션에 role="option" 속성이 있다', () => {
      render(<BasicSelect />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    });

    it('다중 선택 시 aria-multiselectable이 true이다', () => {
      render(<BasicSelect multiple />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    });
  });

  // ============================================
  // 외부 클릭 테스트
  // ============================================

  describe('외부 클릭', () => {
    it('외부 클릭 시 드롭다운이 닫힌다', () => {
      render(
        <div>
          <BasicSelect />
          <button data-testid="outside">외부</button>
        </div>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('content')).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // 에러 처리 테스트
  // ============================================

  describe('에러 처리', () => {
    it('Select 없이 SelectTrigger 사용 시 에러가 발생한다', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<SelectTrigger>테스트</SelectTrigger>)).toThrow(
        'Select 컴포넌트는 Select 내부에서 사용해야 합니다.'
      );

      consoleError.mockRestore();
    });
  });
});
