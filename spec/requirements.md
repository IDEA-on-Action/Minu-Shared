# 사용자 요구사항 (Requirements)

> minu-shared 패키지의 사용자 요구사항 정의

**문서 버전**: 1.0.0
**작성일**: 2025-11-27
**상태**: Phase 1 진행 중

---

## 1. 개요

minu-shared는 Minu 서비스(Find, Frame, Build, Keep) 간 코드 재사용과 일관성을 위한 공유 패키지입니다.

## 2. 사용자 스토리

### 2.1 UI 컴포넌트 (@minu/ui)

**AS A** Minu 서비스 개발자,
**I WANT** 일관된 디자인의 UI 컴포넌트를 사용하고 싶습니다,
**SO THAT** 모든 서비스에서 동일한 사용자 경험을 제공할 수 있습니다.

- [ ] Button 컴포넌트: primary, secondary, ghost, danger 변형
- [ ] Input 컴포넌트: text, email, password, search 타입
- [ ] Card 컴포넌트: Header, Content, Footer 구성

### 2.2 유틸리티 함수 (@minu/utils)

**AS A** Minu 서비스 개발자,
**I WANT** 공통 유틸리티 함수를 재사용하고 싶습니다,
**SO THAT** 중복 코드를 줄이고 유지보수를 효율화할 수 있습니다.

- [ ] API 클라이언트: 인증 헤더 자동 추가, 에러 처리
- [ ] JWT 유틸: 토큰 파싱, 만료 확인, 서비스 접근 권한 확인
- [ ] 포맷팅: 날짜, 통화, 숫자, 파일 크기 포맷

### 2.3 타입 정의 (@minu/types)

**AS A** Minu 서비스 개발자,
**I WANT** 공유 TypeScript 타입을 사용하고 싶습니다,
**SO THAT** 서비스 간 타입 안전성을 보장할 수 있습니다.

- [ ] User 타입: 사용자 정보, 구독, 테넌트
- [ ] API 타입: ApiResponse, ApiError, PaginatedResponse
- [ ] JWT 페이로드 타입

## 3. 기능 요구사항

### 3.1 필수 기능 (P0)

| ID | 기능 | 패키지 | 상태 |
|----|------|--------|------|
| F-001 | Button 컴포넌트 | @minu/ui | 🔄 진행 중 |
| F-002 | Input 컴포넌트 | @minu/ui | 🔄 진행 중 |
| F-003 | Card 컴포넌트 | @minu/ui | 🔄 진행 중 |
| F-004 | API 클라이언트 | @minu/utils | 🔄 진행 중 |
| F-005 | JWT 유틸리티 | @minu/utils | 🔄 진행 중 |
| F-006 | 포맷팅 유틸 | @minu/utils | 🔄 진행 중 |
| F-007 | User 타입 | @minu/types | 🔄 진행 중 |
| F-008 | API 타입 | @minu/types | 🔄 진행 중 |

### 3.2 우선순위 높음 (P1)

| ID | 기능 | 패키지 | 상태 |
|----|------|--------|------|
| F-101 | Modal 컴포넌트 | @minu/ui | ⏳ 대기 |
| F-102 | Toast 시스템 | @minu/ui | ⏳ 대기 |
| F-103 | Tabs 컴포넌트 | @minu/ui | ⏳ 대기 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2025-11-27 | 최초 작성 |
