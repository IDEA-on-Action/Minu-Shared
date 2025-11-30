# Changelog

모든 주요 변경 사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

---

## [Unreleased]

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

[Unreleased]: https://github.com/IDEA-on-Action/minu-shared/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/IDEA-on-Action/minu-shared/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/IDEA-on-Action/minu-shared/releases/tag/v0.1.0
