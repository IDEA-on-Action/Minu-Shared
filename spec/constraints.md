# 제약사항 (Constraints)

> minu-shared 패키지의 비기능 요구사항 및 제약사항

**문서 버전**: 1.0.0
**작성일**: 2025-11-27

---

## 1. 기술 제약사항

### 1.1 런타임 환경

| 항목 | 요구사항 |
|------|----------|
| Node.js | >= 18.0.0 |
| React | 18.x 또는 19.x |
| TypeScript | 5.0+ |
| 패키지 매니저 | pnpm 8+ |

### 1.2 빌드 출력

| 항목 | 설정 |
|------|------|
| 모듈 형식 | CommonJS + ES Modules |
| 타입 선언 | .d.ts 파일 생성 |
| 소스맵 | 개발용 포함 |

### 1.3 Peer Dependencies

```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

---

## 2. 스타일링 제약사항

### 2.1 Tailwind CSS

- 모든 UI 컴포넌트는 Tailwind CSS 사용
- 커스텀 CSS 최소화
- `cn()` 유틸리티로 클래스 병합 (clsx + tailwind-merge)

### 2.2 디자인 토큰

| 토큰 | 사용 |
|------|------|
| primary-600 (#2563EB) | 주요 액션 |
| secondary-500 (#10B981) | 성공 상태 |
| accent-500 (#F59E0B) | 경고, 강조 |

---

## 3. 보안 제약사항

### 3.1 민감 정보

- 환경 변수에 토큰/시크릿 저장 금지
- .env 파일 gitignore 필수
- JWT는 httpOnly 쿠키 권장

### 3.2 배포

- GitHub Packages 접근은 GITHUB_TOKEN 필요
- 프라이빗 레지스트리 사용

---

## 4. 코드 품질 제약사항

### 4.1 TypeScript

- Strict Mode 활성화
- any 타입 사용 금지 (eslint 규칙)
- 명시적 타입 선언 권장

### 4.2 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `Button`, `CardHeader` |
| 함수/변수 | camelCase | `formatDate`, `isLoading` |
| 상수 | UPPER_SNAKE_CASE | `DEFAULT_TIMEOUT` |
| 파일명 | kebab-case 또는 PascalCase | `api-client.ts`, `Button.tsx` |

### 4.3 Import 순서

1. React
2. 외부 라이브러리
3. 내부 모듈 (@minu/*)
4. 상대 경로
5. 스타일

---

## 5. 호환성 제약사항

### 5.1 브라우저 지원

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

### 5.2 서버 사이드 렌더링

- Next.js 14+ / 15+ 호환
- 'use client' 지시문 필요 시 명시

---

## 6. 버전 관리 제약사항

### 6.1 버전 형식

**Semantic Versioning 2.0.0** 준수:

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

예시:
- 0.1.0          : 초기 개발 버전
- 0.2.0-beta.1   : 베타 테스트 버전
- 1.0.0-rc.1     : 정식 출시 릴리스 후보
- 1.0.0          : 정식 출시 (GA)
```

| 버전 변경 | 기준 | 예시 |
|----------|------|------|
| **Major (X.0.0)** | Breaking Changes, 하위 호환성 깨짐 | 2.0.0 |
| **Minor (0.X.0)** | 새로운 기능 추가 (하위 호환) | 0.2.0 |
| **Patch (0.0.X)** | 버그 수정, 보안 패치 | 0.1.1 |

### 6.2 Pre-release 태그

| 태그 | 용도 | 안정성 | 예시 |
|------|------|--------|------|
| `-alpha.N` | 내부 개발 버전 | 불안정 | `0.1.0-alpha.1` |
| `-beta.N` | 베타 테스트 버전 | 준안정 | `0.2.0-beta.3` |
| `-rc.N` | 릴리스 후보 | 안정 | `1.0.0-rc.1` |

### 6.3 Git 태그 규칙

```bash
# 버전 태그 형식
v{VERSION}

# 예시
v0.1.0
v0.2.0-beta.1
v1.0.0-rc.1

# Annotated Tag 사용 (필수)
git tag -a v0.1.0 -m "초기 릴리스"
git push origin v0.1.0
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2025-11-27 | 최초 작성 |
| 1.1.0 | 2025-11-27 | 버전 관리 제약사항 섹션 추가 |
