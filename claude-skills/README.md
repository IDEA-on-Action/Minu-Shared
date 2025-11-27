# Claude Skills

> Minu 시리즈 전체에서 사용하는 Claude Skills 중앙 관리

**최종 업데이트**: 2025-11-27

---

## 개요

Claude Skills는 AI 협업 시 일관된 컨텍스트와 규칙을 제공하는 모듈화된 지식 문서입니다.
SDD(Spec-Driven Development)의 **컨텍스트 보존** 원칙을 실현합니다.

```
SDD + Claude Skills = 효율적인 AI 협업
```

---

## 폴더 구조

```
claude-skills/
├── minu-core/           # 공통 핵심 규칙 (모든 프로젝트 필수)
├── minu-sdd/            # SDD 방법론 (기획/설계 작업 시)
├── minu-shared/         # 공유 패키지 가이드 (컴포넌트 개발 시)
├── minu-portal/         # Portal 전용 (minu.best)
├── minu-find/           # Find 전용 (find.minu.best)
├── minu-frame/          # Frame 전용 (frame.minu.best)
├── minu-build/          # Build 전용 (build.minu.best)
└── minu-keep/           # Keep 전용 (keep.minu.best)
```

---

## Skill 계층 구조

```
┌─────────────────────────────────────────────────────┐
│                    minu-core                         │  ← 모든 프로젝트 공통
│  (언어, 코드 컨벤션, 품질 기준, 브랜드)               │
└─────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ minu-sdd │    │  minu-   │    │  minu-   │
    │(방법론)  │    │ shared   │    │ {서비스} │
    └──────────┘    │(패키지)  │    │(Portal,  │
                    └──────────┘    │Find 등)  │
                                    └──────────┘
```

---

## 적용 방법

### 1. Claude Project Custom Instructions

```markdown
## Skills 참조

작업 시 아래 GitHub Raw URL의 Skills를 참조하세요:

- Core: https://raw.githubusercontent.com/IDEA-on-Action/Minu-Shared/main/claude-skills/minu-core/SKILL.md
- SDD: https://raw.githubusercontent.com/IDEA-on-Action/Minu-Shared/main/claude-skills/minu-sdd/SKILL.md
- Shared: https://raw.githubusercontent.com/IDEA-on-Action/Minu-Shared/main/claude-skills/minu-shared/SKILL.md
```

### 2. Claude Project Knowledge 업로드

Claude Project > Settings > Knowledge에서 SKILL.md 파일 직접 업로드

### 3. 대화 시작 시 참조

```markdown
# 작업 컨텍스트

참조 Skills:
- minu-core: 공통 규칙
- minu-sdd: SDD 방법론
- minu-shared: 공유 패키지 가이드
```

---

## Skill 목록

| Skill | 파일 | 용도 | 적용 대상 |
|-------|------|------|----------|
| `minu-core` | [SKILL.md](minu-core/SKILL.md) | 언어, 코드 컨벤션, 품질 기준 | **모든 프로젝트 (필수)** |
| `minu-sdd` | [SKILL.md](minu-sdd/SKILL.md) | SDD 방법론, 문서 구조 | 기획/설계 작업 |
| `minu-shared` | [SKILL.md](minu-shared/SKILL.md) | 공유 컴포넌트/유틸 가이드 | 패키지 개발 |
| `minu-portal` | [SKILL.md](minu-portal/SKILL.md) | Portal 특화 규칙 | minu.best |
| `minu-find` | [SKILL.md](minu-find/SKILL.md) | Find 특화 규칙 | find.minu.best |
| `minu-frame` | [SKILL.md](minu-frame/SKILL.md) | Frame 특화 규칙 | frame.minu.best |
| `minu-build` | [SKILL.md](minu-build/SKILL.md) | Build 특화 규칙 | build.minu.best |
| `minu-keep` | [SKILL.md](minu-keep/SKILL.md) | Keep 특화 규칙 | keep.minu.best |

---

## SDD와 Skills 연동

### SDD 4단계와 Skills 매핑

| SDD 단계 | 관련 Skills | 역할 |
|----------|-------------|------|
| **Specify** (명세) | `minu-sdd` | 문서 구조, 작성 원칙 |
| **Plan** (계획) | `minu-core`, `minu-sdd` | 기술 제약, 아키텍처 결정 |
| **Tasks** (작업) | `minu-sdd` | 작업 분해, 우선순위 |
| **Implement** (구현) | `minu-core`, `minu-shared`, `minu-{서비스}` | 코드 컨벤션, 컴포넌트 가이드 |

### 작업별 Skills 조합

| 작업 유형 | 권장 Skills 조합 |
|----------|-----------------|
| 기획/설계 | `minu-core` + `minu-sdd` |
| 공유 패키지 개발 | `minu-core` + `minu-shared` |
| Portal 개발 | `minu-core` + `minu-portal` |
| Find 개발 | `minu-core` + `minu-shared` + `minu-find` |
| 버그 수정 | `minu-core` + `minu-sdd` (버그 픽스 기록) |

---

## Skill 수정 가이드

### 1. 수정 프로세스

```
1. claude-skills/{skill-name}/SKILL.md 편집
2. 버전/날짜 업데이트 (파일 상단)
3. PR 생성 및 리뷰
4. main 머지 → 자동 반영
```

### 2. 버전 관리

각 SKILL.md 상단에 명시:

```markdown
**버전**: 1.0.0
**최종 수정**: 2025-11-27
```

### 3. 변경 원칙

- **minu-core**: 신중하게 변경 (모든 프로젝트 영향)
- **minu-sdd**: 방법론 개선 시 업데이트
- **서비스별 Skills**: 해당 서비스 요구사항에 맞게 자유롭게 업데이트

---

## 관련 문서

- [CLAUDE.md](../CLAUDE.md) - 프로젝트 개요
- [spec/](../spec/) - SDD 명세 문서
- [plan/](../plan/) - SDD 계획 문서
- [tasks/](../tasks/) - SDD 작업 문서
