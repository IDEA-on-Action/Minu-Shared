# Minu Shared Skill

> Minu 시리즈 공유 컴포넌트, 유틸리티, 타입 가이드

**버전**: 1.0.0
**최종 수정**: 2025-11-27

---

## 개요

Minu Shared는 모든 Minu 서비스에서 공통으로 사용하는:
- UI 컴포넌트
- 유틸리티 함수
- TypeScript 타입
- 인증 헬퍼
- API 클라이언트

를 제공하는 내부 패키지입니다.

---

## 패키지 구조

```
@minu/shared
├── components/           # 공유 UI 컴포넌트
│   ├── ui/              # 기본 UI (Button, Input, Modal...)
│   ├── layout/          # 레이아웃 (Header, Footer, Sidebar)
│   └── brand/           # 브랜드 (Logo, ServiceBadge)
├── hooks/               # 공유 훅
│   ├── useAuth.ts
│   ├── useSubscription.ts
│   └── useToast.ts
├── lib/                 # 유틸리티
│   ├── api.ts          # API 클라이언트
│   ├── auth.ts         # 인증 헬퍼
│   ├── utils.ts        # 범용 유틸
│   └── constants.ts    # 공통 상수
├── types/               # TypeScript 타입
│   ├── user.ts
│   ├── subscription.ts
│   └── common.ts
└── styles/              # 공유 스타일
    └── globals.css
```

---

## 공유 컴포넌트

### Button

```tsx
// @minu/shared/components/ui/Button
import { Button } from '@minu/shared/components/ui/Button';

<Button variant="primary" size="md" loading={isLoading}>
  시작하기
</Button>

// Props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
```

### ServiceBadge

```tsx
// 서비스별 배지 컴포넌트
import { ServiceBadge } from '@minu/shared/components/brand/ServiceBadge';

<ServiceBadge service="find" size="sm" />
<ServiceBadge service="frame" size="md" />

// 서비스별 자동 컬러 적용
// find: #3B82F6, frame: #10B981, build: #F59E0B, keep: #8B5CF6
```

### AuthGuard

```tsx
// 인증 필요 페이지 래퍼
import { AuthGuard } from '@minu/shared/components/auth/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard fallback="/login">
      <Dashboard />
    </AuthGuard>
  );
}
```

---

## 공유 훅

### useAuth

```tsx
import { useAuth } from '@minu/shared/hooks/useAuth';

function Component() {
  const { user, isLoading, signIn, signOut } = useAuth();
  
  if (isLoading) return <Spinner />;
  if (!user) return <LoginPrompt />;
  
  return <div>Welcome, {user.name}</div>;
}
```

### useSubscription

```tsx
import { useSubscription } from '@minu/shared/hooks/useSubscription';

function PremiumFeature() {
  const { plan, canAccess, upgrade } = useSubscription();
  
  if (!canAccess('ai-analysis')) {
    return (
      <UpgradePrompt 
        feature="AI 분석" 
        requiredPlan="pro" 
        onUpgrade={upgrade}
      />
    );
  }
  
  return <AIAnalysis />;
}
```

---

## 유틸리티 함수

### API 클라이언트

```typescript
// @minu/shared/lib/api.ts
import { createAPIClient } from '@minu/shared/lib/api';

const api = createAPIClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  getToken: () => localStorage.getItem('token'),
});

// 사용
const projects = await api.get('/projects');
const result = await api.post('/bookmarks', { projectId });
```

### 유틸리티

```typescript
// @minu/shared/lib/utils.ts

// 클래스명 결합 (clsx + tailwind-merge)
import { cn } from '@minu/shared/lib/utils';
<div className={cn('base-class', isActive && 'active-class')} />

// 금액 포맷
import { formatCurrency } from '@minu/shared/lib/utils';
formatCurrency(29000);  // "₩29,000"

// 날짜 포맷
import { formatDate } from '@minu/shared/lib/utils';
formatDate(new Date());  // "2025년 11월 27일"

// 상대 시간
import { timeAgo } from '@minu/shared/lib/utils';
timeAgo(pastDate);  // "3일 전"
```

---

## TypeScript 타입

### 사용자

```typescript
// @minu/shared/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface UserProfile extends User {
  company?: string;
  role?: string;
  phone?: string;
}
```

### 구독

```typescript
// @minu/shared/types/subscription.ts
export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';
export type ServiceType = 'find' | 'frame' | 'build' | 'keep';

export interface Subscription {
  id: string;
  userId: string;
  service: ServiceType;
  plan: PlanType;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
}

export interface PlanLimits {
  searchCount: number;
  proposalCount: number;
  projectCount: number;
  teamMembers: number;
  storage: number;  // bytes
}
```

### API 응답

```typescript
// @minu/shared/types/common.ts
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}
```

---

## 상수

```typescript
// @minu/shared/lib/constants.ts

export const SERVICES = {
  find: {
    name: 'Find',
    domain: 'find.minu.best',
    color: '#3B82F6',
    icon: '🔍',
    description: '프로젝트 기회 탐색',
  },
  frame: {
    name: 'Frame',
    domain: 'frame.minu.best',
    color: '#10B981',
    icon: '📝',
    description: 'AI 제안서 작성',
  },
  // ...
} as const;

export const PLANS = {
  basic: { name: 'Basic', price: { find: 29000, frame: 39000, ... } },
  pro: { name: 'Pro', price: { find: 99000, frame: 129000, ... } },
  enterprise: { name: 'Enterprise', price: { find: 299000, ... } },
} as const;

export const AUTH_URLS = {
  login: 'https://ideaonaction.ai/login',
  logout: 'https://ideaonaction.ai/logout',
  billing: 'https://ideaonaction.ai/billing',
} as const;
```

---

## 사용 방법

### 설치 (각 프로젝트에서)

```bash
# package.json
{
  "dependencies": {
    "@minu/shared": "workspace:*"
  }
}

# 또는 Git submodule
git submodule add https://github.com/IDEA-on-Action/Minu-Shared.git packages/shared
```

### Import

```typescript
// 컴포넌트
import { Button, Input, Modal } from '@minu/shared/components/ui';
import { ServiceBadge } from '@minu/shared/components/brand';

// 훅
import { useAuth, useSubscription } from '@minu/shared/hooks';

// 유틸
import { cn, formatCurrency } from '@minu/shared/lib/utils';
import { createAPIClient } from '@minu/shared/lib/api';

// 타입
import type { User, Subscription, PlanType } from '@minu/shared/types';

// 상수
import { SERVICES, PLANS } from '@minu/shared/lib/constants';
```

---

## 체크리스트

### 새 공유 컴포넌트 추가 시
- [ ] TypeScript 타입 정의
- [ ] Props 문서화 (JSDoc)
- [ ] Storybook 스토리 작성
- [ ] 반응형 지원
- [ ] 접근성 (ARIA) 적용

### 새 유틸리티 추가 시
- [ ] 단위 테스트 작성
- [ ] 타입 안전성 확보
- [ ] JSDoc 주석 추가
- [ ] 예제 코드 문서화

### 버전 업데이트 시
- [ ] CHANGELOG.md 업데이트
- [ ] Breaking Change 명시
- [ ] 마이그레이션 가이드 (필요시)
