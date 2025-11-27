# 구현 전략 (Implementation Strategy)

> minu-shared 패키지의 구현 순서 및 우선순위
>
> **전체 로드맵**: [roadmap.md](roadmap.md)
> **개발 방법론**: SSDD (Skillful SDD)

**문서 버전**: 1.2.0
**작성일**: 2025-11-27
**최종 업데이트**: 2025-11-27

---

## 1. Phase 개요

| Phase | 내용 | 상태 | 진행률 |
|-------|------|------|--------|
| Phase 1 | 프로젝트 세팅, 기본 컴포넌트 | ✅ 완료 | 100% |
| Phase 2 | 레이아웃/피드백 컴포넌트 | ⏳ 대기 | 0% |
| Phase 3 | 유틸리티 & 타입 확장 | ⏳ 대기 | 0% |
| Phase 4 | CI/CD, 문서화, v1.0.0 | ⏳ 대기 | 0% |

---

## 2. Phase 1: 기반 구축 ✅ 완료

### 2.1 목표

- 모노레포 구조 확립
- 기본 UI 컴포넌트 3개 완성
- 핵심 유틸리티 구현
- 공유 타입 정의

### 2.2 작업 목록

| 순서 | 작업 | 패키지 | 상태 |
|------|------|--------|------|
| 1 | 모노레포 세팅 | root | ✅ |
| 2 | TypeScript 설정 | root | ✅ |
| 3 | pnpm-workspace 설정 | root | ✅ |
| 4 | Button 컴포넌트 | @minu/ui | ✅ |
| 5 | Input 컴포넌트 | @minu/ui | ✅ |
| 6 | Card 컴포넌트 | @minu/ui | ✅ |
| 7 | cn 유틸리티 | @minu/ui | ✅ |
| 8 | API 클라이언트 | @minu/utils | ✅ |
| 9 | JWT 유틸리티 | @minu/utils | ✅ |
| 10 | 포맷팅 함수 | @minu/utils | ✅ |
| 11 | User 타입 | @minu/types | ✅ |
| 12 | API 타입 | @minu/types | ✅ |
| 13 | CI/CD 파이프라인 | root | ✅ |
| 14 | Vitest 테스트 환경 | root | ✅ |
| 15 | 컴포넌트 테스트 (51개) | @minu/ui | ✅ |
| 16 | Tailwind 디자인 토큰 | @minu/ui | ✅ |

### 2.3 완료 기준

- [x] 모든 패키지 빌드 성공
- [x] 타입 에러 0개
- [x] 린트 에러 0개
- [x] 테스트 통과 (51개)
- [x] Tailwind 디자인 토큰 정의

---

## 3. Phase 2: 컴포넌트 확장

### 3.1 목표

- 레이아웃 컴포넌트 추가
- 피드백 시스템 구축

### 3.2 작업 목록

| 작업 | 패키지 |
|------|--------|
| Modal 컴포넌트 | @minu/ui |
| Drawer 컴포넌트 | @minu/ui |
| Tabs 컴포넌트 | @minu/ui |
| Toast 시스템 | @minu/ui |
| Alert 컴포넌트 | @minu/ui |
| Badge 컴포넌트 | @minu/ui |
| Spinner 컴포넌트 | @minu/ui |

---

## 4. Phase 3: 유틸리티 & 타입 확장

### 4.1 작업 목록

| 작업 | 패키지 |
|------|--------|
| 인증 토큰 갱신 | @minu/utils |
| Validation 유틸 | @minu/utils |
| Project 타입 | @minu/types |
| Proposal 타입 | @minu/types |
| Subscription 타입 | @minu/types |

---

## 5. Phase 4: 배포 & 문서화

### 5.1 작업 목록

| 작업 |
|------|
| GitHub Actions 워크플로우 완성 |
| Changesets 통합 |
| Storybook 설정 (선택) |
| README 정비 |
| v1.0.0 릴리스 |

---

## 6. 구현 원칙

### 6.1 TDD 적용

```
Red → Green → Refactor
```

1. 실패하는 테스트 작성
2. 테스트 통과하는 최소 코드
3. 리팩토링

### 6.2 작은 커밋

- 1 기능 = 1 커밋
- Conventional Commits 형식
- 예: `feat(ui): add Button component`

### 6.3 점진적 통합

- 각 컴포넌트 완성 후 즉시 minu-find에서 테스트
- 문제 발견 시 바로 수정

---

## 7. 릴리스 프로세스

### 7.1 버전 라이프사이클

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  0.x.0   MVP (Minimum Viable Product)                      │
│          ├─ 핵심 기능만 구현                                │
│          ├─ 내부 테스트 및 검증                            │
│          └─ 소비자 서비스 통합 테스트                       │
│                        │                                    │
│                        ▼                                    │
│  0.x.0-beta.N   Beta Release                               │
│          ├─ 기능 안정화                                    │
│          ├─ 피드백 수집 및 반영                            │
│          └─ 문서화 완료                                    │
│                        │                                    │
│                        ▼                                    │
│  1.0.0-rc.N   Release Candidate                            │
│          ├─ 최종 검증                                      │
│          ├─ 성능 최적화                                    │
│          └─ Breaking Change 금지                           │
│                        │                                    │
│                        ▼                                    │
│  1.0.0   정식 출시 (GA: General Availability)              │
│          ├─ 프로덕션 Ready                                  │
│          ├─ 완전한 기능 세트                                │
│          └─ API 안정성 보장                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 버전 업 워크플로우

```
1. 기능/수정 완료
        │
        ▼
2. 변경 유형 판단
   ├─ Breaking Change? → Major 업
   ├─ 새 기능?        → Minor 업
   └─ 버그 수정?      → Patch 업
        │
        ▼
3. Changeset 생성
   pnpm changeset
        │
        ▼
4. PR 머지 후 버전 업데이트
   pnpm changeset version
        │
        ▼
5. CHANGELOG.md 자동 업데이트
        │
        ▼
6. Git 태그 생성 및 푸시
   git tag -a v0.x.0 -m "버전 설명"
   git push origin v0.x.0
        │
        ▼
7. GitHub Release 생성 (자동)
```

### 7.3 Changesets 사용법

```bash
# 변경사항 기록 (대화형)
pnpm changeset

# 버전 업데이트 (package.json, CHANGELOG.md)
pnpm changeset version

# GitHub Packages 배포
pnpm changeset publish
```

### 7.4 Pre-release 배포

```bash
# Beta 버전 배포
pnpm changeset pre enter beta
pnpm changeset version
pnpm changeset publish

# RC 버전 배포
pnpm changeset pre enter rc
pnpm changeset version
pnpm changeset publish

# Pre-release 모드 종료
pnpm changeset pre exit
```

---

## 관련 문서

- [roadmap.md](roadmap.md) - 전체 로드맵
> **개발 방법론**: SSDD (Skillful SDD)
- [../tasks/sprint-1.md](../tasks/sprint-1.md) - 현재 스프린트
- [../tasks/backlog.md](../tasks/backlog.md) - 백로그
- [../spec/acceptance-criteria.md](../spec/acceptance-criteria.md) - 릴리스 조건

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2025-11-27 | 최초 작성 |
| 1.1.0 | 2025-11-27 | 릴리스 프로세스 섹션 추가 |
| 1.2.0 | 2025-11-27 | Phase 1 완료 상태 업데이트, 로드맵 연동 |
