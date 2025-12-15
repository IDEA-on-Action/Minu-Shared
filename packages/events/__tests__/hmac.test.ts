import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHmacSignature, createHmacHeaders } from '../src/client/hmac';

describe('createHmacSignature', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00.000Z'));
  });

  it('HMAC-SHA256 서명을 생성해야 한다', async () => {
    const secret = 'test-secret-key';
    const payload = JSON.stringify({ events: [{ type: 'test' }] });

    const result = await createHmacSignature(secret, payload);

    expect(result).toHaveProperty('signature');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('nonce');

    // 서명은 hex 문자열 (64자 = 256비트)
    expect(result.signature).toMatch(/^[a-f0-9]{64}$/);

    // 타임스탬프는 ISO 8601 형식
    expect(result.timestamp).toBe('2025-01-15T10:00:00.000Z');

    // 논스는 32자 hex 문자열
    expect(result.nonce).toMatch(/^[a-f0-9]{32}$/);
  });

  it('동일한 입력에 대해 다른 논스로 다른 서명을 생성해야 한다', async () => {
    const secret = 'test-secret-key';
    const payload = JSON.stringify({ events: [{ type: 'test' }] });

    const result1 = await createHmacSignature(secret, payload);
    const result2 = await createHmacSignature(secret, payload);

    // 논스가 다르므로 서명도 달라야 함
    expect(result1.nonce).not.toBe(result2.nonce);
    expect(result1.signature).not.toBe(result2.signature);
  });

  it('다른 시크릿은 다른 서명을 생성해야 한다', async () => {
    const payload = JSON.stringify({ events: [{ type: 'test' }] });

    // 고정된 논스를 위해 crypto.getRandomValues를 스파이로 모킹
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((arr) => {
      // 고정된 값으로 채움 (두 호출 모두 같은 값)
      if (arr instanceof Uint8Array) {
        arr.fill(0x42);
      }
      return arr;
    });

    const result1 = await createHmacSignature('secret1', payload);
    const result2 = await createHmacSignature('secret2', payload);

    // 논스는 같지만 (모킹됨) 서명은 달라야 함
    expect(result1.nonce).toBe(result2.nonce);
    expect(result1.signature).not.toBe(result2.signature);

    // 스파이 복원
    vi.restoreAllMocks();
  });
});

describe('createHmacHeaders', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00.000Z'));
  });

  it('HMAC 인증 헤더를 생성해야 한다', async () => {
    const serviceId = 'minu-find';
    const secret = 'test-secret-key';
    const payload = JSON.stringify({ events: [{ type: 'test' }] });

    const headers = await createHmacHeaders(serviceId, secret, payload);

    expect(headers['X-Service-Id']).toBe('minu-find');
    expect(headers['X-Timestamp']).toBe('2025-01-15T10:00:00.000Z');
    expect(headers['X-Nonce']).toMatch(/^[a-f0-9]{32}$/);
    expect(headers['X-Signature-256']).toMatch(/^sha256=[a-f0-9]{64}$/);
  });

  it('헤더에 sha256= 접두사가 포함되어야 한다', async () => {
    const serviceId = 'minu-find';
    const secret = 'test-secret-key';
    const payload = JSON.stringify({ events: [{ type: 'test' }] });

    const headers = await createHmacHeaders(serviceId, secret, payload);

    expect(headers['X-Signature-256'].startsWith('sha256=')).toBe(true);
  });
});
