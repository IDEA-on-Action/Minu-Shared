import * as React from 'react';
import { cn } from '../utils/cn';
import { useControllableState } from '../hooks/use-controllable-state';
import { useId } from '../hooks/use-id';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange'> {
  /** 체크 상태 (제어 모드) */
  checked?: boolean;
  /** 기본 체크 상태 (비제어 모드) */
  defaultChecked?: boolean;
  /** 중간 상태 (indeterminate) */
  indeterminate?: boolean;
  /** 체크 상태 변경 핸들러 */
  onCheckedChange?: (checked: boolean) => void;
  /** 라벨 텍스트 */
  label?: React.ReactNode;
  /** 설명 텍스트 */
  description?: React.ReactNode;
  /** 에러 상태 */
  error?: boolean;
}

/**
 * Minu 공용 Checkbox 컴포넌트
 *
 * @example
 * ```tsx
 * // 비제어 모드
 * <Checkbox label="이용약관 동의" />
 *
 * // 제어 모드
 * <Checkbox
 *   checked={checked}
 *   onCheckedChange={setChecked}
 *   label="알림 받기"
 * />
 *
 * // 중간 상태
 * <Checkbox indeterminate label="전체 선택" />
 * ```
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      checked: checkedProp,
      defaultChecked = false,
      indeterminate = false,
      onCheckedChange,
      label,
      description,
      error = false,
      disabled,
      id: idProp,
      ...props
    },
    ref
  ) => {
    const generatedId = useId('checkbox');
    const id = idProp || generatedId;
    const descriptionId = description ? `${id}-description` : undefined;

    const [checked, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked,
      onChange: onCheckedChange,
    });

    const inputRef = React.useRef<HTMLInputElement>(null);

    // indeterminate 상태 처리 (DOM API로만 설정 가능)
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    // ref 병합
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);
    };

    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex h-5 items-center">
          <input
            ref={inputRef}
            type="checkbox"
            id={id}
            checked={checked}
            disabled={disabled}
            aria-describedby={descriptionId}
            aria-invalid={error}
            onChange={handleChange}
            className={cn(
              'h-4 w-4 shrink-0 cursor-pointer rounded border transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-destructive text-destructive focus:ring-destructive'
                : 'border-input text-primary focus:ring-primary',
              checked && !error && 'bg-primary border-primary',
              indeterminate && !error && 'bg-primary border-primary'
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-2 text-sm">
            {label && (
              <label
                htmlFor={id}
                className={cn(
                  'font-medium cursor-pointer',
                  disabled && 'cursor-not-allowed opacity-50',
                  error ? 'text-destructive' : 'text-foreground'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={descriptionId}
                className={cn(
                  'text-muted-foreground',
                  error && 'text-destructive'
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
