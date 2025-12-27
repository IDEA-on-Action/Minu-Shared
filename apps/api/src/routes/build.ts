import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { Errors } from '../middleware/error-handler';
import { requireTenant } from '../middleware/auth';
import { generateId } from '../utils/id';

export const buildRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * 프로젝트 목록 조회
 */
buildRoutes.get('/projects', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const { status, page = '1', limit = '20' } = c.req.query();

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), 50);
  const offset = (pageNum - 1) * limitNum;

  let sql = `
    SELECT p.id, p.name, p.code, p.status, p.progress, p.start_date, p.end_date,
           p.client_name, p.created_at
    FROM projects p
    INNER JOIN project_members pm ON p.id = pm.project_id
    WHERE p.tenant_id = ? AND pm.user_id = ?
  `;
  const params: unknown[] = [auth.tenantId, auth.userId];

  if (status) {
    sql += ` AND p.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY p.updated_at DESC LIMIT ? OFFSET ?`;
  params.push(limitNum, offset);

  const result = await c.env.DB_BUILD.prepare(sql).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
  });
});

/**
 * 프로젝트 생성
 */
buildRoutes.post('/projects', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const body = await c.req.json<{
    name: string;
    description?: string;
    code?: string;
    start_date?: string;
    end_date?: string;
    budget?: number;
    client_name?: string;
    proposal_id?: string;
    opportunity_id?: string;
  }>();

  if (!body.name) {
    throw Errors.VALIDATION_ERROR({ name: 'Name is required' });
  }

  const projectId = generateId();
  const now = new Date().toISOString();

  // 프로젝트 코드 생성
  const code = body.code || `PRJ-${new Date().getFullYear()}-${projectId.slice(0, 6).toUpperCase()}`;

  await c.env.DB_BUILD.batch([
    // 프로젝트 생성
    c.env.DB_BUILD.prepare(`
      INSERT INTO projects (id, tenant_id, name, description, code, start_date, end_date,
                           budget, client_name, proposal_id, opportunity_id, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning', ?, ?, ?)
    `).bind(
      projectId,
      auth.tenantId,
      body.name,
      body.description || null,
      code,
      body.start_date || null,
      body.end_date || null,
      body.budget || null,
      body.client_name || null,
      body.proposal_id || null,
      body.opportunity_id || null,
      auth.userId,
      now,
      now
    ),

    // 생성자를 PM으로 추가
    c.env.DB_BUILD.prepare(`
      INSERT INTO project_members (id, project_id, user_id, role, joined_at, created_at, updated_at)
      VALUES (?, ?, ?, 'pm', ?, ?, ?)
    `).bind(generateId(), projectId, auth.userId, now, now, now),
  ]);

  const project = await c.env.DB_BUILD.prepare(`
    SELECT * FROM projects WHERE id = ?
  `).bind(projectId).first();

  return c.json({
    success: true,
    data: project,
  }, 201);
});

/**
 * 프로젝트 상세 조회
 */
buildRoutes.get('/projects/:id', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const id = c.req.param('id');

  const project = await c.env.DB_BUILD.prepare(`
    SELECT p.*, pm.role as my_role
    FROM projects p
    INNER JOIN project_members pm ON p.id = pm.project_id
    WHERE p.id = ? AND p.tenant_id = ? AND pm.user_id = ?
  `).bind(id, auth.tenantId, auth.userId).first();

  if (!project) {
    throw Errors.NOT_FOUND('Project');
  }

  // 멤버 목록
  const members = await c.env.DB_BUILD.prepare(`
    SELECT pm.*, u.email, u.name, u.avatar_url
    FROM project_members pm
    INNER JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `).bind(id).all();

  // 마일스톤 목록
  const milestones = await c.env.DB_BUILD.prepare(`
    SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date
  `).bind(id).all();

  return c.json({
    success: true,
    data: {
      ...project,
      members: members.results,
      milestones: milestones.results,
    },
  });
});

/**
 * 태스크 목록 조회
 */
buildRoutes.get('/projects/:id/tasks', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const projectId = c.req.param('id');
  const { status, assignee, milestone_id } = c.req.query();

  // 프로젝트 접근 권한 확인
  const member = await c.env.DB_BUILD.prepare(`
    SELECT id FROM project_members WHERE project_id = ? AND user_id = ?
  `).bind(projectId, auth.userId).first();

  if (!member) {
    throw Errors.FORBIDDEN('Not a project member');
  }

  let sql = `
    SELECT t.*, u.name as assignee_name, u.avatar_url as assignee_avatar
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    WHERE t.project_id = ?
  `;
  const params: unknown[] = [projectId];

  if (status) {
    sql += ` AND t.status = ?`;
    params.push(status);
  }

  if (assignee) {
    sql += ` AND t.assignee_id = ?`;
    params.push(assignee);
  }

  if (milestone_id) {
    sql += ` AND t.milestone_id = ?`;
    params.push(milestone_id);
  }

  sql += ` ORDER BY t.order_index, t.created_at`;

  const result = await c.env.DB_BUILD.prepare(sql).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
  });
});

/**
 * 태스크 생성
 */
buildRoutes.post('/projects/:id/tasks', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const projectId = c.req.param('id');
  const body = await c.req.json<{
    title: string;
    description?: string;
    task_type?: string;
    priority?: string;
    assignee_id?: string;
    milestone_id?: string;
    due_date?: string;
    estimated_minutes?: number;
  }>();

  if (!body.title) {
    throw Errors.VALIDATION_ERROR({ title: 'Title is required' });
  }

  // 프로젝트 접근 권한 확인
  const member = await c.env.DB_BUILD.prepare(`
    SELECT id FROM project_members WHERE project_id = ? AND user_id = ?
  `).bind(projectId, auth.userId).first();

  if (!member) {
    throw Errors.FORBIDDEN('Not a project member');
  }

  const taskId = generateId();
  const now = new Date().toISOString();

  await c.env.DB_BUILD.prepare(`
    INSERT INTO tasks (id, project_id, title, description, task_type, priority, status,
                      assignee_id, reporter_id, milestone_id, due_date, estimated_minutes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    taskId,
    projectId,
    body.title,
    body.description || null,
    body.task_type || 'task',
    body.priority || 'medium',
    body.assignee_id || null,
    auth.userId,
    body.milestone_id || null,
    body.due_date || null,
    body.estimated_minutes || null,
    now,
    now
  ).run();

  // 활동 로그
  await c.env.DB_BUILD.prepare(`
    INSERT INTO activity_log (id, project_id, user_id, action, entity_type, entity_id, new_values, created_at)
    VALUES (?, ?, ?, 'created', 'task', ?, ?, ?)
  `).bind(generateId(), projectId, auth.userId, taskId, JSON.stringify({ title: body.title }), now).run();

  // 알림 큐에 추가 (담당자가 있을 경우)
  if (body.assignee_id && body.assignee_id !== auth.userId) {
    await c.env.NOTIFICATION_QUEUE.send({
      type: 'task_assigned',
      user_id: body.assignee_id,
      data: {
        task_id: taskId,
        task_title: body.title,
        project_id: projectId,
        assigned_by: auth.userId,
      },
    });
  }

  const task = await c.env.DB_BUILD.prepare(`
    SELECT * FROM tasks WHERE id = ?
  `).bind(taskId).first();

  return c.json({
    success: true,
    data: task,
  }, 201);
});

/**
 * 태스크 상태 변경
 */
buildRoutes.patch('/projects/:projectId/tasks/:taskId/status', requireTenant, async (c) => {
  const auth = c.get('auth')!;
  const { projectId, taskId } = c.req.param();
  const { status } = await c.req.json<{ status: string }>();

  const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done', 'canceled'];
  if (!validStatuses.includes(status)) {
    throw Errors.VALIDATION_ERROR({ status: 'Invalid status' });
  }

  const task = await c.env.DB_BUILD.prepare(`
    SELECT t.*, pm.id as member_id
    FROM tasks t
    INNER JOIN project_members pm ON t.project_id = pm.project_id AND pm.user_id = ?
    WHERE t.id = ? AND t.project_id = ?
  `).bind(auth.userId, taskId, projectId).first<{ status: string }>();

  if (!task) {
    throw Errors.NOT_FOUND('Task');
  }

  const oldStatus = task.status;
  const now = new Date().toISOString();

  await c.env.DB_BUILD.prepare(`
    UPDATE tasks SET status = ?, updated_at = ?, completed_at = ? WHERE id = ?
  `).bind(
    status,
    now,
    status === 'done' ? now : null,
    taskId
  ).run();

  // 활동 로그
  await c.env.DB_BUILD.prepare(`
    INSERT INTO activity_log (id, project_id, user_id, action, entity_type, entity_id, old_values, new_values, created_at)
    VALUES (?, ?, ?, 'status_changed', 'task', ?, ?, ?, ?)
  `).bind(
    generateId(),
    projectId,
    auth.userId,
    taskId,
    JSON.stringify({ status: oldStatus }),
    JSON.stringify({ status }),
    now
  ).run();

  return c.json({
    success: true,
    data: { status },
  });
});
