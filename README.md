# Minu Shared Packages

Minu 서비스(Find, Frame, Build, Keep) 공용 패키지 모음

## 📦 패키지 목록

| 패키지 | 설명 | 버전 |
|--------|------|------|
| `@idea-on-action/ui` | 공용 UI 컴포넌트 | 1.1.0 |
| `@idea-on-action/utils` | 유틸리티 함수 | 1.0.0 |
| `@idea-on-action/types` | TypeScript 타입 정의 | 1.0.1 |

## 🚀 설치 방법

### 1. GitHub Packages 인증 설정

프로젝트 루트에 `.npmrc` 파일 생성:

```bash
@idea-on-action:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 2. 패키지 설치

```bash
# 모든 패키지 설치
pnpm add @idea-on-action/ui @idea-on-action/utils @idea-on-action/types

# 개별 설치
pnpm add @idea-on-action/ui
pnpm add @idea-on-action/utils
pnpm add @idea-on-action/types
```

## 📖 사용법

### @idea-on-action/ui

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@idea-on-action/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>제목</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default" onClick={() => alert('클릭!')}>
          클릭하세요
        </Button>
      </CardContent>
    </Card>
  );
}
```

### @idea-on-action/utils

```tsx
import { createApiClient, formatCurrency, parseJWT } from '@idea-on-action/utils';

// API 클라이언트
const api = createApiClient({
  baseUrl: 'https://ideaonaction.ai',
  getAccessToken: () => localStorage.getItem('token'),
});

const user = await api.getUser();

// 포맷팅
formatCurrency(1234567); // "1,234,567원"
formatCurrency(1234567, { short: true }); // "123만원"

// JWT 파싱
const payload = parseJWT(token);
console.log(payload?.email);
```

### @idea-on-action/types

```tsx
import type { User, Subscription, JWTPayload, ApiResponse } from '@idea-on-action/types';

function handleUser(user: User) {
  console.log(user.email);
}

function handleResponse<T>(response: ApiResponse<T>) {
  if (response.success) {
    console.log(response.data);
  } else {
    console.error(response.error.message);
  }
}
```

## 🛠️ 개발

### 설치

```bash
pnpm install
```

### 빌드

```bash
# 모든 패키지 빌드
pnpm build

# 개발 모드 (watch)
pnpm dev
```

### 로컬 테스트 (npm link)

```bash
# minu-shared에서
cd packages/ui
pnpm link --global

# minu-find에서
pnpm link --global @idea-on-action/ui
```

## 📤 배포

`main` 브랜치에 푸시하면 GitHub Actions가 자동으로 패키지를 배포합니다.

### 수동 버전 업데이트

```bash
# 버전 변경 (각 패키지에서)
cd packages/ui
npm version patch  # 0.1.0 → 0.1.1

# 또는 수동으로 package.json 수정 후 커밋
```

## 📁 구조

```
minu-shared/
├── packages/
│   ├── ui/                 # @idea-on-action/ui
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsup.config.ts
│   ├── utils/              # @idea-on-action/utils
│   │   ├── src/
│   │   │   ├── api-client.ts
│   │   │   ├── jwt.ts
│   │   │   ├── format.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── types/              # @idea-on-action/types
│       ├── src/
│       │   ├── user.ts
│       │   ├── api.ts
│       │   └── index.ts
│       └── package.json
├── .github/
│   └── workflows/
│       └── publish.yml
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## 🔗 관련 프로젝트

- [minu-portal](https://github.com/IDEA-on-Action/minu-portal) - minu.best
- [minu-find](https://github.com/IDEA-on-Action/minu-find) - find.minu.best
- [minu-frame](https://github.com/IDEA-on-Action/minu-frame) - frame.minu.best
