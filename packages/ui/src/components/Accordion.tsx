import * as React from 'react';
import { cn } from '../utils/cn';
import { useControllableState } from '../hooks/use-controllable-state';
import { useId } from '../hooks/use-id';

// ============================================
// Context
// ============================================

interface AccordionContextValue {
  type: 'single' | 'multiple';
  value: string | string[] | undefined;
  onValueChange: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion 컴포넌트는 Accordion 내부에서 사용해야 합니다.');
  }
  return context;
}

interface AccordionItemContextValue {
  value: string;
  disabled?: boolean;
  isOpen: boolean;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext() {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionItem 컴포넌트는 AccordionItem 내부에서 사용해야 합니다.');
  }
  return context;
}

// ============================================
// Accordion (Root) - Single Type
// ============================================

export interface AccordionSingleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 단일 열기 모드 */
  type: 'single';
  /** 현재 열린 항목 값 (제어 모드) */
  value?: string;
  /** 기본 열린 항목 값 (비제어 모드) */
  defaultValue?: string;
  /** 항목 변경 시 호출되는 콜백 */
  onValueChange?: (value: string) => void;
}

// ============================================
// Accordion (Root) - Multiple Type
// ============================================

export interface AccordionMultipleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 다중 열기 모드 */
  type: 'multiple';
  /** 현재 열린 항목들 값 (제어 모드) */
  value?: string[];
  /** 기본 열린 항목들 값 (비제어 모드) */
  defaultValue?: string[];
  /** 항목 변경 시 호출되는 콜백 */
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

/**
 * Accordion 컴포넌트
 *
 * 접고 펼칠 수 있는 콘텐츠 영역을 제공하는 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * // 단일 열기 모드
 * <Accordion type="single">
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>항목 1</AccordionTrigger>
 *     <AccordionContent>내용 1</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 *
 * // 다중 열기 모드
 * <Accordion type="multiple" defaultValue={['item-1', 'item-2']}>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>항목 1</AccordionTrigger>
 *     <AccordionContent>내용 1</AccordionContent>
 *   </AccordionItem>
 *   <AccordionItem value="item-2">
 *     <AccordionTrigger>항목 2</AccordionTrigger>
 *     <AccordionContent>내용 2</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type, value: valueProp, defaultValue, onValueChange, children, ...props }, ref) => {
    // Single 모드
    if (type === 'single') {
      const [value, setValue] = useControllableState({
        prop: valueProp as string | undefined,
        defaultProp: defaultValue as string | undefined,
        onChange: onValueChange as ((value: string) => void) | undefined,
      });

      const handleValueChange = React.useCallback(
        (itemValue: string) => {
          if (value === itemValue) {
            setValue('');
          } else {
            setValue(itemValue);
          }
        },
        [value, setValue]
      );

      return (
        <AccordionContext.Provider value={{ type, value, onValueChange: handleValueChange }}>
          <div ref={ref} className={cn('space-y-2', className)} {...props}>
            {children}
          </div>
        </AccordionContext.Provider>
      );
    }

    // Multiple 모드
    const [value, setValue] = useControllableState({
      prop: valueProp as string[] | undefined,
      defaultProp: defaultValue as string[] | undefined,
      onChange: onValueChange as ((value: string[]) => void) | undefined,
    });

    const handleValueChange = React.useCallback(
      (itemValue: string) => {
        const currentValue = value || [];
        if (currentValue.includes(itemValue)) {
          setValue(currentValue.filter((v) => v !== itemValue));
        } else {
          setValue([...currentValue, itemValue]);
        }
      },
      [value, setValue]
    );

    return (
      <AccordionContext.Provider value={{ type, value, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);

Accordion.displayName = 'Accordion';

// ============================================
// AccordionItem
// ============================================

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 항목 식별 값 */
  value: string;
  /** 비활성화 상태 */
  disabled?: boolean;
}

/**
 * AccordionItem - 개별 아코디언 항목
 */
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const { type, value: accordionValue } = useAccordionContext();
    const triggerId = useId();
    const contentId = useId();

    const isOpen = React.useMemo(() => {
      if (type === 'single') {
        return accordionValue === value;
      }
      return Array.isArray(accordionValue) && accordionValue.includes(value);
    }, [type, accordionValue, value]);

    return (
      <AccordionItemContext.Provider
        value={{
          value,
          disabled,
          isOpen,
          triggerId,
          contentId,
        }}
      >
        <div
          ref={ref}
          className={cn('border border-border rounded-lg', className)}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);

AccordionItem.displayName = 'AccordionItem';

// ============================================
// AccordionTrigger
// ============================================

export type AccordionTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * AccordionTrigger - 아코디언 트리거 버튼
 */
export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { onValueChange } = useAccordionContext();
    const { value, disabled, isOpen, triggerId, contentId } = useAccordionItemContext();

    return (
      <button
        ref={ref}
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={contentId}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium',
          'transition-all hover:bg-muted/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        onClick={() => !disabled && onValueChange(value)}
        {...props}
      >
        {children}
        <svg
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }
);

AccordionTrigger.displayName = 'AccordionTrigger';

// ============================================
// AccordionContent
// ============================================

export type AccordionContentProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * AccordionContent - 아코디언 콘텐츠 영역
 */
export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, contentId, triggerId } = useAccordionItemContext();
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => contentRef.current!);

    if (!isOpen) {
      return null;
    }

    return (
      <div
        ref={contentRef}
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        className={cn(
          'overflow-hidden text-sm',
          'animate-in fade-in-0 slide-in-from-top-2',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2'
        )}
        data-state={isOpen ? 'open' : 'closed'}
      >
        <div className={cn('px-4 py-3', className)} {...props}>
          {children}
        </div>
      </div>
    );
  }
);

AccordionContent.displayName = 'AccordionContent';
