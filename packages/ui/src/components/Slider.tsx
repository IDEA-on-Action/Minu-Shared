import * as React from 'react';
import { cn } from '../utils/cn';
import { useControllableState } from '../hooks/use-controllable-state';
import { useId } from '../hooks/use-id';

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 슬라이더 값 (제어 모드) */
  value?: number;
  /** 기본 슬라이더 값 (비제어 모드) */
  defaultValue?: number;
  /** 최소값 */
  min?: number;
  /** 최대값 */
  max?: number;
  /** 스텝 */
  step?: number;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 값 변경 핸들러 */
  onValueChange?: (value: number) => void;
  /** 슬라이더 방향 */
  orientation?: 'horizontal' | 'vertical';
  /** 현재 값 표시 여부 */
  showValue?: boolean;
  /** 접근성 라벨 */
  'aria-label'?: string;
  /** 접근성 라벨 참조 ID */
  'aria-labelledby'?: string;
}

/**
 * Minu 공용 Slider 컴포넌트
 *
 * @example
 * ```tsx
 * // 비제어 모드
 * <Slider defaultValue={50} />
 *
 * // 제어 모드
 * <Slider
 *   value={volume}
 *   onValueChange={setVolume}
 *   min={0}
 *   max={100}
 * />
 *
 * // 값 표시
 * <Slider value={50} showValue />
 *
 * // 수직 방향
 * <Slider orientation="vertical" />
 * ```
 */
export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value: valueProp,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      onValueChange,
      orientation = 'horizontal',
      showValue = false,
      id: idProp,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      ...props
    },
    ref
  ) => {
    const generatedId = useId('slider');
    const id = idProp || generatedId;

    const [value = min, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const innerRef = React.useRef<HTMLDivElement>(null);
    const trackRef = innerRef;
    const [isDragging, setIsDragging] = React.useState(false);

    // ref를 외부와 내부 모두에 연결
    React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

    // 값을 min-max 범위로 제한
    const clampValue = React.useCallback(
      (val: number) => {
        return Math.min(Math.max(val, min), max);
      },
      [min, max]
    );

    // step에 맞춰 값 조정
    const roundToStep = React.useCallback(
      (val: number) => {
        return Math.round(val / step) * step;
      },
      [step]
    );

    // 최종 값 설정
    const updateValue = React.useCallback(
      (newValue: number) => {
        const clampedValue = clampValue(newValue);
        const steppedValue = roundToStep(clampedValue);
        setValue(steppedValue);
      },
      [clampValue, roundToStep, setValue]
    );

    // 마우스 위치를 값으로 변환
    const getValueFromPosition = React.useCallback(
      (clientX: number, clientY: number) => {
        if (!trackRef.current) return value;

        const rect = trackRef.current.getBoundingClientRect();
        let percentage: number;

        if (orientation === 'horizontal') {
          const position = clientX - rect.left;
          percentage = position / rect.width;
        } else {
          // vertical: 아래에서 위로 증가
          const position = rect.bottom - clientY;
          percentage = position / rect.height;
        }

        // percentage를 0-1 범위로 제한
        percentage = Math.min(Math.max(percentage, 0), 1);

        return min + percentage * (max - min);
      },
      [orientation, min, max, value]
    );

    // 키보드 이벤트 핸들러
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        let newValue = value;
        const largeStep = step * 10;

        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowUp':
            event.preventDefault();
            newValue = value + step;
            break;
          case 'ArrowLeft':
          case 'ArrowDown':
            event.preventDefault();
            newValue = value - step;
            break;
          case 'Home':
            event.preventDefault();
            newValue = min;
            break;
          case 'End':
            event.preventDefault();
            newValue = max;
            break;
          case 'PageUp':
            event.preventDefault();
            newValue = value + largeStep;
            break;
          case 'PageDown':
            event.preventDefault();
            newValue = value - largeStep;
            break;
          default:
            return;
        }

        updateValue(newValue);
      },
      [disabled, value, step, min, max, updateValue]
    );

    // 마우스 다운 핸들러
    const handleMouseDown = React.useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;

        event.preventDefault();
        setIsDragging(true);

        const newValue = getValueFromPosition(event.clientX, event.clientY);
        updateValue(newValue);

        // 포커스 설정
        if (trackRef.current) {
          trackRef.current.focus();
        }
      },
      [disabled, getValueFromPosition, updateValue]
    );

    // 마우스 이동 핸들러 (전역)
    React.useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (event: MouseEvent) => {
        const newValue = getValueFromPosition(event.clientX, event.clientY);
        updateValue(newValue);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, getValueFromPosition, updateValue]);

    // 진행률 계산 (0-100%)
    const percentage = ((value - min) / (max - min)) * 100;

    const isHorizontal = orientation === 'horizontal';

    return (
      <div
        className={cn(
          'relative flex items-center',
          isHorizontal ? 'w-full' : 'h-full flex-col',
          className
        )}
      >
        {/* 슬라이더 트랙 */}
        <div
          ref={innerRef}
          id={id}
          role="slider"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-orientation={orientation}
          aria-disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          className={cn(
            'relative bg-input rounded-full cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'transition-opacity',
            isHorizontal ? 'h-2 w-full' : 'w-2 h-full',
            disabled && 'cursor-not-allowed opacity-50',
            isDragging && 'cursor-grabbing'
          )}
          {...props}
        >
          {/* 진행 바 */}
          <div
            className={cn(
              'absolute bg-primary rounded-full',
              isHorizontal ? 'h-full top-0 left-0' : 'w-full bottom-0 left-0'
            )}
            style={
              isHorizontal
                ? { width: `${percentage}%` }
                : { height: `${percentage}%` }
            }
          />

          {/* 썸 */}
          <div
            className={cn(
              'absolute w-4 h-4 bg-background border-2 border-primary rounded-full shadow-md',
              'transition-transform hover:scale-110',
              disabled && 'hover:scale-100',
              isDragging && 'scale-110'
            )}
            style={
              isHorizontal
                ? {
                    left: `${percentage}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }
                : {
                    bottom: `${percentage}%`,
                    left: '50%',
                    transform: 'translate(-50%, 50%)',
                  }
            }
          />
        </div>

        {/* 값 표시 */}
        {showValue && (
          <div
            className={cn(
              'text-sm font-medium text-foreground select-none',
              isHorizontal ? 'ml-3' : 'mt-3'
            )}
            aria-live="polite"
          >
            {value}
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';
