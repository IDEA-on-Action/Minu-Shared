import * as React from 'react';
import { cn } from '../utils/cn';
import { Portal } from '../primitives/Portal';
import { useId } from '../hooks/use-id';

export interface TooltipProps {
  /** 툴팁 내용 */
  content: React.ReactNode;
  /** 툴팁 위치 */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** 툴팁 정렬 */
  align?: 'start' | 'center' | 'end';
  /** 표시 지연 시간 (ms) */
  delay?: number;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 툴팁을 트리거할 자식 요소 */
  children: React.ReactElement;
}

/**
 * Minu 공용 Tooltip 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <Tooltip content="도움말 텍스트">
 *   <button>호버하세요</button>
 * </Tooltip>
 *
 * // 위치와 정렬 지정
 * <Tooltip content="자세한 설명" side="right" align="start">
 *   <span>?</span>
 * </Tooltip>
 *
 * // 지연 시간 설정
 * <Tooltip content="500ms 후 표시" delay={500}>
 *   <button>천천히 호버</button>
 * </Tooltip>
 *
 * // 복잡한 내용
 * <Tooltip
 *   content={
 *     <div>
 *       <strong>제목</strong>
 *       <p>상세 설명</p>
 *     </div>
 *   }
 * >
 *   <button>정보</button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  side = 'top',
  align = 'center',
  delay = 200,
  disabled = false,
  children,
}: TooltipProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId('tooltip');

  // 툴팁 위치 계산
  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const gap = 8; // 트리거와 툴팁 사이 간격

    // 툴팁 크기를 알 수 없으므로 예상 크기 사용 (실제로는 렌더 후 조정됨)
    const estimatedWidth = 200;
    const estimatedHeight = 40;

    let top = 0;
    let left = 0;

    // side에 따른 기본 위치 계산
    switch (side) {
      case 'top':
        top = triggerRect.top - estimatedHeight - gap;
        left = triggerRect.left + triggerRect.width / 2 - estimatedWidth / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - estimatedWidth / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - estimatedHeight / 2;
        left = triggerRect.left - estimatedWidth - gap;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - estimatedHeight / 2;
        left = triggerRect.right + gap;
        break;
    }

    // align에 따른 위치 조정
    if (side === 'top' || side === 'bottom') {
      if (align === 'start') {
        left = triggerRect.left;
      } else if (align === 'end') {
        left = triggerRect.right - estimatedWidth;
      }
    } else if (side === 'left' || side === 'right') {
      if (align === 'start') {
        top = triggerRect.top;
      } else if (align === 'end') {
        top = triggerRect.bottom - estimatedHeight;
      }
    }

    setPosition({ top, left });
  }, [side, align]);

  // 툴팁 표시
  const show = React.useCallback(() => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, delay);
  }, [disabled, delay]);

  // 툴팁 숨김
  const hide = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(false);
  }, []);

  // 위치 업데이트 (툴팁이 열릴 때)
  React.useEffect(() => {
    if (open) {
      // 위치를 먼저 설정
      updatePosition();

      // 툴팁이 렌더링된 후 정확한 크기로 재조정
      const adjustPosition = () => {
        if (tooltipRef.current && triggerRef.current) {
          const triggerRect = triggerRef.current.getBoundingClientRect();
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          const gap = 8;

          let top = 0;
          let left = 0;

          switch (side) {
            case 'top':
              top = triggerRect.top - tooltipRect.height - gap;
              left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
              break;
            case 'bottom':
              top = triggerRect.bottom + gap;
              left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
              break;
            case 'left':
              top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
              left = triggerRect.left - tooltipRect.width - gap;
              break;
            case 'right':
              top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
              left = triggerRect.right + gap;
              break;
          }

          if (side === 'top' || side === 'bottom') {
            if (align === 'start') {
              left = triggerRect.left;
            } else if (align === 'end') {
              left = triggerRect.right - tooltipRect.width;
            }
          } else if (side === 'left' || side === 'right') {
            if (align === 'start') {
              top = triggerRect.top;
            } else if (align === 'end') {
              top = triggerRect.bottom - tooltipRect.height;
            }
          }

          setPosition({ top, left });
        }
      };

      // 다음 tick에서 재조정 (Portal이 렌더링된 후)
      setTimeout(adjustPosition, 0);
    }
  }, [open, updatePosition, side, align]);

  // cleanup
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 자식 요소에 이벤트 핸들러 추가
  const child = React.Children.only(children);
  const trigger = React.cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      // triggerRef를 직접 할당하지 않고 Object.assign으로 처리
      (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;

      // 원래 ref가 있으면 유지
      const childRef = (child as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;
      if (typeof childRef === 'function') {
        childRef(node);
      } else if (childRef && typeof childRef === 'object') {
        (childRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      show();
      child.props.onMouseEnter?.(event);
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      hide();
      child.props.onMouseLeave?.(event);
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      show();
      child.props.onFocus?.(event);
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      hide();
      child.props.onBlur?.(event);
    },
    'aria-describedby': open ? tooltipId : undefined,
  });

  return (
    <>
      {trigger}
      {open && (
        <Portal>
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            data-side={side}
            data-align={align}
            className={cn(
              'absolute z-50 px-3 py-2 text-sm',
              'bg-popover text-popover-foreground',
              'rounded-md shadow-md',
              'animate-in fade-in duration-200',
              'pointer-events-none' // 마우스 이벤트 무시
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}

Tooltip.displayName = 'Tooltip';
