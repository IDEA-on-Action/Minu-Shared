import * as React from 'react';

type UseControllableStateParams<T> = {
  /** 제어 모드에서 사용되는 값 */
  prop?: T;
  /** 비제어 모드에서 사용되는 기본값 */
  defaultProp?: T;
  /** 값이 변경될 때 호출되는 콜백 */
  onChange?: (value: T) => void;
};

type SetStateAction<T> = T | ((prevState: T) => T);

/**
 * 제어/비제어 컴포넌트를 모두 지원하는 상태 관리 훅
 *
 * @example
 * ```tsx
 * // 제어 모드
 * const [value, setValue] = useControllableState({
 *   prop: controlledValue,
 *   onChange: onControlledChange,
 * });
 *
 * // 비제어 모드
 * const [value, setValue] = useControllableState({
 *   defaultProp: 'initial',
 *   onChange: onUncontrolledChange,
 * });
 * ```
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>): [T | undefined, (value: SetStateAction<T>) => void] {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({
    defaultProp,
    onChange,
  });
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledProp;

  const setValue = React.useCallback(
    (nextValue: SetStateAction<T>) => {
      if (isControlled) {
        const setter = nextValue as (prevState: T) => T;
        const newValue = typeof nextValue === 'function' ? setter(prop as T) : nextValue;
        if (newValue !== prop) {
          onChange?.(newValue);
        }
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, onChange, setUncontrolledProp]
  );

  return [value, setValue];
}

function useUncontrolledState<T>({
  defaultProp,
  onChange,
}: Omit<UseControllableStateParams<T>, 'prop'>): [T | undefined, (value: SetStateAction<T>) => void] {
  const [value, setValueInternal] = React.useState<T | undefined>(defaultProp);
  const prevValueRef = React.useRef(value);

  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      onChange?.(value as T);
      prevValueRef.current = value;
    }
  }, [value, onChange]);

  const setValue = React.useCallback((nextValue: SetStateAction<T>) => {
    setValueInternal((prev) => {
      if (typeof nextValue === 'function') {
        return (nextValue as (prevState: T) => T)(prev as T);
      }
      return nextValue;
    });
  }, []);

  return [value, setValue];
}
