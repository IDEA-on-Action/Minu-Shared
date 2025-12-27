import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { Errors } from '../middleware/error-handler';
import { generateId } from '../utils/id';

export const usersRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * 현재 사용자 정보 조회
 */
usersRoutes.get('/me', async (c) => {
  const auth = c.get('auth')!;

  const user = await c.env.DB_SHARED.prepare(`
    SELECT id, email, name, avatar_url, provider, email_verified, last_login_at, created_at
    FROM users
    WHERE id = ?
  `).bind(auth.userId).first();

  if (!user) {
    // 사용자가 없으면 생성 (최초 로그인)
    const newUser = {
      id: auth.userId,
      email: auth.email,
      name: auth.name || null,
      avatar_url: null,
      provider: 'google',
      email_verified: 1,
      last_login_at: new Date().toISOString(),
    };

    await c.env.DB_SHARED.prepare(`
      INSERT INTO users (id, email, name, avatar_url, provider, email_verified, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      newUser.id,
      newUser.email,
      newUser.name,
      newUser.avatar_url,
      newUser.provider,
      newUser.email_verified,
      newUser.last_login_at
    ).run();

    return c.json({
      success: true,
      data: newUser,
    });
  }

  // 마지막 로그인 시간 업데이트
  await c.env.DB_SHARED.prepare(`
    UPDATE users SET last_login_at = ? WHERE id = ?
  `).bind(new Date().toISOString(), auth.userId).run();

  return c.json({
    success: true,
    data: user,
  });
});

/**
 * 사용자 정보 수정
 */
usersRoutes.patch('/me', async (c) => {
  const auth = c.get('auth')!;
  const updates = await c.req.json<{
    name?: string;
    avatar_url?: string;
  }>();

  const allowedFields = ['name', 'avatar_url'];
  const updateFields: string[] = [];
  const updateValues: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      updateFields.push(`${key} = ?`);
      updateValues.push(value);
    }
  }

  if (updateFields.length === 0) {
    throw Errors.BAD_REQUEST('No valid fields to update');
  }

  updateFields.push('updated_at = ?');
  updateValues.push(new Date().toISOString());
  updateValues.push(auth.userId);

  await c.env.DB_SHARED.prepare(`
    UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
  `).bind(...updateValues).run();

  const user = await c.env.DB_SHARED.prepare(`
    SELECT id, email, name, avatar_url, provider, email_verified, created_at, updated_at
    FROM users
    WHERE id = ?
  `).bind(auth.userId).first();

  return c.json({
    success: true,
    data: user,
  });
});

/**
 * 사용자의 테넌트 목록 조회
 */
usersRoutes.get('/me/tenants', async (c) => {
  const auth = c.get('auth')!;

  const tenants = await c.env.DB_SHARED.prepare(`
    SELECT t.id, t.name, t.slug, t.logo_url, t.plan, tm.role, tm.joined_at
    FROM tenants t
    INNER JOIN tenant_members tm ON t.id = tm.tenant_id
    WHERE tm.user_id = ?
    ORDER BY tm.joined_at DESC
  `).bind(auth.userId).all();

  return c.json({
    success: true,
    data: tenants.results,
  });
});

/**
 * 사용자 계정 삭제
 */
usersRoutes.delete('/me', async (c) => {
  const auth = c.get('auth')!;

  // 소유한 테넌트 확인
  const ownedTenants = await c.env.DB_SHARED.prepare(`
    SELECT COUNT(*) as count
    FROM tenant_members
    WHERE user_id = ? AND role = 'owner'
  `).bind(auth.userId).first<{ count: number }>();

  if (ownedTenants && ownedTenants.count > 0) {
    throw Errors.BAD_REQUEST(
      'Cannot delete account while owning tenants. Transfer ownership first.'
    );
  }

  // 사용자 삭제 (CASCADE로 tenant_members도 삭제됨)
  await c.env.DB_SHARED.prepare(`
    DELETE FROM users WHERE id = ?
  `).bind(auth.userId).run();

  return c.json({
    success: true,
    message: 'Account deleted successfully',
  });
});
