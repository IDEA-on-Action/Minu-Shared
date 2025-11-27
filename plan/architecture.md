# 아키텍처 (Architecture)

> minu-shared 패키지의 시스템 구조 및 컴포넌트 설계

**문서 버전**: 1.0.0
**작성일**: 2025-11-27

---

## 1. 시스템 구조

### 1.1 전체 아키텍처

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

### 1.2 패키지 의존성

```
@minu/ui ──────────► @minu/types
    │
    └──────────────► @minu/utils (cn 함수만)

@minu/utils ───────► @minu/types

@minu/types ───────► (외부 의존성 없음)
```

---

## 2. 패키지 구조

### 2.1 @minu/ui

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── CardHeader.tsx
│   │   │   ├── CardTitle.tsx
│   │   │   ├── CardContent.tsx
│   │   │   ├── CardFooter.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── hooks/
│   │   └── index.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

### 2.2 @minu/utils

```
packages/utils/
├── src/
│   ├── api/
│   │   ├── api-client.ts
│   │   └── index.ts
│   ├── auth/
│   │   ├── jwt.ts
│   │   └── index.ts
│   ├── format/
│   │   ├── format.ts
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

### 2.3 @minu/types

```
packages/types/
├── src/
│   ├── user.ts
│   ├── api.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

---

## 3. 컴포넌트 설계 패턴

### 3.1 Compound Component 패턴

Card 컴포넌트 예시:

```tsx
// 사용 예
<Card>
  <Card.Header>
    <Card.Title>제목</Card.Title>
  </Card.Header>
  <Card.Content>내용</Card.Content>
  <Card.Footer>푸터</Card.Footer>
</Card>
```

### 3.2 forwardRef 패턴

DOM 접근이 필요한 컴포넌트:

```tsx
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

---

## 4. 빌드 설정

### 4.1 tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});
```

### 4.2 출력 형식

| 형식 | 파일 | 용도 |
|------|------|------|
| CommonJS | dist/index.js | Node.js, 레거시 |
| ES Modules | dist/index.mjs | 모던 번들러 |
| TypeScript | dist/index.d.ts | 타입 선언 |

---

## 5. 배포 아키텍처

```
GitHub Repository
       │
       ▼ (push to main)
GitHub Actions
       │
       ├── lint
       ├── type-check
       ├── test
       ├── build
       │
       ▼
GitHub Packages (npm.pkg.github.com)
       │
       ▼ (pnpm add @minu/*)
Minu Services
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2025-11-27 | 최초 작성 |
