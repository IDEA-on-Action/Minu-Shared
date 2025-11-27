# @minu/types

Minu 서비스 공용 TypeScript 타입 정의

## 설치

```bash
pnpm add @minu/types
```

## 사용법

```tsx
import type { User, Subscription, Project, Proposal } from '@minu/types';
```

## 사용자 타입

```tsx
import type { User, UserRole, MinuService, JWTPayload } from '@minu/types';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

type UserRole = 'admin' | 'member' | 'viewer';
type MinuService = 'find' | 'frame' | 'build' | 'keep';
```

## 구독 타입

```tsx
import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionUsage,
  PaymentHistory,
  PlanLimits,
} from '@minu/types';

interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
```

## 프로젝트 타입

```tsx
import type { Project, ProjectStatus, ProjectMember, ProjectRole } from '@minu/types';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  owner_id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

type ProjectStatus = 'draft' | 'active' | 'archived' | 'deleted';
type ProjectRole = 'owner' | 'editor' | 'viewer';
```

## 제안서 타입

```tsx
import type {
  Proposal,
  ProposalStatus,
  ProposalSection,
  ProposalComment,
  ProposalReview,
} from '@minu/types';

interface Proposal {
  id: string;
  project_id: string;
  title: string;
  status: ProposalStatus;
  version: number;
  sections: ProposalSection[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

type ProposalStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'archived';
```

## API 타입

```tsx
import type { ApiResponse, ApiError, PaginatedResponse } from '@minu/types';

// 성공 응답
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// 에러 타입
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// 페이지네이션 응답
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}
```

## 라이선스

Private - IDEA on Action
