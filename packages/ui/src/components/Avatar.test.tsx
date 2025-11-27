import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================

  describe('렌더링', () => {
    it('기본 아바타가 렌더링된다', () => {
      render(<Avatar data-testid="avatar" />);
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('ref가 올바르게 전달된다', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(<Avatar ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  // ============================================
  // 이미지 테스트
  // ============================================

  describe('이미지', () => {
    it('src가 있으면 이미지가 렌더링된다', () => {
      render(<Avatar src="/test.jpg" alt="테스트 이미지" data-testid="avatar" />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/test.jpg');
      expect(img).toHaveAttribute('alt', '테스트 이미지');
    });

    it('alt가 없으면 name이 alt로 사용된다', () => {
      render(<Avatar src="/test.jpg" name="홍길동" />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', '홍길동');
    });

    it('alt와 name이 없으면 기본 alt가 사용된다', () => {
      render(<Avatar src="/test.jpg" />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', '아바타');
    });

    it('이미지 로드 실패 시 폴백이 표시된다', () => {
      render(<Avatar src="/invalid.jpg" name="홍길동" data-testid="avatar" />);
      const img = screen.getByRole('img');
      fireEvent.error(img);
      expect(screen.getByText('홍길')).toBeInTheDocument();
    });
  });

  // ============================================
  // 이니셜 테스트
  // ============================================

  describe('이니셜', () => {
    it('src가 없고 name이 있으면 이니셜이 표시된다', () => {
      render(<Avatar name="홍길동" data-testid="avatar" />);
      expect(screen.getByText('홍길')).toBeInTheDocument();
    });

    it('두 단어 이름은 첫글자와 마지막글자 이니셜이 표시된다', () => {
      render(<Avatar name="John Doe" data-testid="avatar" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('세 단어 이상 이름도 첫글자와 마지막글자 이니셜이 표시된다', () => {
      render(<Avatar name="Kim Min Su" data-testid="avatar" />);
      expect(screen.getByText('KS')).toBeInTheDocument();
    });

    it('한 글자 이름은 두 글자까지 표시된다', () => {
      render(<Avatar name="A" data-testid="avatar" />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  // ============================================
  // 폴백 아이콘 테스트
  // ============================================

  describe('폴백 아이콘', () => {
    it('src와 name이 없으면 기본 아이콘이 표시된다', () => {
      render(<Avatar data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      const svg = avatar.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  // ============================================
  // size 테스트
  // ============================================

  describe('sizes', () => {
    it('xs 크기가 적용된다', () => {
      render(<Avatar size="xs" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-6');
      expect(avatar).toHaveClass('w-6');
    });

    it('sm 크기가 적용된다', () => {
      render(<Avatar size="sm" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-8');
      expect(avatar).toHaveClass('w-8');
    });

    it('md 크기가 적용된다 (기본값)', () => {
      render(<Avatar size="md" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-10');
      expect(avatar).toHaveClass('w-10');
    });

    it('lg 크기가 적용된다', () => {
      render(<Avatar size="lg" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-12');
      expect(avatar).toHaveClass('w-12');
    });

    it('xl 크기가 적용된다', () => {
      render(<Avatar size="xl" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-16');
      expect(avatar).toHaveClass('w-16');
    });
  });

  // ============================================
  // status 테스트
  // ============================================

  describe('status', () => {
    it('online 상태가 표시된다', () => {
      render(<Avatar status="online" data-testid="avatar" />);
      const status = screen.getByLabelText('상태: online');
      expect(status).toHaveClass('bg-green-500');
    });

    it('offline 상태가 표시된다', () => {
      render(<Avatar status="offline" data-testid="avatar" />);
      const status = screen.getByLabelText('상태: offline');
      expect(status).toHaveClass('bg-gray-400');
    });

    it('busy 상태가 표시된다', () => {
      render(<Avatar status="busy" data-testid="avatar" />);
      const status = screen.getByLabelText('상태: busy');
      expect(status).toHaveClass('bg-red-500');
    });

    it('away 상태가 표시된다', () => {
      render(<Avatar status="away" data-testid="avatar" />);
      const status = screen.getByLabelText('상태: away');
      expect(status).toHaveClass('bg-yellow-500');
    });

    it('status가 없으면 상태 인디케이터가 표시되지 않는다', () => {
      render(<Avatar data-testid="avatar" />);
      expect(screen.queryByLabelText(/상태:/)).not.toBeInTheDocument();
    });
  });

  // ============================================
  // 스타일 테스트
  // ============================================

  describe('스타일', () => {
    it('기본 스타일이 적용된다', () => {
      render(<Avatar data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('rounded-full');
      expect(avatar).toHaveClass('overflow-hidden');
    });

    it('커스텀 className이 병합된다', () => {
      render(<Avatar className="custom-class" data-testid="avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('custom-class');
      expect(avatar).toHaveClass('rounded-full');
    });
  });

  // ============================================
  // Props 전달 테스트
  // ============================================

  describe('props 전달', () => {
    it('HTML 속성이 올바르게 전달된다', () => {
      render(<Avatar data-testid="avatar" id="my-avatar" />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('id', 'my-avatar');
    });
  });
});
