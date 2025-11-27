import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

describe('Tabs', () => {
  const renderTabs = (props = {}) => {
    return render(
      <Tabs defaultValue="tab1" {...props}>
        <TabsList>
          <TabsTrigger value="tab1">탭 1</TabsTrigger>
          <TabsTrigger value="tab2">탭 2</TabsTrigger>
          <TabsTrigger value="tab3" disabled>탭 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">탭 1 내용</TabsContent>
        <TabsContent value="tab2">탭 2 내용</TabsContent>
        <TabsContent value="tab3">탭 3 내용</TabsContent>
      </Tabs>
    );
  };

  it('기본 Tabs가 렌더링되어야 한다', () => {
    renderTabs();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('defaultValue에 해당하는 탭이 활성화되어야 한다', () => {
    renderTabs();
    expect(screen.getByText('탭 1 내용')).toBeInTheDocument();
    expect(screen.queryByText('탭 2 내용')).not.toBeInTheDocument();
  });

  it('탭 클릭 시 해당 콘텐츠가 표시되어야 한다', () => {
    renderTabs();

    fireEvent.click(screen.getByRole('tab', { name: '탭 2' }));

    expect(screen.queryByText('탭 1 내용')).not.toBeInTheDocument();
    expect(screen.getByText('탭 2 내용')).toBeInTheDocument();
  });

  it('onValueChange 콜백이 호출되어야 한다', () => {
    const handleValueChange = vi.fn();
    renderTabs({ onValueChange: handleValueChange });

    fireEvent.click(screen.getByRole('tab', { name: '탭 2' }));

    expect(handleValueChange).toHaveBeenCalledWith('tab2');
  });

  it('disabled 탭은 클릭해도 동작하지 않아야 한다', () => {
    const handleValueChange = vi.fn();
    renderTabs({ onValueChange: handleValueChange });

    const disabledTab = screen.getByRole('tab', { name: '탭 3' });
    expect(disabledTab).toBeDisabled();

    fireEvent.click(disabledTab);
    expect(handleValueChange).not.toHaveBeenCalled();
  });

  describe('제어 모드', () => {
    it('value prop으로 활성 탭을 제어할 수 있어야 한다', () => {
      render(
        <Tabs value="tab2">
          <TabsList>
            <TabsTrigger value="tab1">탭 1</TabsTrigger>
            <TabsTrigger value="tab2">탭 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">탭 1 내용</TabsContent>
          <TabsContent value="tab2">탭 2 내용</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('탭 2 내용')).toBeInTheDocument();
      expect(screen.queryByText('탭 1 내용')).not.toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('TabsTrigger에 aria-selected가 설정되어야 한다', () => {
      renderTabs();

      const activeTab = screen.getByRole('tab', { name: '탭 1' });
      const inactiveTab = screen.getByRole('tab', { name: '탭 2' });

      expect(activeTab).toHaveAttribute('aria-selected', 'true');
      expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
    });

    it('TabsContent에 role="tabpanel"이 설정되어야 한다', () => {
      renderTabs();
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('TabsContent에 tabIndex가 설정되어야 한다', () => {
      renderTabs();
      expect(screen.getByRole('tabpanel')).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('스타일', () => {
    it('활성 탭에 data-state="active"가 설정되어야 한다', () => {
      renderTabs();

      const activeTab = screen.getByRole('tab', { name: '탭 1' });
      expect(activeTab).toHaveAttribute('data-state', 'active');
    });

    it('비활성 탭에 data-state="inactive"가 설정되어야 한다', () => {
      renderTabs();

      const inactiveTab = screen.getByRole('tab', { name: '탭 2' });
      expect(inactiveTab).toHaveAttribute('data-state', 'inactive');
    });

    it('커스텀 className이 적용되어야 한다', () => {
      render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList className="custom-list">
            <TabsTrigger value="tab1" className="custom-trigger">탭 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content">내용</TabsContent>
        </Tabs>
      );

      expect(document.querySelector('.custom-tabs')).toBeInTheDocument();
      expect(document.querySelector('.custom-list')).toBeInTheDocument();
      expect(document.querySelector('.custom-trigger')).toBeInTheDocument();
      expect(document.querySelector('.custom-content')).toBeInTheDocument();
    });
  });

  it('ref가 전달되어야 한다', () => {
    const tabsRef = vi.fn();
    const listRef = vi.fn();
    const triggerRef = vi.fn();
    const contentRef = vi.fn();

    render(
      <Tabs defaultValue="tab1" ref={tabsRef}>
        <TabsList ref={listRef}>
          <TabsTrigger value="tab1" ref={triggerRef}>탭 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" ref={contentRef}>내용</TabsContent>
      </Tabs>
    );

    expect(tabsRef).toHaveBeenCalled();
    expect(listRef).toHaveBeenCalled();
    expect(triggerRef).toHaveBeenCalled();
    expect(contentRef).toHaveBeenCalled();
  });
});
