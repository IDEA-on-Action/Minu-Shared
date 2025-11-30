# Minu Shared Packages

> Claude 협업용 프로젝트 핵심 문서

**버전**: 1.1.0 | **상태**: Phase 5 완료 | **방법론**: SSDD (Skillful SDD)

---

## 프로젝트 개요

Minu 서비스(Find, Frame, Build, Keep) 간 공유 패키지 모노레포

| 패키지 | 역할 |
|--------|------|
| **@minu/ui** | React UI 컴포넌트 (23개), 훅(7개), 프리미티브(4개) |
| **@minu/utils** | API 클라이언트, JWT, 검증, 타이밍, ID 생성 유틸리티 |
| **@minu/types** | User, Project, Proposal, Subscription 타입 |

---

## 주요 명령어

```bash
pnpm dev           # 개발 모드
pnpm build         # 빌드
pnpm test          # 테스트
pnpm lint          # 린트
pnpm type-check    # 타입 체크
pnpm changeset     # 변경사항 기록
pnpm docs          # TypeDoc 문서 생성
pnpm storybook     # Storybook 실행 (localhost:6006)
```

---

## 프로젝트 구조

```
minu-shared/
├── packages/
│   ├── ui/          # @minu/ui
│   ├── utils/       # @minu/utils
│   └── types/       # @minu/types
├── spec/            # SDD 명세
├── plan/            # SDD 계획
├── tasks/           # SDD 작업
└── claude-skills/   # AI 협업 Skills
```

---

## SSDD (Skillful SDD) 방법론

**SDD 4단계**: Specify → Plan → Tasks → Implement

| 단계 | 산출물 | 목적 |
|------|--------|------|
| Specify | `/spec/` | 요구사항, 인수조건, 제약사항 |
| Plan | `/plan/` | 아키텍처, 기술스택, 구현전략 |
| Tasks | `/tasks/` | 스프린트, 백로그 |
| Implement | 코드 | TDD 기반 구현 |

**Skills**: [claude-skills/](claude-skills/) 참조

---

## 코드 컨벤션

| 대상 | 규칙 |
|------|------|
| 컴포넌트/타입 | PascalCase |
| 함수/변수 | camelCase |
| 파일명 | kebab-case |
| 상수 | UPPER_SNAKE_CASE |

**원칙**:
- TypeScript Strict Mode
- TDD (Red → Green → Refactor)
- Conventional Commits
- 한글 출력 (코드 제외)

---

## 개발 로드맵

```
Phase 1 ██████████████████████ 100% 기반 구축 ✅
Phase 2 ██████████████████████ 100% 컴포넌트 확장 ✅
Phase 3 ██████████████████████ 100% 유틸리티 확장 ✅
Phase 4 ██████████████████████ 100% 배포 & 문서화 ✅
Phase 5 ██████████████████████ 100% 컴포넌트 보강 (v1.1.0) ✅
```

**상세**: [plan/roadmap.md](plan/roadmap.md)

---

## 주요 문서

| 구분 | 문서 |
|------|------|
| **SDD** | [spec/](spec/), [plan/](plan/), [tasks/](tasks/) |
| **Skills** | [claude-skills/README.md](claude-skills/README.md) |
| **변경로그** | [CHANGELOG.md](CHANGELOG.md) |

---

## AI 협업 규칙

1. **언어**: 모든 출력은 한글 (코드 변수명 제외)
2. **날짜**: KST 기준, YYYY-MM-DD 형식
3. **컨텍스트**: 태스크마다 새 대화, 명세 파일 참조
4. **버그픽스**: [docs/troubleshooting/bug-fixes-log.md](docs/troubleshooting/bug-fixes-log.md) 기록

---

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
