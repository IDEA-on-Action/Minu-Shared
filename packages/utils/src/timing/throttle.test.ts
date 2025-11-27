import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { throttle } from './throttle';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('기본 동작', () => {
    it('첫 호출 즉시 실행 (leading 기본값 true)', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('wait 시간 내 재호출 무시', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('a');
      throttled('b');
      throttled('c');

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('a');
    });

    it('wait 시간 후 trailing 호출 실행', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('a');
      throttled('b');
      throttled('c');

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith('c');
    });

    it('wait 시간 후 다시 호출 가능', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('a');
      vi.advanceTimersByTime(100);

      throttled('b');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('leading 옵션', () => {
    it('leading: false면 첫 호출 즉시 실행 안 함', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100, { leading: false });

      throttled();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('trailing 옵션', () => {
    it('trailing: false면 마지막 호출 실행 안 함', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100, { trailing: false });

      throttled('a');
      throttled('b');
      throttled('c');

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('a');

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1); // trailing 없음
    });
  });

  describe('leading과 trailing 조합', () => {
    it('leading: false, trailing: true', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100, { leading: false, trailing: true });

      throttled('a');
      throttled('b');

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('b');
    });

    it('leading: true, trailing: false', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100, { leading: true, trailing: false });

      throttled('a');
      throttled('b');
      throttled('c');

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('a');

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel', () => {
    it('대기 중인 trailing 호출 취소', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('a');
      throttled('b');
      throttled.cancel();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('a');
    });
  });

  describe('pending', () => {
    it('trailing 호출 대기 중이면 true', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      expect(throttled.pending()).toBe(false);

      throttled();
      expect(throttled.pending()).toBe(true); // trailing 대기 중

      vi.advanceTimersByTime(100);
      // trailing 실행 후에도 다음 trailing을 위해 타이머 설정될 수 있음
    });
  });

  describe('연속 호출 시나리오', () => {
    it('100ms 간격으로 호출하면 모두 실행', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('a');
      vi.advanceTimersByTime(100);

      throttled('b');
      vi.advanceTimersByTime(100);

      throttled('c');
      vi.advanceTimersByTime(100);

      // leading 3번 + trailing 가능
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });
});
