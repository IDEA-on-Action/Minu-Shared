# Minu Portal Skill

> minu.best 마케팅 랜딩 페이지 전용 규칙

**버전**: 1.0.0
**최종 수정**: 2025-11-27
**현재 버전**: 0.7.0 (MVP)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 도메인 | minu.best |
| 역할 | Minu 시리즈 마케팅 랜딩 페이지 |
| 유형 | **정적 사이트 (SSG)** |
| 서버 로직 | 없음 |
| API Routes | 없음 |
| 인증 처리 | 없음 |

---

## 기술 스택

| 영역 | 기술 | 설정 |
|------|------|------|
| Framework | Next.js 15 | App Router |
| Rendering | SSG | `output: 'export'` |
| Styling | TailwindCSS | 반응형 |
| Deployment | Vercel | 정적 호스팅 |

### Next.js 설정

```javascript
// next.config.ts
const nextConfig = {
  output: 'export',           // 정적 사이트 빌드
  trailingSlash: true,        // /page/ 형태 URL
  images: {
    unoptimized: true,        // 정적 빌드용
  },
};
```

---

## 페이지 구조

```
minu.best/
├── /                        → 랜딩 페이지 (홈)
├── /services                → 서비스 소개 (개요)
│   ├── /services/find      → Find 상세
│   ├── /services/frame     → Frame 상세
│   ├── /services/build     → Build 상세 [Coming Soon]
│   └── /services/keep      → Keep 상세 [Coming Soon]
├── /pricing                 → 요금제
└── /about                   → 소개
```

---

## 소스 디렉토리

```
src/
├── app/
│   ├── page.tsx              # 홈
│   ├── layout.tsx            # 루트 레이아웃
│   ├── globals.css           # 전역 스타일
│   ├── pricing/page.tsx      # 요금제
│   ├── about/page.tsx        # 소개
│   └── services/
│       ├── page.tsx          # 서비스 개요
│       ├── find/page.tsx
│       ├── frame/page.tsx
│       ├── build/page.tsx
│       └── keep/page.tsx
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── ServiceCards.tsx
│   ├── Workflow.tsx
│   └── CTA.tsx
└── lib/
    ├── constants.ts          # 상수 데이터
    └── utils.ts              # 유틸리티
```

---

## CTA 버튼 라우팅

| 버튼 | 위치 | 이동 대상 |
|------|------|----------|
| 시작하기 | Hero, 서비스 카드 | `find.minu.best` |
| Find 시작하기 | Find 상세 | `find.minu.best` |
| Frame 시작하기 | Frame 상세 | `frame.minu.best` |
| 로그인 | Header | `ideaonaction.ai/login?redirect=minu` |
| 구독하기 | 요금제 | `ideaonaction.ai/billing` |

### CTA 컴포넌트 예시

```tsx
// 외부 링크는 반드시 target="_blank" + rel="noopener noreferrer"
<a 
  href="https://find.minu.best" 
  target="_blank" 
  rel="noopener noreferrer"
  className="btn-primary"
>
  시작하기
</a>
```

---

## 제약사항

### ❌ 사용 불가

- `getServerSideProps` (SSG만 사용)
- API Routes (`/api/*`)
- 서버 컴포넌트에서 동적 데이터 페칭
- `cookies()`, `headers()` 등 서버 전용 API
- `next/image` 최적화 (unoptimized 사용)

### ✅ 사용 가능

- `generateStaticParams` (동적 라우트 정적 생성)
- `generateMetadata` (메타데이터 정적 생성)
- 클라이언트 컴포넌트 (`'use client'`)
- 외부 API 호출 (클라이언트 사이드만)

---

## SEO 설정

### 메타데이터

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'Minu - 작은 시작, 큰 기회',
    template: '%s | Minu',
  },
  description: '프리랜서와 1인 기업을 위한 올인원 비즈니스 플랫폼',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://minu.best',
    siteName: 'Minu',
  },
};
```

### robots.txt / sitemap.xml

```tsx
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://minu.best/sitemap.xml',
  };
}

// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://minu.best', lastModified: new Date() },
    { url: 'https://minu.best/services', lastModified: new Date() },
    // ...
  ];
}
```

---

## 빌드 & 배포

### 명령어

```bash
npm run dev       # 개발 서버
npm run build     # 정적 빌드 → /out 디렉토리
npm run start     # 빌드 미리보기
```

### 빌드 결과물

```
out/
├── index.html
├── services/
│   ├── index.html
│   ├── find/index.html
│   └── ...
├── pricing/index.html
└── _next/                # 정적 자산
```

---

## Git 브랜치

| 브랜치 | 용도 | 배포 환경 |
|--------|------|----------|
| `main` | 프로덕션 | minu.best |
| `canary` | 스테이징 | canary.minu.best |
| `feature/*` | 기능 개발 | Preview |

### 워크플로우

```
feature/* → canary (테스트) → main (프로덕션)
```

---

## 체크리스트

### 새 페이지 추가 시
- [ ] `app/` 디렉토리에 page.tsx 생성
- [ ] `generateMetadata` 설정
- [ ] sitemap.ts에 URL 추가
- [ ] Header/Footer 네비게이션 업데이트

### 배포 전
- [ ] `npm run build` 성공
- [ ] `/out` 디렉토리 생성 확인
- [ ] 모든 링크 동작 확인
- [ ] 모바일 반응형 확인
