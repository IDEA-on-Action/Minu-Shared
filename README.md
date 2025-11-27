# Minu Shared Packages

Minu 서비스(Find, Frame, Build, Keep) 공용 패키지 모음

## 📦 패키지 목록

| 패키지 | 설명 | 버전 |
|--------|------|------|
| `@minu/ui` | 공용 UI 컴포넌트 | 0.1.0 |
| `@minu/utils` | 유틸리티 함수 | 0.1.0 |
| `@minu/types` | TypeScript 타입 정의 | 0.1.0 |

## 🚀 설치 방법

### 1. GitHub Packages 인증 설정

프로젝트 루트에 `.npmrc` 파일 생성:

```bash
@minu:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 2. 패키지 설치

```bash
# 모든 패키지 설치
pnpm add @minu/ui @minu/utils @minu/types

# 개별 설치
pnpm add @minu/ui
pnpm add @minu/utils
pnpm add @minu/types
```

## 📖 사용법

### @minu/ui

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@minu/ui';

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

### @minu/utils

```tsx
import { createApiClient, formatCurrency, parseJWT } from '@minu/utils';

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

### @minu/types

```tsx
import type { User, Subscription, JWTPayload, ApiResponse } from '@minu/types';

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
pnpm link --global @minu/ui
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
│   ├── ui/                 # @minu/ui
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsup.config.ts
│   ├── utils/              # @minu/utils
│   │   ├── src/
│   │   │   ├── api-client.ts
│   │   │   ├── jwt.ts
│   │   │   ├── format.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── types/              # @minu/types
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
