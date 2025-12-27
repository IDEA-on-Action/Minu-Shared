-- ============================================
-- Minu Build Database - Initial Schema
-- Database: minu-build-db
-- Created: 2024-12-28
-- Description: 프로젝트 협업 관리 서비스
-- ============================================

-- --------------------------------------------
-- 1. Projects (프로젝트)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,

  -- 연결 정보
  opportunity_id TEXT,  -- minu-find의 opportunity
  proposal_id TEXT,     -- minu-frame의 proposal

  -- 기본 정보
  name TEXT NOT NULL,
  description TEXT,
  code TEXT,  -- 프로젝트 코드 (예: PRJ-2024-001)

  -- 분류
  category TEXT,
  tags TEXT DEFAULT '[]',  -- JSON array

  -- 기간 및 예산
  start_date TEXT,
  end_date TEXT,
  budget INTEGER,
  currency TEXT DEFAULT 'KRW',

  -- 고객 정보
  client_name TEXT,
  client_contact TEXT,
  contract_number TEXT,

  -- 상태
  status TEXT CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'canceled')) DEFAULT 'planning',
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),

  -- 설정
  settings TEXT DEFAULT '{}',  -- JSON

  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_tenant ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_opportunity ON projects(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_projects_proposal ON projects(proposal_id);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);

-- --------------------------------------------
-- 2. Project Members (프로젝트 멤버)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  role TEXT CHECK (role IN ('pm', 'lead', 'member', 'observer')) DEFAULT 'member',
  department TEXT,
  responsibilities TEXT,  -- 담당 업무

  -- 참여 기간
  joined_at TEXT DEFAULT (datetime('now')),
  left_at TEXT,

  -- 알림 설정
  notify_tasks INTEGER DEFAULT 1,
  notify_comments INTEGER DEFAULT 1,
  notify_deadlines INTEGER DEFAULT 1,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_role ON project_members(role);

-- --------------------------------------------
-- 3. Milestones (마일스톤)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- 일정
  due_date TEXT NOT NULL,
  completed_at TEXT,

  -- 상태
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed')) DEFAULT 'pending',

  -- 순서
  order_index INTEGER DEFAULT 0,

  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);

-- --------------------------------------------
-- 4. Tasks (태스크)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id TEXT REFERENCES milestones(id) ON DELETE SET NULL,
  parent_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,

  -- 기본 정보
  title TEXT NOT NULL,
  description TEXT,

  -- 분류
  task_type TEXT CHECK (task_type IN ('task', 'bug', 'feature', 'improvement', 'documentation')) DEFAULT 'task',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',

  -- 상태
  status TEXT CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'done', 'canceled')) DEFAULT 'todo',

  -- 담당자
  assignee_id TEXT,
  reporter_id TEXT NOT NULL,

  -- 일정
  start_date TEXT,
  due_date TEXT,
  completed_at TEXT,

  -- 추정/실제 시간 (분 단위)
  estimated_minutes INTEGER,
  actual_minutes INTEGER,

  -- 순서 (칸반 보드용)
  order_index INTEGER DEFAULT 0,

  -- 라벨
  labels TEXT DEFAULT '[]',  -- JSON array

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- --------------------------------------------
-- 5. Task Comments (태스크 코멘트)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS task_comments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES task_comments(id) ON DELETE CASCADE,

  user_id TEXT NOT NULL,
  content TEXT NOT NULL,

  -- 멘션
  mentions TEXT DEFAULT '[]',  -- JSON array of user_ids

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user ON task_comments(user_id);

-- --------------------------------------------
-- 6. Task Attachments (태스크 첨부파일)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS task_attachments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,  -- R2 경로
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,

  uploaded_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_task_attachments_task ON task_attachments(task_id);

-- --------------------------------------------
-- 7. Time Entries (시간 기록)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS time_entries (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,

  description TEXT,
  minutes INTEGER NOT NULL,
  entry_date TEXT NOT NULL,

  -- 청구 가능 여부
  billable INTEGER DEFAULT 1,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(entry_date);

-- --------------------------------------------
-- 8. Activity Log (활동 로그)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  action TEXT NOT NULL,  -- created, updated, deleted, commented, assigned, etc.
  entity_type TEXT NOT NULL,  -- project, task, milestone, comment
  entity_id TEXT NOT NULL,

  old_values TEXT,  -- JSON
  new_values TEXT,  -- JSON

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_log_project ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);
