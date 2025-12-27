-- ============================================
-- Minu Frame Database - Initial Schema
-- Database: minu-frame-db
-- Created: 2024-12-28
-- Description: AI 제안서 작성 서비스
-- ============================================

-- --------------------------------------------
-- 1. Templates (제안서 템플릿)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,  -- NULL이면 시스템 템플릿

  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('government', 'corporate', 'startup', 'research', 'other')) DEFAULT 'other',

  -- 템플릿 구조
  structure TEXT NOT NULL DEFAULT '[]',  -- JSON array of sections
  default_styles TEXT DEFAULT '{}',  -- JSON

  -- 메타데이터
  is_public INTEGER DEFAULT 0,
  is_system INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,

  thumbnail_url TEXT,
  preview_url TEXT,

  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_templates_tenant ON templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_system ON templates(is_system);

-- --------------------------------------------
-- 2. Proposals (제안서)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,

  -- 연결 정보
  opportunity_id TEXT,  -- minu-find의 opportunity와 연결
  template_id TEXT REFERENCES templates(id) ON DELETE SET NULL,

  -- 기본 정보
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'in_progress', 'review', 'submitted', 'accepted', 'rejected')) DEFAULT 'draft',

  -- 제안서 내용
  content TEXT DEFAULT '{}',  -- JSON (섹션별 내용)
  outline TEXT DEFAULT '[]',  -- JSON array (목차)

  -- AI 생성 정보
  ai_generated INTEGER DEFAULT 0,
  ai_model TEXT,
  ai_prompt_tokens INTEGER DEFAULT 0,
  ai_completion_tokens INTEGER DEFAULT 0,

  -- 파일 정보
  file_url TEXT,
  file_size INTEGER,
  file_format TEXT CHECK (file_format IN ('pdf', 'docx', 'hwp', 'pptx')),

  -- 제출 정보
  submitted_at TEXT,
  submission_deadline TEXT,

  -- 버전 관리
  version INTEGER DEFAULT 1,
  parent_id TEXT REFERENCES proposals(id),

  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_proposals_tenant ON proposals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_opportunity ON proposals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_proposals_template ON proposals(template_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_proposals_deadline ON proposals(submission_deadline);

-- --------------------------------------------
-- 3. Proposal Sections (제안서 섹션)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS proposal_sections (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,

  -- 섹션 정보
  title TEXT NOT NULL,
  section_type TEXT CHECK (section_type IN ('cover', 'toc', 'executive_summary', 'body', 'appendix', 'custom')) DEFAULT 'body',
  order_index INTEGER NOT NULL DEFAULT 0,

  -- 내용
  content TEXT,  -- Markdown or HTML
  content_json TEXT DEFAULT '{}',  -- JSON (structured content)

  -- AI 생성 정보
  ai_generated INTEGER DEFAULT 0,
  ai_suggestions TEXT DEFAULT '[]',  -- JSON array

  -- 상태
  status TEXT CHECK (status IN ('empty', 'draft', 'complete', 'review')) DEFAULT 'empty',
  word_count INTEGER DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_proposal_sections_proposal ON proposal_sections(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_sections_order ON proposal_sections(proposal_id, order_index);

-- --------------------------------------------
-- 4. Proposal Comments (제안서 코멘트)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS proposal_comments (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES proposal_sections(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES proposal_comments(id) ON DELETE CASCADE,

  user_id TEXT NOT NULL,
  content TEXT NOT NULL,

  -- 위치 정보 (텍스트 하이라이트)
  selection_start INTEGER,
  selection_end INTEGER,
  selected_text TEXT,

  -- 상태
  status TEXT CHECK (status IN ('open', 'resolved', 'wontfix')) DEFAULT 'open',
  resolved_at TEXT,
  resolved_by TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_proposal_comments_proposal ON proposal_comments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_section ON proposal_comments(section_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_user ON proposal_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_status ON proposal_comments(status);

-- --------------------------------------------
-- 5. Proposal Collaborators (제안서 협업자)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS proposal_collaborators (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  role TEXT CHECK (role IN ('owner', 'editor', 'reviewer', 'viewer')) DEFAULT 'viewer',
  sections TEXT DEFAULT '[]',  -- JSON array (담당 섹션)

  invited_by TEXT,
  invited_at TEXT DEFAULT (datetime('now')),
  accepted_at TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(proposal_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_proposal_collaborators_proposal ON proposal_collaborators(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_collaborators_user ON proposal_collaborators(user_id);

-- --------------------------------------------
-- 6. AI Generation History (AI 생성 이력)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS ai_generations (
  id TEXT PRIMARY KEY,
  proposal_id TEXT REFERENCES proposals(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES proposal_sections(id) ON DELETE CASCADE,

  user_id TEXT NOT NULL,

  -- 요청 정보
  prompt TEXT NOT NULL,
  context TEXT,  -- JSON (추가 컨텍스트)
  model TEXT NOT NULL,

  -- 결과
  result TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,

  -- 평가
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,

  -- 채택 여부
  accepted INTEGER DEFAULT 0,
  accepted_at TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_generations_proposal ON ai_generations(proposal_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_section ON ai_generations(section_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_model ON ai_generations(model);

-- --------------------------------------------
-- 7. Proposal Files (제안서 첨부파일)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS proposal_files (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES proposal_sections(id) ON DELETE SET NULL,

  -- 파일 정보
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,  -- R2 경로
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,

  -- 분류
  file_type TEXT CHECK (file_type IN ('image', 'document', 'spreadsheet', 'diagram', 'other')) DEFAULT 'other',

  uploaded_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_proposal_files_proposal ON proposal_files(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_files_section ON proposal_files(section_id);
