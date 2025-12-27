-- ============================================
-- Minu Keep Database - Initial Schema
-- Database: minu-keep-db
-- Created: 2024-12-28
-- Description: 서비스 모니터링 및 알림 서비스
-- ============================================

-- --------------------------------------------
-- 1. Services (모니터링 대상 서비스)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,

  -- 기본 정보
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  icon_url TEXT,

  -- 분류
  category TEXT CHECK (category IN ('website', 'api', 'database', 'server', 'other')) DEFAULT 'website',
  environment TEXT CHECK (environment IN ('production', 'staging', 'development')) DEFAULT 'production',
  tags TEXT DEFAULT '[]',  -- JSON array

  -- 모니터링 설정
  check_interval INTEGER DEFAULT 60,  -- 초 단위
  timeout INTEGER DEFAULT 30,  -- 초 단위
  method TEXT CHECK (method IN ('GET', 'POST', 'HEAD')) DEFAULT 'GET',
  headers TEXT DEFAULT '{}',  -- JSON
  body TEXT,
  expected_status INTEGER DEFAULT 200,
  expected_body TEXT,  -- 포함되어야 할 문자열

  -- 알림 설정
  alert_threshold INTEGER DEFAULT 3,  -- 연속 실패 횟수
  alert_channels TEXT DEFAULT '["email"]',  -- JSON array

  -- 상태
  status TEXT CHECK (status IN ('active', 'paused', 'maintenance')) DEFAULT 'active',
  current_status TEXT CHECK (current_status IN ('up', 'down', 'degraded', 'unknown')) DEFAULT 'unknown',
  last_check_at TEXT,
  last_up_at TEXT,
  last_down_at TEXT,

  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_current_status ON services(current_status);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- --------------------------------------------
-- 2. Health Checks (헬스체크 기록)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS health_checks (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- 결과
  status TEXT CHECK (status IN ('up', 'down', 'degraded')) NOT NULL,
  response_time INTEGER,  -- ms 단위
  status_code INTEGER,

  -- 상세 정보
  error_message TEXT,
  response_body TEXT,  -- 처음 1000자만 저장

  -- 체크 위치
  region TEXT DEFAULT 'ap-northeast-2',

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_health_checks_service ON health_checks(service_id);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON health_checks(status);
CREATE INDEX IF NOT EXISTS idx_health_checks_created ON health_checks(created_at);

-- 오래된 데이터 정리를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_health_checks_cleanup ON health_checks(service_id, created_at);

-- --------------------------------------------
-- 3. Incidents (장애)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,

  -- 기본 정보
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('critical', 'major', 'minor', 'warning')) DEFAULT 'major',

  -- 상태
  status TEXT CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')) DEFAULT 'investigating',

  -- 시간
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  identified_at TEXT,
  resolved_at TEXT,
  duration_minutes INTEGER,  -- 자동 계산

  -- 영향
  affected_components TEXT DEFAULT '[]',  -- JSON array
  impact_summary TEXT,

  -- 근본 원인
  root_cause TEXT,
  resolution TEXT,

  -- 담당자
  assigned_to TEXT,

  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents(service_id);
CREATE INDEX IF NOT EXISTS idx_incidents_tenant ON incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_started ON incidents(started_at);

-- --------------------------------------------
-- 4. Incident Updates (장애 업데이트)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS incident_updates (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,

  status TEXT CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')) NOT NULL,
  message TEXT NOT NULL,

  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_incident_updates_incident ON incident_updates(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_updates_created ON incident_updates(created_at);

-- --------------------------------------------
-- 5. Alerts (알림)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  incident_id TEXT REFERENCES incidents(id) ON DELETE SET NULL,
  tenant_id TEXT NOT NULL,

  -- 알림 정보
  type TEXT CHECK (type IN ('service_down', 'service_up', 'degraded', 'ssl_expiry', 'domain_expiry', 'custom')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,

  -- 전송 상태
  status TEXT CHECK (status IN ('pending', 'sent', 'failed', 'acknowledged')) DEFAULT 'pending',

  -- 채널별 전송 상태
  email_sent INTEGER DEFAULT 0,
  email_sent_at TEXT,
  slack_sent INTEGER DEFAULT 0,
  slack_sent_at TEXT,
  webhook_sent INTEGER DEFAULT 0,
  webhook_sent_at TEXT,
  sms_sent INTEGER DEFAULT 0,
  sms_sent_at TEXT,

  -- 확인 정보
  acknowledged_at TEXT,
  acknowledged_by TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_alerts_service ON alerts(service_id);
CREATE INDEX IF NOT EXISTS idx_alerts_incident ON alerts(incident_id);
CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);

-- --------------------------------------------
-- 6. Alert Channels (알림 채널)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS alert_channels (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,

  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('email', 'slack', 'webhook', 'sms', 'kakao')) NOT NULL,

  -- 설정
  config TEXT NOT NULL DEFAULT '{}',  -- JSON (채널별 설정)

  -- 상태
  is_active INTEGER DEFAULT 1,
  is_verified INTEGER DEFAULT 0,
  verified_at TEXT,

  -- 테스트
  last_test_at TEXT,
  last_test_result TEXT CHECK (last_test_result IN ('success', 'failure')),

  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_alert_channels_tenant ON alert_channels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alert_channels_type ON alert_channels(type);
CREATE INDEX IF NOT EXISTS idx_alert_channels_active ON alert_channels(is_active);

-- --------------------------------------------
-- 7. Metrics (메트릭)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- 집계 기간
  period TEXT CHECK (period IN ('hourly', 'daily', 'weekly', 'monthly')) NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,

  -- 가용성
  uptime_percentage REAL,
  total_checks INTEGER DEFAULT 0,
  successful_checks INTEGER DEFAULT 0,
  failed_checks INTEGER DEFAULT 0,

  -- 응답 시간 (ms)
  avg_response_time INTEGER,
  min_response_time INTEGER,
  max_response_time INTEGER,
  p50_response_time INTEGER,
  p95_response_time INTEGER,
  p99_response_time INTEGER,

  -- 장애
  incident_count INTEGER DEFAULT 0,
  total_downtime_minutes INTEGER DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_metrics_service ON metrics(service_id);
CREATE INDEX IF NOT EXISTS idx_metrics_period ON metrics(period, period_start);
CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_unique ON metrics(service_id, period, period_start);

-- --------------------------------------------
-- 8. Status Pages (상태 페이지)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS status_pages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,

  -- 기본 정보
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- 브랜딩
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  custom_css TEXT,

  -- 도메인
  custom_domain TEXT UNIQUE,
  custom_domain_verified INTEGER DEFAULT 0,

  -- 표시할 서비스
  services TEXT DEFAULT '[]',  -- JSON array of service_ids

  -- 설정
  is_public INTEGER DEFAULT 1,
  show_uptime INTEGER DEFAULT 1,
  show_response_time INTEGER DEFAULT 0,
  show_incidents INTEGER DEFAULT 1,

  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_status_pages_tenant ON status_pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_status_pages_slug ON status_pages(slug);
CREATE INDEX IF NOT EXISTS idx_status_pages_domain ON status_pages(custom_domain);

-- --------------------------------------------
-- 9. Maintenance Windows (유지보수 기간)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_windows (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,

  title TEXT NOT NULL,
  description TEXT,

  -- 기간
  scheduled_start TEXT NOT NULL,
  scheduled_end TEXT NOT NULL,
  actual_start TEXT,
  actual_end TEXT,

  -- 상태
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'canceled')) DEFAULT 'scheduled',

  -- 알림
  notify_before_minutes INTEGER DEFAULT 60,
  notification_sent INTEGER DEFAULT 0,

  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_maintenance_service ON maintenance_windows(service_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tenant ON maintenance_windows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_windows(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled ON maintenance_windows(scheduled_start, scheduled_end);
