# Minu Shared Packages 기획서

> **@minu/ui · @minu/utils · @minu/types**

| 항목 | 내용 |
|------|------|
| **문서 버전** | 1.0.0 |
| **작성일** | 2025년 11월 27일 |
| **프로젝트** | Minu - 프리랜서 비즈니스 플랫폼 |
| **레포지토리** | github.com/ideaonaction/minu-shared |

---

## 목차

1. [개요](#1-개요)
2. [패키지 구조](#2-패키지-구조)
3. [@minu/ui - UI 컴포넌트](#3-minuui---ui-컴포넌트)
4. [@minu/utils - 유틸리티 함수](#4-minuutils---유틸리티-함수)
5. [@minu/types - 공유 타입 정의](#5-minutypes---공유-타입-정의)
6. [배포 및 CI/CD](#6-배포-및-cicd)
7. [사용 방법](#7-사용-방법)
8. [개발 로드맵](#8-개발-로드맵)
9. [참고 사항](#9-참고-사항)

---

## 1. 개요

### 1.1 목적

minu-shared는 Minu 서비스 간 코드 재사용과 일관성을 위한 공유 패키지입니다. Find, Frame, Build, Keep 4개 서비스에서 공통으로 사용되는 UI 컴포넌트, 유틸리티 함수, TypeScript 타입을 단일 소스로 관리합니다.

### 1.2 핵심 가치

| 가치 | 설명 |
|------|------|
| **일관성 (Consistency)** | 모든 서비스에서 동일한 디자인 시스템과 UX 패턴 |
| **재사용성 (Reusability)** | 중복 코드 제거, 유지보수 비용 절감 |
| **타입 안전성 (Type Safety)** | 공유 타입으로 서비스 간 통신 오류 방지 |
| **개발 속도 (Velocity)** | 검증된 컴포넌트로 빠른 개발 |

### 1.3 아키텍처 위치

```
┌─────────────────────────────────────────────────────────────┐
│                        Minu Services                         │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  find.minu   │ frame.minu   │ build.minu   │  keep.minu     │
│    .best     │    .best     │    .best     │    .best       │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬────────┘
       │              │              │               │
       └──────────────┴──────────────┴───────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │        minu-shared            │
              ├───────────┬─────────┬─────────┤
              │ @minu/ui  │ @minu/  │ @minu/  │
              │           │ utils   │ types   │
              └───────────┴─────────┴─────────┘
```

---

## 2. 패키지 구조

### 2.1 패키지 개요

| 패키지명 | 역할 | 주요 내용 |
|----------|------|----------|
| **@minu/ui** | UI 컴포넌트 | Button, Input, Card, Modal, Toast 등 React 컴포넌트 |
| **@minu/utils** | 유틸리티 | API 클라이언트, JWT 처리, 날짜/포맷 헬퍼, 인증 유틸 |
| **@minu/types** | 타입 정의 | User, Subscription, Project, Proposal 등 공유 인터페이스 |

### 2.2 모노레포 구조

```
minu-shared/
├── packages/
│   ├── ui/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Card/
│   │   │   │   └── ...
│   │   │   ├── hooks/
│   │   │   ├── styles/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── format/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── types/
│       ├── src/
│       │   ├── user.ts
│       │   ├── subscription.ts
│       │   ├── project.ts
│       │   ├── proposal.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .github/
│   └── workflows/
│       └── publish.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 3. @minu/ui - UI 컴포넌트

### 3.1 디자인 토큰

Tailwind CSS 기반 디자인 시스템으로, 모든 서비스에서 일관된 스타일을 적용합니다.

#### 컬러 시스템

| 토큰 | Hex | 용도 |
|------|-----|------|
| `primary-600` | #2563EB | 주요 액션, CTA 버튼, 링크 |
| `secondary-500` | #10B981 | 성공 상태, 긍정적 피드백 |
| `accent-500` | #F59E0B | 경고, 주의, 강조 |
| `find` | #3B82F6 | Find 서비스 브랜드 컬러 |
| `frame` | #10B981 | Frame 서비스 브랜드 컬러 |
| `build` | #F59E0B | Build 서비스 브랜드 컬러 |
| `keep` | #8B5CF6 | Keep 서비스 브랜드 컬러 |

#### 그레이 스케일

| 토큰 | Hex | 용도 |
|------|-----|------|
| `gray-50` | #F9FAFB | 배경 |
| `gray-100` | #F3F4F6 | 카드 배경 |
| `gray-200` | #E5E7EB | 보더 |
| `gray-400` | #9CA3AF | 플레이스홀더 |
| `gray-600` | #4B5563 | 보조 텍스트 |
| `gray-900` | #111827 | 주요 텍스트 |

#### 타이포그래피

| 용도 | 폰트 | 설명 |
|------|------|------|
| **Display** | Outfit | 헤드라인, 타이틀, 숫자 강조 |
| **Body** | Pretendard | 본문, UI 텍스트, 한글 최적화 |

```typescript
// tailwind.config.ts
export const fontFamily = {
  sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
  display: ['Outfit', 'Pretendard Variable', 'system-ui', 'sans-serif'],
};
```

#### 간격 및 반경

| 토큰 | 값 | 용도 |
|------|-----|------|
| `spacing-1` | 4px | 최소 간격 |
| `spacing-2` | 8px | 인라인 요소 간격 |
| `spacing-4` | 16px | 컴포넌트 내부 패딩 |
| `spacing-6` | 24px | 섹션 간격 |
| `spacing-8` | 32px | 대형 섹션 간격 |
| `radius-sm` | 4px | 작은 요소 |
| `radius-md` | 8px | 버튼, 인풋 |
| `radius-lg` | 12px | 카드 |
| `radius-xl` | 16px | 모달 |

### 3.2 컴포넌트 목록

#### Basic 컴포넌트

| 컴포넌트 | 설명 | Variants / Props |
|----------|------|------------------|
| **Button** | 기본 버튼 | `variant`: primary, secondary, ghost, danger<br>`size`: sm, md, lg<br>`loading`, `disabled`, `leftIcon`, `rightIcon` |
| **Input** | 텍스트 입력 | `type`: text, email, password, search<br>`error`, `leftIcon`, `rightIcon`, `clearable` |
| **Textarea** | 다중 줄 입력 | `autoResize`, `maxLength`, `showCount`, `error` |
| **Select** | 선택 컴포넌트 | `multiple`, `searchable`, `grouped`, `placeholder` |
| **Checkbox** | 체크박스 | `checked`, `indeterminate`, `labelPosition` |
| **Radio** | 라디오 버튼 | `RadioGroup` 컨테이너, `orientation`: horizontal, vertical |
| **Switch** | 토글 스위치 | `checked`, `labelPosition`: left, right |

#### Layout 컴포넌트

| 컴포넌트 | 설명 | Props |
|----------|------|-------|
| **Card** | 카드 컨테이너 | `header`, `footer`, `hoverable`, `clickable`, `padding` |
| **Modal** | 모달 대화상자 | `size`: sm, md, lg, full<br>`closeOnBackdrop`, `closeOnEsc`, `title` |
| **Drawer** | 슬라이드 패널 | `position`: left, right<br>`size`, `closeOnBackdrop` |
| **Tabs** | 탭 네비게이션 | `TabList`, `Tab`, `TabPanel`<br>`variant`: line, enclosed, soft |
| **Accordion** | 접이식 패널 | `type`: single, multiple<br>`defaultOpen`, `collapsible` |

#### Feedback 컴포넌트

| 컴포넌트 | 설명 | Props |
|----------|------|-------|
| **Toast** | 토스트 알림 | `type`: success, error, warning, info<br>`duration`, `action`, `closable` |
| **Alert** | 인라인 알림 | `type`, `title`, `closable`, `icon` |
| **Badge** | 뱃지/태그 | `variant`: dot, count<br>`color`, `size` |
| **Spinner** | 로딩 스피너 | `size`: sm, md, lg<br>`color` |
| **Progress** | 진행률 표시 | `type`: linear, circular<br>`value`, `indeterminate` |
| **Skeleton** | 로딩 스켈레톤 | `variant`: text, circle, rect<br>`animation`: pulse, wave |

#### Data Display 컴포넌트

| 컴포넌트 | 설명 | Props |
|----------|------|-------|
| **Avatar** | 프로필 이미지 | `src`, `fallback`: initials, icon<br>`AvatarGroup` 스택 |
| **Table** | 데이터 테이블 | `columns`, `data`, `sortable`, `selectable`, `pagination` |
| **List** | 리스트 | `ListItem`, `ListIcon`, `divider` |
| **Empty** | 빈 상태 | `icon`, `title`, `description`, `action` |

#### Navigation 컴포넌트

| 컴포넌트 | 설명 | Props |
|----------|------|-------|
| **Breadcrumb** | 경로 표시 | `items`, `separator` |
| **Pagination** | 페이지네이션 | `total`, `page`, `pageSize`, `onChange` |
| **Menu** | 드롭다운 메뉴 | `items`, `trigger`, `placement` |

### 3.3 컴포넌트 사용 예시

```tsx
import { Button, Input, Card, Toast } from '@minu/ui';

// Button
<Button variant="primary" size="lg" loading={isLoading}>
  저장하기
</Button>

// Input with icon
<Input
  type="email"
  placeholder="이메일을 입력하세요"
  leftIcon={<Mail />}
  error={errors.email?.message}
/>

// Card
<Card hoverable onClick={handleClick}>
  <Card.Header>
    <h3>프로젝트 제목</h3>
  </Card.Header>
  <Card.Body>
    <p>프로젝트 설명...</p>
  </Card.Body>
  <Card.Footer>
    <Button variant="ghost">더 보기</Button>
  </Card.Footer>
</Card>

// Toast (via hook)
const { toast } = useToast();
toast.success('저장되었습니다!');
```

### 3.4 Hooks

| Hook | 용도 | 반환값 |
|------|------|--------|
| `useToast` | 토스트 알림 | `{ toast, dismiss, toasts }` |
| `useModal` | 모달 상태 관리 | `{ isOpen, open, close, toggle }` |
| `useDisclosure` | 열림/닫힘 상태 | `{ isOpen, onOpen, onClose, onToggle }` |
| `useMediaQuery` | 반응형 감지 | `boolean` |
| `useDebounce` | 디바운스 값 | `debouncedValue` |

---

## 4. @minu/utils - 유틸리티 함수

### 4.1 API 클라이언트

ideaonaction.ai 및 각 서비스 API와 통신하기 위한 HTTP 클라이언트입니다.

```typescript
interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  onUnauthorized?: () => void;
}

// 생성
const api = createApiClient({
  baseUrl: 'https://api.find.minu.best',
  onUnauthorized: () => redirectToLogin()
});

// 사용
const projects = await api.get<Project[]>('/projects', { params: { page: 1 } });
const created = await api.post<Project>('/projects', { data: newProject });
```

#### 기능

| 기능 | 설명 |
|------|------|
| **요청 인터셉터** | Authorization 헤더 자동 추가 |
| **응답 인터셉터** | 401 시 토큰 갱신 및 재시도 |
| **에러 정규화** | `ApiError` 타입으로 일관된 에러 처리 |
| **타임아웃** | 설정 가능한 요청 타임아웃 |
| **재시도** | 네트워크 오류 시 자동 재시도 |

### 4.2 인증 유틸리티

| 함수 | 설명 | 시그니처 |
|------|------|----------|
| `getAccessToken` | 저장된 액세스 토큰 반환 | `() => string \| null` |
| `getRefreshToken` | 저장된 리프레시 토큰 반환 | `() => string \| null` |
| `setTokens` | 토큰 쌍 저장 (httpOnly 쿠키 권장) | `(access: string, refresh: string) => void` |
| `clearTokens` | 모든 토큰 삭제 (로그아웃) | `() => void` |
| `isTokenExpired` | JWT 만료 여부 확인 | `(token: string) => boolean` |
| `decodeToken` | JWT 페이로드 디코딩 | `<T>(token: string) => T` |
| `refreshAccessToken` | ideaonaction.ai에 토큰 갱신 요청 | `() => Promise<AuthTokens>` |

```typescript
import { getAccessToken, isTokenExpired, refreshAccessToken } from '@minu/utils';

// 토큰 체크 및 갱신
const token = getAccessToken();
if (token && isTokenExpired(token)) {
  const newTokens = await refreshAccessToken();
  setTokens(newTokens.accessToken, newTokens.refreshToken);
}
```

### 4.3 날짜 및 포맷 유틸리티

| 함수 | 설명 | 예시 |
|------|------|------|
| `formatDate` | 날짜 포맷팅 | `formatDate(date, 'YYYY-MM-DD')` → `'2025-11-27'` |
| `formatRelativeTime` | 상대 시간 | `formatRelativeTime(date)` → `'3분 전'` |
| `formatCurrency` | 통화 포맷 | `formatCurrency(1234567)` → `'₩1,234,567'` |
| `formatNumber` | 숫자 포맷 | `formatNumber(1234567)` → `'1,234,567'` |
| `truncateText` | 텍스트 자르기 | `truncateText('긴 텍스트...', 10)` → `'긴 텍스트...'` |
| `slugify` | URL-safe 슬러그 | `slugify('Hello World')` → `'hello-world'` |

```typescript
import { formatDate, formatRelativeTime, formatCurrency } from '@minu/utils';

// 날짜 포맷
formatDate(new Date(), 'YYYY년 MM월 DD일'); // '2025년 11월 27일'
formatDate(new Date(), 'MM/DD HH:mm');      // '11/27 14:30'

// 상대 시간
formatRelativeTime(new Date(Date.now() - 60000));   // '1분 전'
formatRelativeTime(new Date(Date.now() - 3600000)); // '1시간 전'

// 통화
formatCurrency(5000000);           // '₩5,000,000'
formatCurrency(5000000, 'USD');    // '$5,000,000'
```

### 4.4 기타 유틸리티

| 함수 | 설명 | 시그니처 |
|------|------|----------|
| `cn` | 클래스명 병합 (clsx + tailwind-merge) | `(...classes: ClassValue[]) => string` |
| `debounce` | 디바운스 함수 | `<T>(fn: T, delay: number) => T` |
| `throttle` | 스로틀 함수 | `<T>(fn: T, limit: number) => T` |
| `deepClone` | 깊은 복사 | `<T>(obj: T) => T` |
| `generateId` | 고유 ID 생성 (nanoid) | `(size?: number) => string` |
| `sleep` | Promise 기반 딜레이 | `(ms: number) => Promise<void>` |
| `isServer` | 서버 환경 여부 | `() => boolean` |
| `isBrowser` | 브라우저 환경 여부 | `() => boolean` |

```typescript
import { cn, debounce, generateId } from '@minu/utils';

// cn - 조건부 클래스
<div className={cn(
  'base-class',
  isActive && 'active-class',
  { 'error-class': hasError }
)} />

// debounce - 검색 입력
const debouncedSearch = debounce((query: string) => {
  searchProjects(query);
}, 300);

// generateId
const id = generateId(); // 'V1StGXR8_Z5jdHi6B-myT'
```

### 4.5 Validation 유틸리티

```typescript
import { validators } from '@minu/utils';

// 이메일 검증
validators.isEmail('test@example.com'); // true

// URL 검증
validators.isUrl('https://minu.best'); // true

// 빈 값 체크
validators.isEmpty(''); // true
validators.isEmpty([]); // true
validators.isEmpty({}); // true

// 한글 검증
validators.hasKorean('안녕하세요'); // true
```

---

## 5. @minu/types - 공유 타입 정의

### 5.1 사용자 및 인증

```typescript
// 기본 사용자
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 확장 프로필
interface UserProfile extends User {
  bio?: string;
  skills: string[];
  portfolio?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

// 인증 토큰
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

// 인증 세션
interface AuthSession {
  user: User;
  tokens: AuthTokens;
  expiresAt: Date;
}
```

### 5.2 구독 및 결제

```typescript
// 구독 상태
type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'trialing' 
  | 'paused';

// 플랜 ID
type PlanId = 
  | 'free' 
  | 'find-pro' 
  | 'frame-pro' 
  | 'build-pro' 
  | 'keep-pro' 
  | 'minu-pro';

// 구독 정보
interface Subscription {
  id: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

// 플랜 정의
interface Plan {
  id: PlanId;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    [key: string]: number | boolean;
  };
}
```

### 5.3 Find 서비스 타입

```typescript
// 플랫폼
type ProjectPlatform = 
  | 'wishket' 
  | 'kmong' 
  | 'freemoa' 
  | 'soomgo' 
  | 'other';

// 프로젝트 상태
type ProjectStatus = 'open' | 'closed' | 'in_progress';

// 근무 형태
type WorkType = 'remote' | 'onsite' | 'hybrid';

// 프로젝트
interface Project {
  id: string;
  platform: ProjectPlatform;
  platformId: string;
  platformUrl: string;
  
  title: string;
  description: string;
  clientName?: string;
  
  budget: {
    type: 'fixed' | 'hourly' | 'negotiable';
    min: number | null;
    max: number | null;
    currency: string;
  };
  
  skills: string[];
  deadline?: Date;
  workType: WorkType;
  location?: string;
  
  status: ProjectStatus;
  
  // AI 분석 결과
  aiSummary?: string;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  
  crawledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 검색 필터
interface ProjectFilter {
  keyword?: string;
  platforms?: ProjectPlatform[];
  skills?: string[];
  budgetMin?: number;
  budgetMax?: number;
  workType?: WorkType;
  deadlineWithin?: number; // days
}

// 북마크
interface Bookmark {
  id: string;
  userId: string;
  projectId: string;
  notes?: string;
  createdAt: Date;
}
```

### 5.4 Frame 서비스 타입

```typescript
// 제안서 상태
type ProposalStatus = 
  | 'draft' 
  | 'submitted' 
  | 'viewed' 
  | 'accepted' 
  | 'rejected';

// 제안서
interface Proposal {
  id: string;
  projectId: string;
  userId: string;
  
  title: string;
  content: string;
  
  budget: number;
  timeline: string;
  
  status: ProposalStatus;
  
  submittedAt?: Date;
  viewedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// 제안서 템플릿
interface ProposalTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  
  sections: {
    id: string;
    title: string;
    content: string;
    order: number;
  }[];
  
  isDefault: boolean;
  createdAt: Date;
}

// 포트폴리오
interface Portfolio {
  id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  skills: string[];
  url?: string;
  createdAt: Date;
}
```

### 5.5 공통 타입

```typescript
// API 응답
interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API 에러
interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// 페이지네이션 파라미터
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 타임스탬프
interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

// Nullable
type Nullable<T> = T | null;

// Optional ID (생성 시)
type WithOptionalId<T> = Omit<T, 'id'> & { id?: string };
```

---

## 6. 배포 및 CI/CD

### 6.1 배포 전략

| 항목 | 설정 |
|------|------|
| **레지스트리** | GitHub Packages (npm) |
| **스코프** | @minu (조직 스코프) |
| **버전 관리** | Semantic Versioning (semver) |
| **모노레포 도구** | pnpm workspaces + Turborepo |

### 6.2 GitHub Actions 워크플로우

```yaml
# .github/workflows/publish.yml
name: Publish Packages

on:
  push:
    branches: [main]
    paths:
      - 'packages/**'
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://npm.pkg.github.com'
          scope: '@minu'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint & Type Check
        run: |
          pnpm lint
          pnpm type-check
      
      - name: Test
        run: pnpm test
      
      - name: Build
        run: pnpm build
      
      - name: Publish
        run: pnpm publish -r --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 6.3 버전 관리

| 변경 유형 | 버전 증가 | 예시 |
|----------|----------|------|
| **MAJOR** | 하위 호환성을 깨는 변경 | 1.0.0 → 2.0.0 |
| **MINOR** | 하위 호환성 유지하며 새 기능 추가 | 1.0.0 → 1.1.0 |
| **PATCH** | 버그 수정, 문서 업데이트 | 1.0.0 → 1.0.1 |

```bash
# 버전 범프 (Changesets 사용)
pnpm changeset        # 변경사항 기록
pnpm changeset version  # 버전 업데이트
pnpm changeset publish  # 배포
```

### 6.4 릴리스 프로세스

1. **PR 생성 시**: 린트 + 타입 체크 + 유닛 테스트
2. **main 머지 시**: 빌드 + 버전 범프 + GitHub Packages 배포
3. **릴리스 태그 시**: Changelog 생성 + Release Notes 자동 작성

---

## 7. 사용 방법

### 7.1 설치

#### .npmrc 설정

```bash
# 프로젝트 루트에 .npmrc 파일 생성
@minu:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

#### 패키지 설치

```bash
# 모든 패키지 설치
pnpm add @minu/ui @minu/utils @minu/types

# 개별 설치
pnpm add @minu/ui
pnpm add @minu/utils
pnpm add @minu/types
```

### 7.2 TailwindCSS 설정

```typescript
// tailwind.config.ts
import { minuPreset } from '@minu/ui/tailwind';

export default {
  presets: [minuPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@minu/ui/**/*.{js,ts,jsx,tsx}',
  ],
  // 추가 커스터마이징...
};
```

### 7.3 임포트 예시

```typescript
// UI 컴포넌트
import { 
  Button, 
  Input, 
  Card, 
  Modal, 
  Toast,
  useToast 
} from '@minu/ui';

// 유틸리티
import { 
  createApiClient, 
  formatCurrency, 
  cn,
  debounce 
} from '@minu/utils';

// 타입
import type { 
  User, 
  Project, 
  Subscription,
  ApiResponse 
} from '@minu/types';
```

### 7.4 전체 사용 예시

```tsx
// pages/projects/[id].tsx
import { Card, Button, Badge, Spinner } from '@minu/ui';
import { formatCurrency, formatRelativeTime } from '@minu/utils';
import type { Project, ApiResponse } from '@minu/types';

export default function ProjectPage({ project }: { project: Project }) {
  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{project.title}</h1>
          <Badge color={project.platform}>
            {project.platform}
          </Badge>
        </div>
      </Card.Header>
      
      <Card.Body>
        <p className="text-gray-600">{project.description}</p>
        
        <div className="mt-4 flex gap-2">
          {project.skills.map(skill => (
            <Badge key={skill} variant="outline">{skill}</Badge>
          ))}
        </div>
        
        <div className="mt-4 text-lg font-semibold">
          {formatCurrency(project.budget.min)} ~ {formatCurrency(project.budget.max)}
        </div>
        
        <p className="text-sm text-gray-400">
          {formatRelativeTime(project.crawledAt)} 업데이트
        </p>
      </Card.Body>
      
      <Card.Footer>
        <Button variant="primary" className="w-full">
          제안서 작성하기
        </Button>
      </Card.Footer>
    </Card>
  );
}
```

---

## 8. 개발 로드맵

### 8.1 Phase별 계획

| Phase | 기간 | 내용 |
|-------|------|------|
| **Phase 1** | Week 1 | 프로젝트 세팅, 디자인 토큰, 기본 컴포넌트 (Button, Input, Card) |
| **Phase 2** | Week 2 | 레이아웃 컴포넌트 (Modal, Drawer, Tabs), 피드백 컴포넌트 (Toast, Alert) |
| **Phase 3** | Week 3 | API 클라이언트, 인증 유틸리티, 공유 타입 정의 |
| **Phase 4** | Week 4 | CI/CD 파이프라인, 문서화 (Storybook), 첫 릴리스 v1.0.0 |

### 8.2 상세 태스크

#### Phase 1: 기반 구축

- [ ] 모노레포 세팅 (pnpm workspaces + Turborepo)
- [ ] TypeScript 설정
- [ ] Tailwind 디자인 토큰 정의
- [ ] Button 컴포넌트
- [ ] Input 컴포넌트
- [ ] Card 컴포넌트

#### Phase 2: 컴포넌트 확장

- [ ] Modal 컴포넌트
- [ ] Drawer 컴포넌트
- [ ] Tabs 컴포넌트
- [ ] Toast 시스템
- [ ] Alert 컴포넌트
- [ ] Badge 컴포넌트
- [ ] Spinner 컴포넌트

#### Phase 3: 유틸리티 & 타입

- [ ] API 클라이언트 구현
- [ ] 인증 유틸리티
- [ ] 날짜/포맷 함수
- [ ] User, Subscription 타입
- [ ] Project, Proposal 타입
- [ ] 공통 API 타입

#### Phase 4: 배포 & 문서화

- [ ] GitHub Actions 워크플로우
- [ ] Changesets 설정
- [ ] Storybook 구성
- [ ] README 문서
- [ ] v1.0.0 릴리스

---

## 9. 참고 사항

### 9.1 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| React | 18+ / 19 | UI 라이브러리 |
| Next.js | 14+ / 15 | 프레임워크 |
| TypeScript | 5.0+ | 타입 시스템 |
| TailwindCSS | 3.4+ | 스타일링 |
| pnpm | 8+ | 패키지 매니저 |

### 9.2 Peer Dependencies

```json
{
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### 9.3 관련 리소스

| 리소스 | URL |
|--------|-----|
| **Figma** | Minu Design System (디자인 토큰, 컴포넌트 시안) |
| **Storybook** | storybook.minu.best (컴포넌트 문서) |
| **Repository** | github.com/ideaonaction/minu-shared |
| **npm** | npm.pkg.github.com/@minu |

### 9.4 컨트리뷰션 가이드

1. `main` 브랜치에서 feature 브랜치 생성
2. 변경사항 커밋 (Conventional Commits)
3. `pnpm changeset`으로 변경사항 기록
4. PR 생성 및 리뷰 요청
5. CI 통과 후 머지

#### 커밋 컨벤션

```
feat(ui): add Dropdown component
fix(utils): handle null in formatDate
docs(types): update User interface docs
chore: update dependencies
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2025-11-27 | 최초 작성 |

---

**© 2025 IDEA on Action. All rights reserved.**
