# 기술 스택 (Tech Stack)

> minu-shared 패키지에서 사용하는 기술 스택 및 선택 이유

**문서 버전**: 1.0.0
**작성일**: 2025-11-27

---

## 1. Core 기술

### 1.1 TypeScript 5.3+

**선택 이유**:
- 강력한 타입 시스템으로 런타임 오류 방지
- IDE 자동완성 및 리팩토링 지원
- 공유 패키지 특성상 타입 안전성 필수

**설정**:
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx"
  }
}
```

### 1.2 React 18/19

**선택 이유**:
- Minu 서비스들이 React 기반
- Concurrent Features 지원
- Server Components 호환성

### 1.3 Tailwind CSS 3.4+

**선택 이유**:
- 유틸리티 퍼스트 CSS로 빠른 스타일링
- 디자인 토큰 기반 일관성
- 트리 쉐이킹으로 최적화된 번들 크기

---

## 2. 빌드 도구

### 2.1 pnpm 8+

**선택 이유**:
- 디스크 공간 효율적 (심볼릭 링크)
- Monorepo 워크스페이스 네이티브 지원
- 빠른 설치 속도

### 2.2 tsup

**선택 이유**:
- esbuild 기반 빠른 빌드
- TypeScript 선언 파일 자동 생성
- CJS/ESM 동시 출력 간편

**설정**:
```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
});
```

### 2.3 Changesets

**선택 이유**:
- Monorepo 버전 관리에 최적화
- 자동 CHANGELOG 생성
- GitHub Actions 통합

---

## 3. 유틸리티 라이브러리

### 3.1 clsx + tailwind-merge

**용도**: 조건부 클래스 병합

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**선택 이유**:
- Tailwind 클래스 충돌 자동 해결
- 조건부 클래스 깔끔한 문법

---

## 4. 개발 도구

### 4.1 ESLint

**설정**: @typescript-eslint 플러그인

### 4.2 Prettier

**설정**:
- singleQuote: true
- trailingComma: 'es5'

---

## 5. CI/CD

### 5.1 GitHub Actions

**워크플로우**:
1. PR 생성 시: lint, type-check, test
2. main 머지 시: build, publish

### 5.2 GitHub Packages

**선택 이유**:
- GitHub 통합 인증
- 프라이빗 패키지 지원
- Actions와 원활한 연동

---

## 6. 버전 정보

| 도구 | 현재 버전 | 최소 버전 |
|------|----------|----------|
| Node.js | - | 18.0.0 |
| pnpm | 8.15.0 | 8.0.0 |
| TypeScript | 5.3.3 | 5.0.0 |
| React | - | 18.0.0 |
| Tailwind CSS | - | 3.4.0 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2025-11-27 | 최초 작성 |
