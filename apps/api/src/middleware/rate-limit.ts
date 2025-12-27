import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types';

interface RateLimitOptions {
  /** 윈도우당 최대 요청 수 */
  limit: number;
  /** 윈도우 크기 (초) */
  window: number;
  /** 커스텀 키 생성 함수 */
  keyGenerator?: (c: any) => string;
}

interface RateLimitResponse {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Rate Limiting 미들웨어
 *
 * Durable Objects를 사용한 원자적 Rate Limiting
 * 각 사용자/IP별로 독립적인 DO 인스턴스가 할당됩니다.
 */
export const rateLimitMiddleware = (options: RateLimitOptions) => {
  const { limit, window, keyGenerator } = options;

  return createMiddleware<{
    Bindings: Env;
    Variables: Variables;
  }>(async (c, next) => {
    const key = keyGenerator
      ? keyGenerator(c)
      : generateDefaultKey(c);

    try {
      // Durable Object ID 생성 (키 기반)
      const id = c.env.RATE_LIMITER.idFromName(key);
      const stub = c.env.RATE_LIMITER.get(id);

      // DO에 rate limit 체크 요청
      const response = await stub.fetch(new Request('https://rate-limiter/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit, window }),
      }));

      const result = await response.json() as RateLimitResponse;

      // Rate Limit 헤더 설정
      c.header('X-RateLimit-Limit', result.limit.toString());
      c.header('X-RateLimit-Remaining', result.remaining.toString());
      c.header('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());

      // 제한 초과 확인
      if (!result.allowed) {
        c.header('Retry-After', (result.retryAfter ?? 60).toString());

        return c.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMITED',
              message: 'Too many requests, please try again later',
              retryAfter: result.retryAfter,
            },
          },
          429
        );
      }

      await next();
    } catch (error) {
      // Rate Limiting 실패해도 요청은 허용
      console.error('Rate limiting error:', error);
      await next();
    }
  });
};

/**
 * 기본 키 생성 함수
 *
 * 인증된 사용자는 user_id 기반, 미인증은 IP 기반
 */
function generateDefaultKey(c: any): string {
  const auth = c.get('auth');

  if (auth?.userId) {
    return `user:${auth.userId}`;
  }

  // CF-Connecting-IP 또는 X-Forwarded-For에서 IP 추출
  const ip =
    c.req.header('CF-Connecting-IP') ||
    c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * 엔드포인트별 Rate Limiting 설정
 */
export const rateLimitPresets = {
  /** 일반 API 요청 */
  standard: rateLimitMiddleware({ limit: 100, window: 60 }),

  /** 인증 관련 (로그인, 회원가입) */
  auth: rateLimitMiddleware({ limit: 10, window: 60 }),

  /** 비용이 큰 작업 (AI 생성 등) */
  expensive: rateLimitMiddleware({ limit: 10, window: 300 }),

  /** 업로드 */
  upload: rateLimitMiddleware({ limit: 30, window: 60 }),

  /** 검색 */
  search: rateLimitMiddleware({ limit: 60, window: 60 }),
};
