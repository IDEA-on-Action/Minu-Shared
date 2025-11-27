# 성공 기준 (Acceptance Criteria)

> minu-shared 패키지의 완료 기준 및 검증 방법

**문서 버전**: 1.0.0
**작성일**: 2025-11-27

---

## 1. 전체 프로젝트 성공 기준

### 1.1 품질 기준

| 항목 | 기준 | 현재 상태 |
|------|------|----------|
| TypeScript Strict Mode | 활성화 | ✅ |
| 테스트 커버리지 | 80% 이상 | ⏳ 미구현 |
| 린트 에러 | 0개 | ⏳ 확인 필요 |
| 빌드 성공 | 모든 패키지 | ⏳ 확인 필요 |

### 1.2 배포 기준

| 항목 | 기준 | 현재 상태 |
|------|------|----------|
| GitHub Packages 배포 | 자동화 | ✅ publish.yml |
| Semantic Versioning | 준수 | ✅ |
| Changesets | 설정 완료 | ✅ |

---

## 2. 패키지별 성공 기준

### 2.1 @minu/ui

#### Button 컴포넌트
- [ ] `variant` prop: primary, secondary, ghost, danger
- [ ] `size` prop: sm, md, lg
- [ ] `loading` 상태 지원
- [ ] `disabled` 상태 지원
- [ ] Tailwind CSS 스타일링
- [ ] TypeScript 타입 export

#### Input 컴포넌트
- [ ] `type` prop: text, email, password, search
- [ ] `error` 상태 및 메시지 표시
- [ ] `leftIcon`, `rightIcon` 지원
- [ ] forwardRef 지원

#### Card 컴포넌트
- [ ] CardHeader, CardTitle, CardContent, CardFooter 서브컴포넌트
- [ ] Compound Component 패턴
- [ ] 유연한 스타일 커스터마이징

### 2.2 @minu/utils

#### API 클라이언트
- [ ] `createApiClient` 팩토리 함수
- [ ] GET, POST, PUT, DELETE 메서드
- [ ] Authorization 헤더 자동 추가
- [ ] 에러 응답 정규화

#### JWT 유틸리티
- [ ] `parseJWT`: 토큰 페이로드 파싱
- [ ] `isTokenExpired`: 만료 여부 확인
- [ ] `hasServiceAccess`: 서비스 접근 권한 확인
- [ ] `getSubscriptionPlan`: 구독 플랜 확인

#### 포맷팅 유틸리티
- [ ] `formatDate`: 날짜 포맷 (YYYY-MM-DD 등)
- [ ] `formatCurrency`: 통화 포맷 (₩1,234,567)
- [ ] `formatNumber`: 숫자 포맷 (1,234,567)
- [ ] `formatFileSize`: 파일 크기 (1.2 MB)

### 2.3 @minu/types

- [ ] User, Subscription, Tenant 타입
- [ ] JWTPayload, MinuService 타입
- [ ] ApiResponse, ApiError, PaginatedResponse 타입
- [ ] 모든 타입 export

---

## 3. 검증 방법

### 3.1 자동 검증

```bash
# 타입 체크
pnpm type-check

# 린트
pnpm lint

# 테스트
pnpm test

# 빌드
pnpm build
```

### 3.2 수동 검증

1. 각 서비스(Find, Frame, Build, Keep)에서 패키지 설치 테스트
2. 컴포넌트 렌더링 확인
3. 유틸리티 함수 동작 확인

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2025-11-27 | 최초 작성 |
