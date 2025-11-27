import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('기본 동작', () => {
    it('wait 시간 후에 함수 실행', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('연속 호출 시 마지막 호출만 실행', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('a');
      debounced('b');
      debounced('c');

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('c');
    });

    it('wait 시간 내 재호출 시 타이머 리셋', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('leading 옵션', () => {
    it('leading: true면 첫 호출 즉시 실행', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100, { leading: true });

      debounced();
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1); // trailing도 기본 true라 한 번 더
    });

    it('leading: true, trailing: false면 첫 호출만 실행', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100, { leading: true, trailing: false });

      debounced('a');
      debounced('b');
      debounced('c');

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('a');

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('trailing 옵션', () => {
    it('trailing: false면 마지막 호출 실행 안 함', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100, { trailing: false });

      debounced();
      vi.advanceTimersByTime(100);

      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('maxWait 옵션', () => {
    it('maxWait 시간 후 강제 실행', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100, { maxWait: 200 });

      debounced('a');
      vi.advanceTimersByTime(50);
      debounced('b');
      vi.advanceTimersByTime(50);
      debounced('c');
      vi.advanceTimersByTime(50);
      debounced('d');
      vi.advanceTimersByTime(50);

      // 200ms 후 maxWait로 실행
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel', () => {
    it('대기 중인 호출 취소', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced.cancel();
      vi.advanceTimersByTime(100);

      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('flush', () => {
    it('대기 중인 호출 즉시 실행', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('value');
      debounced.flush();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('value');
    });

    it('대기 중인 호출 없으면 아무것도 안 함', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced.flush();

      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('pending', () => {
    it('대기 중이면 true', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      expect(debounced.pending()).toBe(false);

      debounced();
      expect(debounced.pending()).toBe(true);

      vi.advanceTimersByTime(100);
      expect(debounced.pending()).toBe(false);
    });
  });
});
