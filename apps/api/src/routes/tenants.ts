import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { Errors } from '../middleware/error-handler';
import { requireTenant, requireRole } from '../middleware/auth';
import { generateId, generateSlug } from '../utils/id';

export const tenantsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * 테넌트 생성
 */
tenantsRoutes.post('/', async (c) => {
  const auth = c.get('auth')!;
  const { name, slug: customSlug } = await c.req.json<{
    name: string;
    slug?: string;
  }>();

  if (!name || name.length < 2) {
    throw Errors.VALIDATION_ERROR({ name: 'Name must be at least 2 characters' });
  }

  const slug = customSlug || generateSlug(name);
  const tenantId = generateId();

  // 슬러그 중복 확인
  const existing = await c.env.DB_SHARED.prepare(`
    SELECT id FROM tenants WHERE slug = ?
  `).bind(slug).first();

  if (existing) {
    throw Errors.CONFLICT('Tenant with this slug already exists');
  }

  const now = new Date().toISOString();

  // 트랜잭션으로 테넌트 + 멤버 생성
  await c.env.DB_SHARED.batch([
    c.env.DB_SHARED.prepare(`
      INSERT INTO tenants (id, name, slug, plan, created_at, updated_at)
      VALUES (?, ?, ?, 'free', ?, ?)
    `).bind(tenantId, name, slug, now, now),

    c.env.DB_SHARED.prepare(`
      INSERT INTO tenant_members (id, tenant_id, user_id, role, joined_at, created_at, updated_at)
      VALUES (?, ?, ?, 'owner', ?, ?, ?)
    `).bind(generateId(), tenantId, auth.userId, now, now, now),
  ]);

  const tenant = await c.env.DB_SHARED.prepare(`
    SELECT id, name, slug, logo_url, plan, created_at
    FROM tenants
    WHERE id = ?
  `).bind(tenantId).first();

  return c.json({
    success: true,
    data: tenant,
  }, 201);
});

/**
 * 현재 테넌트 정보 조회
 */
tenantsRoutes.get('/current', requireTenant, async (c) => {
  const auth = c.get('auth')!;

  const tenant = await c.env.DB_SHARED.prepare(`
    SELECT t.*, tm.role as my_role
    FROM tenants t
    INNER JOIN tenant_members tm ON t.id = tm.tenant_id
    WHERE t.id = ? AND tm.user_id = ?
  `).bind(auth.tenantId, auth.userId).first();

  if (!tenant) {
    throw Errors.NOT_FOUND('Tenant');
  }

  return c.json({
    success: true,
    data: tenant,
  });
});

/**
 * 테넌트 정보 수정
 */
tenantsRoutes.patch('/current', requireTenant, requireRole('owner', 'admin'), async (c) => {
  const auth = c.get('auth')!;
  const updates = await c.req.json<{
    name?: string;
    logo_url?: string;
    settings?: Record<string, unknown>;
  }>();

  const allowedFields = ['name', 'logo_url', 'settings'];
  const updateFields: string[] = [];
  const updateValues: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      if (key === 'settings') {
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
  updateValues.push(auth.tenantId);

  await c.env.DB_SHARED.prepare(`
    UPDATE tenants SET ${updateFields.join(', ')} WHERE id = ?
  `).bind(...updateValues).run();

  const tenant = await c.env.DB_SHARED.prepare(`
    SELECT * FROM tenants WHERE id = ?
  `).bind(auth.tenantId).first();

  return c.json({
    success: true,
    data: tenant,
  });
});

/**
 * 테넌트 멤버 목록
 */
tenantsRoutes.get('/current/members', requireTenant, async (c) => {
  const auth = c.get('auth')!;

  const members = await c.env.DB_SHARED.prepare(`
    SELECT tm.id, tm.role, tm.joined_at, u.id as user_id, u.email, u.name, u.avatar_url
    FROM tenant_members tm
    INNER JOIN users u ON tm.user_id = u.id
    WHERE tm.tenant_id = ?
    ORDER BY tm.joined_at ASC
  `).bind(auth.tenantId).all();

  return c.json({
    success: true,
    data: members.results,
  });
});

/**
 * 멤버 초대
 */
tenantsRoutes.post('/current/members/invite', requireTenant, requireRole('owner', 'admin'), async (c) => {
  const auth = c.get('auth')!;
  const { email, role = 'member' } = await c.req.json<{
    email: string;
    role?: 'admin' | 'member' | 'viewer';
  }>();

  if (!email) {
    throw Errors.VALIDATION_ERROR({ email: 'Email is required' });
  }

  // 사용자 찾기
  const user = await c.env.DB_SHARED.prepare(`
    SELECT id FROM users WHERE email = ?
  `).bind(email).first<{ id: string }>();

  if (!user) {
    // TODO: 초대 이메일 발송
    return c.json({
      success: true,
      message: 'Invitation email will be sent',
      pending: true,
    });
  }

  // 이미 멤버인지 확인
  const existing = await c.env.DB_SHARED.prepare(`
    SELECT id FROM tenant_members WHERE tenant_id = ? AND user_id = ?
  `).bind(auth.tenantId, user.id).first();

  if (existing) {
    throw Errors.CONFLICT('User is already a member');
  }

  const now = new Date().toISOString();

  await c.env.DB_SHARED.prepare(`
    INSERT INTO tenant_members (id, tenant_id, user_id, role, invited_by, invited_at, joined_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(generateId(), auth.tenantId, user.id, role, auth.userId, now, now, now, now).run();

  return c.json({
    success: true,
    message: 'Member added successfully',
  }, 201);
});

/**
 * 멤버 역할 변경
 */
tenantsRoutes.patch('/current/members/:memberId', requireTenant, requireRole('owner', 'admin'), async (c) => {
  const auth = c.get('auth')!;
  const memberId = c.req.param('memberId');
  const { role } = await c.req.json<{ role: string }>();

  if (!['admin', 'member', 'viewer'].includes(role)) {
    throw Errors.VALIDATION_ERROR({ role: 'Invalid role' });
  }

  // owner 역할은 변경 불가
  const member = await c.env.DB_SHARED.prepare(`
    SELECT role FROM tenant_members WHERE id = ? AND tenant_id = ?
  `).bind(memberId, auth.tenantId).first<{ role: string }>();

  if (!member) {
    throw Errors.NOT_FOUND('Member');
  }

  if (member.role === 'owner') {
    throw Errors.BAD_REQUEST('Cannot change owner role');
  }

  await c.env.DB_SHARED.prepare(`
    UPDATE tenant_members SET role = ?, updated_at = ? WHERE id = ?
  `).bind(role, new Date().toISOString(), memberId).run();

  return c.json({
    success: true,
    message: 'Role updated successfully',
  });
});

/**
 * 멤버 제거
 */
tenantsRoutes.delete('/current/members/:memberId', requireTenant, requireRole('owner', 'admin'), async (c) => {
  const auth = c.get('auth')!;
  const memberId = c.req.param('memberId');

  const member = await c.env.DB_SHARED.prepare(`
    SELECT role, user_id FROM tenant_members WHERE id = ? AND tenant_id = ?
  `).bind(memberId, auth.tenantId).first<{ role: string; user_id: string }>();

  if (!member) {
    throw Errors.NOT_FOUND('Member');
  }

  if (member.role === 'owner') {
    throw Errors.BAD_REQUEST('Cannot remove owner');
  }

  await c.env.DB_SHARED.prepare(`
    DELETE FROM tenant_members WHERE id = ?
  `).bind(memberId).run();

  return c.json({
    success: true,
    message: 'Member removed successfully',
  });
});
