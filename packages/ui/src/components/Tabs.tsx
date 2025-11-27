import * as React from 'react';
import { cn } from '../utils/cn';
import { useControllableState } from '../hooks/use-controllable-state';

// ============================================
// Context
// ============================================

interface TabsContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs 컴포넌트는 Tabs 내부에서 사용해야 합니다.');
  }
  return context;
}

// ============================================
// Tabs (Root)
// ============================================

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 현재 활성화된 탭 값 (제어 모드) */
  value?: string;
  /** 기본 활성화된 탭 값 (비제어 모드) */
  defaultValue?: string;
  /** 탭 변경 시 호출되는 콜백 */
  onValueChange?: (value: string) => void;
}

/**
 * Tabs 컴포넌트
 *
 * 탭 형태의 네비게이션을 제공하는 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">탭 1</TabsTrigger>
 *     <TabsTrigger value="tab2">탭 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">탭 1 내용</TabsContent>
 *   <TabsContent value="tab2">탭 2 내용</TabsContent>
 * </Tabs>
 * ```
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value: valueProp, defaultValue, onValueChange, children, ...props }, ref) => {
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    return (
      <TabsContext.Provider value={{ value, onValueChange: setValue }}>
        <div ref={ref} className={cn('w-full', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

// ============================================
// TabsList
// ============================================

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * TabsList - 탭 트리거들을 감싸는 컨테이너
 */
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(
          'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
          className
        )}
        {...props}
      />
    );
  }
);

TabsList.displayName = 'TabsList';

// ============================================
// TabsTrigger
// ============================================

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 탭 식별 값 */
  value: string;
}

/**
 * TabsTrigger - 개별 탭 버튼
 */
export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabsContext();
    const isSelected = selectedValue === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-controls={`tabpanel-${value}`}
        data-state={isSelected ? 'active' : 'inactive'}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          isSelected
            ? 'bg-background text-foreground shadow'
            : 'hover:bg-background/50 hover:text-foreground',
          className
        )}
        onClick={() => !disabled && onValueChange(value)}
        {...props}
      />
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

// ============================================
// TabsContent
// ============================================

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 탭 식별 값 */
  value: string;
}

/**
 * TabsContent - 탭 콘텐츠 영역
 */
export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext();
    const isSelected = selectedValue === value;

    if (!isSelected) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabpanel-${value}`}
        aria-labelledby={`tab-${value}`}
        data-state={isSelected ? 'active' : 'inactive'}
        tabIndex={0}
        className={cn(
          'mt-2 ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        {...props}
      />
    );
  }
);

TabsContent.displayName = 'TabsContent';
