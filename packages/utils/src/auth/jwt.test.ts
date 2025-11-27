import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseJWT,
  isTokenExpired,
  hasServiceAccess,
  getSubscriptionPlan,
  getUserIdFromToken,
  getTenantIdFromToken,
} from './jwt';

// JWT 페이로드를 Base64로 인코딩하는 헬퍼
function createMockJWT(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

describe('parseJWT', () => {
  it('유효한 JWT를 파싱한다', () => {
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      services: ['find', 'frame'],
      plan: 'pro',
      tenant_id: 'tenant-456',
      exp: 1234567890,
    };
    const token = createMockJWT(payload);
    const result = parseJWT(token);

    expect(result).not.toBeNull();
    expect(result?.sub).toBe('user-123');
    expect(result?.email).toBe('test@example.com');
    expect(result?.services).toEqual(['find', 'frame']);
    expect(result?.plan).toBe('pro');
  });

  it('3개의 파트가 아닌 토큰은 null을 반환한다', () => {
    expect(parseJWT('invalid')).toBeNull();
    expect(parseJWT('part1.part2')).toBeNull();
    expect(parseJWT('part1.part2.part3.part4')).toBeNull();
  });

  it('잘못된 Base64는 null을 반환한다', () => {
    expect(parseJWT('header.!!!invalid!!!.signature')).toBeNull();
  });

  it('잘못된 JSON은 null을 반환한다', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const invalidBody = btoa('not-json');
    expect(parseJWT(`${header}.${invalidBody}.signature`)).toBeNull();
  });

  it('URL-safe Base64를 처리한다', () => {
    // Base64 URL safe 문자 (-와 _)를 포함한 토큰 테스트
    const payload = { sub: 'user+test/data=' };
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    // URL-safe encoding 시뮬레이션
    const body = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${header}.${body}.signature`;

    const result = parseJWT(token);
    expect(result?.sub).toBe('user+test/data=');
  });
});

describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('만료되지 않은 토큰은 false를 반환한다', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1시간 후
    const token = createMockJWT({ exp: futureExp });
    expect(isTokenExpired(token)).toBe(false);
  });

  it('만료된 토큰은 true를 반환한다', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 60; // 1분 전
    const token = createMockJWT({ exp: pastExp });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('만료 10초 전부터 만료로 처리한다 (버퍼)', () => {
    const almostExpired = Math.floor(Date.now() / 1000) + 5; // 5초 후
    const token = createMockJWT({ exp: almostExpired });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('exp가 없는 토큰은 만료로 처리한다', () => {
    const token = createMockJWT({ sub: 'user-123' });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('파싱 불가능한 토큰은 만료로 처리한다', () => {
    expect(isTokenExpired('invalid-token')).toBe(true);
  });
});

describe('hasServiceAccess', () => {
  it('서비스에 접근 권한이 있으면 true를 반환한다', () => {
    const token = createMockJWT({ services: ['find', 'frame', 'build'] });
    expect(hasServiceAccess(token, 'find')).toBe(true);
    expect(hasServiceAccess(token, 'frame')).toBe(true);
    expect(hasServiceAccess(token, 'build')).toBe(true);
  });

  it('서비스에 접근 권한이 없으면 false를 반환한다', () => {
    const token = createMockJWT({ services: ['find'] });
    expect(hasServiceAccess(token, 'keep')).toBe(false);
  });

  it('services가 없는 토큰은 false를 반환한다', () => {
    const token = createMockJWT({ sub: 'user-123' });
    expect(hasServiceAccess(token, 'find')).toBe(false);
  });

  it('파싱 불가능한 토큰은 false를 반환한다', () => {
    expect(hasServiceAccess('invalid', 'find')).toBe(false);
  });
});

describe('getSubscriptionPlan', () => {
  it('구독 플랜을 반환한다', () => {
    const token = createMockJWT({ plan: 'pro' });
    expect(getSubscriptionPlan(token)).toBe('pro');
  });

  it('plan이 없으면 null을 반환한다', () => {
    const token = createMockJWT({ sub: 'user-123' });
    expect(getSubscriptionPlan(token)).toBeNull();
  });

  it('파싱 불가능한 토큰은 null을 반환한다', () => {
    expect(getSubscriptionPlan('invalid')).toBeNull();
  });
});

describe('getUserIdFromToken', () => {
  it('사용자 ID를 반환한다', () => {
    const token = createMockJWT({ sub: 'user-12345' });
    expect(getUserIdFromToken(token)).toBe('user-12345');
  });

  it('sub가 없으면 null을 반환한다', () => {
    const token = createMockJWT({ email: 'test@example.com' });
    expect(getUserIdFromToken(token)).toBeNull();
  });

  it('파싱 불가능한 토큰은 null을 반환한다', () => {
    expect(getUserIdFromToken('invalid')).toBeNull();
  });
});

describe('getTenantIdFromToken', () => {
  it('테넌트 ID를 반환한다', () => {
    const token = createMockJWT({ tenant_id: 'tenant-abc123' });
    expect(getTenantIdFromToken(token)).toBe('tenant-abc123');
  });

  it('tenant_id가 없으면 null을 반환한다', () => {
    const token = createMockJWT({ sub: 'user-123' });
    expect(getTenantIdFromToken(token)).toBeNull();
  });

  it('파싱 불가능한 토큰은 null을 반환한다', () => {
    expect(getTenantIdFromToken('invalid')).toBeNull();
  });
});
