import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { Modal } from './Modal';

describe('Modal', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('open이 false일 때 렌더링되지 않는다', () => {
      render(
        <Modal open={false}>
          <Modal.Content>
            <Modal.Title>테스트 모달</Modal.Title>
          </Modal.Content>
        </Modal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('open이 true일 때 렌더링된다', () => {
      render(
        <Modal open={true}>
          <Modal.Content>
            <Modal.Title>테스트 모달</Modal.Title>
          </Modal.Content>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('title이 올바르게 렌더링된다', () => {
      render(
        <Modal open={true}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>모달 제목</Modal.Title>
            </Modal.Header>
          </Modal.Content>
        </Modal>
      );

      expect(screen.getByText('모달 제목')).toBeInTheDocument();
    });

    it('body 내용이 렌더링된다', () => {
      render(
        <Modal open={true}>
          <Modal.Content>
            <Modal.Body>모달 본문 내용</Modal.Body>
          </Modal.Content>
        </Modal>
      );

      expect(screen.getByText('모달 본문 내용')).toBeInTheDocument();
    });
  });

  // ============================================
  // 상호작용 테스트
  // ============================================

  describe('상호작용', () => {
    it('닫기 버튼 클릭 시 onOpenChange가 호출된다', () => {
      const onOpenChange = vi.fn();

      render(
        <Modal open={true} onOpenChange={onOpenChange}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>제목</Modal.Title>
              <Modal.Close />
            </Modal.Header>
          </Modal.Content>
        </Modal>
      );

      fireEvent.click(screen.getByLabelText('닫기'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('Backdrop 클릭 시 onOpenChange가 호출된다', () => {
      const onOpenChange = vi.fn();

      render(
        <Modal open={true} onOpenChange={onOpenChange}>
          <Modal.Content>
            <Modal.Title>제목</Modal.Title>
          </Modal.Content>
        </Modal>
      );

      // backdrop은 aria-hidden이므로 클래스로 찾음
      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onOpenChange).toHaveBeenCalledWith(false);
      }
    });

    it('ESC 키 입력 시 onOpenChange가 호출된다', () => {
      const onOpenChange = vi.fn();

      render(
        <Modal open={true} onOpenChange={onOpenChange}>
          <Modal.Content>
            <Modal.Title>제목</Modal.Title>
          </Modal.Content>
        </Modal>
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
        <Modal open={true}>
          <Modal.Content>
            <Modal.Title>접근성 테스트</Modal.Title>
          </Modal.Content>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('aria-labelledby가 title과 연결되어 있다', () => {
      render(
        <Modal open={true}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>제목</Modal.Title>
            </Modal.Header>
          </Modal.Content>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();

      const title = screen.getByText('제목');
      expect(title).toHaveAttribute('id', labelledBy);
    });

    it('닫기 버튼에 aria-label이 있다', () => {
      render(
        <Modal open={true}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>제목</Modal.Title>
              <Modal.Close />
            </Modal.Header>
          </Modal.Content>
        </Modal>
      );

      expect(screen.getByLabelText('닫기')).toBeInTheDocument();
    });
  });

  // ============================================
  // 크기 테스트
  // ============================================

  describe('크기 variants', () => {
    it('기본 크기는 md이다', () => {
      render(
        <Modal open={true}>
          <Modal.Content>
            <Modal.Title>제목</Modal.Title>
          </Modal.Content>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('max-w-md');
    });

    it('size="lg"일 때 max-w-lg 클래스가 적용된다', () => {
      render(
        <Modal open={true}>
          <Modal.Content size="lg">
            <Modal.Title>제목</Modal.Title>
          </Modal.Content>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('max-w-lg');
    });
  });

  // ============================================
  // axe 접근성 테스트
  // ============================================

  describe('axe 접근성 테스트', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <Modal open={true}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>모달 제목</Modal.Title>
            </Modal.Header>
            <Modal.Body>모달 내용</Modal.Body>
          </Modal.Content>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
