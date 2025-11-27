# Minu Core Skill

> Minu 시리즈 전체에 적용되는 핵심 규칙

**버전**: 1.1.0
**최종 수정**: 2025-11-27

---

## 언어 원칙

- **모든 출력은 한글로 작성**: 코드 주석, 커밋 메시지, 문서, 대화 응답
- **예외**: 코드 변수명, 함수명, 기술 용어는 영문 유지
- **시간대**: KST (Korea Standard Time, UTC+9)
- **날짜 형식**: YYYY-MM-DD (예: 2025-11-27)

---

## 브랜드 정보

| 항목 | 내용 |
|------|------|
| 사이트명 | Minu (미누) |
| 슬로건 | "작은 시작, 큰 기회" |
| 부모 서비스 | 생각과 행동 (ideaonaction.ai) |

### 도메인 구조

| 서비스 | 도메인 | 역할 |
|--------|--------|------|
| Portal | minu.best | 마케팅 랜딩 (정적) |
| Find | find.minu.best | 프로젝트 기회 탐색 |
| Frame | frame.minu.best | AI 제안서 작성 |
| Build | build.minu.best | 프로젝트 진행 관리 |
| Keep | keep.minu.best | 유지보수 운영 |

---

## 코드 컨벤션

### 네이밍

| 대상 | 스타일 | 예시 |
|------|--------|------|
| 컴포넌트, 타입, 인터페이스 | PascalCase | `ServiceCard`, `UserProfile` |
| 함수, 변수, 훅 | camelCase | `handleClick`, `useState` |
| 파일명, CSS 클래스 | kebab-case | `service-card.tsx` |
| 상수 | UPPER_SNAKE_CASE | `API_BASE_URL` |

### Import 순서

```typescript
// 1. React/Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. 외부 라이브러리
import { motion } from 'framer-motion';

// 3. 내부 모듈 (절대 경로)
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// 4. 타입
import type { ServiceType } from '@/types';

// 5. 스타일 (필요시)
import styles from './Component.module.css';
```

### Import Alias

```
@/ → ./src/
```

---

## 기술 원칙

1. **TypeScript Strict Mode**: 엄격한 타입 체크 필수
2. **컴포넌트 단일 책임**: 한 컴포넌트는 한 가지 역할만
3. **명시적 에러 처리**: try-catch 또는 Error Boundary 사용
4. **반응형 디자인**: 모바일 퍼스트 접근

---

## 품질 기준

| 지표 | 목표 |
|------|------|
| Lighthouse Performance | 95+ |
| Lighthouse Accessibility | 95+ |
| TypeScript 에러 | 0 |
| ESLint 경고 | 0 |
| 접근성 | WCAG 2.1 AA 준수 |

---

## 디자인 토큰

### 컬러 팔레트

| 용도 | 컬러명 | Hex |
|------|--------|-----|
| Primary | Deep Blue | `#2563EB` |
| Secondary | Mint Green | `#10B981` |
| Accent | Amber | `#F59E0B` |
| Background | White/Gray | `#FFFFFF` / `#F9FAFB` |
| Text | Dark Gray | `#111827` |

### 서비스별 컬러

| 서비스 | 아이콘 | 컬러 | Hex |
|--------|--------|------|-----|
| Find | 🔍 | Blue | `#3B82F6` |
| Frame | 📝 | Green | `#10B981` |
| Build | 🏗️ | Orange | `#F59E0B` |
| Keep | 🛡️ | Purple | `#8B5CF6` |

---

## 커밋 메시지

Conventional Commits 준수:

```
<type>: <description>

[optional body]
```

| Type | 설명 | 버전 영향 |
|------|------|----------|
| `feat` | 새로운 기능 | Minor ⬆️ |
| `fix` | 버그 수정 | Patch ⬆️ |
| `docs` | 문서 변경 | - |
| `style` | 코드 포맷팅 | - |
| `refactor` | 리팩토링 | - |
| `perf` | 성능 개선 | Patch ⬆️ |
| `test` | 테스트 | - |
| `chore` | 빌드/설정 | - |

---

## 버전 관리

### Semantic Versioning

Minu 시리즈는 **Semantic Versioning 2.0.0**을 따릅니다.

```
MAJOR.MINOR.PATCH[-PRERELEASE]
```

### 버전 단계

| 버전 범위 | 단계 | 설명 |
|-----------|------|------|
| `0.1.x ~ 0.6.x` | 개발 | 내부 개발 단계 |
| `0.7.x` | MVP | 최소 기능 제품 완성 |
| `0.8.x` | Closed Beta | 제한된 사용자 테스트 |
| `0.9.x` | Open Beta | 공개 베타 서비스 |
| `1.0.0` | 정식 출시 | 프로덕션 릴리즈 |
| `1.x.x+` | 운영 | 지속적 개선 |

### Pre-release 태그

| 태그 | 용도 | 예시 |
|------|------|------|
| `-alpha.N` | 내부 테스트 | `0.7.0-alpha.1` |
| `-beta.N` | 베타 테스트 | `0.9.0-beta.1` |
| `-rc.N` | 출시 후보 | `1.0.0-rc.1` |

### Git 태깅 규칙

- **형식**: `v{VERSION}` (v 접두사 필수)
- **예시**: `v0.9.0-beta.1`, `v1.0.0`
- **태그 메시지**: 릴리즈 하이라이트 포함

```bash
git tag -a v0.9.0-beta.1 -m "MVP 베타 출시"
git push origin v0.9.0-beta.1
```

### 버전 증가 규칙

| 변경 유형 | 버전 증가 | 예시 |
|-----------|----------|------|
| Breaking Change | Major | `1.0.0` → `2.0.0` |
| 새 기능 (`feat`) | Minor | `0.9.0` → `0.10.0` |
| 버그 수정 (`fix`) | Patch | `0.9.0` → `0.9.1` |
| 베타 업데이트 | Pre-release | `0.9.0-beta.1` → `0.9.0-beta.2` |

### 버전 동기화

- `package.json`의 `version` 필드와 Git 태그 일치 필수
- CHANGELOG.md에 변경 이력 기록
- CLAUDE.md에 현재 버전 상태 반영

---

## 작업 체크리스트

### 코드 작성 전
- [ ] 관련 Skill 문서 확인
- [ ] 기존 컴포넌트/유틸리티 재사용 가능 여부 확인

### 코드 작성 후
- [ ] TypeScript 에러 0개
- [ ] ESLint 경고 0개
- [ ] 반응형 확인 (모바일/태블릿/데스크톱)
- [ ] 접근성 확인 (키보드 네비게이션, 스크린리더)

---

## 금지 사항

- ❌ `any` 타입 사용 (불가피한 경우 주석으로 사유 명시)
- ❌ `console.log` 프로덕션 코드에 남기기
- ❌ 인라인 스타일 (Tailwind 사용)
- ❌ 하드코딩된 문자열 (상수로 분리)
