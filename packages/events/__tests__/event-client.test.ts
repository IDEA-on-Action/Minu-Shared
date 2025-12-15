import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventClient, createEventClient } from '../src/client/event-client';
import type { EventClientConfig } from '../src/client/config';

// fetch 모킹
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// 기본 테스트 설정
function createTestConfig(overrides?: Partial<EventClientConfig>): EventClientConfig {
  return {
    endpoint: 'https://api.example.com/events',
    getToken: () => 'test-token',
    service: 'find',
    environment: 'development',
    ...overrides,
  };
}

describe('EventClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createEventClient', () => {
    it('EventClient 인스턴스를 생성해야 한다', async () => {
      const client = createEventClient(createTestConfig());
      expect(client).toBeInstanceOf(EventClient);
      await client.shutdown();
    });
  });

  describe('send (즉시 발송)', () => {
    it('이벤트를 즉시 전송해야 한다', async () => {
      const client = createEventClient(createTestConfig());

      const result = await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/events',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
        })
      );

      await client.shutdown();
    });

    it('성공 시 eventId를 반환해야 한다', async () => {
      const client = createEventClient(createTestConfig());

      const result = await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      expect(result.success).toBe(true);
      expect(result.eventId).toMatch(/^evt_/);

      await client.shutdown();
    });

    it('실패 시 에러를 반환해야 한다', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const client = createEventClient(createTestConfig());

      const result = await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.eventId).toMatch(/^evt_/);

      await client.shutdown();
    });

    it('disabled 모드에서는 실제 전송하지 않아야 한다', async () => {
      const client = createEventClient(createTestConfig({ disabled: true }));

      const result = await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      expect(result.success).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();

      await client.shutdown();
    });

    it('재시도 로직이 적용되어야 한다', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      // 배치 프로세서 타이머를 비활성화하기 위해 flushIntervalMs를 매우 크게 설정
      const client = createEventClient(
        createTestConfig({
          batch: { flushIntervalMs: 999999999, maxBatchSize: 100 },
        })
      );

      const resultPromise = client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      // 재시도에 필요한 타이머만 진행 (짧은 시간씩)
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3);

      await client.shutdown();
    });
  });

  describe('enqueue (배치 큐)', () => {
    it('이벤트를 버퍼에 추가해야 한다', async () => {
      const client = createEventClient(createTestConfig());

      await client.enqueue({
        type: 'test.event',
        data: { value: 'test' },
      });

      expect(client.getPendingCount()).toBe(1);
      expect(mockFetch).not.toHaveBeenCalled();

      await client.shutdown();
    });

    it('disabled 모드에서는 버퍼에 추가하지 않아야 한다', async () => {
      const client = createEventClient(createTestConfig({ disabled: true }));

      await client.enqueue({
        type: 'test.event',
        data: { value: 'test' },
      });

      expect(client.getPendingCount()).toBe(0);

      await client.shutdown();
    });
  });

  describe('이벤트 생성', () => {
    it('고유한 이벤트 ID를 생성해야 한다 (evt_ 접두사)', async () => {
      const client = createEventClient(createTestConfig());

      const result = await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      expect(result.eventId).toMatch(/^evt_[A-Za-z0-9_-]+$/);

      await client.shutdown();
    });

    it('ISO 8601 형식의 timestamp를 생성해야 한다', async () => {
      const client = createEventClient(createTestConfig());

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const event = callBody.events[0];

      // ISO 8601 형식 검증
      expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(new Date(event.timestamp).toISOString()).toBe(event.timestamp);

      await client.shutdown();
    });

    it('설정된 service와 version을 포함해야 한다', async () => {
      const client = createEventClient(
        createTestConfig({
          service: 'frame',
          schemaVersion: '2.0',
        })
      );

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const event = callBody.events[0];

      expect(event.service).toBe('frame');
      expect(event.version).toBe('2.0');

      await client.shutdown();
    });

    it('payload의 메타데이터를 포함해야 한다', async () => {
      const client = createEventClient(createTestConfig());

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
        metadata: {
          userId: 'user-123',
          sessionId: 'session-456',
        },
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const event = callBody.events[0];

      expect(event.metadata.userId).toBe('user-123');
      expect(event.metadata.sessionId).toBe('session-456');
      expect(event.metadata.environment).toBe('development');

      await client.shutdown();
    });
  });

  describe('flush', () => {
    it('버퍼의 모든 이벤트를 전송해야 한다', async () => {
      const client = createEventClient(createTestConfig());

      await client.enqueue({ type: 'test.event1', data: { value: 1 } });
      await client.enqueue({ type: 'test.event2', data: { value: 2 } });
      await client.enqueue({ type: 'test.event3', data: { value: 3 } });

      const result = await client.flush();

      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(3);
      expect(client.getPendingCount()).toBe(0);

      await client.shutdown();
    });

    it('전송 결과를 반환해야 한다', async () => {
      const client = createEventClient(createTestConfig());

      await client.enqueue({ type: 'test.event', data: { value: 'test' } });

      const result = await client.flush();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('sentCount');
      expect(result).toHaveProperty('failedCount');

      await client.shutdown();
    });
  });

  describe('상태 확인', () => {
    it('isHealthy()는 에러 없을 때 true를 반환해야 한다', async () => {
      const client = createEventClient(createTestConfig());

      expect(client.isHealthy()).toBe(true);

      await client.shutdown();
    });

    it('isHealthy()는 에러 발생 후 false를 반환해야 한다', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const client = createEventClient(createTestConfig());

      await client.send({ type: 'test.event', data: {} });

      expect(client.isHealthy()).toBe(false);

      await client.shutdown();
    });

    it('getPendingCount()는 버퍼 크기를 반환해야 한다', async () => {
      const client = createEventClient(createTestConfig());

      expect(client.getPendingCount()).toBe(0);

      await client.enqueue({ type: 'test.event', data: {} });
      expect(client.getPendingCount()).toBe(1);

      await client.enqueue({ type: 'test.event', data: {} });
      expect(client.getPendingCount()).toBe(2);

      await client.shutdown();
    });

    it('getStatus()는 전체 상태를 반환해야 한다', async () => {
      const client = createEventClient(createTestConfig());

      await client.enqueue({ type: 'test.event', data: {} });

      const status = client.getStatus();

      expect(status).toHaveProperty('isHealthy', true);
      expect(status).toHaveProperty('pendingCount', 1);
      expect(status).toHaveProperty('isProcessing');

      await client.shutdown();
    });

    it('clearError()는 lastError를 초기화해야 한다', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const client = createEventClient(createTestConfig());

      await client.send({ type: 'test.event', data: {} });
      expect(client.isHealthy()).toBe(false);

      client.clearError();
      expect(client.isHealthy()).toBe(true);

      await client.shutdown();
    });
  });

  describe('shutdown', () => {
    it('남은 이벤트를 플러시해야 한다', async () => {
      const client = createEventClient(createTestConfig());

      await client.enqueue({ type: 'test.event1', data: {} });
      await client.enqueue({ type: 'test.event2', data: {} });

      await client.shutdown();

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('async getToken', () => {
    it('비동기 getToken 함수를 지원해야 한다', async () => {
      const asyncGetToken = vi.fn().mockResolvedValue('async-token');
      const client = createEventClient(
        createTestConfig({
          getToken: asyncGetToken,
        })
      );

      await client.send({ type: 'test.event', data: {} });

      expect(asyncGetToken).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer async-token',
          }),
        })
      );

      await client.shutdown();
    });
  });
});
