import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { Errors } from '../middleware/error-handler';
import { requireTenant } from '../middleware/auth';
import { generateId } from '../utils/id';

export const keepRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * 서비스 목록 조회
 */
keepRoutes.get('/services', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const { status, category } = c.req.query();

  let sql = `
    SELECT id, name, url, category, environment, status, current_status,
           check_interval, last_check_at, last_up_at, last_down_at
    FROM services
    WHERE tenant_id = ?
  `;
  const params: unknown[] = [auth.tenantId];

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY name`;

  const result = await c.env.DB_KEEP.prepare(sql).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
  });
});

/**
 * 서비스 생성
 */
keepRoutes.post('/services', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const body = await c.req.json<{
    name: string;
    url: string;
    description?: string;
    category?: string;
    environment?: string;
    check_interval?: number;
    timeout?: number;
    method?: string;
    expected_status?: number;
    alert_threshold?: number;
    alert_channels?: string[];
  }>();

  if (!body.name || !body.url) {
    throw Errors.VALIDATION_ERROR({
      name: !body.name ? 'Name is required' : undefined,
      url: !body.url ? 'URL is required' : undefined,
    });
  }

  // URL 유효성 검사
  try {
    new URL(body.url);
  } catch {
    throw Errors.VALIDATION_ERROR({ url: 'Invalid URL format' });
  }

  const serviceId = generateId();
  const now = new Date().toISOString();

  await c.env.DB_KEEP.prepare(`
    INSERT INTO services (id, tenant_id, name, url, description, category, environment,
                         check_interval, timeout, method, expected_status, alert_threshold,
                         alert_channels, status, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
  `).bind(
    serviceId,
    auth.tenantId,
    body.name,
    body.url,
    body.description || null,
    body.category || 'website',
    body.environment || 'production',
    body.check_interval || 60,
    body.timeout || 30,
    body.method || 'GET',
    body.expected_status || 200,
    body.alert_threshold || 3,
    JSON.stringify(body.alert_channels || ['email']),
    auth.userId,
    now,
    now
  ).run();

  const service = await c.env.DB_KEEP.prepare(`
    SELECT * FROM services WHERE id = ?
  `).bind(serviceId).first();

  return c.json({
    success: true,
    data: service,
  }, 201);
});

/**
 * 서비스 상세 조회 (최근 헬스체크 포함)
 */
keepRoutes.get('/services/:id', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const id = c.req.param('id');

  const service = await c.env.DB_KEEP.prepare(`
    SELECT * FROM services WHERE id = ? AND tenant_id = ?
  `).bind(id, auth.tenantId).first();

  if (!service) {
    throw Errors.NOT_FOUND('Service');
  }

  // 최근 헬스체크 24시간
  const recentChecks = await c.env.DB_KEEP.prepare(`
    SELECT status, response_time, created_at
    FROM health_checks
    WHERE service_id = ? AND created_at > datetime('now', '-24 hours')
    ORDER BY created_at DESC
    LIMIT 100
  `).bind(id).all();

  // 최근 장애
  const recentIncidents = await c.env.DB_KEEP.prepare(`
    SELECT id, title, severity, status, started_at, resolved_at
    FROM incidents
    WHERE service_id = ?
    ORDER BY started_at DESC
    LIMIT 5
  `).bind(id).all();

  return c.json({
    success: true,
    data: {
      ...service,
      recent_checks: recentChecks.results,
      recent_incidents: recentIncidents.results,
    },
  });
});

/**
 * 수동 헬스체크 실행
 */
keepRoutes.post('/services/:id/check', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const id = c.req.param('id');

  const service = await c.env.DB_KEEP.prepare(`
    SELECT * FROM services WHERE id = ? AND tenant_id = ?
  `).bind(id, auth.tenantId).first<{
    url: string;
    method: string;
    timeout: number;
    expected_status: number;
    headers: string;
  }>();

  if (!service) {
    throw Errors.NOT_FOUND('Service');
  }

  // 헬스체크 실행
  const startTime = Date.now();
  let status: 'up' | 'down' | 'degraded' = 'down';
  let statusCode: number | null = null;
  let errorMessage: string | null = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), service.timeout * 1000);

    const response = await fetch(service.url, {
      method: service.method,
      headers: service.headers ? JSON.parse(service.headers) : {},
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    statusCode = response.status;

    if (response.status === service.expected_status) {
      status = 'up';
    } else if (response.status >= 200 && response.status < 400) {
      status = 'degraded';
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
  }

  const responseTime = Date.now() - startTime;
  const now = new Date().toISOString();

  // 헬스체크 결과 저장
  await c.env.DB_KEEP.prepare(`
    INSERT INTO health_checks (id, service_id, status, response_time, status_code, error_message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(generateId(), id, status, responseTime, statusCode, errorMessage, now).run();

  // 서비스 상태 업데이트
  await c.env.DB_KEEP.prepare(`
    UPDATE services SET
      current_status = ?,
      last_check_at = ?,
      last_up_at = CASE WHEN ? = 'up' THEN ? ELSE last_up_at END,
      last_down_at = CASE WHEN ? = 'down' THEN ? ELSE last_down_at END
    WHERE id = ?
  `).bind(status, now, status, now, status, now, id).run();

  return c.json({
    success: true,
    data: {
      status,
      response_time: responseTime,
      status_code: statusCode,
      error_message: errorMessage,
      checked_at: now,
    },
  });
});

/**
 * 장애 목록 조회
 */
keepRoutes.get('/incidents', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const { status, service_id, page = '1', limit = '20' } = c.req.query();

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), 50);
  const offset = (pageNum - 1) * limitNum;

  let sql = `
    SELECT i.*, s.name as service_name, s.url as service_url
    FROM incidents i
    INNER JOIN services s ON i.service_id = s.id
    WHERE i.tenant_id = ?
  `;
  const params: unknown[] = [auth.tenantId];

  if (status) {
    sql += ` AND i.status = ?`;
    params.push(status);
  }

  if (service_id) {
    sql += ` AND i.service_id = ?`;
    params.push(service_id);
  }

  sql += ` ORDER BY i.started_at DESC LIMIT ? OFFSET ?`;
  params.push(limitNum, offset);

  const result = await c.env.DB_KEEP.prepare(sql).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
  });
});

/**
 * 서비스 메트릭 조회
 */
keepRoutes.get('/services/:id/metrics', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const id = c.req.param('id');
  const { period = 'daily', days = '7' } = c.req.query();

  // 서비스 접근 권한 확인
  const service = await c.env.DB_KEEP.prepare(`
    SELECT id FROM services WHERE id = ? AND tenant_id = ?
  `).bind(id, auth.tenantId).first();

  if (!service) {
    throw Errors.NOT_FOUND('Service');
  }

  const metrics = await c.env.DB_KEEP.prepare(`
    SELECT *
    FROM metrics
    WHERE service_id = ? AND period = ? AND period_start > datetime('now', '-' || ? || ' days')
    ORDER BY period_start DESC
  `).bind(id, period, parseInt(days)).all();

  return c.json({
    success: true,
    data: metrics.results,
  });
});

/**
 * 알림 채널 목록 조회
 */
keepRoutes.get('/alert-channels', requireTenant, async (c) => {
  const auth = c.get('auth')!;

  const channels = await c.env.DB_KEEP.prepare(`
    SELECT id, name, type, is_active, is_verified, last_test_at, last_test_result, created_at
    FROM alert_channels
    WHERE tenant_id = ?
    ORDER BY created_at
  `).bind(auth.tenantId).all();

  return c.json({
    success: true,
    data: channels.results,
  });
});

/**
 * 알림 채널 생성
 */
keepRoutes.post('/alert-channels', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const body = await c.req.json<{
    name: string;
    type: 'email' | 'slack' | 'webhook' | 'sms' | 'kakao';
    config: Record<string, unknown>;
  }>();

  if (!body.name || !body.type || !body.config) {
    throw Errors.VALIDATION_ERROR({
      name: !body.name ? 'Name is required' : undefined,
      type: !body.type ? 'Type is required' : undefined,
      config: !body.config ? 'Config is required' : undefined,
    });
  }

  const channelId = generateId();
  const now = new Date().toISOString();

  await c.env.DB_KEEP.prepare(`
    INSERT INTO alert_channels (id, tenant_id, name, type, config, is_active, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  `).bind(channelId, auth.tenantId, body.name, body.type, JSON.stringify(body.config), auth.userId, now, now).run();

  const channel = await c.env.DB_KEEP.prepare(`
    SELECT * FROM alert_channels WHERE id = ?
  `).bind(channelId).first();

  return c.json({
    success: true,
    data: channel,
  }, 201);
});
