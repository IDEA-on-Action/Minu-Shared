-- ============================================
-- Minu Find Database - Initial Schema
-- Database: minu-find-db
-- Created: 2024-12-28
-- Description: 공공입찰/사업기회 검색 서비스
-- ============================================

-- --------------------------------------------
-- 1. Opportunities (사업 기회)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,

  -- 기본 정보
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT CHECK (platform IN ('g2b', 'korea_on', 'smtech', 'keit', 'nipa', 'kdata', 'other')) NOT NULL,
  external_id TEXT,  -- 외부 플랫폼 ID
  external_url TEXT,

  -- 분류
  category TEXT,
  subcategory TEXT,
  tags TEXT DEFAULT '[]',  -- JSON array

  -- 금액 및 일정
  budget_min INTEGER,
  budget_max INTEGER,
  currency TEXT DEFAULT 'KRW',
  deadline TEXT,
  announcement_date TEXT,

  -- 발주처 정보
  organization_name TEXT,
  organization_type TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,

  -- 상태
  status TEXT CHECK (status IN ('open', 'closed', 'canceled', 'awarded')) DEFAULT 'open',

  -- AI 분석
  ai_summary TEXT,
  ai_keywords TEXT DEFAULT '[]',  -- JSON array
  ai_score REAL,
  ai_analyzed_at TEXT,

  -- 원본 데이터
  raw_data TEXT,  -- JSON

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_opportunities_tenant ON opportunities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_platform ON opportunities(platform);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_external ON opportunities(platform, external_id);

-- FTS (Full-Text Search) 가상 테이블
CREATE VIRTUAL TABLE IF NOT EXISTS opportunities_fts USING fts5(
  title,
  description,
  organization_name,
  content='opportunities',
  content_rowid='rowid'
);

-- FTS 트리거
CREATE TRIGGER IF NOT EXISTS opportunities_ai AFTER INSERT ON opportunities BEGIN
  INSERT INTO opportunities_fts(rowid, title, description, organization_name)
  VALUES (NEW.rowid, NEW.title, NEW.description, NEW.organization_name);
END;

CREATE TRIGGER IF NOT EXISTS opportunities_ad AFTER DELETE ON opportunities BEGIN
  INSERT INTO opportunities_fts(opportunities_fts, rowid, title, description, organization_name)
  VALUES ('delete', OLD.rowid, OLD.title, OLD.description, OLD.organization_name);
END;

CREATE TRIGGER IF NOT EXISTS opportunities_au AFTER UPDATE ON opportunities BEGIN
  INSERT INTO opportunities_fts(opportunities_fts, rowid, title, description, organization_name)
  VALUES ('delete', OLD.rowid, OLD.title, OLD.description, OLD.organization_name);
  INSERT INTO opportunities_fts(rowid, title, description, organization_name)
  VALUES (NEW.rowid, NEW.title, NEW.description, NEW.organization_name);
END;

-- --------------------------------------------
-- 2. Saved Searches (저장된 검색)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS saved_searches (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  name TEXT NOT NULL,
  description TEXT,

  -- 검색 조건
  query TEXT,
  filters TEXT DEFAULT '{}',  -- JSON
  platforms TEXT DEFAULT '[]',  -- JSON array
  categories TEXT DEFAULT '[]',  -- JSON array
  budget_min INTEGER,
  budget_max INTEGER,

  -- 알림 설정
  alert_enabled INTEGER DEFAULT 0,
  alert_frequency TEXT CHECK (alert_frequency IN ('realtime', 'daily', 'weekly')) DEFAULT 'daily',
  alert_email INTEGER DEFAULT 1,
  alert_slack INTEGER DEFAULT 0,
  last_alerted_at TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_tenant ON saved_searches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_alert ON saved_searches(alert_enabled, alert_frequency);

-- --------------------------------------------
-- 3. Alerts (알림)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  saved_search_id TEXT REFERENCES saved_searches(id) ON DELETE CASCADE,
  opportunity_id TEXT REFERENCES opportunities(id) ON DELETE CASCADE,

  type TEXT CHECK (type IN ('new_opportunity', 'deadline_reminder', 'status_change')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,

  -- 전송 상태
  status TEXT CHECK (status IN ('pending', 'sent', 'failed', 'read')) DEFAULT 'pending',
  sent_at TEXT,
  read_at TEXT,

  -- 전송 채널별 상태
  email_sent INTEGER DEFAULT 0,
  slack_sent INTEGER DEFAULT 0,
  push_sent INTEGER DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);

-- --------------------------------------------
-- 4. Bookmarks (북마크)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,

  notes TEXT,
  tags TEXT DEFAULT '[]',  -- JSON array

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_tenant ON bookmarks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_opportunity ON bookmarks(opportunity_id);

-- --------------------------------------------
-- 5. Crawl Jobs (크롤링 작업)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,

  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  started_at TEXT,
  completed_at TEXT,

  items_found INTEGER DEFAULT 0,
  items_created INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,

  error_message TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_crawl_jobs_platform ON crawl_jobs(platform);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_created ON crawl_jobs(created_at);
