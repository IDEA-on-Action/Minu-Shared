import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VisuallyHidden } from './VisuallyHidden';
import * as React from 'react';

describe('VisuallyHidden', () => {
  it('children을 렌더링한다', () => {
    render(<VisuallyHidden>숨겨진 텍스트</VisuallyHidden>);
    expect(screen.getByText('숨겨진 텍스트')).toBeInTheDocument();
  });

  it('시각적으로 숨기는 스타일을 적용한다', () => {
    render(<VisuallyHidden>숨겨진 텍스트</VisuallyHidden>);
    const element = screen.getByText('숨겨진 텍스트');

    expect(element).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      border: '0',
    });
  });

  it('clip 스타일을 적용한다', () => {
    render(<VisuallyHidden>숨겨진 텍스트</VisuallyHidden>);
    const element = screen.getByText('숨겨진 텍스트');

    // jsdom은 clip 값을 'rect(0px, 0px, 0px, 0px)' 형식으로 정규화함
    expect(element.style.clip).toMatch(/rect\(0(px)?, 0(px)?, 0(px)?, 0(px)?\)/);
  });

  it('커스텀 스타일을 추가로 적용할 수 있다', () => {
    render(
      <VisuallyHidden style={{ color: 'red' }}>
        숨겨진 텍스트
      </VisuallyHidden>
    );
    const element = screen.getByText('숨겨진 텍스트');

    // jsdom은 색상을 rgb 형식으로 정규화함
    expect(element).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    // 기존 숨김 스타일도 유지
    expect(element).toHaveStyle({ position: 'absolute' });
  });

  it('추가 props를 전달할 수 있다', () => {
    render(
      <VisuallyHidden data-testid="hidden-element" id="my-hidden">
        숨겨진 텍스트
      </VisuallyHidden>
    );
    const element = screen.getByTestId('hidden-element');

    expect(element).toHaveAttribute('id', 'my-hidden');
  });

  it('ref를 전달할 수 있다', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<VisuallyHidden ref={ref}>숨겨진 텍스트</VisuallyHidden>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.textContent).toBe('숨겨진 텍스트');
  });

  it('span 요소로 렌더링된다', () => {
    render(<VisuallyHidden>숨겨진 텍스트</VisuallyHidden>);
    const element = screen.getByText('숨겨진 텍스트');

    expect(element.tagName).toBe('SPAN');
  });

  it('displayName이 설정되어 있다', () => {
    expect(VisuallyHidden.displayName).toBe('VisuallyHidden');
  });

  it('aria-label과 함께 사용할 수 있다', () => {
    render(
      <button aria-labelledby="label">
        <span>X</span>
        <VisuallyHidden id="label">닫기 버튼</VisuallyHidden>
      </button>
    );

    expect(screen.getByText('닫기 버튼')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-labelledby', 'label');
  });

  it('복잡한 children도 렌더링할 수 있다', () => {
    render(
      <VisuallyHidden>
        <span>첫 번째</span>
        <span>두 번째</span>
      </VisuallyHidden>
    );

    expect(screen.getByText('첫 번째')).toBeInTheDocument();
    expect(screen.getByText('두 번째')).toBeInTheDocument();
  });
});
