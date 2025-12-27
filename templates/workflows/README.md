# Cloudflare CI/CD 워크플로우 템플릿

Minu 서비스의 Cloudflare 배포를 위한 GitHub Actions 워크플로우 템플릿입니다.

## 워크플로우 목록

| 파일 | 용도 | 트리거 |
|------|------|--------|
| `deploy-workers.yml` | Workers API 배포 | push, PR, 수동 |
| `deploy-pages.yml` | Pages (Next.js) 배포 | push, PR, 수동 |
| `d1-migrations.yml` | D1 데이터베이스 마이그레이션 | push, 수동 |
| `ci.yml` | 통합 CI (모노레포용) | push, PR |

---

## 사용법

### 1. 워크플로우 파일 복사

```bash
# 서비스 레포에서
mkdir -p .github/workflows
cp path/to/templates/workflows/deploy-workers.yml .github/workflows/
cp path/to/templates/workflows/deploy-pages.yml .github/workflows/
```

### 2. GitHub Secrets 설정

Repository Settings > Secrets and variables > Actions에서 설정:

#### 필수 Secrets

| 이름 | 설명 | 획득 방법 |
|------|------|----------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 토큰 | Cloudflare 대시보드 > My Profile > API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID | Cloudflare 대시보드 > Overview 페이지 |
| `JWT_PUBLIC_KEY` | JWT 검증용 공개키 | ideaonaction.ai에서 발급 |
| `EVENTS_SECRET` | 이벤트 HMAC 시크릿 | ideaonaction.ai에서 발급 |

#### 선택적 Secrets (서비스별)

| 이름 | 서비스 | 설명 |
|------|--------|------|
| `ANTHROPIC_API_KEY` | minu-frame | Claude API 키 |
| `SLACK_WEBHOOK_URL` | minu-keep | Slack 알림 웹훅 |
| `KAKAO_API_KEY` | minu-keep | 카카오 알림톡 API |

### 3. GitHub Variables 설정

Repository Settings > Secrets and variables > Actions > Variables:

| 이름 | 예시 값 | 설명 |
|------|---------|------|
| `PAGES_PROJECT_NAME` | `minu-find` | Cloudflare Pages 프로젝트 이름 |
| `D1_DATABASE_NAME` | `minu-find-db` | D1 데이터베이스 이름 |
| `NEXT_PUBLIC_API_URL_STAGING` | `https://api-staging.find.minu.best` | Staging API URL |
| `NEXT_PUBLIC_API_URL_PRODUCTION` | `https://api.find.minu.best` | Production API URL |
| `NEXT_PUBLIC_PARENT_DOMAIN` | `https://minu.best` | 부모 도메인 |

---

## Cloudflare API 토큰 권한

API 토큰 생성 시 다음 권한이 필요합니다:

### Workers 배포용

```
Account - Workers Scripts: Edit
Account - Workers KV Storage: Edit
Account - D1: Edit
Account - Workers R2 Storage: Edit
Zone - Workers Routes: Edit
```

### Pages 배포용

```
Account - Cloudflare Pages: Edit
```

### 통합 토큰 (권장)

```
Account - Workers Scripts: Edit
Account - Workers KV Storage: Edit
Account - D1: Edit
Account - Workers R2 Storage: Edit
Account - Cloudflare Pages: Edit
Zone - Workers Routes: Edit
```

---

## 환경별 배포

### Staging (자동)

- `main` 브랜치 푸시 시 자동 배포
- PR 프리뷰 배포

### Production (수동)

**방법 1: 워크플로우 디스패치**

```
Actions > Deploy Workers API > Run workflow > production
```

**방법 2: 커밋 메시지**

```bash
git commit -m "feat: 새 기능 추가 [deploy:prod]"
```

---

## wrangler.toml 설정 예시

```toml
name = "minu-find-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# 환경별 설정
[env.staging]
name = "minu-find-api-staging"
vars = { ENVIRONMENT = "staging" }

[[env.staging.d1_databases]]
binding = "DB"
database_name = "minu-find-staging"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[env.staging.kv_namespaces]]
binding = "SESSION_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[env.production]
name = "minu-find-api"
vars = { ENVIRONMENT = "production" }
routes = [
  { pattern = "api.find.minu.best/*", zone_name = "minu.best" }
]

[[env.production.d1_databases]]
binding = "DB"
database_name = "minu-find"
database_id = "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"

[[env.production.kv_namespaces]]
binding = "SESSION_KV"
id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
```

---

## package.json scripts 예시

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsup src/index.ts --format esm",
    "build:cf": "npx @cloudflare/next-on-pages",
    "deploy:staging": "wrangler deploy --env staging",
    "deploy:prod": "wrangler deploy --env production",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

---

## 마이그레이션 파일 규칙

### 파일명 형식

```
NNNN_description.sql

예시:
0001_create_users.sql
0002_create_projects.sql
0003_add_user_avatar.sql
```

### 파일 내용 예시

```sql
-- 0001_create_users.sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

## 트러블슈팅

### Workers 배포 실패

```
Error: Could not find a compatible Workers runtime
```

**해결**: `compatibility_date`를 최신 날짜로 업데이트

### Pages 빌드 실패

```
Error: Cannot find module '@cloudflare/next-on-pages'
```

**해결**: devDependencies에 추가

```bash
pnpm add -D @cloudflare/next-on-pages
```

### D1 마이그레이션 실패

```
Error: no such table
```

**해결**: 마이그레이션 순서 확인, 이전 마이그레이션 먼저 적용

---

## 관련 문서

- [Cloudflare Workers 문서](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 문서](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 문서](https://developers.cloudflare.com/workers/wrangler/)
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
