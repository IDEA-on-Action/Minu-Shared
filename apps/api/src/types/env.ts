/**
 * Cloudflare Workers 환경 바인딩 타입 정의
 */

export interface Env {
  // 환경 변수
  ENVIRONMENT: 'development' | 'staging' | 'production';
  JWT_PUBLIC_KEY: string;
  EVENTS_SECRET: string;

  // D1 Databases
  DB_SHARED: D1Database;
  DB_FIND: D1Database;
  DB_FRAME: D1Database;
  DB_BUILD: D1Database;
  DB_KEEP: D1Database;

  // KV Namespaces
  SESSION_KV: KVNamespace;
  CACHE_KV: KVNamespace;
  RATE_LIMIT_KV: KVNamespace;

  // R2 Buckets
  PUBLIC_ASSETS: R2Bucket;
  FILES: R2Bucket;

  // Queues
  NOTIFICATION_QUEUE: Queue;
  EVENT_QUEUE: Queue;
  EMAIL_QUEUE: Queue;

  // Durable Objects
  RATE_LIMITER: DurableObjectNamespace;
}

/**
 * JWT 페이로드 타입
 */
export interface JwtPayload {
  sub: string; // user_id
  email: string;
  name?: string;
  tenant_id?: string;
  role?: string;
  iat: number;
  exp: number;
  iss: string;
}

/**
 * 인증된 사용자 컨텍스트
 */
export interface AuthContext {
  userId: string;
  email: string;
  name?: string;
  tenantId?: string;
  role?: string;
}

/**
 * Hono Context Variables
 */
export interface Variables {
  auth?: AuthContext;
  requestId: string;
  startTime: number;
}
