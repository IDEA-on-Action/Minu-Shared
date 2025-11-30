import * as React from 'react';
import { cn } from '../utils/cn';
import { useControllableState } from '../hooks/use-controllable-state';
import { useId } from '../hooks/use-id';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** 체크 상태 (제어 모드) */
  checked?: boolean;
  /** 기본 체크 상태 (비제어 모드) */
  defaultChecked?: boolean;
  /** 체크 상태 변경 핸들러 */
  onCheckedChange?: (checked: boolean) => void;
  /** 라벨 텍스트 */
  label?: React.ReactNode;
  /** 스위치 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 폼 요소 name (숨겨진 input에 적용) */
  name?: string;
  /** 폼 요소 value (숨겨진 input에 적용) */
  value?: string;
  /** 필수 입력 여부 */
  required?: boolean;
}

/**
 * Minu 공용 Switch 컴포넌트
 *
 * @example
 * ```tsx
 * // 비제어 모드
 * <Switch label="알림 받기" />
 *
 * // 제어 모드
 * <Switch
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 *   label="다크 모드"
 * />
 *
 * // 크기 변형
 * <Switch size="sm" label="작은 스위치" />
 * <Switch size="lg" label="큰 스위치" />
 * ```
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      label,
      size = 'md',
      disabled,
      id: idProp,
      name,
      value,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId('switch');
    const id = idProp || generatedId;

    const [checked, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked,
      onChange: onCheckedChange,
    });

    const handleClick = () => {
      if (!disabled) {
        setChecked(!checked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Space 또는 Enter 키로 토글
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleClick();
      }
    };

    // 크기별 스타일 설정
    const sizeStyles = {
      sm: {
        switch: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: checked ? 'translate-x-4' : 'translate-x-0',
      },
      md: {
        switch: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: checked ? 'translate-x-5' : 'translate-x-0',
      },
      lg: {
        switch: 'h-7 w-14',
        thumb: 'h-6 w-6',
        translate: checked ? 'translate-x-7' : 'translate-x-0',
      },
    };

    const currentSize = sizeStyles[size];

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <button
          ref={ref}
          type="button"
          role="switch"
          id={id}
          aria-checked={checked}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            'relative inline-flex shrink-0 cursor-pointer rounded-full',
            'transition-colors duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            currentSize.switch,
            checked ? 'bg-primary' : 'bg-input'
          )}
          {...props}
        >
          {/* 스위치 토글 */}
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none inline-block rounded-full bg-background shadow-lg ring-0',
              'transition-transform duration-200 ease-in-out',
              currentSize.thumb,
              currentSize.translate
            )}
          />
        </button>

        {/* 숨겨진 input (폼 제출용) */}
        {name && (
          <input
            type="checkbox"
            name={name}
            value={value}
            checked={checked}
            required={required}
            disabled={disabled}
            onChange={() => {}} // 제어 컴포넌트이므로 빈 핸들러
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              borderWidth: 0,
            }}
          />
        )}

        {/* 라벨 */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium cursor-pointer select-none',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';
