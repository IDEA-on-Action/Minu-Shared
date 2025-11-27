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

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2025-11-27 | 최초 작성 |
