# Changelog

모든 주요 변경 사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

---

## [Unreleased]

### Added

#### @minu/ui
- `Alert` 컴포넌트: variant(default, success, warning, error, info), title, description, closable 지원
- `Tabs` 컴포넌트: Tabs, TabsList, TabsTrigger, TabsContent (제어/비제어 모드)
- `useControllableState` 훅: 제어/비제어 상태 통합 관리

### Changed
- `.npmrc`: 환경변수 경고 해결 (인증 토큰 라인 CI/CD로 이동)
- `package.json` exports 순서: types를 최상위로 이동 (3개 패키지)

### Fixed
- SDD 문서 구조 정비 (spec/, plan/, tasks/)
- packages/ 폴더 구조 표준화

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

[Unreleased]: https://github.com/IDEA-on-Action/minu-shared/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/IDEA-on-Action/minu-shared/releases/tag/v0.1.0
