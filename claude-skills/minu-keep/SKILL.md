# Minu Keep Skill

> keep.minu.best 유지보수 운영 서비스 전용 규칙

**버전**: 1.0.0
**최종 수정**: 2025-11-27
**현재 버전**: Coming Soon (MVP 예정 - 2026-03)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 도메인 | keep.minu.best |
| 역할 | 납품 후 유지보수 및 운영 관리 |
| 유형 | **동적 웹앱 (SSR + CSR)** |
| 인증 | ideaonaction.ai OAuth 연동 |

---

## 기술 스택 (예정)

| 영역 | 기술 | 비고 |
|------|------|------|
| Framework | Next.js 15 | App Router |
| Database | Supabase | PostgreSQL |
| Monitoring | 외부 연동 | UptimeRobot, Pingdom 등 |
| Alerting | 다채널 | Email, Slack, Kakao |
| Styling | TailwindCSS | shadcn/ui |

---

## 핵심 기능 (예정)

### MVP (0.7.x)

| 기능 | 설명 |
|------|------|
| 서비스 등록 | 모니터링 대상 등록 |
| 상태 대시보드 | 업타임/응답시간 표시 |
| 이슈 트래킹 | 장애/요청 관리 |
| 알림 설정 | 이메일 알림 |

### Closed Beta (0.8.x)

| 기능 | 설명 |
|------|------|
| SLA 추적 | 가용성 계산 |
| 다채널 알림 | 슬랙, 카카오톡 |
| 리포트 | 월간 유지보수 리포트 |
| 계약 관리 | 유지보수 계약 정보 |

---

## 데이터 모델 (예정)

```sql
-- 서비스 (모니터링 대상)
services (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  type TEXT,                  -- 'website', 'api', 'server'
  url TEXT,
  check_interval INT,         -- 체크 주기 (초)
  settings JSONB,
  status TEXT,                -- 'active', 'paused'
  created_at TIMESTAMPTZ
)

-- 모니터링 결과
health_checks (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services,
  status TEXT,                -- 'up', 'down', 'degraded'
  response_time INT,          -- ms
  status_code INT,
  error_message TEXT,
  checked_at TIMESTAMPTZ
)

-- 인시던트
incidents (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT,              -- 'critical', 'major', 'minor'
  status TEXT,                -- 'open', 'investigating', 'resolved'
  started_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  root_cause TEXT,
  resolution TEXT
)

-- 유지보수 요청
maintenance_requests (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services,
  requester_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,                  -- 'bug', 'enhancement', 'support'
  priority TEXT,
  status TEXT,
  estimated_hours INT,
  actual_hours INT,
  created_at TIMESTAMPTZ
)

-- SLA 설정
sla_configs (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services,
  uptime_target DECIMAL,      -- 99.9 등
  response_time_target INT,   -- ms
  support_hours TEXT,         -- '24/7', 'business_hours'
  created_at TIMESTAMPTZ
)

-- 알림 설정
alert_configs (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services,
  channels TEXT[],            -- ['email', 'slack', 'kakao']
  conditions JSONB,           -- { downtime: '5m', responseTime: 3000 }
  recipients TEXT[],
  created_at TIMESTAMPTZ
)
```

---

## 디렉토리 구조 (예정)

```
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── services/
│   │   │   ├── page.tsx           # 서비스 목록
│   │   │   ├── new/page.tsx       # 서비스 등록
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # 서비스 대시보드
│   │   │       ├── incidents/page.tsx
│   │   │       ├── requests/page.tsx
│   │   │       └── settings/page.tsx
│   │   ├── incidents/page.tsx     # 전체 인시던트
│   │   ├── reports/page.tsx       # 리포트
│   │   └── settings/page.tsx      # 알림 설정
│   └── api/
│       ├── services/
│       ├── incidents/
│       ├── health/
│       └── webhooks/
├── components/
│   ├── dashboard/
│   │   ├── StatusCard.tsx
│   │   ├── UptimeChart.tsx
│   │   └── ResponseTimeChart.tsx
│   ├── incident/
│   │   ├── IncidentCard.tsx
│   │   └── IncidentTimeline.tsx
│   └── alert/
│       └── AlertConfig.tsx
└── lib/
    ├── monitoring.ts
    └── notifications.ts
```

---

## 외부 연동 (예정)

### 모니터링 통합

```typescript
// lib/monitoring.ts
export interface MonitoringProvider {
  checkHealth(service: Service): Promise<HealthCheckResult>;
  getUptime(serviceId: string, period: string): Promise<UptimeData>;
}

// UptimeRobot 연동
export class UptimeRobotProvider implements MonitoringProvider {
  // ...
}

// 자체 Health Check
export class InternalHealthChecker implements MonitoringProvider {
  async checkHealth(service: Service) {
    const start = Date.now();
    try {
      const response = await fetch(service.url, { 
        method: 'HEAD',
        timeout: 10000 
      });
      return {
        status: response.ok ? 'up' : 'degraded',
        responseTime: Date.now() - start,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - start,
        errorMessage: error.message,
      };
    }
  }
}
```

### 알림 채널

```typescript
// lib/notifications.ts
export interface NotificationChannel {
  send(alert: Alert): Promise<void>;
}

export class SlackNotifier implements NotificationChannel {
  async send(alert: Alert) {
    await fetch(this.webhookUrl, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 ${alert.service} - ${alert.message}`,
        attachments: [/* ... */],
      }),
    });
  }
}

export class KakaoNotifier implements NotificationChannel {
  // 카카오 알림톡 연동
}
```

---

## 요금제 (예정)

| 플랜 | 월 요금 | 제한 |
|------|---------|------|
| Basic | ₩59,000 | 5개 서비스, 이메일 알림, 7일 보존 |
| Pro | ₩179,000 | 20개 서비스, 전체 채널, 90일 보존 |
| Enterprise | ₩499,000 | 무제한, 24/7 지원, 365일 보존 |

---

## 로드맵

| 버전 | 예정일 | 내용 |
|------|--------|------|
| 0.7.0 | 2026-03 | MVP - 기본 모니터링/알림 |
| 0.8.0 | 2026-04 | Closed Beta - SLA, 리포트 |
| 0.9.0 | 2026-05 | Open Beta - 계약 관리 |
| 1.0.0 | 2026-06 | GA - 정식 출시 |

---

## 참고

- Find/Frame/Build 서비스의 아키텍처 패턴 재사용
- @minu/shared 패키지 활용
- 크론잡으로 주기적 Health Check 실행
