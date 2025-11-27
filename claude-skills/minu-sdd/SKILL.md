# Minu SDD Skill

> Spec-Driven Development 방법론 가이드

**버전**: 1.0.0
**최종 수정**: 2025-11-27

---

## SDD란?

코드 작성 전에 **명세서(Specification)**를 먼저 작성하는 개발 방법론입니다.
명세서가 개발자와 AI의 **단일 진실 소스(Single Source of Truth)** 역할을 수행합니다.

```
전통적 접근: 코드 중심 → 문서는 사후 보강
SDD 접근:    명세 중심 → 코드는 명세의 구현체
```

---

## 핵심 원칙

### 1. 명세가 원본(Source)이다
- 코드는 명세의 **표현물(Artifact)**
- 변경 시 명세를 먼저 업데이트
- 명세와 구현의 간극을 최소화

### 2. 의도와 구현의 분리
- **"무엇을(What)"**: 변하지 않는 의도와 목표
- **"어떻게(How)"**: 유연한 구현 방식

### 3. 검증 중심 개발
- 각 단계마다 검증 후 다음 단계로
- 작은 변경 단위로 리뷰 및 테스트

### 4. 컨텍스트 보존
- 의사결정의 맥락과 이유를 문서화
- AI와의 대화 컨텍스트를 명세로 결정화

---

## 4단계 프로세스

### Stage 1: Specify (명세 작성)

**목적**: 의도, 목표, 요구사항 정의
**경로**: `/docs/spec/`

| 파일 | 내용 |
|------|------|
| `requirements.md` | 사용자 요구사항, 사용자 여정 |
| `acceptance-criteria.md` | 성공 기준, 검증 방법 |
| `constraints.md` | 비기능 요구사항, 제약사항 |
| `user-journeys.md` | 사용자 시나리오 |

**작성 원칙**:
- ✅ 사용자 관점에서 작성
- ✅ 기능보다 가치에 집중
- ✅ 구체적인 예시 포함
- ❌ 기술 스택 언급 금지
- ❌ 구현 방법 언급 금지

---

### Stage 2: Plan (계획 수립)

**목적**: 기술적 접근 방법과 아키텍처 결정
**경로**: `/docs/plan/`

| 파일 | 내용 |
|------|------|
| `architecture.md` | 시스템 구조, 컴포넌트 설계 |
| `tech-stack.md` | 기술 스택, 선택 이유 |
| `implementation-strategy.md` | 구현 순서, 우선순위 |

**작성 원칙**:
- ✅ 기술적 제약사항 명시
- ✅ 아키텍처 결정 이유 기록
- ✅ 보안, 성능, 확장성 고려

---

### Stage 3: Tasks (작업 분해)

**목적**: 구현 가능한 작은 단위로 분해
**경로**: `/docs/tasks/`

| 파일 | 내용 |
|------|------|
| `backlog.md` | 전체 백로그 |
| `sprint-N.md` | 스프린트별 작업 |
| `completed.md` | 완료된 작업 |

**작업 크기 기준**:
- ⏱️ **1~3시간 단위** 권장
- ✅ 독립적으로 구현 가능
- ✅ 독립적으로 테스트 가능
- ✅ 명확한 완료 기준 존재

---

### Stage 4: Implement (구현)

**목적**: 작업 단위로 코드 작성 및 검증

**프로세스**:
1. 태스크 선택 (`/docs/tasks/`)
2. 새 대화 시작 (컨텍스트 오염 방지)
3. TDD로 구현 (Red → Green → Refactor)
4. 테스트 통과 확인
5. 린트/타입 에러 해결
6. 커밋 (태스크 ID 포함)

---

## 문서 구조

```
docs/
├── spec/                    # Stage 1: 명세
│   ├── requirements.md
│   ├── acceptance-criteria.md
│   ├── constraints.md
│   └── user-journeys.md
├── plan/                    # Stage 2: 계획
│   ├── architecture.md
│   ├── tech-stack.md
│   └── implementation-strategy.md
├── tasks/                   # Stage 3: 작업
│   ├── backlog.md
│   ├── sprint-1.md
│   └── completed.md
└── decisions/               # ADR (Architecture Decision Records)
    └── 001-example.md
```

---

## 체크리스트

### Specify 단계
- [ ] 사용자 스토리 작성
- [ ] 성공 기준 정의
- [ ] 제약사항 확인

### Plan 단계
- [ ] 아키텍처 설계 검토
- [ ] 기술 스택 선택 및 기록
- [ ] 보안/성능 고려사항 점검

### Tasks 단계
- [ ] 1~3시간 단위로 분해
- [ ] 각 작업의 완료 기준 정의
- [ ] 의존성 관계 파악

### Implement 단계
- [ ] 새 대화(세션) 시작
- [ ] 관련 명세/플랜/태스크 확인
- [ ] TDD 사이클 적용
- [ ] 커밋 및 푸시

---

## 버그 픽스 기록

버그 수정 시 반드시 기록:

1. **증상**: 사용자가 경험한 문제
2. **에러 메시지**: 콘솔 로그 또는 에러 내용
3. **원인**: 근본 원인 분석
4. **해결**: 수정 코드
5. **관련 파일**: 수정된 파일 목록
6. **교훈**: 향후 예방을 위한 교훈

---

## AI 협업 시 컨텍스트 제공

새 대화 시작 시:

```markdown
# 작업 컨텍스트

1. 관련 명세: docs/spec/requirements.md#feature-name
2. 관련 플랜: docs/plan/architecture.md#component-structure
3. 현재 태스크: docs/tasks/sprint-N.md#task-ID
4. 관련 파일: src/components/Component.tsx
```

---

## 문서 업데이트 원칙

1. **명세 우선**: 구현 전 명세 작성
2. **변경 시 명세 먼저**: 코드 변경 전 명세 업데이트
3. **버그 픽스 시 필수**: 원인과 해결 방법 기록
