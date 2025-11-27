import * as React from 'react';
import { cn } from '../utils/cn';
import { useControllableState } from '../hooks/use-controllable-state';
import { useId } from '../hooks/use-id';

// ============================================
// Context
// ============================================

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext() {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error('Radio 컴포넌트는 RadioGroup 내부에서 사용해야 합니다.');
  }
  return context;
}

// ============================================
// RadioGroup
// ============================================

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** 현재 선택된 값 (제어 모드) */
  value?: string;
  /** 기본 선택된 값 (비제어 모드) */
  defaultValue?: string;
  /** 값 변경 시 호출되는 콜백 */
  onValueChange?: (value: string) => void;
  /** 폼 요소 name */
  name?: string;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 에러 상태 */
  error?: boolean;
  /** 라디오 버튼 방향 */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * RadioGroup 컴포넌트
 *
 * @example
 * ```tsx
 * <RadioGroup defaultValue="option1" onValueChange={console.log}>
 *   <Radio value="option1" label="옵션 1" />
 *   <Radio value="option2" label="옵션 2" />
 *   <Radio value="option3" label="옵션 3" />
 * </RadioGroup>
 * ```
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      value: valueProp,
      defaultValue,
      onValueChange,
      name: nameProp,
      disabled = false,
      error = false,
      orientation = 'vertical',
      children,
      ...props
    },
    ref
  ) => {
    const generatedName = useId('radio-group');
    const name = nameProp || generatedName;

    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const radios = Array.from(
        event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)')
      );

      if (radios.length === 0) return;

      const currentIndex = radios.findIndex((radio) => radio.value === value);
      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          nextIndex = currentIndex === radios.length - 1 ? 0 : currentIndex + 1;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          nextIndex = currentIndex <= 0 ? radios.length - 1 : currentIndex - 1;
          break;
        default:
          return;
      }

      const nextRadio = radios[nextIndex];
      nextRadio.focus();
      setValue(nextRadio.value);
    };

    return (
      <RadioGroupContext.Provider value={{ name, value, onValueChange: setValue, disabled, error }}>
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex',
            orientation === 'vertical' ? 'flex-col space-y-2' : 'flex-row space-x-4',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

// ============================================
// Radio
// ============================================

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
  /** 라디오 버튼 값 */
  value: string;
  /** 라벨 텍스트 */
  label?: React.ReactNode;
  /** 설명 텍스트 */
  description?: React.ReactNode;
}

/**
 * Radio 컴포넌트
 *
 * RadioGroup 내부에서 사용해야 합니다.
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, value, label, description, disabled: disabledProp, id: idProp, ...props }, ref) => {
    const { name, value: groupValue, onValueChange, disabled: groupDisabled, error } = useRadioGroupContext();

    const generatedId = useId('radio');
    const id = idProp || generatedId;
    const descriptionId = description ? `${id}-description` : undefined;

    const isChecked = groupValue === value;
    const isDisabled = disabledProp || groupDisabled;

    const handleChange = () => {
      if (!isDisabled) {
        onValueChange(value);
      }
    };

    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex h-5 items-center">
          <input
            ref={ref}
            type="radio"
            id={id}
            name={name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            aria-describedby={descriptionId}
            aria-invalid={error}
            onChange={handleChange}
            className={cn(
              'h-4 w-4 shrink-0 cursor-pointer rounded-full border transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-destructive text-destructive focus:ring-destructive'
                : 'border-input text-primary focus:ring-primary',
              isChecked && !error && 'border-primary'
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
                  isDisabled && 'cursor-not-allowed opacity-50',
                  error ? 'text-destructive' : 'text-foreground'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={descriptionId}
                className={cn('text-muted-foreground', error && 'text-destructive')}
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

Radio.displayName = 'Radio';
