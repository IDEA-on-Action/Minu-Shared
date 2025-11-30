import * as React from 'react';
import { cn } from '../utils/cn';
import { useControllableState } from '../hooks/use-controllable-state';
import { useClickOutside } from '../hooks/use-click-outside';
import { useEscapeKey } from '../hooks/use-escape-key';
import { useId } from '../hooks/use-id';
import { Portal } from '../primitives/Portal';

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'min' | 'max'> {
  /** 제어 모드에서 사용되는 날짜 값 */
  value?: Date;
  /** 비제어 모드에서 사용되는 기본 날짜 값 */
  defaultValue?: Date;
  /** 날짜가 변경될 때 호출되는 콜백 */
  onChange?: (date: Date | undefined) => void;
  /** 최소 선택 가능 날짜 */
  min?: Date;
  /** 최대 선택 가능 날짜 */
  max?: Date;
  /** 로케일 (기본값: 'ko-KR') */
  locale?: string;
  /** 표시 형식 (기본값: 'yyyy-MM-dd') */
  format?: string;
}

/**
 * Minu 공용 DatePicker 컴포넌트
 *
 * @example
 * ```tsx
 * <DatePicker placeholder="날짜 선택" />
 * <DatePicker value={date} onChange={setDate} />
 * <DatePicker min={new Date()} max={new Date(2025, 11, 31)} />
 * ```
 */
export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      className,
      placeholder = '날짜 선택',
      value,
      defaultValue,
      onChange,
      min,
      max,
      locale = 'ko-KR',
      // format prop은 현재 구현에서 사용되지 않으며, 향후 확장을 위해 예약됨
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      format = 'yyyy-MM-dd',
      disabled,
      ...props
    },
    ref
  ) => {
    const [selectedDate, setSelectedDate] = useControllableState({
      prop: value,
      defaultProp: defaultValue,
      onChange,
    });

    const [isOpen, setIsOpen] = React.useState(false);
    const [viewDate, setViewDate] = React.useState(() => selectedDate || new Date());
    const [focusedDate, setFocusedDate] = React.useState<Date | null>(null);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const calendarRef = React.useRef<HTMLDivElement>(null);
    const dateButtonsRef = React.useRef<Map<string, HTMLButtonElement>>(new Map());

    const datePickerId = useId('datepicker');

    // ref 포워딩
    React.useImperativeHandle(ref, () => inputRef.current!);

    // 외부 클릭 및 ESC 키 처리
    useClickOutside(calendarRef, () => setIsOpen(false), isOpen);
    useEscapeKey(() => setIsOpen(false), isOpen);

    // 날짜 포맷팅
    const formatDate = (date: Date | undefined): string => {
      if (!date) return '';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    // 월 이름 가져오기
    const getMonthName = (date: Date): string => {
      return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
    };

    // 월의 첫 날과 마지막 날 가져오기
    const getMonthDays = (year: number, month: number): Date[] => {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const days: Date[] = [];

      // 첫 주의 이전 달 날짜들
      const firstDayOfWeek = firstDay.getDay();
      const prevMonthLastDay = new Date(year, month, 0);
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push(new Date(year, month - 1, prevMonthLastDay.getDate() - i));
      }

      // 현재 달의 날짜들
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
      }

      // 마지막 주의 다음 달 날짜들
      const lastDayOfWeek = lastDay.getDay();
      for (let i = 1; i < 7 - lastDayOfWeek; i++) {
        days.push(new Date(year, month + 1, i));
      }

      return days;
    };

    // 날짜가 같은지 비교
    const isSameDay = (date1: Date | undefined, date2: Date | undefined): boolean => {
      if (!date1 || !date2) return false;
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    // 날짜가 같은 월인지 비교
    const isSameMonth = (date: Date, viewDate: Date): boolean => {
      return date.getFullYear() === viewDate.getFullYear() && date.getMonth() === viewDate.getMonth();
    };

    // 날짜가 오늘인지 확인
    const isToday = (date: Date): boolean => {
      return isSameDay(date, new Date());
    };

    // 날짜가 비활성화되어야 하는지 확인
    const isDisabled = (date: Date): boolean => {
      if (min && date < min) return true;
      if (max && date > max) return true;
      return false;
    };

    // 입력 필드 클릭 핸들러
    const handleInputClick = () => {
      if (!disabled) {
        setIsOpen(true);
        if (selectedDate) {
          setViewDate(selectedDate);
        }
      }
    };

    // 날짜 선택 핸들러
    const handleDateSelect = (date: Date) => {
      if (!isDisabled(date)) {
        setSelectedDate(date);
        setIsOpen(false);
      }
    };

    // 이전 월 이동
    const handlePrevMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    // 다음 월 이동
    const handleNextMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    // 년도 변경
    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newYear = parseInt(event.target.value, 10);
      setViewDate(new Date(newYear, viewDate.getMonth(), 1));
    };

    // 키보드 네비게이션
    const handleDateKeyDown = (event: React.KeyboardEvent, date: Date) => {
      let newFocusDate: Date | null = null;

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          newFocusDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          newFocusDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          newFocusDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
          break;
        case 'ArrowUp':
          event.preventDefault();
          newFocusDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleDateSelect(date);
          return;
      }

      if (newFocusDate) {
        setFocusedDate(newFocusDate);
        // 월이 변경되면 viewDate도 업데이트
        if (!isSameMonth(newFocusDate, viewDate)) {
          setViewDate(new Date(newFocusDate.getFullYear(), newFocusDate.getMonth(), 1));
        }
      }
    };

    // 포커스된 날짜 버튼에 포커스 설정
    React.useEffect(() => {
      if (focusedDate) {
        const key = formatDate(focusedDate);
        const button = dateButtonsRef.current.get(key);
        if (button) {
          button.focus();
        }
      }
    }, [focusedDate]);

    // 년도 선택 옵션 생성 (현재 년도 기준 ±10년)
    const currentYear = viewDate.getFullYear();
    const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

    const monthDays = getMonthDays(viewDate.getFullYear(), viewDate.getMonth());
    const weekDays = locale === 'ko-KR' ? ['일', '월', '화', '수', '목', '금', '토'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <div className={cn('relative w-full', className)}>
        <input
          ref={inputRef}
          type="text"
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'cursor-pointer'
          )}
          placeholder={placeholder}
          value={formatDate(selectedDate)}
          onClick={handleInputClick}
          readOnly
          disabled={disabled}
          aria-label="날짜 선택"
          {...props}
        />

        {isOpen && (
          <Portal>
            <div
              ref={calendarRef}
              role="dialog"
              aria-label="날짜 선택 캘린더"
              aria-modal="false"
              id={datePickerId}
              className={cn(
                'absolute z-50 mt-2 p-4 rounded-md border bg-popover shadow-md',
                'min-w-[280px]'
              )}
              style={{
                top: inputRef.current
                  ? inputRef.current.getBoundingClientRect().bottom + window.scrollY
                  : 0,
                left: inputRef.current ? inputRef.current.getBoundingClientRect().left + window.scrollX : 0,
              }}
            >
              {/* 헤더: 년도 선택 및 월 네비게이션 */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded hover:bg-accent"
                  aria-label="이전 월"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <div className="flex items-center gap-2">
                  <select
                    value={currentYear}
                    onChange={handleYearChange}
                    className="text-sm font-semibold bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded px-2 py-1"
                    aria-label="년도 선택"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm font-semibold">
                    {viewDate.getMonth() + 1}월
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded hover:bg-accent"
                  aria-label="다음 월"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* 년/월 표시 (숨김 텍스트 - 스크린 리더용) */}
              <div className="sr-only" aria-live="polite">
                {locale === 'ko-KR' ? `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월` : `${getMonthName(viewDate)} ${viewDate.getFullYear()}`}
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day, index) => (
                  <div key={index} className="text-center text-xs font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((date) => {
                  const isCurrentMonth = isSameMonth(date, viewDate);
                  const isSelected = isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);
                  const isDateDisabled = isDisabled(date);
                  const dateKey = formatDate(date);

                  return (
                    <button
                      key={dateKey}
                      ref={(el) => {
                        if (el) {
                          dateButtonsRef.current.set(dateKey, el);
                        } else {
                          dateButtonsRef.current.delete(dateKey);
                        }
                      }}
                      type="button"
                      onClick={() => handleDateSelect(date)}
                      onKeyDown={(e) => handleDateKeyDown(e, date)}
                      disabled={isDateDisabled}
                      aria-selected={isSelected}
                      aria-label={formatDate(date)}
                      className={cn(
                        'h-9 w-9 p-0 text-sm rounded-md transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
                        !isCurrentMonth && 'text-muted-foreground opacity-50',
                        isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                        isTodayDate && !isSelected && 'font-bold',
                        isCurrentMonth && !isSelected && !isTodayDate && 'text-foreground'
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </Portal>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
