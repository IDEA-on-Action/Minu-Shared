import * as React from 'react';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 숨길 콘텐츠 */
  children: React.ReactNode;
}

/**
 * VisuallyHidden 컴포넌트
 *
 * 시각적으로 숨기되 스크린 리더에서는 읽을 수 있는 콘텐츠를 제공합니다.
 * 접근성을 위해 아이콘 버튼이나 시각적 요소에 레이블을 추가할 때 사용합니다.
 *
 * @example
 * ```tsx
 * <button>
 *   <CloseIcon />
 *   <VisuallyHidden>닫기</VisuallyHidden>
 * </button>
 * ```
 */
export const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ children, style, ...props }, ref) => {
    return (
      <span
        ref={ref}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
          ...style,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';
