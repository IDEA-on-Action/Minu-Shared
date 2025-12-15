import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventClient, createEventClient } from '../src/client/event-client';
import type { EventClientConfig } from '../src/client/config';

// fetch 모킹
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('EventClient HMAC 인증', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00.000Z'));
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createHmacConfig(overrides?: Partial<EventClientConfig>): EventClientConfig {
    return {
      endpoint: 'https://api.example.com/events',
      service: 'find',
      environment: 'development',
      auth: {
        method: 'hmac',
        secret: 'test-hmac-secret',
        serviceId: 'minu-find',
      },
      ...overrides,
    };
  }

  describe('HMAC 인증 헤더', () => {
    it('HMAC 인증 시 X-Service-Id 헤더를 포함해야 한다', async () => {
      const client = createEventClient(createHmacConfig());

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/events',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Service-Id': 'minu-find',
          }),
        })
      );

      await client.shutdown();
    });

    it('HMAC 인증 시 X-Timestamp 헤더를 포함해야 한다', async () => {
      const client = createEventClient(createHmacConfig());

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/events',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Timestamp': '2025-01-15T10:00:00.000Z',
          }),
        })
      );

      await client.shutdown();
    });

    it('HMAC 인증 시 X-Nonce 헤더를 포함해야 한다', async () => {
      const client = createEventClient(createHmacConfig());

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;

      expect(headers['X-Nonce']).toMatch(/^[a-f0-9]{32}$/);

      await client.shutdown();
    });

    it('HMAC 인증 시 X-Signature-256 헤더를 포함해야 한다', async () => {
      const client = createEventClient(createHmacConfig());

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;

      expect(headers['X-Signature-256']).toMatch(/^sha256=[a-f0-9]{64}$/);

      await client.shutdown();
    });

    it('HMAC 인증 시 Authorization 헤더를 포함하지 않아야 한다', async () => {
      const client = createEventClient(createHmacConfig());

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;

      expect(headers['Authorization']).toBeUndefined();

      await client.shutdown();
    });
  });

  describe('Bearer vs HMAC', () => {
    it('Bearer 인증 시 Authorization 헤더를 포함해야 한다', async () => {
      const client = createEventClient({
        endpoint: 'https://api.example.com/events',
        service: 'find',
        environment: 'development',
        auth: {
          method: 'bearer',
          getToken: () => 'test-bearer-token',
        },
      });

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/events',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-bearer-token',
          }),
        })
      );

      await client.shutdown();
    });

    it('Bearer 인증 시 HMAC 헤더를 포함하지 않아야 한다', async () => {
      const client = createEventClient({
        endpoint: 'https://api.example.com/events',
        service: 'find',
        environment: 'development',
        auth: {
          method: 'bearer',
          getToken: () => 'test-bearer-token',
        },
      });

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;

      expect(headers['X-Service-Id']).toBeUndefined();
      expect(headers['X-Signature-256']).toBeUndefined();

      await client.shutdown();
    });
  });

  describe('하위 호환성', () => {
    it('getToken만 제공해도 Bearer 인증으로 동작해야 한다', async () => {
      const client = createEventClient({
        endpoint: 'https://api.example.com/events',
        service: 'find',
        environment: 'development',
        getToken: () => 'legacy-token',
      });

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/events',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer legacy-token',
          }),
        })
      );

      await client.shutdown();
    });

    it('auth 옵션이 getToken보다 우선해야 한다', async () => {
      const client = createEventClient({
        endpoint: 'https://api.example.com/events',
        service: 'find',
        environment: 'development',
        auth: {
          method: 'hmac',
          secret: 'hmac-secret',
          serviceId: 'minu-find',
        },
        getToken: () => 'ignored-token',
      });

      await client.send({
        type: 'test.event',
        data: { value: 'test' },
      });

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;

      // HMAC 헤더가 있어야 함
      expect(headers['X-Service-Id']).toBe('minu-find');
      // Bearer 헤더가 없어야 함
      expect(headers['Authorization']).toBeUndefined();

      await client.shutdown();
    });
  });
});
