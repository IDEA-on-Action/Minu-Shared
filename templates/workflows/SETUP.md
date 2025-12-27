# Cloudflare CI/CD 설정 가이드

각 Minu 서비스에 Cloudflare CI/CD를 설정하는 단계별 가이드입니다.

---

## 1. Cloudflare 계정 설정

### 1.1 Cloudflare 대시보드 접속

1. https://dash.cloudflare.com 접속
2. 계정 생성 또는 로그인

### 1.2 API 토큰 생성

1. **My Profile** > **API Tokens** 클릭
2. **Create Token** 클릭
3. **Create Custom Token** 선택
4. 다음 권한 설정:

```
Token name: minu-github-actions

Permissions:
- Account > Workers Scripts > Edit
- Account > Workers KV Storage > Edit
- Account > D1 > Edit
- Account > Workers R2 Storage > Edit
- Account > Cloudflare Pages > Edit
- Zone > Workers Routes > Edit

Account Resources:
- Include > All accounts

Zone Resources:
- Include > Specific zone > minu.best
```

5. **Continue to summary** > **Create Token**
6. 토큰 복사 (다시 볼 수 없음!)

### 1.3 Account ID 확인

1. Cloudflare 대시보드 > **Workers & Pages**
2. 오른쪽 사이드바에서 **Account ID** 복사

---

## 2. Cloudflare 리소스 생성

### 2.1 D1 데이터베이스 생성

```bash
# Wrangler CLI 설치
npm install -g wrangler

# 로그인
wrangler login

# 데이터베이스 생성
wrangler d1 create minu-find-staging
wrangler d1 create minu-find

# 생성된 database_id 기록
```

### 2.2 KV 네임스페이스 생성

```bash
# Staging
wrangler kv:namespace create SESSION_KV --env staging
wrangler kv:namespace create CACHE_KV --env staging

# Production
wrangler kv:namespace create SESSION_KV
wrangler kv:namespace create CACHE_KV

# 생성된 id 기록
```

### 2.3 R2 버킷 생성

```bash
wrangler r2 bucket create minu-files-staging
wrangler r2 bucket create minu-files
```

### 2.4 Pages 프로젝트 생성

```bash
# GitHub 연결 없이 직접 생성
wrangler pages project create minu-find

# 또는 Cloudflare 대시보드에서 생성
# Workers & Pages > Create > Pages > Direct Upload
```

---

## 3. GitHub 레포지토리 설정

### 3.1 Secrets 설정

**Repository Settings > Secrets and variables > Actions > Secrets**

| Secret | 값 |
|--------|-----|
| `CLOUDFLARE_API_TOKEN` | 1.2에서 생성한 토큰 |
| `CLOUDFLARE_ACCOUNT_ID` | 1.3에서 확인한 Account ID |
| `JWT_PUBLIC_KEY` | ideaonaction.ai 공개키 |
| `EVENTS_SECRET` | 이벤트 HMAC 시크릿 |

### 3.2 Variables 설정

**Repository Settings > Secrets and variables > Actions > Variables**

| Variable | 예시 값 |
|----------|---------|
| `PAGES_PROJECT_NAME` | `minu-find` |
| `D1_DATABASE_NAME` | `minu-find` |
| `NEXT_PUBLIC_API_URL_STAGING` | `https://api-staging.find.minu.best` |
| `NEXT_PUBLIC_API_URL_PRODUCTION` | `https://api.find.minu.best` |
| `NEXT_PUBLIC_PARENT_DOMAIN` | `https://minu.best` |

### 3.3 Environments 설정

**Repository Settings > Environments**

#### staging 환경

1. **New environment** > 이름: `staging`
2. **Environment secrets**: (필요시 추가)
3. **Deployment branches**: `main`

#### production 환경

1. **New environment** > 이름: `production`
2. **Required reviewers**: 활성화, 승인자 지정
3. **Wait timer**: 5분 (선택)
4. **Deployment branches**: `main`

#### preview 환경

1. **New environment** > 이름: `preview`
2. **Deployment branches**: All branches

---

## 4. 프로젝트 설정

### 4.1 wrangler.toml 작성

```toml
# wrangler.toml
name = "minu-find-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# 기본 설정 (development)
[vars]
ENVIRONMENT = "development"

# Staging 환경
[env.staging]
name = "minu-find-api-staging"
vars = { ENVIRONMENT = "staging" }

[[env.staging.d1_databases]]
binding = "DB"
database_name = "minu-find-staging"
database_id = "<YOUR_STAGING_DB_ID>"

[[env.staging.kv_namespaces]]
binding = "SESSION_KV"
id = "<YOUR_STAGING_KV_ID>"

[[env.staging.r2_buckets]]
binding = "FILES_BUCKET"
bucket_name = "minu-files-staging"

# Production 환경
[env.production]
name = "minu-find-api"
vars = { ENVIRONMENT = "production" }
routes = [
  { pattern = "api.find.minu.best/*", zone_name = "minu.best" }
]

[[env.production.d1_databases]]
binding = "DB"
database_name = "minu-find"
database_id = "<YOUR_PRODUCTION_DB_ID>"

[[env.production.kv_namespaces]]
binding = "SESSION_KV"
id = "<YOUR_PRODUCTION_KV_ID>"

[[env.production.r2_buckets]]
binding = "FILES_BUCKET"
bucket_name = "minu-files"

# Preview 환경 (PR용)
[env.preview]
name = "minu-find-api-preview"
vars = { ENVIRONMENT = "preview" }
```

### 4.2 package.json scripts 추가

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsup src/index.ts --format esm --dts",
    "build:cf": "npx @cloudflare/next-on-pages",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "deploy:staging": "wrangler deploy --env staging",
    "deploy:prod": "wrangler deploy --env production",
    "d1:migrate:staging": "wrangler d1 migrations apply minu-find-staging --env staging",
    "d1:migrate:prod": "wrangler d1 migrations apply minu-find --env production"
  }
}
```

### 4.3 워크플로우 파일 복사

```bash
mkdir -p .github/workflows

# 필요한 워크플로우 복사
cp templates/workflows/deploy-workers.yml .github/workflows/
cp templates/workflows/deploy-pages.yml .github/workflows/
cp templates/workflows/d1-migrations.yml .github/workflows/
```

---

## 5. 초기 마이그레이션

### 5.1 마이그레이션 파일 생성

```bash
mkdir -p migrations

# 첫 번째 마이그레이션
cat > migrations/0001_initial.sql << 'EOF'
-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
EOF
```

### 5.2 로컬에서 마이그레이션 테스트

```bash
# Staging 환경에 적용
wrangler d1 migrations apply minu-find-staging --env staging

# 결과 확인
wrangler d1 execute minu-find-staging --env staging \
  --command "SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 6. 첫 배포

### 6.1 로컬 테스트

```bash
# Workers 개발 서버
wrangler dev --env staging

# Pages 개발 서버 (Next.js)
pnpm dev
```

### 6.2 수동 배포 테스트

```bash
# Workers 배포
wrangler deploy --env staging

# Pages 배포
pnpm build:cf
wrangler pages deploy .vercel/output/static --project-name=minu-find
```

### 6.3 GitHub Actions 배포

```bash
# main 브랜치에 푸시
git add .
git commit -m "feat: initial cloudflare setup"
git push origin main

# GitHub Actions에서 자동 배포 확인
```

---

## 7. DNS 설정

### 7.1 Workers 커스텀 도메인

Cloudflare 대시보드에서:

1. **Workers & Pages** > 해당 Worker 선택
2. **Settings** > **Triggers** > **Custom Domains**
3. **Add Custom Domain**: `api.find.minu.best`

### 7.2 Pages 커스텀 도메인

1. **Workers & Pages** > 해당 Pages 프로젝트 선택
2. **Custom domains** > **Set up a domain**
3. 도메인 입력: `find.minu.best`

---

## 8. 모니터링 설정

### 8.1 Workers Analytics

Cloudflare 대시보드에서 자동 제공:
- 요청 수
- 에러율
- CPU 시간
- 지역별 분포

### 8.2 Pages Analytics

Web Analytics 활성화:

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <script
          defer
          src='https://static.cloudflareinsights.com/beacon.min.js'
          data-cf-beacon='{"token": "YOUR_BEACON_TOKEN"}'
        />
      </body>
    </html>
  );
}
```

---

## 체크리스트

### Cloudflare 설정
- [ ] API 토큰 생성
- [ ] Account ID 확인
- [ ] D1 데이터베이스 생성 (staging, production)
- [ ] KV 네임스페이스 생성
- [ ] R2 버킷 생성
- [ ] Pages 프로젝트 생성

### GitHub 설정
- [ ] Secrets 설정 완료
- [ ] Variables 설정 완료
- [ ] Environments 설정 완료

### 프로젝트 설정
- [ ] wrangler.toml 작성
- [ ] package.json scripts 추가
- [ ] 워크플로우 파일 복사
- [ ] 초기 마이그레이션 작성

### 배포 확인
- [ ] 로컬 테스트 성공
- [ ] Staging 자동 배포 성공
- [ ] Production 수동 배포 성공
- [ ] 커스텀 도메인 설정 완료
