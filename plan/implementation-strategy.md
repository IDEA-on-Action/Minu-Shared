# 구현 전략 (Implementation Strategy)

> minu-shared 패키지의 구현 순서 및 우선순위

**문서 버전**: 1.0.0
**작성일**: 2025-11-27

---

## 1. Phase 개요

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | 프로젝트 세팅, 기본 컴포넌트 | 🔄 진행 중 |
| Phase 2 | 레이아웃/피드백 컴포넌트 | ⏳ 대기 |
| Phase 3 | 유틸리티 & 타입 확장 | ⏳ 대기 |
| Phase 4 | CI/CD, 문서화, v1.0.0 | ⏳ 대기 |

---

## 2. Phase 1: 기반 구축 (현재)

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
| 4 | Button 컴포넌트 | @minu/ui | 🔄 |
| 5 | Input 컴포넌트 | @minu/ui | 🔄 |
| 6 | Card 컴포넌트 | @minu/ui | 🔄 |
| 7 | cn 유틸리티 | @minu/ui | 🔄 |
| 8 | API 클라이언트 | @minu/utils | 🔄 |
| 9 | JWT 유틸리티 | @minu/utils | 🔄 |
| 10 | 포맷팅 함수 | @minu/utils | 🔄 |
| 11 | User 타입 | @minu/types | 🔄 |
| 12 | API 타입 | @minu/types | 🔄 |

### 2.3 완료 기준

- [ ] 모든 패키지 빌드 성공
- [ ] 타입 에러 0개
- [ ] 린트 에러 0개

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

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2025-11-27 | 최초 작성 |
