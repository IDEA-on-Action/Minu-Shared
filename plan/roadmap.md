# 로드맵 (Roadmap)

> minu-shared 패키지의 전체 개발 로드맵

**최종 업데이트**: 2025-11-27
**현재 버전**: 0.1.0
**목표 버전**: 1.0.0

---

## 전체 진행 현황

```
Phase 1 ████████████████████ 100% ✅ 완료
Phase 2 ████████████████████ 100% ✅ 완료
Phase 3 ░░░░░░░░░░░░░░░░░░░░ 0%
Phase 4 ░░░░░░░░░░░░░░░░░░░░ 0%
─────────────────────────────
전체    ██████████░░░░░░░░░░ 50%
```

---

## Phase 1: 기반 구축 ✅ 완료

**목표**: 모노레포 구조 확립 및 기본 컴포넌트/유틸리티 구현

### 완료된 작업 ✅

| 카테고리 | 작업 | 패키지 |
|----------|------|--------|
| 프로젝트 세팅 | 모노레포 세팅 (pnpm workspaces) | root |
| 프로젝트 세팅 | TypeScript 설정 (strict mode) | root |
| 프로젝트 세팅 | Turborepo 설정 | root |
| 프로젝트 세팅 | SDD 문서 구조 (spec/, plan/, tasks/) | root |
| UI 컴포넌트 | Button 컴포넌트 | @minu/ui |
| UI 컴포넌트 | Input 컴포넌트 | @minu/ui |
| UI 컴포넌트 | Card 컴포넌트 | @minu/ui |
| UI 컴포넌트 | cn 유틸리티 (clsx + tailwind-merge) | @minu/ui |
| 스타일 | Tailwind 디자인 토큰 (colors, typography, spacing 등) | @minu/ui |
| 스타일 | Tailwind 프리셋 (minuPreset) | @minu/ui |
| 유틸리티 | API 클라이언트 | @minu/utils |
| 유틸리티 | JWT 유틸리티 | @minu/utils |
| 유틸리티 | 포맷팅 유틸리티 | @minu/utils |
| 타입 | User, Subscription, Tenant 타입 | @minu/types |
| 타입 | API 타입 (ApiResponse, ApiError) | @minu/types |
| CI/CD | GitHub Actions CI 워크플로우 | root |
| CI/CD | GitHub Actions Publish 워크플로우 | root |
| CI/CD | Vitest 테스트 환경 | root |
| CI/CD | Codecov 연동 | root |
| CI/CD | Size-limit 설정 | root |
| 품질 | 컴포넌트 테스트 (51개) | @minu/ui |
| 품질 | 빌드/린트/타입 체크 검증 | all |

### 완료 기준

- [x] 모든 패키지 빌드 성공 (`pnpm build`)
- [x] 타입 에러 0개 (`pnpm type-check`)
- [x] 린트 에러 0개 (`pnpm lint`)
- [x] 컴포넌트 테스트 통과 (51개)
- [x] Tailwind 디자인 토큰 정의

---

## Phase 2: 컴포넌트 확장 ✅ 완료

**목표**: 레이아웃/피드백 컴포넌트 추가로 UI 라이브러리 완성

### 작업 목록

| ID | 작업 | 패키지 | 우선순위 | 상태 |
|----|------|--------|----------|------|
| P2-001 | Modal 컴포넌트 | @minu/ui | P1 | ✅ 완료 |
| P2-002 | Drawer 컴포넌트 | @minu/ui | P1 | ✅ 완료 |
| P2-003 | Tabs 컴포넌트 | @minu/ui | P1 | ✅ 완료 |
| P2-004 | Toast 시스템 | @minu/ui | P1 | ✅ 완료 |
| P2-005 | Alert 컴포넌트 | @minu/ui | P1 | ✅ 완료 |
| P2-006 | Badge 컴포넌트 | @minu/ui | P2 | ✅ 완료 |
| P2-007 | Spinner 컴포넌트 | @minu/ui | P2 | ✅ 완료 |
| P2-008 | Skeleton 컴포넌트 | @minu/ui | P2 | ✅ 완료 |
| P2-009 | Avatar 컴포넌트 | @minu/ui | P2 | ✅ 완료 |
| P2-010 | Select 컴포넌트 (확장) | @minu/ui | P2 | ✅ 완료 |
| P2-011 | Checkbox 컴포넌트 | @minu/ui | P2 | ✅ 완료 |
| P2-012 | Radio 컴포넌트 | @minu/ui | P2 | ✅ 완료 |

### 추가된 훅

| 훅 | 설명 | 상태 |
|----|------|------|
| useControllableState | 제어/비제어 상태 통합 | ✅ 완료 |
| useEscapeKey | ESC 키 감지 | ✅ 완료 |
| useBodyScrollLock | 스크롤 잠금 | ✅ 완료 |
| useFocusTrap | 포커스 트랩 | ✅ 완료 |
| useClickOutside | 외부 클릭 감지 | ✅ 완료 |
| useId | 접근성용 고유 ID | ✅ 완료 |

### 추가된 프리미티브

| 프리미티브 | 설명 | 상태 |
|-----------|------|------|
| Portal | React Portal 래퍼 | ✅ 완료 |
| Backdrop | 반투명 오버레이 | ✅ 완료 |
| FocusScope | 포커스 트랩 컨테이너 | ✅ 완료 |
| VisuallyHidden | 스크린 리더 전용 | ✅ 완료 |

### 완료 기준

- [x] 모든 P1 컴포넌트 구현
- [x] 각 컴포넌트 테스트 작성 (276개)
- [ ] 소비자 서비스(Find, Frame)에서 통합 테스트

---

## Phase 3: 유틸리티 & 타입 확장 ⏳ 대기

**목표**: 서비스 간 공유되는 유틸리티와 타입 확장

### 작업 목록

| ID | 작업 | 패키지 | 우선순위 | 상태 |
|----|------|--------|----------|------|
| P3-001 | 토큰 갱신 로직 | @minu/utils | P1 | ⏳ |
| P3-002 | Project 타입 | @minu/types | P1 | ⏳ |
| P3-003 | Proposal 타입 | @minu/types | P1 | ⏳ |
| P3-004 | Subscription 타입 확장 | @minu/types | P1 | ⏳ |
| P3-005 | Validation 유틸 | @minu/utils | P2 | ⏳ |
| P3-006 | debounce/throttle | @minu/utils | P2 | ⏳ |
| P3-007 | generateId (nanoid) | @minu/utils | P3 | ⏳ |
| P3-008 | useLocalStorage 훅 | @minu/utils | P3 | ⏳ |

### 완료 기준

- [ ] 모든 P1 작업 완료
- [ ] 유틸리티 함수 테스트 작성
- [ ] 타입 정의 문서화

---

## Phase 4: 배포 & 문서화 ⏳ 대기

**목표**: 프로덕션 배포 준비 및 v1.0.0 릴리스

### 작업 목록

| ID | 작업 | 우선순위 | 상태 |
|----|------|----------|------|
| P4-001 | 테스트 커버리지 80% 달성 | P0 | ⏳ |
| P4-002 | GitHub Actions 완성 | P0 | ⏳ |
| P4-003 | Changesets 통합 완료 | P1 | ⏳ |
| P4-004 | README 정비 | P1 | ⏳ |
| P4-005 | API 문서 자동화 | P2 | ⏳ |
| P4-006 | Storybook 설정 (선택) | P3 | ⏳ |
| P4-007 | v1.0.0 릴리스 | P0 | ⏳ |

### 릴리스 체크리스트

- [ ] 모든 패키지 빌드 성공
- [ ] 테스트 커버리지 80%+
- [ ] 린트 에러 0개
- [ ] Breaking Change 없음 (또는 문서화됨)
- [ ] CHANGELOG 업데이트
- [ ] GitHub Release 생성

---

## 버전 로드맵

```
현재
  │
  ▼
v0.1.0 ────────── Phase 1 완료 (기반 구축)
  │
  ▼
v0.2.0 ────────── Phase 2 완료 (컴포넌트 확장)
  │
  ▼
v0.3.0 ────────── Phase 3 완료 (유틸리티 확장)
  │
  ▼
v0.4.0-beta.1 ── Beta 릴리스
  │
  ▼
v1.0.0-rc.1 ──── Release Candidate
  │
  ▼
v1.0.0 ────────── 정식 출시 (GA)
```

---

## 기술 부채 (Tech Debt)

| ID | 내용 | 우선순위 | 상태 |
|----|------|----------|------|
| TD-001 | 테스트 커버리지 80% 달성 | P1 | ⏳ |
| TD-002 | ESLint 규칙 강화 | P2 | ⏳ |
| TD-003 | 접근성(a11y) 검사 추가 | P2 | ⏳ |
| TD-004 | 번들 사이즈 최적화 | P2 | ⏳ |

---

## 우선순위 기준

| 레벨 | 설명 | 대응 |
|------|------|------|
| **P0** | 출시 차단 (필수) | 즉시 처리 |
| **P1** | 높음 | 다음 스프린트 |
| **P2** | 중간 | 백로그 |
| **P3** | 낮음 | 나중에 |

---

## 관련 문서

- [tasks/sprint-1.md](../tasks/sprint-1.md) - 현재 스프린트 상세
- [tasks/backlog.md](../tasks/backlog.md) - 백로그 상세
- [implementation-strategy.md](implementation-strategy.md) - 구현 전략
- [spec/acceptance-criteria.md](../spec/acceptance-criteria.md) - 릴리스 조건

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2025-11-27 | 로드맵 문서 생성, Phase 1~4 정의 |
| 2025-11-27 | Phase 1 완료 (Tailwind 디자인 토큰, 타입 체크 오류 수정) |
| 2025-11-27 | Phase 2 시작: Alert, Tabs 컴포넌트 + useControllableState 훅 완료 |
| 2025-11-27 | Phase 2 Sprint 2: Modal, Drawer, Toast + 5개 훅 + 4개 프리미티브 완료 (P1 완료) |
| 2025-11-27 | Phase 2 Sprint 3-5: Badge, Spinner, Skeleton, Avatar, Checkbox, Radio, Select 완료 (P2 완료, Phase 2 100%) |
