import { Hono } from 'hono';
import type { Env, Variables } from '../types';

export const healthRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * 기본 헬스체크
 */
healthRoutes.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  });
});

/**
 * 상세 헬스체크 (DB 연결 등)
 */
healthRoutes.get('/ready', async (c) => {
  const checks: Record<string, 'ok' | 'error'> = {};

  // D1 연결 확인
  try {
    await c.env.DB_SHARED.prepare('SELECT 1').first();
    checks.db_shared = 'ok';
  } catch {
    checks.db_shared = 'error';
  }

  // KV 연결 확인
  try {
    await c.env.CACHE_KV.get('__health_check__');
    checks.kv = 'ok';
  } catch {
    checks.kv = 'error';
  }

  const isHealthy = Object.values(checks).every((v) => v === 'ok');

  return c.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    isHealthy ? 200 : 503
  );
});

/**
 * 버전 정보
 */
healthRoutes.get('/version', (c) => {
  return c.json({
    version: '0.1.0',
    environment: c.env.ENVIRONMENT,
    runtime: 'Cloudflare Workers',
  });
});
