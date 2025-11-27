# Minu Find Skill

> find.minu.best 프로젝트 기회 탐색 서비스 전용 규칙

**버전**: 1.0.0
**최종 수정**: 2025-11-27
**현재 버전**: 0.7.0 (MVP 개발 중)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 도메인 | find.minu.best |
| 역할 | 프로젝트 기회 탐색 및 매칭 |
| 유형 | **동적 웹앱 (SSR + CSR)** |
| 인증 | ideaonaction.ai OAuth 연동 |

---

## 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| Framework | Next.js 15 | App Router |
| Database | Supabase | PostgreSQL + Auth |
| Styling | TailwindCSS | shadcn/ui 컴포넌트 |
| State | Zustand / TanStack Query | 서버 상태 관리 |
| Deployment | Vercel | Edge Functions |

---

## 핵심 기능

### MVP (0.7.x)

| 기능 | 설명 | 상태 |
|------|------|------|
| 프로젝트 검색 | 키워드/필터 기반 검색 | 🔨 개발 중 |
| 플랫폼 연동 | 나라장터, 조달청 등 | 🔨 개발 중 |
| 알림 설정 | 이메일 알림 | 📋 백로그 |
| 북마크 | 관심 프로젝트 저장 | 📋 백로그 |

### Closed Beta (0.8.x)

| 기능 | 설명 |
|------|------|
| AI 추천 | 사용자 프로필 기반 매칭 |
| 다채널 알림 | 슬랙, 카카오톡 연동 |
| 히스토리 | 6개월 검색 이력 |

---

## 데이터 모델

### 주요 테이블

```sql
-- 프로젝트 공고
projects (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT,           -- 'naranjangter', 'g2b', etc.
  external_id TEXT,        -- 원본 플랫폼 ID
  budget BIGINT,
  deadline TIMESTAMPTZ,
  category TEXT[],
  created_at TIMESTAMPTZ
)

-- 사용자 북마크
bookmarks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  project_id UUID REFERENCES projects,
  created_at TIMESTAMPTZ
)

-- 알림 설정
alert_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  keywords TEXT[],
  categories TEXT[],
  min_budget BIGINT,
  channels TEXT[]          -- ['email', 'slack', 'kakao']
)
```

---

## API 구조

### 내부 API Routes

```
/api/
├── projects/
│   ├── route.ts           # GET: 목록, POST: 생성 (관리자)
│   └── [id]/route.ts      # GET: 상세
├── bookmarks/
│   ├── route.ts           # GET: 목록, POST: 추가
│   └── [id]/route.ts      # DELETE: 삭제
├── alerts/
│   └── route.ts           # GET, PUT: 알림 설정
└── webhooks/
    └── platform/route.ts  # 외부 플랫폼 데이터 수신
```

---

## 인증 연동

### ideaonaction.ai OAuth

```typescript
// lib/auth.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// OAuth 로그인
export async function signInWithIdea() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'oauth2',  // 커스텀 프로바이더
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}
```

### 미들웨어 보호

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

---

## 환경 변수

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ideaonaction OAuth
IDEA_CLIENT_ID=
IDEA_CLIENT_SECRET=
IDEA_AUTH_URL=https://ideaonaction.ai/oauth

# 외부 플랫폼 API
NARANJANGTER_API_KEY=
G2B_API_KEY=
```

---

## 디렉토리 구조

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx        # 인증 필요 레이아웃
│   │   ├── page.tsx          # 대시보드 홈
│   │   ├── search/page.tsx   # 프로젝트 검색
│   │   ├── bookmarks/page.tsx
│   │   └── alerts/page.tsx
│   └── api/
│       └── ...
├── components/
│   ├── ui/                   # shadcn/ui 기반
│   ├── project/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectList.tsx
│   │   └── ProjectFilters.tsx
│   └── layout/
│       ├── DashboardNav.tsx
│       └── DashboardSidebar.tsx
├── hooks/
│   ├── useProjects.ts
│   ├── useBookmarks.ts
│   └── useAuth.ts
├── lib/
│   ├── supabase.ts
│   ├── api.ts
│   └── utils.ts
└── types/
    └── index.ts
```

---

## 상태 관리

### TanStack Query 패턴

```typescript
// hooks/useProjects.ts
export function useProjects(filters: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
    staleTime: 1000 * 60 * 5,  // 5분
  });
}

export function useBookmarkProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => bookmarkProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}
```

---

## 체크리스트

### 기능 개발 시
- [ ] Supabase 테이블/RLS 정책 확인
- [ ] API Route 에러 핸들링
- [ ] TanStack Query 캐시 전략
- [ ] 로딩/에러 UI 구현

### 보안 점검
- [ ] RLS (Row Level Security) 활성화
- [ ] API Rate Limiting
- [ ] 입력값 검증 (Zod)
- [ ] SQL Injection 방지

---

## 요금제 연동

| 플랜 | 제한 |
|------|------|
| Basic (₩29,000) | 4개 플랫폼, 월 50건 |
| Pro (₩99,000) | 6개+ 플랫폼, 월 300건 |
| Enterprise (₩299,000) | 전체 플랫폼, 무제한 |

```typescript
// lib/subscription.ts
export async function checkQuota(userId: string): Promise<boolean> {
  const usage = await getMonthlyUsage(userId);
  const plan = await getUserPlan(userId);
  
  return usage.searchCount < plan.limits.searchCount;
}
```
