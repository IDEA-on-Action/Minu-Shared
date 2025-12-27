import { DurableObject } from 'cloudflare:workers';

interface RateLimitRequest {
  limit: number;
  window: number;
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
 * Rate Limiter Durable Object
 *
 * 원자적 카운터를 사용한 슬라이딩 윈도우 Rate Limiting
 * 각 사용자/IP별로 독립적인 인스턴스가 생성됩니다.
 */
export class RateLimiter extends DurableObject {
  private count: number = 0;
  private resetAt: number = 0;

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
  }

  /**
   * Rate limit 체크 및 카운터 증가
   * Durable Object 내부에서 원자적으로 실행됩니다.
   */
  async checkLimit(request: RateLimitRequest): Promise<RateLimitResponse> {
    const { limit, window } = request;
    const now = Date.now();

    // 윈도우가 만료되었으면 리셋
    if (now >= this.resetAt) {
      this.count = 0;
      this.resetAt = now + window * 1000;
    }

    // 카운터 증가
    this.count++;

    const allowed = this.count <= limit;
    const remaining = Math.max(0, limit - this.count);
    const retryAfter = allowed ? undefined : Math.ceil((this.resetAt - now) / 1000);

    return {
      allowed,
      count: this.count,
      limit,
      remaining,
      resetAt: this.resetAt,
      retryAfter,
    };
  }

  /**
   * HTTP 요청 처리
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/check' && request.method === 'POST') {
      try {
        const body = await request.json() as RateLimitRequest;
        const result = await this.checkLimit(body);
        return Response.json(result);
      } catch (error) {
        return Response.json(
          { error: 'Invalid request body' },
          { status: 400 }
        );
      }
    }

    if (url.pathname === '/reset' && request.method === 'POST') {
      this.count = 0;
      this.resetAt = 0;
      return Response.json({ success: true });
    }

    if (url.pathname === '/status' && request.method === 'GET') {
      return Response.json({
        count: this.count,
        resetAt: this.resetAt,
      });
    }

    return Response.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }
}
