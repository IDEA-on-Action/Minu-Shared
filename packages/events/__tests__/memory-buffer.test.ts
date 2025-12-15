import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryBuffer, BufferOverflowError } from '../src/buffer/memory-buffer';
import type { BaseEvent } from '../src/types/base';

// 테스트용 이벤트 생성 헬퍼
function createTestEvent(id: string): BaseEvent {
  return {
    id,
    type: 'test.event',
    service: 'find',
    timestamp: new Date().toISOString(),
    version: '1.0',
    metadata: {
      environment: 'development',
    },
    data: { value: id },
  };
}

describe('MemoryBuffer', () => {
  describe('enqueue', () => {
    it('이벤트를 버퍼에 추가해야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 100, onOverflow: 'drop-oldest' });
      const event = createTestEvent('evt_1');

      buffer.enqueue(event);

      expect(buffer.size()).toBe(1);
      expect(buffer.isEmpty()).toBe(false);
    });

    it('enqueuedAt 타임스탬프를 기록해야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 100, onOverflow: 'drop-oldest' });
      const event = createTestEvent('evt_1');
      const beforeEnqueue = Date.now();

      buffer.enqueue(event);

      const [bufferedEvent] = buffer.getAll();
      expect(bufferedEvent.enqueuedAt).toBeGreaterThanOrEqual(beforeEnqueue);
      expect(bufferedEvent.enqueuedAt).toBeLessThanOrEqual(Date.now());
    });

    it('retryCount를 0으로 초기화해야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 100, onOverflow: 'drop-oldest' });
      const event = createTestEvent('evt_1');

      buffer.enqueue(event);

      const [bufferedEvent] = buffer.getAll();
      expect(bufferedEvent.retryCount).toBe(0);
    });

    it('여러 이벤트를 순서대로 추가해야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 100, onOverflow: 'drop-oldest' });

      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));
      buffer.enqueue(createTestEvent('evt_3'));

      expect(buffer.size()).toBe(3);
      const events = buffer.getAll();
      expect(events[0].event.id).toBe('evt_1');
      expect(events[1].event.id).toBe('evt_2');
      expect(events[2].event.id).toBe('evt_3');
    });
  });

  describe('오버플로우 처리 (drop-oldest)', () => {
    it('버퍼가 가득 차면 가장 오래된 이벤트를 제거해야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 3, onOverflow: 'drop-oldest' });

      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));
      buffer.enqueue(createTestEvent('evt_3'));
      buffer.enqueue(createTestEvent('evt_4'));

      expect(buffer.size()).toBe(3);
      const events = buffer.getAll();
      expect(events[0].event.id).toBe('evt_2');
      expect(events[1].event.id).toBe('evt_3');
      expect(events[2].event.id).toBe('evt_4');
    });

    it('새 이벤트는 정상적으로 추가되어야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 2, onOverflow: 'drop-oldest' });

      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));
      buffer.enqueue(createTestEvent('evt_3'));

      const events = buffer.getAll();
      expect(events[events.length - 1].event.id).toBe('evt_3');
    });
  });

  describe('오버플로우 처리 (drop-newest)', () => {
    it('버퍼가 가득 차면 새 이벤트를 무시해야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 3, onOverflow: 'drop-newest' });

      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));
      buffer.enqueue(createTestEvent('evt_3'));
      buffer.enqueue(createTestEvent('evt_4'));

      expect(buffer.size()).toBe(3);
      const events = buffer.getAll();
      expect(events[0].event.id).toBe('evt_1');
      expect(events[1].event.id).toBe('evt_2');
      expect(events[2].event.id).toBe('evt_3');
    });

    it('기존 이벤트는 유지되어야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 2, onOverflow: 'drop-newest' });

      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));
      buffer.enqueue(createTestEvent('evt_3'));

      const events = buffer.getAll();
      expect(events.map((e) => e.event.id)).toEqual(['evt_1', 'evt_2']);
    });
  });

  describe('오버플로우 처리 (error)', () => {
    it('버퍼가 가득 차면 BufferOverflowError를 throw해야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 2, onOverflow: 'error' });

      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));

      expect(() => buffer.enqueue(createTestEvent('evt_3'))).toThrow(
        BufferOverflowError
      );
      expect(() => buffer.enqueue(createTestEvent('evt_3'))).toThrow(
        'Buffer overflow: maximum size of 2 exceeded'
      );
    });

    it('오버플로우 전까지는 정상 동작해야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 3, onOverflow: 'error' });

      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));
      buffer.enqueue(createTestEvent('evt_3'));

      expect(buffer.size()).toBe(3);
    });
  });

  describe('peek', () => {
    let buffer: MemoryBuffer;

    beforeEach(() => {
      buffer = new MemoryBuffer({ maxSize: 100, onOverflow: 'drop-oldest' });
      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));
      buffer.enqueue(createTestEvent('evt_3'));
    });

    it('요청한 개수만큼 이벤트를 반환해야 한다', () => {
      const events = buffer.peek(2);
      expect(events.length).toBe(2);
      expect(events[0].event.id).toBe('evt_1');
      expect(events[1].event.id).toBe('evt_2');
    });

    it('버퍼에서 이벤트를 제거하지 않아야 한다', () => {
      buffer.peek(2);
      expect(buffer.size()).toBe(3);
    });

    it('버퍼 크기보다 많이 요청해도 안전하게 동작해야 한다', () => {
      const events = buffer.peek(100);
      expect(events.length).toBe(3);
    });

    it('빈 버퍼에서 peek하면 빈 배열을 반환해야 한다', () => {
      const emptyBuffer = new MemoryBuffer({ maxSize: 100, onOverflow: 'drop-oldest' });
      expect(emptyBuffer.peek(10)).toEqual([]);
    });
  });

  describe('remove', () => {
    let buffer: MemoryBuffer;

    beforeEach(() => {
      buffer = new MemoryBuffer({ maxSize: 100, onOverflow: 'drop-oldest' });
      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));
      buffer.enqueue(createTestEvent('evt_3'));
    });

    it('앞에서부터 지정된 개수만큼 제거해야 한다', () => {
      buffer.remove(2);

      expect(buffer.size()).toBe(1);
      const events = buffer.getAll();
      expect(events[0].event.id).toBe('evt_3');
    });

    it('남은 이벤트는 유지되어야 한다', () => {
      buffer.remove(1);

      const events = buffer.getAll();
      expect(events.map((e) => e.event.id)).toEqual(['evt_2', 'evt_3']);
    });

    it('버퍼 크기보다 많이 제거해도 안전하게 동작해야 한다', () => {
      buffer.remove(100);
      expect(buffer.size()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });
  });

  describe('size/isEmpty', () => {
    it('빈 버퍼는 size() === 0, isEmpty() === true', () => {
      const buffer = new MemoryBuffer({ maxSize: 100, onOverflow: 'drop-oldest' });
      expect(buffer.size()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('이벤트가 있으면 올바른 size와 isEmpty === false', () => {
      const buffer = new MemoryBuffer({ maxSize: 100, onOverflow: 'drop-oldest' });
      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));

      expect(buffer.size()).toBe(2);
      expect(buffer.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    it('모든 이벤트를 제거해야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 100, onOverflow: 'drop-oldest' });
      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));
      buffer.enqueue(createTestEvent('evt_3'));

      buffer.clear();

      expect(buffer.size()).toBe(0);
      expect(buffer.isEmpty()).toBe(true);
      expect(buffer.getAll()).toEqual([]);
    });
  });

  describe('getAll', () => {
    it('모든 이벤트의 복사본을 반환해야 한다', () => {
      const buffer = new MemoryBuffer({ maxSize: 100, onOverflow: 'drop-oldest' });
      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));

      const events1 = buffer.getAll();
      const events2 = buffer.getAll();

      // 다른 배열 인스턴스여야 함
      expect(events1).not.toBe(events2);
      // 내용은 같아야 함
      expect(events1.length).toBe(events2.length);
    });
  });
});
