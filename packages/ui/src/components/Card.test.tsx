import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';

describe('Card', () => {
  it('Card가 렌더링되어야 한다', () => {
    render(<Card data-testid="card">내용</Card>);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('Card에 커스텀 className이 적용되어야 한다', () => {
    render(<Card data-testid="card" className="custom-class">내용</Card>);
    expect(screen.getByTestId('card')).toHaveClass('custom-class');
  });

  it('Card에 ref가 전달되어야 한다', () => {
    const ref = vi.fn();
    render(<Card ref={ref}>내용</Card>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardHeader', () => {
  it('CardHeader가 렌더링되어야 한다', () => {
    render(<CardHeader data-testid="header">헤더</CardHeader>);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('CardHeader에 커스텀 className이 적용되어야 한다', () => {
    render(<CardHeader data-testid="header" className="custom-class">헤더</CardHeader>);
    expect(screen.getByTestId('header')).toHaveClass('custom-class');
  });

  it('CardHeader에 ref가 전달되어야 한다', () => {
    const ref = vi.fn();
    render(<CardHeader ref={ref}>헤더</CardHeader>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardTitle', () => {
  it('CardTitle이 렌더링되어야 한다', () => {
    render(<CardTitle>제목</CardTitle>);
    expect(screen.getByText('제목')).toBeInTheDocument();
  });

  it('CardTitle이 h3 태그로 렌더링되어야 한다', () => {
    render(<CardTitle>제목</CardTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('CardTitle에 커스텀 className이 적용되어야 한다', () => {
    render(<CardTitle className="custom-class">제목</CardTitle>);
    expect(screen.getByText('제목')).toHaveClass('custom-class');
  });

  it('CardTitle에 ref가 전달되어야 한다', () => {
    const ref = vi.fn();
    render(<CardTitle ref={ref}>제목</CardTitle>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardDescription', () => {
  it('CardDescription이 렌더링되어야 한다', () => {
    render(<CardDescription>설명</CardDescription>);
    expect(screen.getByText('설명')).toBeInTheDocument();
  });

  it('CardDescription에 커스텀 className이 적용되어야 한다', () => {
    render(<CardDescription className="custom-class">설명</CardDescription>);
    expect(screen.getByText('설명')).toHaveClass('custom-class');
  });

  it('CardDescription에 ref가 전달되어야 한다', () => {
    const ref = vi.fn();
    render(<CardDescription ref={ref}>설명</CardDescription>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardContent', () => {
  it('CardContent가 렌더링되어야 한다', () => {
    render(<CardContent data-testid="content">콘텐츠</CardContent>);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('CardContent에 커스텀 className이 적용되어야 한다', () => {
    render(<CardContent data-testid="content" className="custom-class">콘텐츠</CardContent>);
    expect(screen.getByTestId('content')).toHaveClass('custom-class');
  });

  it('CardContent에 ref가 전달되어야 한다', () => {
    const ref = vi.fn();
    render(<CardContent ref={ref}>콘텐츠</CardContent>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('CardFooter', () => {
  it('CardFooter가 렌더링되어야 한다', () => {
    render(<CardFooter data-testid="footer">푸터</CardFooter>);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('CardFooter에 커스텀 className이 적용되어야 한다', () => {
    render(<CardFooter data-testid="footer" className="custom-class">푸터</CardFooter>);
    expect(screen.getByTestId('footer')).toHaveClass('custom-class');
  });

  it('CardFooter에 ref가 전달되어야 한다', () => {
    const ref = vi.fn();
    render(<CardFooter ref={ref}>푸터</CardFooter>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('Card 조합', () => {
  it('모든 서브 컴포넌트가 함께 렌더링되어야 한다', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle>카드 제목</CardTitle>
          <CardDescription>카드 설명</CardDescription>
        </CardHeader>
        <CardContent data-testid="content">
          카드 콘텐츠
        </CardContent>
        <CardFooter data-testid="footer">
          카드 푸터
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('카드 제목')).toBeInTheDocument();
    expect(screen.getByText('카드 설명')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('카드 콘텐츠')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('카드 푸터')).toBeInTheDocument();
  });
});
