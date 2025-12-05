# Changelog

모든 주요 변경 사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

---

## [Unreleased]

### Added

#### @idea-on-action/ui
- **Phase 7 훅**
  - `useAsync`: 비동기 함수 상태 관리 훅 (loading/error/data, execute/reset, immediate 옵션, race condition 방지)

- **Storybook 스토리 확장 (5개)**
  - `Switch.stories.tsx`: 스위치 컴포넌트 스토리
  - `Breadcrumb.stories.tsx`: 브레드크럼 컴포넌트 스토리
  - `Toast.stories.tsx`: 토스트 컴포넌트 스토리
  - `Accordion.stories.tsx`: 아코디언 컴포넌트 스토리
  - `Tabs.stories.tsx`: 탭 컴포넌트 스토리

### Changed

#### 테스트 인프라 개선
- axe 접근성 테스트 동시 실행 문제 해결
  - `runAxe` 유틸리티 함수 도입 (큐 기반 순차 실행)
  - 18개 테스트 파일 runAxe 적용
- Vitest 설정 최적화
  - `pool: 'threads'` + `singleThread: true` 설정
  - `maxConcurrency: 1`, `maxWorkers: 1` 설정
  - `sequence.concurrent: false` 설정

---

## [1.2.0] - 2025-12-05

### Added

#### @idea-on-action/ui
- **Phase 6 컴포넌트 (4개)**
  - `Popover` 컴포넌트: 팝오버 (Portal, side/align 위치 지정)
  - `Menu` 컴포넌트: 메뉴 (키보드 네비게이션, 중첩 메뉴 지원)
  - `Accordion` 컴포넌트: 아코디언 (single/multiple 모드)
  - `Progress` 컴포넌트: 진행률 표시 (size/color, indeterminate 모드)

- **Phase 6 훅 (3개)**
  - `useMediaQuery`: SSR 안전한 미디어 쿼리 매칭
  - `useDebounce`: 값 디바운싱
  - `useDebouncedCallback`: 콜백 함수 디바운싱

### Changed

#### 패키지 이름 변경
- **Breaking Change**: 모든 패키지 스코프를 `@minu`에서 `@idea-on-action`으로 변경
  - `@minu/types` → `@idea-on-action/types@1.0.1`
  - `@minu/ui` → `@idea-on-action/ui@1.2.0`
  - `@minu/utils` → `@idea-on-action/utils@1.0.0`
- GitHub 조직 이름(`IDEA-on-Action`)과 패키지 스코프 일치
- `.npmrc` 설정: `@idea-on-action:registry=https://npm.pkg.github.com`

#### GitHub Packages 게시
- GitHub Packages에 성공적으로 패키지 게시
- `publishConfig.registry`: `https://npm.pkg.github.com`
- `publishConfig.access`: `public`
- GitHub Personal Access Token 기반 인증 설정

#### 문서 업데이트
- README.md: 패키지 이름 및 설치 가이드 업데이트
- 모든 예제 코드에서 `@minu` → `@idea-on-action` 변경

#### 테스트 환경 개선
- Node.js 힙 메모리 한도 증가: 메인 프로세스 8GB, Worker 프로세스 4GB
- Vitest fork 프로세스에 `execArgv` 옵션 추가로 Worker OOM 방지
- 테스트 타임아웃 60초로 증가 (대용량 테스트 안정성 향상)

---

## [1.1.0] - 2025-11-30

### Added

#### @minu/ui
- **Phase 5 컴포넌트 (8개)**
  - `Switch` 컴포넌트: 토글 스위치 (on/off 상태, 비활성화 지원)
  - `Textarea` 컴포넌트: 다중 라인 텍스트 입력 (자동 높이 조절 옵션)
  - `Slider` 컴포넌트: 범위 선택 슬라이더 (min/max/step, 비활성화)
  - `DatePicker` 컴포넌트: 날짜 선택기 (캘린더 UI, 범위 선택)
  - `Breadcrumb` 컴포넌트: 탐색 경로 표시 (구분자 커스터마이징)
  - `Pagination` 컴포넌트: 페이지 네비게이션 (이전/다음, 페이지 번호)
  - `Tooltip` 컴포넌트: 툴팁 (4방향, 정렬, 딜레이)
  - `Dropdown` 컴포넌트: 드롭다운 메뉴 (아이템 그룹, 구분선)

### Fixed
- `Tooltip` 테스트: fake timer와 waitFor 충돌 해결

---

## [1.0.0] - 2025-11-28

### Added

#### @minu/ui
- **Phase 2 컴포넌트 (12개)**
  - `Modal` 컴포넌트: 모달 다이얼로그 (Portal, Backdrop, FocusTrap 기반)
  - `Drawer` 컴포넌트: 슬라이드 패널 (left, right, top, bottom)
  - `Toast` 시스템: 토스트 알림 (success, error, warning, info)
  - `Tabs` 컴포넌트: 탭 UI (제어/비제어 모드)
  - `Alert` 컴포넌트: 알림 메시지 (5가지 variant)
  - `Badge` 컴포넌트: 상태 표시
  - `Spinner` 컴포넌트: 로딩 인디케이터
  - `Skeleton` 컴포넌트: 콘텐츠 플레이스홀더
  - `Avatar` 컴포넌트: 사용자 아바타
  - `Select` 컴포넌트: 드롭다운 선택 (단일/다중, 검색 가능)
  - `Checkbox` 컴포넌트: 체크박스
  - `Radio` 컴포넌트: 라디오 버튼 그룹
- **훅 (7개)**: useControllableState, useEscapeKey, useBodyScrollLock, useFocusTrap, useClickOutside, useId, useLocalStorage
- **프리미티브 (4개)**: Portal, Backdrop, FocusScope, VisuallyHidden
- **a11y 테스트**: 15개 컴포넌트에 jest-axe 기반 접근성 테스트 추가

#### @minu/utils
- **Phase 3 유틸리티**
  - `createTokenRefreshManager`: JWT 토큰 갱신 관리자
  - `validateEmail`, `validatePassword`, `validateUrl`: 검증 유틸리티
  - `validatePhoneKR`, `validateBusinessNumber`: 한국 로케일 검증
  - `debounce`, `throttle`: 함수 호출 제어
  - `generateId`, `createIdGenerator`: nanoid 기반 ID 생성

#### @minu/types
- **Phase 3 타입 확장**
  - `Project`, `ProjectMember`: 프로젝트 관련 타입
  - `Proposal`, `ProposalComment`, `ProposalReview`: 제안서 타입
  - `SubscriptionExtended`, `SubscriptionUsage`: 구독 확장 타입
  - `PaymentHistory`, `PlanLimits`: 결제/플랜 타입

#### 개발 환경
- `eslint-plugin-jsx-a11y`: 접근성 린트 규칙 추가
- `jest-axe`: 런타임 접근성 테스트 설정
- `TypeDoc`: API 문서 자동 생성 (`pnpm docs`)
- `Storybook 8.6.14`: 컴포넌트 문서화 (`pnpm storybook`)

### Changed
- **ESM-only 전환**: 3개 패키지 모두 CJS+ESM → ESM-only로 변경
- **테스트 커버리지**: 97%+ 달성 (목표 80%)
- **Vitest 최적화**: `pool: 'forks'` 설정으로 메모리 누수 해결
- **tsup 최적화**: `treeshake: true`, `splitting: true` 설정 추가
- **번들 최적화**: `sideEffects: false` 필드 추가 (tree-shaking 개선)
- `package.json` exports 순서: types를 최상위로 이동

### Fixed
- SDD 문서 구조 정비 (spec/, plan/, tasks/)
- packages/ 폴더 구조 표준화
- Select a11y: 키보드 이벤트 핸들러 추가
- Toast a11y 테스트: fake timer 충돌 해결

---

## [0.1.0] - 2025-11-27

### Added

#### @minu/ui
- `Button` 컴포넌트: variant(default, destructive, outline, secondary, ghost, link), size(default, sm, lg, icon), isLoading 지원
- `Input` 컴포넌트: error 상태, errorMessage 표시 지원
- `Card` 컴포넌트: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `cn` 유틸리티: clsx + tailwind-merge 기반 클래스 병합

#### @minu/utils
- `createApiClient`: ideaonaction.ai API 클라이언트 팩토리
- JWT 유틸리티: parseJWT, isTokenExpired, hasServiceAccess, getSubscriptionPlan, getUserIdFromToken, getTenantIdFromToken
- 포맷팅 유틸리티: formatDate, formatDateTime, formatRelativeTime, formatCurrency, formatNumber, formatPercent, formatFileSize

#### @minu/types
- 사용자 타입: User, Subscription, Tenant, TenantMember, JWTPayload
- 서비스 타입: MinuService, SubscriptionPlan
- API 타입: ApiResponse, ApiError, ApiErrorCode, PaginatedResponse, PaginationMeta

#### 프로젝트 설정
- pnpm workspaces 기반 모노레포 구성
- TypeScript 5.3+ 설정 (strict mode)
- tsup 빌드 설정 (CJS + ESM + DTS)
- GitHub Actions 배포 워크플로우
- GitHub Packages 배포 설정

---

## 버전 가이드

- **Major (X.0.0)**: Breaking Changes - 하위 호환성을 깨는 변경
- **Minor (0.X.0)**: 새로운 기능 추가 (하위 호환)
- **Patch (0.0.X)**: 버그 수정, 문서 업데이트

[Unreleased]: https://github.com/IDEA-on-Action/minu-shared/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/IDEA-on-Action/minu-shared/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/IDEA-on-Action/minu-shared/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/IDEA-on-Action/minu-shared/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/IDEA-on-Action/minu-shared/releases/tag/v0.1.0
