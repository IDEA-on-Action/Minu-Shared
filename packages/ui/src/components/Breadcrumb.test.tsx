import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { runAxe, resetAxe } from '../test-utils';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from './Breadcrumb';

describe('Breadcrumb', () => {
  const renderBreadcrumb = () => {
    return render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">홈</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">제품</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>상세</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  it('기본 Breadcrumb이 렌더링되어야 한다', () => {
    renderBreadcrumb();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('nav에 aria-label="breadcrumb"이 설정되어야 한다', () => {
    renderBreadcrumb();
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb');
  });

  it('BreadcrumbList에 role="list"가 설정되어야 한다', () => {
    renderBreadcrumb();
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('BreadcrumbItem에 role="listitem"이 설정되어야 한다', () => {
    renderBreadcrumb();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('BreadcrumbLink가 올바른 href를 가져야 한다', () => {
    renderBreadcrumb();
    const homeLink = screen.getByRole('link', { name: '홈' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('현재 페이지에 aria-current="page"가 설정되어야 한다', () => {
    renderBreadcrumb();
    const currentPage = screen.getByText('상세');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  describe('BreadcrumbSeparator', () => {
    it('기본 구분자 "/"가 표시되어야 한다', () => {
      const { container } = renderBreadcrumb();
      const separators = container.querySelectorAll('[role="presentation"]');
      expect(separators).toHaveLength(2);
      expect(separators[0]).toHaveTextContent('/');
    });

    it('커스텀 구분자가 표시되어야 한다', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>제품</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      const separator = container.querySelector('[role="presentation"]');
      expect(separator).toHaveTextContent('>');
    });

    it('aria-hidden="true"가 설정되어야 한다', () => {
      const { container } = renderBreadcrumb();
      const separators = container.querySelectorAll('[role="presentation"]');
      separators.forEach(separator => {
        expect(separator).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('BreadcrumbLink', () => {
    it('asChild가 true일 때 자식 요소를 렌더링해야 한다', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <a href="/custom" className="custom-link">커스텀 링크</a>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      const link = screen.getByRole('link', { name: '커스텀 링크' });
      expect(link).toHaveClass('custom-link');
      expect(link).toHaveAttribute('href', '/custom');
    });

    it('asChild가 false일 때 기본 a 태그를 렌더링해야 한다', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/test">테스트</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      const link = screen.getByRole('link', { name: '테스트' });
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('스타일', () => {
    it('커스텀 className이 적용되어야 한다', () => {
      render(
        <Breadcrumb className="custom-breadcrumb">
          <BreadcrumbList className="custom-list">
            <BreadcrumbItem className="custom-item">
              <BreadcrumbLink href="/" className="custom-link">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="custom-separator" />
            <BreadcrumbItem>
              <BreadcrumbPage className="custom-page">현재</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(document.querySelector('.custom-breadcrumb')).toBeInTheDocument();
      expect(document.querySelector('.custom-list')).toBeInTheDocument();
      expect(document.querySelector('.custom-item')).toBeInTheDocument();
      expect(document.querySelector('.custom-link')).toBeInTheDocument();
      expect(document.querySelector('.custom-separator')).toBeInTheDocument();
      expect(document.querySelector('.custom-page')).toBeInTheDocument();
    });
  });

  describe('ref', () => {
    it('ref가 전달되어야 한다', () => {
      const breadcrumbRef = vi.fn();
      const listRef = vi.fn();
      const itemRef = vi.fn();
      const linkRef = vi.fn();
      const pageRef = vi.fn();

      render(
        <Breadcrumb ref={breadcrumbRef}>
          <BreadcrumbList ref={listRef}>
            <BreadcrumbItem ref={itemRef}>
              <BreadcrumbLink href="/" ref={linkRef}>홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage ref={pageRef}>현재</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(breadcrumbRef).toHaveBeenCalled();
      expect(listRef).toHaveBeenCalled();
      expect(itemRef).toHaveBeenCalled();
      expect(linkRef).toHaveBeenCalled();
      expect(pageRef).toHaveBeenCalled();
    });
  });

  describe('복잡한 시나리오', () => {
    it('긴 경로를 올바르게 렌더링해야 한다', () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/category">카테고리</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/category/sub">하위 카테고리</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>제품 상세</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      // BreadcrumbPage도 role="link"를 가지므로 총 4개
      expect(screen.getAllByRole('link')).toHaveLength(4);
      expect(container.querySelectorAll('[role="presentation"]')).toHaveLength(3);
      expect(screen.getByText('제품 상세')).toHaveAttribute('aria-current', 'page');
    });

    it('아이콘과 함께 사용할 수 있어야 한다', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <span className="icon">🏠</span> 홈
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <span className="icon">📄</span> 현재
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(document.querySelector('.icon')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    afterEach(() => {
      resetAxe();
    });

    it('접근성 위반이 없어야 한다', async () => {
      const { container } = render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">제품</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>상세</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      await runAxe(container);
    });
  });
});
