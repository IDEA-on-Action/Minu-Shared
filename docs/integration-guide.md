# Minu Shared 연동 가이드

> Portal, Find 프로젝트에서 @minu 패키지 연동을 위한 기획서

**작성일**: 2024-11-30 | **버전**: 1.0.0

---

## 1. 개요

### 1.1 목적

Minu 서비스(Portal, Find, Frame, Build, Keep) 간 코드 재사용성을 높이고 일관된 사용자 경험을 제공하기 위해 공통 패키지를 연동합니다.

### 1.2 패키지 구성

| 패키지 | 설명 | 크기 |
|--------|------|------|
| `@minu/ui` | React UI 컴포넌트, 훅, 디자인 토큰 | ~85KB |
| `@minu/utils` | API 클라이언트, 인증, 검증, 포맷팅 유틸리티 | ~32KB |
| `@minu/types` | 공용 TypeScript 타입 정의 | ~7KB |

### 1.3 요구사항

- Node.js 18.0.0 이상
- React 18.x 또는 19.x
- TypeScript 5.x (권장)
- pnpm 8.x (권장)

---

## 2. 설치

### 2.1 GitHub Packages 인증 설정

프로젝트 루트에 `.npmrc` 파일 생성:

```ini
@minu:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

환경변수 설정:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

### 2.2 패키지 설치

```bash
# 모든 패키지 설치
pnpm add @minu/ui @minu/utils @minu/types

# 또는 개별 설치
pnpm add @minu/ui      # UI 컴포넌트만
pnpm add @minu/utils   # 유틸리티만
pnpm add @minu/types   # 타입만
```

### 2.3 로컬 개발 연동 (모노레포)

`package.json`:

```json
{
  "dependencies": {
    "@minu/ui": "workspace:*",
    "@minu/utils": "workspace:*",
    "@minu/types": "workspace:*"
  }
}
```

---

## 3. @minu/ui 연동

### 3.1 제공 컴포넌트

| 카테고리 | 컴포넌트 |
|----------|----------|
| 기본 | Button, Input, Card, Badge, Alert |
| 폼 | Checkbox, Radio, Select |
| 피드백 | Modal, Drawer, Toast, Spinner, Skeleton |
| 내비게이션 | Tabs |
| 표시 | Avatar |

### 3.2 스타일 설정

#### Tailwind CSS 연동

`tailwind.config.ts`:

```typescript
import { tailwindPreset } from '@minu/ui';

export default {
  presets: [tailwindPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@minu/ui/dist/**/*.js',
  ],
};
```

#### CSS 직접 임포트

```typescript
// app/layout.tsx 또는 _app.tsx
import '@minu/ui/styles.css';
```

### 3.3 컴포넌트 사용 예시

#### Button

```tsx
import { Button } from '@minu/ui';

export function SubmitButton() {
  return (
    <Button
      variant="primary"
      size="md"
      onClick={() => console.log('clicked')}
    >
      제출하기
    </Button>
  );
}
```

#### Modal

```tsx
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, Button } from '@minu/ui';
import { useState } from 'react';

export function ConfirmDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>열기</Button>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>확인</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>정말 삭제하시겠습니까?</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>취소</Button>
            <Button variant="destructive">삭제</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
```

#### Toast

```tsx
import { ToastProvider, useToast, Button } from '@minu/ui';

// 앱 루트에서 Provider 설정
function App() {
  return (
    <ToastProvider position="top-right">
      <MyComponent />
    </ToastProvider>
  );
}

// 컴포넌트에서 사용
function MyComponent() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: '저장 완료',
      description: '변경사항이 저장되었습니다.',
      variant: 'success',
    });
  };

  return <Button onClick={handleSave}>저장</Button>;
}
```

### 3.4 훅 사용

```tsx
import {
  useControllableState,
  useEscapeKey,
  useClickOutside,
  useFocusTrap,
  useBodyScrollLock,
  useId
} from '@minu/ui';

// 제어/비제어 컴포넌트 상태 관리
const [value, setValue] = useControllableState({
  prop: externalValue,
  defaultProp: '',
  onChange: onExternalChange,
});

// ESC 키 핸들링
useEscapeKey(() => setOpen(false), { enabled: open });

// 외부 클릭 감지
const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

// 포커스 트랩
const trapRef = useFocusTrap<HTMLDivElement>({ enabled: open });

// 스크롤 잠금
useBodyScrollLock(open);

// 고유 ID 생성
const id = useId('input');
```

### 3.5 디자인 토큰

```tsx
import { colors, typography, spacing, tokens } from '@minu/ui';

// 직접 사용
const primaryColor = colors.primary[500]; // #6366f1

// 전체 토큰 객체
console.log(tokens.colors.semantic.success); // #22c55e
```

---

## 4. @minu/utils 연동

### 4.1 API 클라이언트

```typescript
import { createApiClient } from '@minu/utils';
import type { User } from '@minu/types';

const api = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'X-Client-Version': '1.0.0',
  },
});

// GET 요청
const user = await api.get<User>('/users/me');

// POST 요청
const newProject = await api.post('/projects', {
  name: '새 프로젝트',
  description: '설명',
});

// 인터셉터 설정
api.setRequestInterceptor((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.setResponseInterceptor(
  (response) => response,
  async (error) => {
    if (error.status === 401) {
      await refreshToken();
      return api.request(error.config);
    }
    throw error;
  }
);
```

### 4.2 JWT 인증

```typescript
import {
  parseJWT,
  isTokenExpired,
  hasServiceAccess,
  getSubscriptionPlan,
  getUserIdFromToken,
  getTenantIdFromToken
} from '@minu/utils';

const token = 'eyJhbGciOiJIUzI1NiIs...';

// 토큰 파싱
const payload = parseJWT(token);
console.log(payload.sub, payload.exp);

// 만료 확인 (5분 버퍼)
if (isTokenExpired(token, 300)) {
  await refreshToken();
}

// 서비스 접근 권한 확인
if (hasServiceAccess(token, 'find')) {
  // Find 서비스 접근 가능
}

// 구독 플랜 확인
const plan = getSubscriptionPlan(token); // 'free' | 'pro' | 'enterprise'

// 사용자/테넌트 ID 추출
const userId = getUserIdFromToken(token);
const tenantId = getTenantIdFromToken(token);
```

### 4.3 토큰 갱신 관리

```typescript
import { createTokenRefreshManager } from '@minu/utils';

const tokenManager = createTokenRefreshManager({
  refreshEndpoint: '/auth/refresh',
  onTokenRefreshed: (tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },
  onRefreshFailed: () => {
    // 로그아웃 처리
    window.location.href = '/login';
  },
  bufferTime: 60, // 만료 60초 전에 갱신
});

// 자동 갱신 시작
tokenManager.startAutoRefresh(accessToken, refreshToken);

// 수동 갱신
await tokenManager.refresh(refreshToken);

// 정리
tokenManager.stopAutoRefresh();
```

### 4.4 검증 유틸리티

```typescript
import {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePhoneKR,
  validateBusinessNumber,
  validateUrl,
  validateMinLength,
  validateMaxLength
} from '@minu/utils';

// 필수값 검증
const result = validateRequired(value);
if (!result.valid) {
  console.log(result.message); // "필수 입력 항목입니다."
}

// 이메일 검증
validateEmail('user@example.com'); // { valid: true }

// 비밀번호 검증 (정책 커스터마이징)
validatePassword('MyP@ssw0rd', {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
});

// 한국 전화번호
validatePhoneKR('010-1234-5678'); // { valid: true }

// 사업자등록번호
validateBusinessNumber('123-45-67890'); // { valid: true }

// URL 검증
validateUrl('https://minu.io', {
  requireHttps: true,
  allowedDomains: ['minu.io']
});
```

### 4.5 포맷팅 유틸리티

```typescript
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatFileSize
} from '@minu/utils';

// 날짜 포맷
formatDate(new Date());           // "2024년 11월 30일"
formatDate(new Date(), 'short');  // "2024.11.30"

// 날짜+시간
formatDateTime(new Date());       // "2024년 11월 30일 오후 3:30"

// 상대 시간
formatRelativeTime(new Date(Date.now() - 3600000)); // "1시간 전"

// 통화
formatCurrency(1500000);                    // "₩1,500,000"
formatCurrency(99.99, { currency: 'USD' }); // "$99.99"

// 숫자
formatNumber(1234567);            // "1,234,567"
formatNumber(1234567, 'compact'); // "123만"

// 퍼센트
formatPercent(0.156);             // "15.6%"
formatPercent(0.156, 0);          // "16%"

// 파일 크기
formatFileSize(1536000);          // "1.46 MB"
```

### 4.6 타이밍 유틸리티

```typescript
import { debounce, throttle } from '@minu/utils';

// 디바운스 (입력 완료 후 300ms 대기)
const debouncedSearch = debounce((query: string) => {
  searchAPI(query);
}, 300);

// 스로틀 (최대 100ms 간격으로 실행)
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);

// 옵션
const debouncedFn = debounce(fn, 300, {
  leading: true,   // 첫 호출 즉시 실행
  trailing: true,  // 마지막 호출도 실행
  maxWait: 1000,   // 최대 대기 시간
});

// 취소
debouncedFn.cancel();

// 즉시 실행
debouncedFn.flush();
```

### 4.7 ID 생성

```typescript
import {
  generateId,
  createIdGenerator,
  URL_SAFE_ALPHABET,
  NUMERIC_ALPHABET
} from '@minu/utils';

// 기본 ID 생성 (21자, nanoid 호환)
const id = generateId(); // "V1StGXR8_Z5jdHi6B-myT"

// 커스텀 길이
const shortId = generateId({ size: 8 }); // "xK9pL2mN"

// 커스텀 알파벳
const numericId = generateId({
  size: 6,
  alphabet: NUMERIC_ALPHABET
}); // "847291"

// 접두사 포함
const userId = generateId({ prefix: 'usr_' }); // "usr_V1StGXR8_Z5jdHi6B"

// 재사용 가능한 생성기
const projectIdGenerator = createIdGenerator({
  prefix: 'prj_',
  size: 12,
});
const projectId = projectIdGenerator(); // "prj_xK9pL2mN4qRs"
```

---

## 5. @minu/types 연동

### 5.1 사용자 관련 타입

```typescript
import type {
  User,
  Tenant,
  Subscription,
  JWTPayload,
  MinuService,
  SubscriptionPlan
} from '@minu/types';

const user: User = {
  id: 'usr_123',
  email: 'user@example.com',
  name: '홍길동',
  avatar: 'https://...',
  tenantId: 'tnt_456',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const services: MinuService[] = ['portal', 'find', 'frame'];
const plan: SubscriptionPlan = 'pro';
```

### 5.2 프로젝트 타입

```typescript
import type {
  Project,
  ProjectMember,
  ProjectStatus,
  ProjectRole,
  CreateProjectInput
} from '@minu/types';

const newProject: CreateProjectInput = {
  name: '신규 프로젝트',
  description: '프로젝트 설명',
  status: 'active',
};

const member: ProjectMember = {
  userId: 'usr_123',
  projectId: 'prj_456',
  role: 'editor',
  joinedAt: new Date(),
};
```

### 5.3 제안서 타입

```typescript
import type {
  Proposal,
  ProposalStatus,
  ProposalComment,
  CreateProposalInput
} from '@minu/types';

const proposal: CreateProposalInput = {
  projectId: 'prj_123',
  title: '제안서 제목',
  content: '제안서 내용...',
};
```

### 5.4 API 응답 타입

```typescript
import type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationMeta
} from '@minu/types';

// 성공 응답
type UserResponse = ApiResponse<User>;

// 페이지네이션 응답
type ProjectListResponse = PaginatedResponse<Project>;

// 에러 처리
function handleError(error: ApiError) {
  console.log(error.code);    // "VALIDATION_ERROR"
  console.log(error.message); // "입력값이 올바르지 않습니다."
  console.log(error.details); // { field: "email", ... }
}
```

---

## 6. Portal 연동 체크리스트

### 6.1 초기 설정

- [ ] `.npmrc` 파일 생성 및 GitHub 토큰 설정
- [ ] `pnpm add @minu/ui @minu/utils @minu/types`
- [ ] `tailwind.config.ts`에 preset 추가
- [ ] 루트 레이아웃에 `ToastProvider` 추가

### 6.2 인증 연동

- [ ] API 클라이언트 인스턴스 생성 (`lib/api.ts`)
- [ ] 토큰 갱신 매니저 설정 (`lib/auth.ts`)
- [ ] 인터셉터로 토큰 자동 주입
- [ ] 401 에러 시 자동 갱신 로직

### 6.3 공통 컴포넌트 교체

- [ ] 기존 Button → `@minu/ui` Button
- [ ] 기존 Input → `@minu/ui` Input
- [ ] 기존 Modal → `@minu/ui` Modal
- [ ] 기존 Toast → `@minu/ui` Toast

### 6.4 유틸리티 교체

- [ ] 날짜 포맷 함수 → `formatDate`, `formatRelativeTime`
- [ ] 검증 함수 → `validateEmail`, `validatePassword`
- [ ] API 호출 → `createApiClient`

---

## 7. Find 연동 체크리스트

### 7.1 초기 설정

- [ ] `.npmrc` 파일 생성 및 GitHub 토큰 설정
- [ ] `pnpm add @minu/ui @minu/utils @minu/types`
- [ ] `tailwind.config.ts`에 preset 추가
- [ ] 루트 레이아웃에 `ToastProvider` 추가

### 7.2 인증 연동

- [ ] Portal SSO 토큰 검증 (`hasServiceAccess(token, 'find')`)
- [ ] API 클라이언트 공유 설정
- [ ] 서비스 접근 권한 체크

### 7.3 UI 컴포넌트 적용

- [ ] 검색 폼: Input, Button
- [ ] 결과 목록: Card, Skeleton
- [ ] 상세 모달: Modal, Tabs
- [ ] 알림: Toast, Alert

### 7.4 Find 전용 기능

- [ ] 검색 디바운스 적용 (`debounce`)
- [ ] 무한 스크롤 스로틀 (`throttle`)
- [ ] 결과 ID 생성 (`generateId`)

---

## 8. 트러블슈팅

### 8.1 ESM 관련 오류

```
Error: require() of ES Module not supported
```

**해결**: `next.config.js`에서 transpile 설정

```javascript
const nextConfig = {
  transpilePackages: ['@minu/ui', '@minu/utils'],
};
```

### 8.2 타입 인식 오류

```
Cannot find module '@minu/types'
```

**해결**: `tsconfig.json` 확인

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

### 8.3 스타일 미적용

**해결**: Tailwind content 경로 확인

```javascript
content: [
  './node_modules/@minu/ui/dist/**/*.js',
],
```

### 8.4 React 버전 충돌

**해결**: `pnpm` overrides 설정

```json
{
  "pnpm": {
    "overrides": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    }
  }
}
```

---

## 9. 버전 관리

### 9.1 버전 확인

```bash
pnpm list @minu/ui @minu/utils @minu/types
```

### 9.2 업데이트

```bash
pnpm update @minu/ui @minu/utils @minu/types
```

### 9.3 변경 로그

- [CHANGELOG.md](../CHANGELOG.md) 참조
- [GitHub Releases](https://github.com/IDEA-on-Action/minu-shared/releases) 참조

---

## 10. 지원

- **이슈 리포트**: [GitHub Issues](https://github.com/IDEA-on-Action/minu-shared/issues)
- **문서**: [TypeDoc 문서](../docs-generated/)
- **Storybook**: `pnpm storybook` 실행 후 http://localhost:6006
