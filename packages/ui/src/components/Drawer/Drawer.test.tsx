import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('open이 false일 때 렌더링되지 않는다', () => {
      render(
        <Drawer open={false}>
          <Drawer.Content>
            <Drawer.Title>테스트 드로어</Drawer.Title>
          </Drawer.Content>
        </Drawer>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('open이 true일 때 렌더링된다', () => {
      render(
        <Drawer open={true}>
          <Drawer.Content>
            <Drawer.Title>테스트 드로어</Drawer.Title>
          </Drawer.Content>
        </Drawer>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('title이 올바르게 렌더링된다', () => {
      render(
        <Drawer open={true}>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>드로어 제목</Drawer.Title>
            </Drawer.Header>
          </Drawer.Content>
        </Drawer>
      );

      expect(screen.getByText('드로어 제목')).toBeInTheDocument();
    });

    it('body 내용이 렌더링된다', () => {
      render(
        <Drawer open={true}>
          <Drawer.Content>
            <Drawer.Body>드로어 본문 내용</Drawer.Body>
          </Drawer.Content>
        </Drawer>
      );

      expect(screen.getByText('드로어 본문 내용')).toBeInTheDocument();
    });
  });

  // ============================================
  // side 옵션 테스트
  // ============================================

  describe('side 옵션', () => {
    it('기본 side는 right이다', () => {
      render(
        <Drawer open={true}>
          <Drawer.Content>
            <Drawer.Title>제목</Drawer.Title>
          </Drawer.Content>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('right-0');
    });

    it('side="left"일 때 왼쪽에 위치한다', () => {
      render(
        <Drawer open={true} side="left">
          <Drawer.Content>
            <Drawer.Title>제목</Drawer.Title>
          </Drawer.Content>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('left-0');
    });

    it('side="top"일 때 상단에 위치한다', () => {
      render(
        <Drawer open={true} side="top">
          <Drawer.Content>
            <Drawer.Title>제목</Drawer.Title>
          </Drawer.Content>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('top-0');
    });

    it('side="bottom"일 때 하단에 위치한다', () => {
      render(
        <Drawer open={true} side="bottom">
          <Drawer.Content>
            <Drawer.Title>제목</Drawer.Title>
          </Drawer.Content>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('bottom-0');
    });
  });

  // ============================================
  // 상호작용 테스트
  // ============================================

  describe('상호작용', () => {
    it('닫기 버튼 클릭 시 onOpenChange가 호출된다', () => {
      const onOpenChange = vi.fn();

      render(
        <Drawer open={true} onOpenChange={onOpenChange}>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>제목</Drawer.Title>
              <Drawer.Close />
            </Drawer.Header>
          </Drawer.Content>
        </Drawer>
      );

      fireEvent.click(screen.getByLabelText('닫기'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('Backdrop 클릭 시 onOpenChange가 호출된다', () => {
      const onOpenChange = vi.fn();

      render(
        <Drawer open={true} onOpenChange={onOpenChange}>
          <Drawer.Content>
            <Drawer.Title>제목</Drawer.Title>
          </Drawer.Content>
        </Drawer>
      );

      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onOpenChange).toHaveBeenCalledWith(false);
      }
    });

    it('ESC 키 입력 시 onOpenChange가 호출된다', () => {
      const onOpenChange = vi.fn();

      render(
        <Drawer open={true} onOpenChange={onOpenChange}>
          <Drawer.Content>
            <Drawer.Title>제목</Drawer.Title>
          </Drawer.Content>
        </Drawer>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ============================================
  // 접근성 테스트
  // ============================================

  describe('접근성', () => {
    it('role="dialog"와 aria-modal="true" 속성이 있다', () => {
      render(
        <Drawer open={true}>
          <Drawer.Content>
            <Drawer.Title>접근성 테스트</Drawer.Title>
          </Drawer.Content>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('aria-labelledby가 title과 연결되어 있다', () => {
      render(
        <Drawer open={true}>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>제목</Drawer.Title>
            </Drawer.Header>
          </Drawer.Content>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();

      const title = screen.getByText('제목');
      expect(title).toHaveAttribute('id', labelledBy);
    });

    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <Drawer open={true}>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>드로어 제목</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>드로어 내용</Drawer.Body>
          </Drawer.Content>
        </Drawer>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
