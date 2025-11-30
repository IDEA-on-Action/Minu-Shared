import * as React from 'react';
import { cn } from '../utils/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 에러 상태 */
  error?: boolean;
  /** 에러 메시지 */
  errorMessage?: string;
  /** 리사이즈 옵션 */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  /** 글자 수 표시 여부 (maxLength와 함께 사용) */
  showCount?: boolean;
}

/**
 * Minu 공용 Textarea 컴포넌트
 *
 * @example
 * ```tsx
 * <Textarea placeholder="내용 입력" rows={5} />
 * <Textarea error errorMessage="필수 입력 항목입니다" />
 * <Textarea maxLength={100} showCount resize="none" />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      errorMessage,
      resize = 'vertical',
      showCount = false,
      rows = 3,
      maxLength,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    // 제어/비제어 컴포넌트 모두 지원하기 위한 상태
    const [internalValue, setInternalValue] = React.useState<string>('');

    // 현재 값 계산
    const getCurrentValue = (): string => {
      if (value !== undefined) {
        return String(value);
      }
      if (internalValue !== '') {
        return internalValue;
      }
      if (defaultValue !== undefined) {
        return String(defaultValue);
      }
      return '';
    };

    const currentValue = getCurrentValue();

    // 글자 수 계산
    const currentLength = currentValue.length;

    // 에러 메시지 ID 생성
    const errorId = React.useId();

    // resize 클래스 매핑
    const resizeClass = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }[resize];

    // onChange 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        <textarea
          className={cn(
            'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            resizeClass,
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error && errorMessage ? errorId : undefined
          }
          {...props}
        />
        <div className="mt-1 flex items-center justify-between gap-2">
          {error && errorMessage && (
            <p id={errorId} className="text-xs text-destructive">
              {errorMessage}
            </p>
          )}
          {showCount && maxLength !== undefined && (
            <p
              className={cn(
                'ml-auto text-xs',
                currentLength > maxLength
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              )}
            >
              {currentLength} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
