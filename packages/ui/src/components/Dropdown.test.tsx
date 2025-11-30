import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from './Dropdown';

// 기본 Dropdown 래퍼
function BasicDropdown({
  defaultOpen,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  return (
    <Dropdown defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DropdownTrigger data-testid="trigger">메뉴</DropdownTrigger>
      <DropdownContent data-testid="content">
        <DropdownLabel>라벨</DropdownLabel>
        <DropdownItem data-testid="item1" onSelect={() => {}}>
          항목 1
        </DropdownItem>
        <DropdownItem data-testid="item2" onSelect={() => {}}>
          항목 2
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem data-testid="item3" disabled>
          비활성 항목
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}

describe('Dropdown', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('DropdownTrigger가 렌더링된다', () => {
      render(<BasicDropdown />);
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('초기에는 DropdownContent가 보이지 않는다', () => {
      render(<BasicDropdown />);
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('트리거 클릭 시 DropdownContent가 열린다', () => {
      render(<BasicDropdown />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('DropdownItem이 렌더링된다', () => {
      render(<BasicDropdown />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('item1')).toBeInTheDocument();
      expect(screen.getByTestId('item2')).toBeInTheDocument();
    });

    it('DropdownLabel이 렌더링된다', () => {
      render(<BasicDropdown />);
      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByText('라벨')).toBeInTheDocument();
    });

    it('DropdownSeparator가 렌더링된다', () => {
      render(<BasicDropdown />);
      fireEvent.click(screen.getByTestId('trigger'));
      const separators = screen.getAllByRole('separator');
      expect(separators.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // 열기/닫기 테스트
  // ============================================

  describe('열기/닫기', () => {
    it('트리거 클릭으로 드롭다운을 열 수 있다', () => {
      render(<BasicDropdown />);
      const trigger = screen.getByTestId('trigger');

      fireEvent.click(trigger);
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('트리거 재클릭으로 드롭다운을 닫을 수 있다', () => {
      render(<BasicDropdown />);
      const trigger = screen.getByTestId('trigger');

      fireEvent.click(trigger);
      expect(screen.getByTestId('content')).toBeInTheDocument();

      fireEvent.click(trigger);
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('항목 클릭 시 드롭다운이 닫힌다', () => {
      render(<BasicDropdown />);

      fireEvent.click(screen.getByTestId('trigger'));
      fireEvent.click(screen.getByTestId('item1'));

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('ESC 키로 드롭다운을 닫을 수 있다', () => {
      render(<BasicDropdown />);

      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('content')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('외부 클릭 시 드롭다운이 닫힌다', () => {
      render(
        <div>
          <BasicDropdown />
          <button data-testid="outside">외부</button>
        </div>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByTestId('content')).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('defaultOpen prop으로 초기 열림 상태를 설정할 수 있다', () => {
      render(<BasicDropdown defaultOpen />);
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('onOpenChange 콜백이 호출된다', () => {
      const handleOpenChange = vi.fn();
      render(<BasicDropdown onOpenChange={handleOpenChange} />);

      fireEvent.click(screen.getByTestId('trigger'));
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      fireEvent.click(screen.getByTestId('trigger'));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ============================================
  // 항목 선택 테스트
  // ============================================

  describe('항목 선택', () => {
    it('항목 클릭 시 onSelect 콜백이 호출된다', () => {
      const handleSelect = vi.fn();

      render(
        <Dropdown>
          <DropdownTrigger data-testid="trigger">메뉴</DropdownTrigger>
          <DropdownContent>
            <DropdownItem data-testid="item" onSelect={handleSelect}>
              항목
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      fireEvent.click(screen.getByTestId('item'));

      expect(handleSelect).toHaveBeenCalled();
    });

    it('비활성화된 항목은 클릭해도 onSelect가 호출되지 않는다', () => {
      const handleSelect = vi.fn();

      render(
        <Dropdown>
          <DropdownTrigger data-testid="trigger">메뉴</DropdownTrigger>
          <DropdownContent>
            <DropdownItem data-testid="item" disabled onSelect={handleSelect}>
              비활성 항목
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      fireEvent.click(screen.getByTestId('item'));

      expect(handleSelect).not.toHaveBeenCalled();
    });

    it('비활성화된 항목 클릭 시 드롭다운이 닫히지 않는다', () => {
      render(<BasicDropdown />);

      fireEvent.click(screen.getByTestId('trigger'));
      fireEvent.click(screen.getByTestId('item3'));

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  // ============================================
  // 키보드 네비게이션 테스트
  // ============================================

  describe('키보드 네비게이션', () => {
    it('ArrowDown으로 다음 항목으로 이동할 수 있다', async () => {
      render(<BasicDropdown />);

      fireEvent.click(screen.getByTestId('trigger'));

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(screen.getByTestId('item1')).toHaveAttribute('data-highlighted', 'true');
      });
    });

    it('ArrowUp으로 이전 항목으로 이동할 수 있다', async () => {
      render(<BasicDropdown />);

      fireEvent.click(screen.getByTestId('trigger'));

      // 첫 항목으로 이동
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      // 마지막 항목으로 순환
      fireEvent.keyDown(document, { key: 'ArrowUp' });

      await waitFor(() => {
        expect(screen.getByTestId('item2')).toHaveAttribute('data-highlighted', 'true');
      });
    });

    it('Enter 키로 하이라이트된 항목을 선택할 수 있다', async () => {
      const handleSelect = vi.fn();

      render(
        <Dropdown>
          <DropdownTrigger data-testid="trigger">메뉴</DropdownTrigger>
          <DropdownContent>
            <DropdownItem data-testid="item" onSelect={handleSelect}>
              항목
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'Enter' });

      await waitFor(() => {
        expect(handleSelect).toHaveBeenCalled();
      });
    });

    it('비활성화된 항목은 키보드 네비게이션에서 건너뛴다', async () => {
      render(<BasicDropdown />);

      fireEvent.click(screen.getByTestId('trigger'));

      // item1으로 이동
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      // item2로 이동
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      // item3(disabled)는 건너뛰고 다시 item1으로 순환
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(screen.getByTestId('item1')).toHaveAttribute('data-highlighted', 'true');
      });
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('트리거에 aria-haspopup 속성이 있다', () => {
      render(<BasicDropdown />);
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    });

    it('트리거에 aria-expanded 속성이 상태에 따라 변경된다', () => {
      render(<BasicDropdown />);
      const trigger = screen.getByTestId('trigger');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('콘텐츠에 role="menu" 속성이 있다', () => {
      render(<BasicDropdown />);
      fireEvent.click(screen.getByTestId('trigger'));

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('항목에 role="menuitem" 속성이 있다', () => {
      render(<BasicDropdown />);
      fireEvent.click(screen.getByTestId('trigger'));

      const menuitems = screen.getAllByRole('menuitem');
      expect(menuitems.length).toBeGreaterThan(0);
    });

    it('비활성화된 항목에 aria-disabled 속성이 있다', () => {
      render(<BasicDropdown />);
      fireEvent.click(screen.getByTestId('trigger'));

      const disabledItem = screen.getByTestId('item3');
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('라벨에 role="presentation" 속성이 있다', () => {
      render(<BasicDropdown />);
      fireEvent.click(screen.getByTestId('trigger'));

      const label = screen.getByText('라벨');
      expect(label).toHaveAttribute('role', 'presentation');
    });

    it('구분선에 role="separator" 속성이 있다', () => {
      render(<BasicDropdown />);
      fireEvent.click(screen.getByTestId('trigger'));

      const separators = screen.getAllByRole('separator');
      expect(separators.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // 포지셔닝 테스트
  // ============================================

  describe('포지셔닝', () => {
    it('side prop으로 위치를 설정할 수 있다', () => {
      render(
        <Dropdown>
          <DropdownTrigger data-testid="trigger">메뉴</DropdownTrigger>
          <DropdownContent side="top" data-testid="content">
            <DropdownItem>항목</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-side', 'top');
    });

    it('align prop으로 정렬을 설정할 수 있다', () => {
      render(
        <Dropdown>
          <DropdownTrigger data-testid="trigger">메뉴</DropdownTrigger>
          <DropdownContent align="end" data-testid="content">
            <DropdownItem>항목</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-align', 'end');
    });
  });

  // ============================================
  // 에러 처리 테스트
  // ============================================

  describe('에러 처리', () => {
    it('Dropdown 없이 DropdownTrigger 사용 시 에러가 발생한다', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<DropdownTrigger>테스트</DropdownTrigger>)).toThrow(
        'Dropdown 컴포넌트는 Dropdown 내부에서 사용해야 합니다.'
      );

      consoleError.mockRestore();
    });
  });

  // ============================================
  // axe 접근성 테스트
  // ============================================

  describe('axe 접근성 테스트', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <Dropdown>
          <DropdownTrigger data-testid="trigger">메뉴</DropdownTrigger>
          <DropdownContent>
            <DropdownItem>항목 1</DropdownItem>
            <DropdownItem>항목 2</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );

      fireEvent.click(screen.getByTestId('trigger'));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
