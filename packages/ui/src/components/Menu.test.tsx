import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
} from './Menu';

describe('Menu', () => {
  describe('기본 렌더링', () => {
    it('트리거와 콘텐츠를 렌더링한다', () => {
      render(
        <Menu>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
            <MenuItem>항목 2</MenuItem>
          </MenuContent>
        </Menu>
      );

      expect(screen.getByText('메뉴 열기')).toBeInTheDocument();
    });

    it('초기 상태에서 메뉴가 닫혀있다', () => {
      render(
        <Menu>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
          </MenuContent>
        </Menu>
      );

      expect(screen.queryByText('항목 1')).not.toBeInTheDocument();
    });

    it('defaultOpen이 true일 때 메뉴가 열려있다', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
          </MenuContent>
        </Menu>
      );

      expect(screen.getByText('항목 1')).toBeInTheDocument();
    });
  });

  describe('메뉴 열기/닫기', () => {
    it('트리거 클릭 시 메뉴가 열린다', async () => {
      render(
        <Menu>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
          </MenuContent>
        </Menu>
      );

      fireEvent.click(screen.getByText('메뉴 열기'));
      expect(screen.getByText('항목 1')).toBeInTheDocument();
    });

    it('항목 선택 시 메뉴가 닫힌다', async () => {
      const onSelect = vi.fn();

      render(
        <Menu>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem onSelect={onSelect}>항목 1</MenuItem>
          </MenuContent>
        </Menu>
      );

      fireEvent.click(screen.getByText('메뉴 열기'));
      fireEvent.click(screen.getByText('항목 1'));

      expect(onSelect).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(screen.queryByText('항목 1')).not.toBeInTheDocument();
      });
    });

    it('ESC 키로 메뉴를 닫는다', async () => {
      render(
        <Menu>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
          </MenuContent>
        </Menu>
      );

      fireEvent.click(screen.getByText('메뉴 열기'));
      expect(screen.getByText('항목 1')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByText('항목 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('키보드 네비게이션', () => {
    it('ArrowDown 키로 다음 항목으로 이동한다', async () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
            <MenuItem>항목 2</MenuItem>
            <MenuItem>항목 3</MenuItem>
          </MenuContent>
        </Menu>
      );

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      const items = screen.getAllByRole('menuitem');
      expect(items[1]).toHaveAttribute('data-highlighted', 'true');
    });

    it('ArrowUp 키로 이전 항목으로 이동한다', async () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
            <MenuItem>항목 2</MenuItem>
            <MenuItem>항목 3</MenuItem>
          </MenuContent>
        </Menu>
      );

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowUp' });

      const items = screen.getAllByRole('menuitem');
      expect(items[0]).toHaveAttribute('data-highlighted', 'true');
    });

    it('Enter 키로 하이라이트된 항목을 선택한다', async () => {
      const onSelect = vi.fn();

      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
            <MenuItem onSelect={onSelect}>항목 2</MenuItem>
          </MenuContent>
        </Menu>
      );

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'Enter' });

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('disabled 항목은 건너뛴다', async () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
            <MenuItem disabled>항목 2 (비활성)</MenuItem>
            <MenuItem>항목 3</MenuItem>
          </MenuContent>
        </Menu>
      );

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      const items = screen.getAllByRole('menuitem');
      // 활성화된 항목만 순환하므로 두 번째 ArrowDown은 항목 3으로 이동
      expect(items[2]).toHaveAttribute('data-highlighted', 'true');
    });
  });

  describe('MenuItem 옵션', () => {
    it('아이콘을 표시한다', () => {
      const icon = <span data-testid="icon">🎨</span>;

      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem icon={icon}>항목</MenuItem>
          </MenuContent>
        </Menu>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('destructive 스타일을 적용한다', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem destructive>삭제</MenuItem>
          </MenuContent>
        </Menu>
      );

      const item = screen.getByRole('menuitem');
      expect(item).toHaveAttribute('data-destructive', 'true');
    });

    it('disabled 항목은 클릭할 수 없다', async () => {
      const onSelect = vi.fn();

      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem disabled onSelect={onSelect}>
              항목
            </MenuItem>
          </MenuContent>
        </Menu>
      );

      fireEvent.click(screen.getByText('항목'));
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('MenuSeparator', () => {
    it('구분선을 렌더링한다', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
            <MenuSeparator />
            <MenuItem>항목 2</MenuItem>
          </MenuContent>
        </Menu>
      );

      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
    });
  });

  describe('중첩 메뉴 (서브메뉴)', () => {
    it('서브메뉴를 렌더링한다', async () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
            <MenuSub>
              <MenuSubTrigger>더보기</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>서브항목 1</MenuItem>
                <MenuItem>서브항목 2</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </Menu>
      );

      expect(screen.getByText('더보기')).toBeInTheDocument();
      expect(screen.queryByText('서브항목 1')).not.toBeInTheDocument();

      // 서브메뉴 트리거에 마우스 오버
      fireEvent.mouseEnter(screen.getByText('더보기'));

      await waitFor(() => {
        expect(screen.getByText('서브항목 1')).toBeInTheDocument();
      });
    });

    it('ArrowRight 키로 서브메뉴를 연다', async () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuSub>
              <MenuSubTrigger>더보기</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>서브항목 1</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </Menu>
      );

      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowRight' });

      await waitFor(() => {
        expect(screen.getByText('서브항목 1')).toBeInTheDocument();
      });
    });

    it('ArrowLeft 키로 서브메뉴를 닫는다', async () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuSub>
              <MenuSubTrigger>더보기</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>서브항목 1</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </Menu>
      );

      // 서브메뉴 열기
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowRight' });

      await waitFor(() => {
        expect(screen.getByText('서브항목 1')).toBeInTheDocument();
      });

      // 서브메뉴 닫기
      fireEvent.keyDown(document, { key: 'ArrowLeft' });

      await waitFor(() => {
        expect(screen.queryByText('서브항목 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('접근성', () => {
    it('role="menu"와 role="menuitem"을 설정한다', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목 1</MenuItem>
            <MenuItem>항목 2</MenuItem>
          </MenuContent>
        </Menu>
      );

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    });

    it('aria-disabled를 설정한다', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem disabled>항목</MenuItem>
          </MenuContent>
        </Menu>
      );

      const item = screen.getByRole('menuitem');
      expect(item).toHaveAttribute('aria-disabled', 'true');
    });

    it('aria-haspopup을 트리거에 설정한다', () => {
      render(
        <Menu>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목</MenuItem>
          </MenuContent>
        </Menu>
      );

      const trigger = screen.getByText('메뉴 열기');
      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    });

    it('aria-expanded를 트리거에 설정한다', async () => {
      render(
        <Menu>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목</MenuItem>
          </MenuContent>
        </Menu>
      );

      const trigger = screen.getByText('메뉴 열기');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('제어 모드', () => {
    it('open prop으로 메뉴 상태를 제어한다', () => {
      const { rerender } = render(
        <Menu open={false}>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목</MenuItem>
          </MenuContent>
        </Menu>
      );

      expect(screen.queryByText('항목')).not.toBeInTheDocument();

      rerender(
        <Menu open={true}>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목</MenuItem>
          </MenuContent>
        </Menu>
      );

      expect(screen.getByText('항목')).toBeInTheDocument();
    });

    it('onOpenChange 콜백을 호출한다', async () => {
      const onOpenChange = vi.fn();

      render(
        <Menu onOpenChange={onOpenChange}>
          <MenuTrigger>메뉴 열기</MenuTrigger>
          <MenuContent>
            <MenuItem>항목</MenuItem>
          </MenuContent>
        </Menu>
      );

      fireEvent.click(screen.getByText('메뉴 열기'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });
});
