import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { Errors } from '../middleware/error-handler';
import { requireTenant } from '../middleware/auth';
import { generateId } from '../utils/id';

export const findRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * 사업 기회 검색
 */
findRoutes.get('/opportunities', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const query = c.req.query();

  const page = parseInt(query.page || '1');
  const limit = Math.min(parseInt(query.limit || '20'), 100);
  const offset = (page - 1) * limit;

  // 검색 쿼리 빌드
  let sql = `
    SELECT id, title, platform, category, budget_min, budget_max, deadline,
           organization_name, status, ai_score, created_at
    FROM opportunities
    WHERE tenant_id = ?
  `;
  const params: unknown[] = [auth.tenantId];

  // 플랫폼 필터
  if (query.platform) {
    sql += ` AND platform = ?`;
    params.push(query.platform);
  }

  // 상태 필터
  if (query.status) {
    sql += ` AND status = ?`;
    params.push(query.status);
  }

  // 카테고리 필터
  if (query.category) {
    sql += ` AND category = ?`;
    params.push(query.category);
  }

  // 예산 필터
  if (query.budget_min) {
    sql += ` AND budget_max >= ?`;
    params.push(parseInt(query.budget_min));
  }
  if (query.budget_max) {
    sql += ` AND budget_min <= ?`;
    params.push(parseInt(query.budget_max));
  }

  // 마감일 필터
  if (query.deadline_after) {
    sql += ` AND deadline >= ?`;
    params.push(query.deadline_after);
  }

  // 정렬
  const sortField = query.sort || 'deadline';
  const sortOrder = query.order === 'desc' ? 'DESC' : 'ASC';
  sql += ` ORDER BY ${sortField} ${sortOrder}`;

  // 페이지네이션
  sql += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const result = await c.env.DB_FIND.prepare(sql).bind(...params).all();

  // 전체 개수 조회
  let countSql = `SELECT COUNT(*) as total FROM opportunities WHERE tenant_id = ?`;
  const countParams: unknown[] = [auth.tenantId];

  if (query.platform) {
    countSql += ` AND platform = ?`;
    countParams.push(query.platform);
  }
  if (query.status) {
    countSql += ` AND status = ?`;
    countParams.push(query.status);
  }

  const countResult = await c.env.DB_FIND.prepare(countSql).bind(...countParams).first<{ total: number }>();
  const total = countResult?.total || 0;

  return c.json({
    success: true,
    data: result.results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * 전문 검색 (FTS)
 */
findRoutes.get('/opportunities/search', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const { q, limit = '20' } = c.req.query();

  if (!q || q.length < 2) {
    throw Errors.BAD_REQUEST('Search query must be at least 2 characters');
  }

  const result = await c.env.DB_FIND.prepare(`
    SELECT o.id, o.title, o.platform, o.category, o.deadline, o.organization_name,
           highlight(opportunities_fts, 0, '<mark>', '</mark>') as title_highlight
    FROM opportunities_fts
    INNER JOIN opportunities o ON opportunities_fts.rowid = o.rowid
    WHERE opportunities_fts MATCH ? AND o.tenant_id = ?
    ORDER BY rank
    LIMIT ?
  `).bind(q, auth.tenantId, parseInt(limit)).all();

  return c.json({
    success: true,
    data: result.results,
  });
});

/**
 * 사업 기회 상세 조회
 */
findRoutes.get('/opportunities/:id', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const id = c.req.param('id');

  const opportunity = await c.env.DB_FIND.prepare(`
    SELECT * FROM opportunities WHERE id = ? AND tenant_id = ?
  `).bind(id, auth.tenantId).first();

  if (!opportunity) {
    throw Errors.NOT_FOUND('Opportunity');
  }

  return c.json({
    success: true,
    data: opportunity,
  });
});

/**
 * 북마크 토글
 */
findRoutes.post('/opportunities/:id/bookmark', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const opportunityId = c.req.param('id');

  const existing = await c.env.DB_FIND.prepare(`
    SELECT id FROM bookmarks WHERE user_id = ? AND opportunity_id = ?
  `).bind(auth.userId, opportunityId).first();

  if (existing) {
    // 북마크 제거
    await c.env.DB_FIND.prepare(`
      DELETE FROM bookmarks WHERE id = ?
    `).bind(existing.id).run();

    return c.json({
      success: true,
      bookmarked: false,
    });
  }

  // 북마크 추가
  await c.env.DB_FIND.prepare(`
    INSERT INTO bookmarks (id, tenant_id, user_id, opportunity_id, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(generateId(), auth.tenantId, auth.userId, opportunityId, new Date().toISOString()).run();

  return c.json({
    success: true,
    bookmarked: true,
  });
});

/**
 * 저장된 검색 목록
 */
findRoutes.get('/saved-searches', requireTenant, async (c) => {
  const auth = c.get('auth')!;

  const searches = await c.env.DB_FIND.prepare(`
    SELECT * FROM saved_searches
    WHERE tenant_id = ? AND user_id = ?
    ORDER BY created_at DESC
  `).bind(auth.tenantId, auth.userId).all();

  return c.json({
    success: true,
    data: searches.results,
  });
});

/**
 * 저장된 검색 생성
 */
findRoutes.post('/saved-searches', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const body = await c.req.json<{
    name: string;
    query?: string;
    filters?: Record<string, unknown>;
    alert_enabled?: boolean;
    alert_frequency?: string;
  }>();

  if (!body.name) {
    throw Errors.VALIDATION_ERROR({ name: 'Name is required' });
  }

  const id = generateId();
  const now = new Date().toISOString();

  await c.env.DB_FIND.prepare(`
    INSERT INTO saved_searches (id, tenant_id, user_id, name, query, filters, alert_enabled, alert_frequency, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    auth.tenantId,
    auth.userId,
    body.name,
    body.query || null,
    JSON.stringify(body.filters || {}),
    body.alert_enabled ? 1 : 0,
    body.alert_frequency || 'daily',
    now,
    now
  ).run();

  const search = await c.env.DB_FIND.prepare(`
    SELECT * FROM saved_searches WHERE id = ?
  `).bind(id).first();

  return c.json({
    success: true,
    data: search,
  }, 201);
});
