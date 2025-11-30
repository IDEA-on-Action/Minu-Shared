import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('기본 페이지네이션이 렌더링되어야 한다', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument();
  });

  it('페이지 번호 버튼이 렌더링되어야 한다', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    // siblingCount=1이므로 2, 3, 4 페이지가 표시되어야 함
    expect(screen.getByRole('button', { name: '2 페이지로 이동' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3 페이지' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 페이지로 이동' })).toBeInTheDocument();
  });

  it('현재 페이지에 aria-current가 적용되어야 한다', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    const currentButton = screen.getByRole('button', { name: '3 페이지' });
    expect(currentButton).toHaveAttribute('aria-current', 'page');
  });

  it('페이지 클릭 시 onPageChange가 호출되어야 한다', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '2 페이지로 이동' }));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  describe('이전/다음 버튼', () => {
    it('이전/다음 버튼이 렌더링되어야 한다', () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: '이전 페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '다음 페이지' })).toBeInTheDocument();
    });

    it('첫 페이지에서 이전 버튼이 비활성화되어야 한다', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={vi.fn()}
        />
      );

      const prevButton = screen.getByRole('button', { name: '이전 페이지' });
      expect(prevButton).toBeDisabled();
    });

    it('마지막 페이지에서 다음 버튼이 비활성화되어야 한다', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={5}
          onPageChange={vi.fn()}
        />
      );

      const nextButton = screen.getByRole('button', { name: '다음 페이지' });
      expect(nextButton).toBeDisabled();
    });

    it('이전 버튼 클릭 시 이전 페이지로 이동해야 한다', () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '이전 페이지' }));
      expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    it('다음 버튼 클릭 시 다음 페이지로 이동해야 한다', () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }));
      expect(handlePageChange).toHaveBeenCalledWith(4);
    });
  });

  describe('처음/끝 버튼', () => {
    it('기본적으로 처음/끝 버튼이 렌더링되어야 한다', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={10}
          onPageChange={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: '첫 페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '마지막 페이지' })).toBeInTheDocument();
    });

    it('showFirstLast=false일 때 처음/끝 버튼이 표시되지 않아야 한다', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={10}
          onPageChange={vi.fn()}
          showFirstLast={false}
        />
      );

      expect(screen.queryByRole('button', { name: '첫 페이지' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '마지막 페이지' })).not.toBeInTheDocument();
    });

    it('첫 페이지에서 처음 버튼이 비활성화되어야 한다', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={10}
          onPageChange={vi.fn()}
        />
      );

      const firstButton = screen.getByRole('button', { name: '첫 페이지' });
      expect(firstButton).toBeDisabled();
    });

    it('마지막 페이지에서 끝 버튼이 비활성화되어야 한다', () => {
      render(
        <Pagination
          currentPage={10}
          totalPages={10}
          onPageChange={vi.fn()}
        />
      );

      const lastButton = screen.getByRole('button', { name: '마지막 페이지' });
      expect(lastButton).toBeDisabled();
    });

    it('처음 버튼 클릭 시 첫 페이지로 이동해야 한다', () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={5}
          totalPages={10}
          onPageChange={handlePageChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '첫 페이지' }));
      expect(handlePageChange).toHaveBeenCalledWith(1);
    });

    it('끝 버튼 클릭 시 마지막 페이지로 이동해야 한다', () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={5}
          totalPages={10}
          onPageChange={handlePageChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '마지막 페이지' }));
      expect(handlePageChange).toHaveBeenCalledWith(10);
    });
  });

  describe('생략 표시', () => {
    it('많은 페이지가 있을 때 생략 표시가 나타나야 한다', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={20}
          onPageChange={vi.fn()}
        />
      );

      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBeGreaterThan(0);
    });

    it('적은 페이지일 때 모든 페이지가 표시되어야 한다', () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: '1 페이지로 이동' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2 페이지로 이동' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3 페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4 페이지로 이동' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5 페이지로 이동' })).toBeInTheDocument();
    });
  });

  describe('siblingCount', () => {
    it('siblingCount=2일 때 현재 페이지 양옆 2개씩 표시되어야 한다', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={10}
          onPageChange={vi.fn()}
          siblingCount={2}
        />
      );

      // 3, 4, 5, 6, 7이 표시되어야 함
      expect(screen.getByRole('button', { name: '3 페이지로 이동' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4 페이지로 이동' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5 페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '6 페이지로 이동' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '7 페이지로 이동' })).toBeInTheDocument();
    });
  });

  describe('disabled', () => {
    it('disabled일 때 모든 버튼이 비활성화되어야 한다', () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={vi.fn()}
          disabled
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('disabled일 때 클릭 이벤트가 무시되어야 한다', () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={handlePageChange}
          disabled
        />
      );

      const nextButton = screen.getByRole('button', { name: '다음 페이지' });
      fireEvent.click(nextButton);
      expect(handlePageChange).not.toHaveBeenCalled();
    });
  });

  it('커스텀 className이 적용되어야 한다', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
        className="custom-pagination"
      />
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-pagination');
  });

  describe('접근성', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <Pagination
          currentPage={3}
          totalPages={10}
          onPageChange={vi.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('nav 요소에 aria-label이 있어야 한다', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={vi.fn()}
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'pagination');
    });
  });

  describe('경계 조건', () => {
    it('totalPages=1일 때 페이지 버튼만 표시되어야 한다', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={1}
          onPageChange={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: '1 페이지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled();
    });

    it('currentPage가 범위를 벗어나면 적절히 처리되어야 한다', () => {
      render(
        <Pagination
          currentPage={0}
          totalPages={5}
          onPageChange={vi.fn()}
        />
      );

      // 컴포넌트가 깨지지 않고 렌더링되어야 함
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});
