import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BatchProcessor } from '../src/batch/batch-processor';
import { MemoryBuffer } from '../src/buffer/memory-buffer';
import { DEFAULT_BATCH_CONFIG, DEFAULT_RETRY_CONFIG } from '../src/client/config';
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

describe('BatchProcessor', () => {
  let buffer: MemoryBuffer;
  let sendEvents: ReturnType<typeof vi.fn>;
  let onError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    buffer = new MemoryBuffer({ maxSize: 1000, onOverflow: 'drop-oldest' });
    sendEvents = vi.fn().mockResolvedValue(undefined);
    onError = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createProcessor(options?: Partial<{ batchConfig: typeof DEFAULT_BATCH_CONFIG }>) {
    return new BatchProcessor({
      buffer,
      batchConfig: options?.batchConfig ?? DEFAULT_BATCH_CONFIG,
      retryConfig: DEFAULT_RETRY_CONFIG,
      sendEvents,
      onError,
    });
  }

  describe('start/stop', () => {
    it('start() 호출 시 타이머가 시작되어야 한다', () => {
      const processor = createProcessor();
      expect(processor.isRunning()).toBe(false);

      processor.start();

      expect(processor.isRunning()).toBe(true);
    });

    it('stop() 호출 시 타이머가 중지되어야 한다', () => {
      const processor = createProcessor();
      processor.start();

      processor.stop();

      expect(processor.isRunning()).toBe(false);
    });

    it('중복 start() 호출은 무시되어야 한다', () => {
      const processor = createProcessor();
      processor.start();
      processor.start();
      processor.start();

      expect(processor.isRunning()).toBe(true);
      processor.stop();
    });
  });

  describe('flush', () => {
    it('버퍼의 이벤트를 배치 단위로 전송해야 한다', async () => {
      const processor = createProcessor({
        batchConfig: { maxBatchSize: 2, flushIntervalMs: 5000 },
      });

      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));
      buffer.enqueue(createTestEvent('evt_3'));

      const result = await processor.flush();

      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(3);
      expect(sendEvents).toHaveBeenCalledTimes(2); // 2개 + 1개
    });

    it('maxBatchSize를 초과하지 않아야 한다', async () => {
      const processor = createProcessor({
        batchConfig: { maxBatchSize: 2, flushIntervalMs: 5000 },
      });

      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));
      buffer.enqueue(createTestEvent('evt_3'));

      await processor.flush();

      // 첫 번째 호출: 2개
      expect(sendEvents.mock.calls[0][0].length).toBe(2);
      // 두 번째 호출: 1개
      expect(sendEvents.mock.calls[1][0].length).toBe(1);
    });

    it('전송 성공 시 버퍼에서 이벤트를 제거해야 한다', async () => {
      const processor = createProcessor();

      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));

      await processor.flush();

      expect(buffer.isEmpty()).toBe(true);
    });

    it('빈 버퍼에서 flush()는 즉시 반환해야 한다', async () => {
      const processor = createProcessor();

      const result = await processor.flush();

      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(0);
      expect(sendEvents).not.toHaveBeenCalled();
    });

    it('이미 처리 중이면 새 flush()는 건너뛰어야 한다', async () => {
      const processor = createProcessor();

      // 느린 sendEvents 설정
      sendEvents.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      buffer.enqueue(createTestEvent('evt_1'));

      // 첫 번째 플러시 시작
      const flush1 = processor.flush();

      // 즉시 두 번째 플러시 시도
      const flush2Promise = processor.flush();
      const flush2 = await flush2Promise;

      // 두 번째는 건너뛰어야 함
      expect(flush2.sentCount).toBe(0);

      // 타이머 진행 후 첫 번째 완료
      await vi.advanceTimersByTimeAsync(1000);
      await flush1;

      expect(sendEvents).toHaveBeenCalledTimes(1);
    });
  });

  describe('재시도', () => {
    it('재시도 가능한 에러 시 설정된 횟수만큼 재시도해야 한다', async () => {
      const processor = createProcessor();
      const error = new Error('Server error') as Error & { statusCode?: number };
      error.statusCode = 500;

      sendEvents.mockRejectedValue(error);
      buffer.enqueue(createTestEvent('evt_1'));

      const flushPromise = processor.flush();

      // 재시도 타이머 진행
      for (let i = 0; i < DEFAULT_RETRY_CONFIG.maxRetries; i++) {
        await vi.runAllTimersAsync();
      }

      const result = await flushPromise;

      expect(result.success).toBe(false);
      expect(result.failedCount).toBe(1);
      expect(sendEvents).toHaveBeenCalledTimes(DEFAULT_RETRY_CONFIG.maxRetries + 1);
    });

    it('재시도 실패 시 이벤트가 버퍼에 남아있어야 한다', async () => {
      const processor = createProcessor();
      const error = new Error('Server error') as Error & { statusCode?: number };
      error.statusCode = 500;

      sendEvents.mockRejectedValue(error);
      buffer.enqueue(createTestEvent('evt_1'));

      const flushPromise = processor.flush();

      // 재시도 타이머 진행
      for (let i = 0; i < DEFAULT_RETRY_CONFIG.maxRetries; i++) {
        await vi.runAllTimersAsync();
      }

      await flushPromise;

      // 이벤트가 버퍼에 남아있어야 함
      expect(buffer.size()).toBe(1);
    });
  });

  describe('shutdown', () => {
    it('타이머를 중지해야 한다', async () => {
      const processor = createProcessor();
      processor.start();

      await processor.shutdown();

      expect(processor.isRunning()).toBe(false);
    });

    it('남은 이벤트를 플러시해야 한다', async () => {
      const processor = createProcessor();
      processor.start();

      buffer.enqueue(createTestEvent('evt_1'));
      buffer.enqueue(createTestEvent('evt_2'));

      const result = await processor.shutdown();

      expect(result.sentCount).toBe(2);
      expect(buffer.isEmpty()).toBe(true);
    });

    it('shutdown 후 flush()는 동작하지 않아야 한다', async () => {
      const processor = createProcessor();

      await processor.shutdown();

      buffer.enqueue(createTestEvent('evt_1'));
      const result = await processor.flush();

      expect(result.success).toBe(false);
      expect(result.sentCount).toBe(0);
    });
  });

  describe('자동 플러시', () => {
    it('flushIntervalMs마다 자동으로 플러시해야 한다', async () => {
      const processor = createProcessor({
        batchConfig: { maxBatchSize: 100, flushIntervalMs: 1000 },
      });

      processor.start();
      buffer.enqueue(createTestEvent('evt_1'));

      expect(sendEvents).not.toHaveBeenCalled();

      // 타이머 진행
      await vi.advanceTimersByTimeAsync(1000);

      expect(sendEvents).toHaveBeenCalledTimes(1);

      // 추가 이벤트
      buffer.enqueue(createTestEvent('evt_2'));
      await vi.advanceTimersByTimeAsync(1000);

      expect(sendEvents).toHaveBeenCalledTimes(2);

      processor.stop();
    });
  });

  describe('isActive', () => {
    it('처리 중일 때 true를 반환해야 한다', async () => {
      const processor = createProcessor();

      sendEvents.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      buffer.enqueue(createTestEvent('evt_1'));
      const flushPromise = processor.flush();

      // 처리 시작 직후
      expect(processor.isActive()).toBe(true);

      await vi.advanceTimersByTimeAsync(1000);
      await flushPromise;

      expect(processor.isActive()).toBe(false);
    });
  });
});
