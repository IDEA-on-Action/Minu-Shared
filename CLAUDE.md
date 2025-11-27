# Minu Shared Packages 개발 문서

> Claude와의 개발 협업을 위한 프로젝트 핵심 문서

**마지막 업데이트**: 2025-11-27
**현재 버전**: 0.1.0
**상태**: 개발 중 (Phase 1)
**개발 방법론**: SDD (Spec-Driven Development)
**GitHub**: https://github.com/IDEA-on-Action/Minu-Shared

---

## 📋 프로젝트 개요

### 목적

minu-shared는 Minu 서비스 간 코드 재사용과 일관성을 위한 공유 패키지입니다. Find, Frame, Build, Keep 4개 서비스에서 공통으로 사용되는 UI 컴포넌트, 유틸리티 함수, TypeScript 타입을 단일 소스로 관리합니다.

### 기본 정보

| 항목 | 내용 |
|------|------|
| **프로젝트명** | minu-shared |
| **설명** | Minu - 프리랜서 비즈니스 플랫폼 공유 패키지 |
| **레포지토리** | [github.com/IDEA-on-Action/Minu-Shared](https://github.com/IDEA-on-Action/Minu-Shared) |
| **배포** | GitHub Packages (npm.pkg.github.com/@minu) |

### 핵심 가치

| 가치 | 설명 |
|------|------|
| **일관성 (Consistency)** | 모든 서비스에서 동일한 디자인 시스템과 UX 패턴 |
| **재사용성 (Reusability)** | 중복 코드 제거, 유지보수 비용 절감 |
| **타입 안전성 (Type Safety)** | 공유 타입으로 서비스 간 통신 오류 방지 |
| **개발 속도 (Velocity)** | 검증된 컴포넌트로 빠른 개발 |

### 아키텍처

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

### 패키지 구조

| 패키지명 | 역할 | 주요 내용 |
|----------|------|----------|
| **@minu/ui** | UI 컴포넌트 | Button, Input, Card, Modal, Toast 등 React 컴포넌트 |
| **@minu/utils** | 유틸리티 | API 클라이언트, JWT 처리, 날짜/포맷 헬퍼, 인증 유틸 |
| **@minu/types** | 타입 정의 | User, Subscription, Project, Proposal 등 공유 인터페이스 |

---

## 🛠️ 기술 스택

### Core

| 기술 | 버전 | 용도 |
|------|------|------|
| **TypeScript** | 5.0+ | 타입 시스템 |
| **React** | 18+ / 19 | UI 라이브러리 |
| **TailwindCSS** | 3.4+ | 스타일링 |
| **pnpm** | 8+ | 패키지 매니저 |
| **Turborepo** | - | 모노레포 빌드 |

### 디자인 토큰

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

#### 타이포그래피

| 용도 | 폰트 | 설명 |
|------|------|------|
| **Display** | Outfit | 헤드라인, 타이틀, 숫자 강조 |
| **Body** | Pretendard | 본문, UI 텍스트, 한글 최적화 |

---

## 📁 프로젝트 구조

```
minu-shared/
├── packages/
│   ├── ui/
│   │   ├── src/
│   │   │   ├── components/
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
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── spec/                    # Stage 1: Specify (명세)
├── plan/                    # Stage 2: Plan (계획)
├── tasks/                   # Stage 3: Tasks (작업)
│
├── .github/
│   └── workflows/
│       └── publish.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 🚀 빠른 시작

### 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/ideaonaction/minu-shared.git
cd minu-shared

# 2. 의존성 설치
pnpm install

# 3. 개발 서버 실행
pnpm dev
```

### 주요 명령어

```bash
pnpm dev       # 개발 모드 (watch)
pnpm build     # 모든 패키지 빌드
pnpm lint      # 린트 검사
pnpm type-check # 타입 체크
pnpm test      # 테스트 실행
```

### 패키지 사용 (소비자)

#### .npmrc 설정

```bash
# 프로젝트 루트에 .npmrc 파일 생성
@minu:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

#### 설치

```bash
# 모든 패키지 설치
pnpm add @minu/ui @minu/utils @minu/types

# 개별 설치
pnpm add @minu/ui
pnpm add @minu/utils
pnpm add @minu/types
```

#### TailwindCSS 설정

```typescript
// tailwind.config.ts
import { minuPreset } from '@minu/ui/tailwind';

export default {
  presets: [minuPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@minu/ui/**/*.{js,ts,jsx,tsx}',
  ],
};
```

---

## 🎯 SDD (Spec-Driven Development) 방법론

### 개요

minu-shared 프로젝트는 **명세 주도 개발(Spec-Driven Development)**을 적용하여, 코드보다 의도를 먼저 정의하고 AI와 협업하는 체계적인 개발 프로세스를 따릅니다.

### SDD란?

코드 작성 전에 **명세서(Specification)**를 먼저 작성하는 개발 방법론으로, 명세서가 개발자와 AI의 **단일 진실 소스(Single Source of Truth)** 역할을 수행합니다.

```
전통적 접근: 코드 중심 → 문서는 사후 보강
SDD 접근: 명세 중심 → 코드는 명세의 구현체
```

### SDD의 핵심 원칙

#### 1. 명세가 원본(Source)이다
- 코드는 명세의 **표현물(Artifact)**
- 명세와 구현의 간극을 최소화
- 변경 시 명세를 먼저 업데이트

#### 2. 의도와 구현의 분리
- **"무엇을(What)"**: 변하지 않는 의도와 목표
- **"어떻게(How)"**: 유연한 구현 방식
- 스펙 변경 → 플랜 재생성 → 코드 리빌드

#### 3. 검증 중심 개발
- 각 단계마다 검증 후 다음 단계로
- 작은 변경 단위로 리뷰 및 테스트
- 테스트 가능한 작업 단위로 분해

#### 4. 컨텍스트 보존
- 의사결정의 맥락과 이유를 문서화
- AI와의 대화 컨텍스트를 명세로 결정화
- 휘발성 정보를 영구 문서로 변환

---

## 🔄 SDD 4단계 프로세스

### Stage 1: Specify (명세 작성) - "무엇을/왜"

**목적**: 프로젝트의 의도, 목표, 요구사항을 명확히 정의

**산출물**: `/spec/` 디렉토리
- `requirements.md` - 사용자 요구사항, 사용자 여정
- `acceptance-criteria.md` - 성공 기준, 검증 방법
- `constraints.md` - 비기능 요구사항, 제약사항

**작성 원칙**:
- ✅ 사용자 관점에서 작성
- ✅ 기능보다 가치에 집중
- ✅ 구체적인 예시 포함
- ❌ 기술 스택 언급 금지
- ❌ 구현 방법 언급 금지

### Stage 2: Plan (계획 수립) - "어떻게(제약 포함)"

**목적**: 기술적 접근 방법과 아키텍처 결정

**산출물**: `/plan/` 디렉토리
- `architecture.md` - 시스템 구조, 컴포넌트 설계
- `tech-stack.md` - 기술 스택, 라이브러리 선택 이유
- `implementation-strategy.md` - 구현 순서, 우선순위

**작성 원칙**:
- ✅ 기술적 제약사항 명시
- ✅ 아키텍처 결정 이유 기록
- ✅ 보안, 성능, 확장성 고려
- ✅ 기존 시스템과의 통합 방안
- ✅ 레거시 코드 패턴 준수

### Stage 3: Tasks (작업 분해) - "쪼갠 일감"

**목적**: 구현 가능한 작은 단위로 분해

**산출물**: `/tasks/` 디렉토리
- `sprint-N.md` - 스프린트별 작업 목록
- `backlog.md` - 백로그 작업 목록

**작업 크기 기준**:
- ⏱️ **1~3시간 단위** 권장
- ✅ 독립적으로 구현 가능
- ✅ 독립적으로 테스트 가능
- ✅ 명확한 완료 기준 존재

### Stage 4: Implement (구현) - "코드 작성"

**목적**: 작업 단위로 코드 작성 및 검증

**프로세스**:
1. **태스크 선택**: `/tasks/` 에서 하나 선택
2. **새 대화 시작**: 컨텍스트 오염 방지
3. **구현**: AI와 협업하여 코드 작성
4. **테스트**: 단위/통합 테스트 실행
5. **검증**: 완료 기준 충족 확인
6. **커밋**: 작은 단위로 커밋
7. **리뷰**: 코드 리뷰 및 피드백

**구현 원칙**:
- ✅ TDD (Test-Driven Development) 적용
- ✅ Red → Green → Refactor 사이클
- ✅ 최소한의 코드로 테스트 통과
- ✅ 린트/타입 에러 즉시 수정
- ✅ 커밋 메시지에 태스크 ID 포함

---

## 📜 Constitution (프로젝트 헌법)

프로젝트의 **협상 불가능한 원칙**을 정의합니다. 모든 의사결정은 이 원칙에 부합해야 합니다.

### 핵심 가치

1. **사용자 우선**: 모든 기능은 사용자 가치 제공이 목적
2. **투명성**: 의사결정 과정과 이유를 문서화
3. **품질**: 테스트 커버리지 80% 이상 유지
4. **접근성**: WCAG 2.1 AA 준수
5. **성능**: Lighthouse 점수 90+ 유지

### 기술 원칙

1. **TypeScript Strict Mode**: 엄격한 타입 체크
2. **TDD**: 테스트 먼저, 구현 나중
3. **컴포넌트 단일 책임**: 한 가지 역할만 수행
4. **명시적 에러 처리**: try-catch 또는 Error Boundary
5. **반응형 디자인**: 모바일 퍼스트

### 코드 스타일

1. **PascalCase**: 컴포넌트, 타입, 인터페이스
2. **camelCase**: 함수, 변수, 훅
3. **kebab-case**: 파일명, CSS 클래스
4. **UPPER_SNAKE_CASE**: 상수
5. **Import 순서**: React → 외부 라이브러리 → 내부 모듈 → 스타일

### 문서화 원칙

1. **명세 우선**: 구현 전 명세 작성
2. **변경 시 명세 먼저**: 코드 변경 전 명세 업데이트
3. **커밋 메시지**: Conventional Commits 준수
4. **코드 주석**: Why, not What
5. **README**: 프로젝트 시작 가이드 포함

---

## 🤖 AI 협업 규칙 (SDD 적용)

### 언어 원칙

- **모든 출력은 한글로 작성**: 코드 주석, 커밋 메시지, 문서, 대화 응답 모두 한글 사용
- **예외**: 코드 변수명, 함수명, 기술 용어는 영문 유지
- **번역 불필요**: 영문 에러 메시지나 로그는 그대로 인용 가능

### 날짜/시간 원칙

- **기준 시간대**: KST (Korea Standard Time, UTC+9)
- **날짜 표기**: YYYY-MM-DD 형식 (예: 2025-11-27)
- **문서 업데이트 시 현지 날짜 확인 필수**
- **마이그레이션 파일명**: YYYYMMDDHHMMSS 형식 (UTC 기준)

### SOT (Skeleton of Thought) + SDD 통합

모든 작업은 **SDD 4단계 프로세스**를 따르며, SOT로 각 단계를 구조화합니다.

**통합 프로세스**:
```
1. 문제 정의 → Specify (명세 작성)
2. 현황 파악 → Plan (계획 수립)
3. 구조 설계 → Tasks (작업 분해)
4. 영향 범위 → Implement (구현)
5. 검증 계획 → Verify (검증)
```

### 작업 전 체크리스트

#### Specify 단계
- [ ] 사용자 스토리 작성
- [ ] 성공 기준 정의
- [ ] 제약사항 확인
- [ ] 관련 명세 검토

#### Plan 단계
- [ ] 아키텍처 설계 검토
- [ ] 기술 스택 선택 및 기록
- [ ] 구현 전략 수립
- [ ] 보안/성능 고려사항 점검

#### Tasks 단계
- [ ] 작업을 1~3시간 단위로 분해
- [ ] 각 작업의 완료 기준 정의
- [ ] 의존성 관계 파악
- [ ] 우선순위 결정

#### Implement 단계
- [ ] 새 대화(세션) 시작
- [ ] 관련 명세/플랜/태스크 확인
- [ ] TDD 사이클 적용
- [ ] 린트/타입 에러 해결
- [ ] 테스트 통과 확인
- [ ] 커밋 및 푸시

### 작업 후 문서 업데이트 체크리스트

**필수 문서**:
- [ ] `CLAUDE.md` - 프로젝트 현황 업데이트
- [ ] 관련 명세 파일 (`spec/`, `plan/`, `tasks/`)

**중요 문서**:
- [ ] `CHANGELOG.md` - 변경 로그 기록

**버그 픽스 시 필수**:
- [ ] `docs/troubleshooting/bug-fixes-log.md` - 에러 원인과 해결 방법 기록

---

## 🐛 버그 픽스 관리 원칙

### 목적

모든 버그 픽스와 해결 방안을 체계적으로 기록하여, 다음 배포나 작업에 활용할 수 있도록 합니다.

### 기록 대상

1. **프로덕션 에러**: 배포 후 발견된 버그
2. **타입 에러**: TypeScript 컴파일 오류
3. **빌드 에러**: 컴파일 또는 배포 실패
4. **호환성 이슈**: 패키지 간 버전 충돌

### 기록 위치

- **버그 픽스 로그**: `docs/troubleshooting/bug-fixes-log.md`

### 기록 항목

1. **증상**: 발생한 문제
2. **에러 메시지**: 콘솔 로그 또는 에러 내용
3. **원인**: 근본 원인 분석
4. **해결**: 수정 코드
5. **관련 파일**: 수정된 파일 목록
6. **교훈**: 향후 예방을 위한 교훈

### 워크플로우

```
버그 발견 → 원인 분석 → 수정 → 테스트 → bug-fixes-log.md 기록 → 커밋
```

---

### 컨텍스트 관리 원칙

#### 컨텍스트 절식 (Context Isolation)

- **태스크마다 새 대화 시작**: 이전 대화의 오염 방지
- **명세 참조로 컨텍스트 제공**: 대화 히스토리 대신 명세 파일 공유
- **관련 파일만 공유**: 전체 코드베이스가 아닌 필요한 파일만

#### 컨텍스트 제공 방법

```markdown
# 새 대화 시작 시 제공할 정보

1. 관련 명세: spec/requirements.md#feature-name
2. 관련 플랜: plan/architecture.md#component-structure
3. 현재 태스크: tasks/sprint-N.md#task-ID
4. 관련 파일: packages/ui/src/components/Button.tsx
5. Constitution: CLAUDE.md#constitution
```

---

## 🔢 버전 관리

**현재 버전**: 0.1.0
**형식**: Major.Minor.Patch ([Semantic Versioning 2.0.0](https://semver.org/lang/ko/))

### 버전 형식

```
MAJOR.MINOR.PATCH[-PRERELEASE]

예시:
- 0.1.0          : 초기 개발 버전
- 0.2.0-beta.1   : 베타 테스트 버전
- 1.0.0-rc.1     : 정식 출시 릴리스 후보
- 1.0.0          : 정식 출시 (GA)
```

### 버전 업 기준

| 버전 | 변경 기준 | 승인 |
|------|-----------|------|
| **Major (X.0.0)** | Breaking Changes, 하위 호환성을 깨는 변경 | ⚠️ 사용자 승인 필수 |
| **Minor (0.X.0)** | 새로운 기능 추가 (하위 호환) | 자동 |
| **Patch (0.0.X)** | 버그 수정, 문서 업데이트, Hotfix | 자동 |

### Pre-release 태그

| 태그 | 용도 | 안정성 |
|------|------|--------|
| `-alpha.N` | 내부 개발 버전 | 불안정 |
| `-beta.N` | 베타 테스트 버전 | 준안정 |
| `-rc.N` | 릴리스 후보 | 안정 |

### 버전 라이프사이클

```
MVP (0.x.0) → Beta (0.x.0-beta.N) → RC (1.0.0-rc.N) → GA (1.0.0)
```

### Changesets 사용법

```bash
# 변경사항 기록
pnpm changeset

# 버전 업데이트
pnpm changeset version

# 배포
pnpm changeset publish

# Pre-release (Beta/RC)
pnpm changeset pre enter beta  # 또는 rc
pnpm changeset version
pnpm changeset publish
pnpm changeset pre exit
```

### Git 태그 규칙

```bash
# 형식: v{VERSION}
git tag -a v0.1.0 -m "초기 릴리스"
git push origin v0.1.0
```

### 릴리스 프로세스

1. **PR 생성 시**: 린트 + 타입 체크 + 유닛 테스트
2. **main 머지 시**: 빌드 + 버전 범프 + GitHub Packages 배포
3. **릴리스 태그 시**: Changelog 생성 + Release Notes 자동 작성

### 관련 문서

- **[spec/constraints.md](spec/constraints.md#6-버전-관리-제약사항)** - 버전 형식 및 태그 규칙
- **[spec/acceptance-criteria.md](spec/acceptance-criteria.md#4-릴리스-단계별-출시-조건)** - 출시 조건
- **[plan/implementation-strategy.md](plan/implementation-strategy.md#7-릴리스-프로세스)** - 릴리스 프로세스 상세
- **[spec/version-policy.md](spec/version-policy.md)** - Minu 전체 서비스 버전 정책 (참조용)

---

## 📊 개발 로드맵

### Phase별 계획

| Phase | 기간 | 내용 | 상태 |
|-------|------|------|------|
| **Phase 1** | Week 1 | 프로젝트 세팅, 디자인 토큰, 기본 컴포넌트 | 🔄 진행 중 |
| **Phase 2** | Week 2 | 레이아웃 컴포넌트, 피드백 컴포넌트 | ⏳ 대기 |
| **Phase 3** | Week 3 | API 클라이언트, 인증 유틸리티, 공유 타입 | ⏳ 대기 |
| **Phase 4** | Week 4 | CI/CD 파이프라인, 문서화, v1.0.0 릴리스 | ⏳ 대기 |

### Phase 1 상세 태스크

- [x] 모노레포 세팅 (pnpm workspaces)
- [x] TypeScript 설정
- [x] SDD 문서 구조 (spec/, plan/, tasks/)
- [x] GitHub 연동
- [x] packages/ 폴더 구조 정비
- [x] Button 컴포넌트 (기본 구현)
- [x] Input 컴포넌트 (기본 구현)
- [x] Card 컴포넌트 (기본 구현)
- [x] cn 유틸리티 (clsx + tailwind-merge)
- [x] API 클라이언트 (기본 구현)
- [x] JWT 유틸리티 (기본 구현)
- [x] 포맷팅 유틸리티 (기본 구현)
- [x] User, API 타입 정의
- [ ] Tailwind 디자인 토큰 정의
- [ ] 컴포넌트 테스트 작성
- [ ] 빌드 검증

---

## 📚 참고 문서

### SDD 문서
- **[spec/requirements.md](spec/requirements.md)** - 사용자 요구사항
- **[spec/acceptance-criteria.md](spec/acceptance-criteria.md)** - 인수 조건
- **[spec/constraints.md](spec/constraints.md)** - 제약사항
- **[plan/architecture.md](plan/architecture.md)** - 아키텍처 설계
- **[plan/tech-stack.md](plan/tech-stack.md)** - 기술 스택
- **[plan/implementation-strategy.md](plan/implementation-strategy.md)** - 구현 전략
- **[tasks/sprint-1.md](tasks/sprint-1.md)** - Sprint 1 태스크
- **[tasks/backlog.md](tasks/backlog.md)** - 백로그

### 프로젝트 문서
- **[minu-shared-기획서.md](minu-shared-기획서.md)** - 전체 기획서
- **[CHANGELOG.md](CHANGELOG.md)** - 변경 이력
- **[README.md](README.md)** - 패키지 사용 가이드
- **[docs/troubleshooting/bug-fixes-log.md](docs/troubleshooting/bug-fixes-log.md)** - 버그 픽스 로그

### 외부 참고
- [TypeScript 문서](https://www.typescriptlang.org/docs/)
- [React 문서](https://react.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [pnpm 문서](https://pnpm.io/)
- [Turborepo 문서](https://turbo.build/repo)

---

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
