# Minu Build Skill

> build.minu.best 프로젝트 진행 관리 서비스 전용 규칙

**버전**: 1.0.0
**최종 수정**: 2025-11-27
**현재 버전**: Coming Soon (MVP 예정 - 2026-02)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 도메인 | build.minu.best |
| 역할 | 프로젝트 진행 관리 및 협업 |
| 유형 | **동적 웹앱 (SSR + CSR)** |
| 인증 | ideaonaction.ai OAuth 연동 |

---

## 기술 스택 (예정)

| 영역 | 기술 | 비고 |
|------|------|------|
| Framework | Next.js 15 | App Router |
| Database | Supabase | PostgreSQL + Realtime |
| Realtime | Supabase Realtime | 실시간 협업 |
| Storage | Supabase Storage | 파일 관리 |
| Styling | TailwindCSS | shadcn/ui |

---

## 핵심 기능 (예정)

### MVP (0.7.x)

| 기능 | 설명 |
|------|------|
| 프로젝트 생성 | 기본 정보 등록 |
| 칸반 보드 | 태스크 관리 |
| 파일 관리 | 문서/산출물 업로드 |
| 타임라인 | 마일스톤 관리 |

### Closed Beta (0.8.x)

| 기능 | 설명 |
|------|------|
| 간트 차트 | 일정 시각화 |
| 클라이언트 포털 | 고객 공유 페이지 |
| 팀 협업 | 실시간 편집 |
| 자동 리포트 | 진행 상황 리포트 |

---

## 데이터 모델 (예정)

```sql
-- 프로젝트
projects (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,                -- 'planning', 'in_progress', 'completed'
  start_date DATE,
  end_date DATE,
  budget BIGINT,
  client_info JSONB,
  settings JSONB,
  created_at TIMESTAMPTZ
)

-- 태스크
tasks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,                -- 'todo', 'in_progress', 'review', 'done'
  priority TEXT,              -- 'low', 'medium', 'high', 'urgent'
  assignee_id UUID,
  due_date DATE,
  estimated_hours INT,
  actual_hours INT,
  position INT,               -- 칸반 정렬
  created_at TIMESTAMPTZ
)

-- 마일스톤
milestones (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects,
  title TEXT NOT NULL,
  due_date DATE,
  deliverables TEXT[],
  status TEXT,
  created_at TIMESTAMPTZ
)

-- 파일
files (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects,
  task_id UUID REFERENCES tasks,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size BIGINT,
  mime_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ
)

-- 팀 멤버
project_members (
  project_id UUID REFERENCES projects,
  user_id UUID REFERENCES auth.users,
  role TEXT,                  -- 'owner', 'admin', 'member', 'viewer'
  joined_at TIMESTAMPTZ,
  PRIMARY KEY (project_id, user_id)
)
```

---

## 디렉토리 구조 (예정)

```
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── projects/
│   │   │   ├── page.tsx           # 프로젝트 목록
│   │   │   ├── new/page.tsx       # 새 프로젝트
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # 프로젝트 대시보드
│   │   │       ├── board/page.tsx # 칸반 보드
│   │   │       ├── timeline/page.tsx
│   │   │       ├── files/page.tsx
│   │   │       └── settings/page.tsx
│   │   └── team/page.tsx
│   └── api/
│       ├── projects/
│       ├── tasks/
│       └── files/
├── components/
│   ├── board/
│   │   ├── KanbanBoard.tsx
│   │   ├── TaskCard.tsx
│   │   └── Column.tsx
│   ├── timeline/
│   │   ├── GanttChart.tsx
│   │   └── Milestone.tsx
│   └── file/
│       ├── FileUploader.tsx
│       └── FileList.tsx
└── lib/
    ├── supabase.ts
    └── realtime.ts
```

---

## 요금제 (예정)

| 플랜 | 월 요금 | 제한 |
|------|---------|------|
| Basic | ₩49,000 | 3개 프로젝트, 3명, 5GB |
| Pro | ₩149,000 | 15개 프로젝트, 15명, 50GB |
| Enterprise | ₩399,000 | 무제한 |

---

## 로드맵

| 버전 | 예정일 | 내용 |
|------|--------|------|
| 0.7.0 | 2026-02 | MVP - 기본 프로젝트/태스크 관리 |
| 0.8.0 | 2026-03 | Closed Beta - 간트, 협업 |
| 0.9.0 | 2026-04 | Open Beta - 클라이언트 포털 |
| 1.0.0 | 2026-05 | GA - 정식 출시 |

---

## 참고

- Find/Frame 서비스의 아키텍처 패턴 재사용
- @minu/shared 패키지 활용
- Supabase Realtime으로 실시간 협업 구현
