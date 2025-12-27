# GitHub Actions CI/CD 설정 가이드

## 개요

이 문서는 Minu API의 GitHub Actions CI/CD 파이프라인 설정 방법을 안내합니다.

## 워크플로우 구조

```
.github/workflows/
├── ci.yml           # CI (lint, type-check, test, build)
├── publish.yml      # NPM 패키지 배포
├── deploy-api.yml   # Workers API 배포
└── migrate-d1.yml   # D1 데이터베이스 마이그레이션
```

## 필수 GitHub Secrets

GitHub 저장소 Settings > Secrets and variables > Actions에서 다음 시크릿을 설정해야 합니다.

### Cloudflare 관련

| Secret | 설명 | 발급 방법 |
|--------|------|----------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 토큰 | Cloudflare Dashboard > My Profile > API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID | Cloudflare Dashboard > Workers & Pages > 우측 사이드바 |

**API Token 권한:**
- Account > Workers Scripts > Edit
- Account > Workers KV Storage > Edit
- Account > Workers R2 Storage > Edit
- Account > D1 > Edit
- Account > Queues > Edit
- Zone > Workers Routes > Edit

### 애플리케이션 관련

| Secret | 설명 | 비고 |
|--------|------|------|
| `JWT_PUBLIC_KEY` | JWT 검증용 RSA 공개키 (PEM 형식) | ideaonaction.ai 시스템에서 발급 |
| `EVENTS_SECRET` | 이벤트 HMAC 서명 시크릿 | 32자 이상 권장 |

### 기타 (선택)

| Secret | 설명 | 용도 |
|--------|------|------|
| `CODECOV_TOKEN` | Codecov 업로드 토큰 | 테스트 커버리지 리포트 |

## 워크플로우 상세

### 1. CI (`ci.yml`)

**트리거:** `main` 브랜치 push 또는 PR

**Jobs:**
- `lint` - ESLint 검사
- `type-check` - TypeScript 타입 검사
- `test` - Vitest 테스트 + 커버리지
- `build` - 빌드 검증
- `size` - 번들 사이즈 체크

### 2. Deploy API (`deploy-api.yml`)

**트리거:**
- `main` 브랜치 push (apps/api 변경 시)
- 수동 실행 (workflow_dispatch)

**배포 흐름:**

```
main push
    │
    ▼
┌─────────┐
│ Validate│ ← lint, type-check
└────┬────┘
     │
     ▼
┌──────────────┐
│ Deploy       │ ← staging 배포
│ Staging      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Promote to   │ ← production 승격 (수동 승인)
│ Production   │
└──────────────┘
```

**수동 배포:**

```bash
# GitHub CLI 사용
gh workflow run deploy-api.yml -f environment=staging
gh workflow run deploy-api.yml -f environment=production
```

### 3. D1 Migrations (`migrate-d1.yml`)

**트리거:** 수동 실행만

**사용법:**

```bash
# 모든 staging DB 마이그레이션
gh workflow run migrate-d1.yml -f environment=staging -f database=all

# production의 특정 DB만 마이그레이션
gh workflow run migrate-d1.yml -f environment=production -f database=shared
```

**지원 데이터베이스:**
- `all` - 모든 DB
- `shared` - minu-shared-db
- `find` - minu-find-db
- `frame` - minu-frame-db
- `build` - minu-build-db
- `keep` - minu-keep-db

## Environment 설정

GitHub 저장소 Settings > Environments에서 환경을 설정합니다.

### staging

- **보호 규칙:** 없음 (자동 배포)

### production

- **보호 규칙:**
  - Required reviewers: 1명 이상
  - Wait timer: 5분 (선택)

## 로컬 테스트

워크플로우를 로컬에서 테스트하려면 [act](https://github.com/nektos/act)를 사용합니다:

```bash
# CI 워크플로우 테스트
act -j lint

# 시크릿 포함 테스트
act -j deploy-staging --secret-file .secrets
```

## 트러블슈팅

### Workers 배포 실패

1. `CLOUDFLARE_API_TOKEN` 권한 확인
2. `wrangler.toml` 설정 확인
3. Workers 로그 확인: `wrangler tail --env staging`

### D1 마이그레이션 실패

1. 마이그레이션 파일 문법 확인
2. 데이터베이스 ID 확인 (`wrangler.toml`)
3. 수동 실행: `npx wrangler d1 migrations apply <db-name> --remote --env staging`

### Health Check 실패

1. Workers 로그 확인
2. 시크릿 설정 확인 (JWT_PUBLIC_KEY, EVENTS_SECRET)
3. 바인딩 설정 확인 (D1, KV, R2, Queues)
