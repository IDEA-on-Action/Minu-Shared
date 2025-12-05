import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { runAxe, resetAxe } from '../test-utils';
import { Button } from './Button';

describe('Button', () => {
  afterEach(() => {
    resetAxe();
  });
  it('기본 버튼이 렌더링되어야 한다', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
  });

  it('클릭 이벤트가 동작해야 한다', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서 클릭이 무시되어야 한다', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>클릭</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('isLoading 상태에서 버튼이 비활성화되어야 한다', () => {
    render(<Button isLoading>로딩 중</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('isLoading 상태에서 스피너가 표시되어야 한다', () => {
    render(<Button isLoading>로딩 중</Button>);

    const spinner = document.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  describe('variant', () => {
    it('default variant가 적용되어야 한다', () => {
      render(<Button variant="default">버튼</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('destructive variant가 적용되어야 한다', () => {
      render(<Button variant="destructive">삭제</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    it('outline variant가 적용되어야 한다', () => {
      render(<Button variant="outline">버튼</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
    });

    it('secondary variant가 적용되어야 한다', () => {
      render(<Button variant="secondary">버튼</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });

    it('ghost variant가 적용되어야 한다', () => {
      render(<Button variant="ghost">버튼</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('link variant가 적용되어야 한다', () => {
      render(<Button variant="link">링크</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('underline-offset-4');
    });
  });

  describe('size', () => {
    it('default size가 적용되어야 한다', () => {
      render(<Button size="default">버튼</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
    });

    it('sm size가 적용되어야 한다', () => {
      render(<Button size="sm">버튼</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
    });

    it('lg size가 적용되어야 한다', () => {
      render(<Button size="lg">버튼</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
    });

    it('icon size가 적용되어야 한다', () => {
      render(<Button size="icon">+</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-9');
    });
  });

  it('커스텀 className이 적용되어야 한다', () => {
    render(<Button className="custom-class">버튼</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('ref가 전달되어야 한다', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>버튼</Button>);
    expect(ref).toHaveBeenCalled();
  });

  describe('접근성', () => {
    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(<Button>접근성 테스트</Button>);
      await runAxe(container);
    });
  });
});
