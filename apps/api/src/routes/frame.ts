import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { Errors } from '../middleware/error-handler';
import { requireTenant } from '../middleware/auth';
import { rateLimitPresets } from '../middleware/rate-limit';
import { generateId } from '../utils/id';

export const frameRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * 제안서 목록 조회
 */
frameRoutes.get('/proposals', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const { status, page = '1', limit = '20' } = c.req.query();

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), 50);
  const offset = (pageNum - 1) * limitNum;

  let sql = `
    SELECT id, title, status, template_id, ai_generated, version, submission_deadline, created_at, updated_at
    FROM proposals
    WHERE tenant_id = ?
  `;
  const params: unknown[] = [auth.tenantId];

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
  params.push(limitNum, offset);

  const result = await c.env.DB_FRAME.prepare(sql).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
  });
});

/**
 * 제안서 생성
 */
frameRoutes.post('/proposals', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const body = await c.req.json<{
    title: string;
    description?: string;
    template_id?: string;
    opportunity_id?: string;
    submission_deadline?: string;
  }>();

  if (!body.title) {
    throw Errors.VALIDATION_ERROR({ title: 'Title is required' });
  }

  const id = generateId();
  const now = new Date().toISOString();

  await c.env.DB_FRAME.prepare(`
    INSERT INTO proposals (id, tenant_id, title, description, template_id, opportunity_id,
                          submission_deadline, status, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
  `).bind(
    id,
    auth.tenantId,
    body.title,
    body.description || null,
    body.template_id || null,
    body.opportunity_id || null,
    body.submission_deadline || null,
    auth.userId,
    now,
    now
  ).run();

  const proposal = await c.env.DB_FRAME.prepare(`
    SELECT * FROM proposals WHERE id = ?
  `).bind(id).first();

  return c.json({
    success: true,
    data: proposal,
  }, 201);
});

/**
 * 제안서 상세 조회
 */
frameRoutes.get('/proposals/:id', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const id = c.req.param('id');

  const proposal = await c.env.DB_FRAME.prepare(`
    SELECT * FROM proposals WHERE id = ? AND tenant_id = ?
  `).bind(id, auth.tenantId).first();

  if (!proposal) {
    throw Errors.NOT_FOUND('Proposal');
  }

  // 섹션 목록도 함께 조회
  const sections = await c.env.DB_FRAME.prepare(`
    SELECT * FROM proposal_sections WHERE proposal_id = ? ORDER BY order_index
  `).bind(id).all();

  return c.json({
    success: true,
    data: {
      ...proposal,
      sections: sections.results,
    },
  });
});

/**
 * 제안서 수정
 */
frameRoutes.patch('/proposals/:id', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const id = c.req.param('id');
  const updates = await c.req.json();

  const proposal = await c.env.DB_FRAME.prepare(`
    SELECT id FROM proposals WHERE id = ? AND tenant_id = ?
  `).bind(id, auth.tenantId).first();

  if (!proposal) {
    throw Errors.NOT_FOUND('Proposal');
  }

  const allowedFields = ['title', 'description', 'status', 'content', 'outline', 'submission_deadline'];
  const updateFields: string[] = [];
  const updateValues: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      if (['content', 'outline'].includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(JSON.stringify(value));
      } else {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }
  }

  if (updateFields.length === 0) {
    throw Errors.BAD_REQUEST('No valid fields to update');
  }

  updateFields.push('updated_at = ?');
  updateValues.push(new Date().toISOString());
  updateValues.push(id);

  await c.env.DB_FRAME.prepare(`
    UPDATE proposals SET ${updateFields.join(', ')} WHERE id = ?
  `).bind(...updateValues).run();

  const updated = await c.env.DB_FRAME.prepare(`
    SELECT * FROM proposals WHERE id = ?
  `).bind(id).first();

  return c.json({
    success: true,
    data: updated,
  });
});

/**
 * AI 섹션 생성 (비용이 큰 작업)
 */
frameRoutes.post('/proposals/:id/generate', requireTenant, rateLimitPresets.expensive, async (c) => {
  const auth = c.get('auth')!;
  const id = c.req.param('id');
  const { section_id, prompt, context } = await c.req.json<{
    section_id: string;
    prompt: string;
    context?: string;
  }>();

  const proposal = await c.env.DB_FRAME.prepare(`
    SELECT id, title, content FROM proposals WHERE id = ? AND tenant_id = ?
  `).bind(id, auth.tenantId).first();

  if (!proposal) {
    throw Errors.NOT_FOUND('Proposal');
  }

  // TODO: AI 생성 로직 (Anthropic API 호출)
  // const response = await fetch('https://api.anthropic.com/v1/messages', {...});

  // AI 생성 이력 저장
  const generationId = generateId();
  await c.env.DB_FRAME.prepare(`
    INSERT INTO ai_generations (id, proposal_id, section_id, user_id, prompt, context, model, result, tokens_used, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    generationId,
    id,
    section_id,
    auth.userId,
    prompt,
    context || null,
    'claude-3-5-sonnet',
    'AI 생성 결과가 여기에 들어갑니다.', // TODO: 실제 결과로 교체
    0,
    new Date().toISOString()
  ).run();

  return c.json({
    success: true,
    data: {
      generation_id: generationId,
      result: 'AI 생성 결과가 여기에 들어갑니다.',
    },
  });
});

/**
 * 템플릿 목록 조회
 */
frameRoutes.get('/templates', async (c) => {
  const auth = c.get('auth');
  const { category } = c.req.query();

  let sql = `
    SELECT id, name, description, category, is_public, is_system, usage_count, thumbnail_url
    FROM templates
    WHERE is_system = 1 OR is_public = 1
  `;
  const params: unknown[] = [];

  // 테넌트 템플릿 포함
  if (auth?.tenantId) {
    sql = `
      SELECT id, name, description, category, is_public, is_system, usage_count, thumbnail_url
      FROM templates
      WHERE is_system = 1 OR is_public = 1 OR tenant_id = ?
    `;
    params.push(auth.tenantId);
  }

  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY usage_count DESC`;

  const result = await c.env.DB_FRAME.prepare(sql).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
  });
});
