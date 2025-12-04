# Minu 서비스 연동 가이드

> @idea-on-action 패키지 설치 및 연동 방법

---

## 패키지 정보

| 패키지 | 버전 | 설명 |
|--------|------|------|
| `@idea-on-action/ui` | 1.1.0 | React UI 컴포넌트 |
| `@idea-on-action/utils` | 1.0.0 | 유틸리티 함수 |
| `@idea-on-action/types` | 1.0.1 | TypeScript 타입 정의 |

---

## 1. .npmrc 설정

프로젝트 루트에 `.npmrc` 파일 생성:

```ini
@idea-on-action:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

> **Note**: `GITHUB_TOKEN`은 환경변수로 설정하거나, 실제 토큰 값으로 대체하세요.

---

## 2. 패키지 설치

```bash
# 전체 설치
pnpm add @idea-on-action/ui @idea-on-action/utils @idea-on-action/types

# 개별 설치
pnpm add @idea-on-action/ui
pnpm add @idea-on-action/utils
pnpm add @idea-on-action/types
```

---

## 3. 코드에서 사용

### UI 컴포넌트

```tsx
import { Button, Card, Input, Modal, Toast } from '@idea-on-action/ui';
import '@idea-on-action/ui/styles.css';

function MyComponent() {
  return (
    <Card>
      <Input placeholder="이메일" />
      <Button variant="primary">로그인</Button>
    </Card>
  );
}
```

### 유틸리티 함수

```tsx
import { formatDate, parseJWT, isTokenExpired } from '@idea-on-action/utils';

const token = getAccessToken();
const payload = parseJWT(token);
const expired = isTokenExpired(token);
```

### 타입 정의

```tsx
import type { User, Project, Subscription } from '@idea-on-action/types';

interface Props {
  user: User;
  projects: Project[];
}
```

---

## 4. Tailwind CSS 설정

### tailwind.config.ts

```ts
import { minuPreset } from '@idea-on-action/ui/tailwind';

export default {
  presets: [minuPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@idea-on-action/ui/**/*.{js,ts,jsx,tsx}',
  ],
};
```

---

## 5. 기존 @minu/* 패키지에서 마이그레이션

### 5.1 패키지 교체

```bash
# 기존 패키지 제거
pnpm remove @minu/ui @minu/utils @minu/types

# 새 패키지 설치
pnpm add @idea-on-action/ui @idea-on-action/utils @idea-on-action/types
```

### 5.2 import 문 일괄 변경

VS Code에서 전체 검색/치환 (Ctrl+Shift+H):

| 검색 | 치환 |
|------|------|
| `@minu/ui` | `@idea-on-action/ui` |
| `@minu/utils` | `@idea-on-action/utils` |
| `@minu/types` | `@idea-on-action/types` |

### 5.3 .npmrc 수정

```ini
# 변경 전
@minu:registry=https://npm.pkg.github.com

# 변경 후
@idea-on-action:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

---

## 6. 서비스별 체크리스트

### Portal / Find / Frame / Build / Keep

- [ ] `.npmrc` 파일 생성/수정
- [ ] 기존 `@minu/*` 패키지 제거 (해당시)
- [ ] `@idea-on-action/*` 패키지 설치
- [ ] 모든 import 문 수정
- [ ] `tailwind.config.ts` 수정
- [ ] `pnpm install` 실행
- [ ] `pnpm build` 성공 확인

---

## 7. 문제 해결

### 패키지를 찾을 수 없는 경우

```bash
# .npmrc 확인
cat .npmrc

# 캐시 삭제 후 재설치
pnpm store prune
pnpm install
```

### 권한 오류 (401/403)

1. `.npmrc`에 토큰이 올바르게 설정되어 있는지 확인
2. 토큰 만료 여부 확인
3. GitHub 조직(IDEA-on-Action) 멤버십 확인

---

## 8. GitHub Actions CI/CD

```yaml
name: Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'

      - name: Install dependencies
        run: pnpm install
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Build
        run: pnpm build
```

---

**최종 업데이트**: 2025-11-30
