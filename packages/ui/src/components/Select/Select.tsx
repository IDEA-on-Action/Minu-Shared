import * as React from 'react';
import { cn } from '../../utils/cn';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useClickOutside } from '../../hooks/use-click-outside';
import { useEscapeKey } from '../../hooks/use-escape-key';
import { useId } from '../../hooks/use-id';
import { Portal } from '../../primitives/Portal';

// ============================================
// Types
// ============================================

export type SelectValue = string | string[];

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// ============================================
// Context
// ============================================

interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: SelectValue | undefined;
  onValueChange: (value: SelectValue) => void;
  multiple: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  searchable: boolean;
  disabled?: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  highlightedIndex: number;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  filteredOptions: SelectOption[];
  setFilteredOptions: React.Dispatch<React.SetStateAction<SelectOption[]>>;
  placeholder?: string;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select 컴포넌트는 Select 내부에서 사용해야 합니다.');
  }
  return context;
}

// ============================================
// Select (Root)
// ============================================

export interface SelectProps {
  /** 자식 요소 */
  children: React.ReactNode;
  /** 현재 선택된 값 (제어 모드) */
  value?: SelectValue;
  /** 기본 선택된 값 (비제어 모드) */
  defaultValue?: SelectValue;
  /** 값 변경 시 호출되는 콜백 */
  onValueChange?: (value: SelectValue) => void;
  /** 다중 선택 여부 */
  multiple?: boolean;
  /** 검색 기능 활성화 */
  searchable?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 드롭다운 열림 상태 (제어 모드) */
  open?: boolean;
  /** 기본 열림 상태 (비제어 모드) */
  defaultOpen?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** placeholder 텍스트 */
  placeholder?: string;
}

/**
 * Select 컴포넌트
 *
 * @example
 * ```tsx
 * <Select defaultValue="option1" onValueChange={console.log}>
 *   <SelectTrigger>
 *     <SelectValue placeholder="선택하세요" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="option1">옵션 1</SelectItem>
 *     <SelectItem value="option2">옵션 2</SelectItem>
 *   </SelectContent>
 * </Select>
 *
 * // 검색 가능
 * <Select searchable>
 *   <SelectTrigger>
 *     <SelectValue placeholder="검색하세요" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectSearch placeholder="검색..." />
 *     <SelectItem value="option1">옵션 1</SelectItem>
 *   </SelectContent>
 * </Select>
 *
 * // 다중 선택
 * <Select multiple>
 *   <SelectTrigger>
 *     <SelectValue placeholder="여러 개 선택" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="option1">옵션 1</SelectItem>
 *     <SelectItem value="option2">옵션 2</SelectItem>
 *   </SelectContent>
 * </Select>
 * ```
 */
export function Select({
  children,
  value: valueProp,
  defaultValue,
  onValueChange,
  multiple = false,
  searchable = false,
  disabled = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placeholder,
}: SelectProps) {
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? (multiple ? [] : undefined),
    onChange: onValueChange,
  });

  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  const [searchValue, setSearchValue] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [filteredOptions, setFilteredOptions] = React.useState<SelectOption[]>([]);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // 열릴 때 검색어 초기화
  React.useEffect(() => {
    if (open) {
      setSearchValue('');
      setHighlightedIndex(-1);
    }
  }, [open]);

  return (
    <SelectContext.Provider
      value={{
        open: open ?? false,
        setOpen,
        value,
        onValueChange: setValue,
        multiple,
        searchValue,
        setSearchValue,
        searchable,
        disabled,
        triggerRef,
        contentRef,
        highlightedIndex,
        setHighlightedIndex,
        filteredOptions,
        setFilteredOptions,
        placeholder,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

// ============================================
// SelectTrigger
// ============================================

export type SelectTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, disabled, triggerRef } = useSelectContext();
    const generatedId = useId('select-trigger');

    // ref 병합
    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    return (
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${generatedId}-content`}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm',
          'focus:outline-none focus:ring-1 focus:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'placeholder:text-muted-foreground',
          className
        )}
        {...props}
      >
        {children}
        <svg
          className={cn('h-4 w-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

// ============================================
// SelectValue
// ============================================

export interface SelectValueProps {
  /** 선택되지 않았을 때 표시할 텍스트 */
  placeholder?: string;
}

export function SelectValue({ placeholder: placeholderProp }: SelectValueProps) {
  const { value, multiple, placeholder: contextPlaceholder, filteredOptions } = useSelectContext();
  const placeholder = placeholderProp || contextPlaceholder;

  const getDisplayValue = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-muted-foreground">{placeholder || '선택하세요'}</span>;
    }

    if (multiple && Array.isArray(value)) {
      if (value.length === 1) {
        const option = filteredOptions.find((opt) => opt.value === value[0]);
        return option?.label || value[0];
      }
      return `${value.length}개 선택됨`;
    }

    const option = filteredOptions.find((opt) => opt.value === value);
    return option?.label || value;
  };

  return <span className="truncate">{getDisplayValue()}</span>;
}

// ============================================
// SelectContent
// ============================================

export type SelectContentProps = React.HTMLAttributes<HTMLDivElement>;

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const {
      open,
      setOpen,
      triggerRef,
      contentRef,
      highlightedIndex,
      setHighlightedIndex,
      filteredOptions,
      onValueChange,
      value,
      multiple,
    } = useSelectContext();

    // ref 병합
    React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

    // 외부 클릭 시 닫기
    useClickOutside(contentRef, () => setOpen(false), open);

    // ESC 키로 닫기
    useEscapeKey(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, open);

    // 키보드 네비게이션
    React.useEffect(() => {
      if (!open) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        const options = filteredOptions.filter((opt) => !opt.disabled);

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
            break;
          case 'ArrowUp':
            event.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
            break;
          case 'Enter':
            event.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < options.length) {
              const selectedOption = options[highlightedIndex];
              if (multiple) {
                const currentValues = Array.isArray(value) ? value : [];
                const newValues = currentValues.includes(selectedOption.value)
                  ? currentValues.filter((v) => v !== selectedOption.value)
                  : [...currentValues, selectedOption.value];
                onValueChange(newValues);
              } else {
                onValueChange(selectedOption.value);
                setOpen(false);
                triggerRef.current?.focus();
              }
            }
            break;
          case 'Home':
            event.preventDefault();
            setHighlightedIndex(0);
            break;
          case 'End':
            event.preventDefault();
            setHighlightedIndex(options.length - 1);
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, highlightedIndex, filteredOptions, multiple, value, onValueChange, setOpen, triggerRef, setHighlightedIndex]);

    // 포지셔닝 계산
    const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });

    React.useEffect(() => {
      if (open && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, [open, triggerRef]);

    if (!open) return null;

    return (
      <Portal>
        <div
          ref={contentRef}
          role="listbox"
          aria-multiselectable={multiple}
          className={cn(
            'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
            'animate-in fade-in-0 zoom-in-95',
            className
          )}
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
          }}
          {...props}
        >
          <div className="max-h-[300px] overflow-y-auto p-1">{children}</div>
        </div>
      </Portal>
    );
  }
);

SelectContent.displayName = 'SelectContent';

// ============================================
// SelectSearch
// ============================================

export interface SelectSearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** 검색어 변경 콜백 */
  onSearchChange?: (value: string) => void;
}

export const SelectSearch = React.forwardRef<HTMLInputElement, SelectSearchProps>(
  ({ className, placeholder = '검색...', onSearchChange, ...props }, ref) => {
    const { searchValue, setSearchValue } = useSelectContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setSearchValue(newValue);
      onSearchChange?.(newValue);
    };

    return (
      <div className="sticky top-0 bg-popover p-1">
        <input
          ref={ref}
          type="text"
          value={searchValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm',
            'focus:outline-none focus:ring-1 focus:ring-ring',
            'placeholder:text-muted-foreground',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

SelectSearch.displayName = 'SelectSearch';

// ============================================
// SelectItem
// ============================================

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 옵션 값 */
  value: string;
  /** 비활성화 상태 */
  disabled?: boolean;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value: itemValue, disabled = false, children, ...props }, ref) => {
    const {
      value,
      onValueChange,
      multiple,
      setOpen,
      triggerRef,
      searchValue,
      highlightedIndex,
      setFilteredOptions,
      filteredOptions,
    } = useSelectContext();

    const isSelected = multiple
      ? Array.isArray(value) && value.includes(itemValue)
      : value === itemValue;

    // 옵션 등록
    React.useEffect(() => {
      const label = typeof children === 'string' ? children : itemValue;
      const option: SelectOption = { value: itemValue, label, disabled };

      setFilteredOptions((prev) => {
        const exists = prev.some((opt) => opt.value === itemValue);
        if (exists) {
          return prev.map((opt) => (opt.value === itemValue ? option : opt));
        }
        return [...prev, option];
      });

      return () => {
        setFilteredOptions((prev) => prev.filter((opt) => opt.value !== itemValue));
      };
    }, [itemValue, children, disabled, setFilteredOptions]);

    // 검색 필터링
    const label = typeof children === 'string' ? children : itemValue;
    const isFiltered = searchValue && !label.toLowerCase().includes(searchValue.toLowerCase());

    if (isFiltered) return null;

    const optionIndex = filteredOptions.findIndex((opt) => opt.value === itemValue);
    const isHighlighted = optionIndex === highlightedIndex;

    const handleClick = () => {
      if (disabled) return;

      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = isSelected
          ? currentValues.filter((v) => v !== itemValue)
          : [...currentValues, itemValue];
        onValueChange(newValues);
      } else {
        onValueChange(itemValue);
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        data-highlighted={isHighlighted}
        data-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          'data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground',
          'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
          isSelected && 'bg-accent/50',
          className
        )}
        {...props}
      >
        {multiple && (
          <span className="mr-2 flex h-4 w-4 items-center justify-center">
            {isSelected && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        )}
        <span className="flex-1">{children}</span>
        {!multiple && isSelected && (
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    );
  }
);

SelectItem.displayName = 'SelectItem';

// ============================================
// SelectEmpty
// ============================================

export type SelectEmptyProps = React.HTMLAttributes<HTMLDivElement>;

export const SelectEmpty = React.forwardRef<HTMLDivElement, SelectEmptyProps>(
  ({ className, children = '검색 결과가 없습니다.', ...props }, ref) => {
    const { searchValue, filteredOptions } = useSelectContext();

    // 검색어가 있고 필터링된 결과가 없을 때만 표시
    const visibleOptions = filteredOptions.filter((opt) => {
      if (!searchValue) return true;
      return opt.label.toLowerCase().includes(searchValue.toLowerCase());
    });

    if (!searchValue || visibleOptions.length > 0) return null;

    return (
      <div
        ref={ref}
        className={cn('py-6 text-center text-sm text-muted-foreground', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SelectEmpty.displayName = 'SelectEmpty';
