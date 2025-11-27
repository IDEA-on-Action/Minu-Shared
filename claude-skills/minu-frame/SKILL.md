# Minu Frame Skill

> frame.minu.best AI 기반 제안서 자동 작성 서비스 전용 규칙

**버전**: 1.0.0
**최종 수정**: 2025-11-27
**현재 버전**: 0.7.0 (MVP 예정 - 2026-01)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 도메인 | frame.minu.best |
| 역할 | AI 기반 제안서/RFP 자동 작성 |
| 유형 | **동적 웹앱 (SSR + CSR)** |
| 인증 | ideaonaction.ai OAuth 연동 |
| AI | Claude API / OpenAI API |

---

## 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| Framework | Next.js 15 | App Router |
| Database | Supabase | PostgreSQL |
| AI | Anthropic Claude | 제안서 생성 |
| Editor | Tiptap / Plate | 리치 텍스트 에디터 |
| Export | @react-pdf/renderer | PDF 출력 |
| Styling | TailwindCSS | shadcn/ui |

---

## 핵심 기능

### MVP (0.7.x)

| 기능 | 설명 | 상태 |
|------|------|------|
| 프로젝트 분석 | 공고문 자동 분석 | 📋 기획 중 |
| 제안서 생성 | AI 기반 초안 작성 | 📋 기획 중 |
| 템플릿 | 기본 템플릿 10개 | 📋 기획 중 |
| PDF 출력 | 제안서 다운로드 | 📋 기획 중 |

### Closed Beta (0.8.x)

| 기능 | 설명 |
|------|------|
| 고급 AI | 맞춤형 톤/스타일 |
| 템플릿 50+ | 업종별 전문 템플릿 |
| 협업 | 팀 편집 기능 |
| 버전 관리 | 제안서 히스토리 |

---

## AI 프롬프트 아키텍처

### 제안서 생성 파이프라인

```
┌─────────────────────────────────────────────────────────────┐
│                    제안서 생성 플로우                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 공고문 입력                                              │
│     └── 텍스트 / URL / 파일 업로드                           │
│                                                             │
│  2. 분석 (AI Step 1)                                        │
│     ├── 요구사항 추출                                        │
│     ├── 평가 기준 파악                                       │
│     └── 핵심 키워드 도출                                     │
│                                                             │
│  3. 구조화 (AI Step 2)                                      │
│     ├── 목차 생성                                           │
│     ├── 섹션별 가이드                                        │
│     └── 페이지 배분                                          │
│                                                             │
│  4. 초안 작성 (AI Step 3)                                   │
│     ├── 섹션별 콘텐츠 생성                                   │
│     ├── 도표/차트 제안                                       │
│     └── 참고 자료 연결                                       │
│                                                             │
│  5. 사용자 편집                                              │
│     └── Tiptap 에디터에서 수정                               │
│                                                             │
│  6. PDF 출력                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 데이터 모델

```sql
-- 제안서
proposals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  project_id UUID,               -- Find 연동 시
  template_id UUID,
  content JSONB,                 -- Tiptap JSON
  status TEXT,                   -- 'draft', 'completed', 'submitted'
  ai_analysis JSONB,             -- AI 분석 결과
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- 템플릿
templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,                 -- 'IT', 'Construction', 'Consulting'
  structure JSONB,               -- 기본 구조
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)

-- 버전 히스토리
proposal_versions (
  id UUID PRIMARY KEY,
  proposal_id UUID REFERENCES proposals,
  version INT,
  content JSONB,
  created_at TIMESTAMPTZ
)
```

---

## AI 통합

### Claude API 호출

```typescript
// lib/ai/claude.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeRFP(content: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `당신은 RFP/제안요청서 분석 전문가입니다.
주어진 공고문을 분석하여 다음을 추출하세요:
1. 핵심 요구사항
2. 평가 기준 및 배점
3. 필수 포함 사항
4. 제출 기한 및 형식`,
    messages: [
      { role: 'user', content }
    ],
  });
  
  return response;
}

export async function generateSection(
  sectionTitle: string,
  context: ProposalContext
) {
  // 섹션별 콘텐츠 생성
}
```

### 스트리밍 응답

```typescript
// app/api/ai/generate/route.ts
export async function POST(request: Request) {
  const { proposalId, section } = await request.json();
  
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [...],
  });
  
  return new Response(stream.toReadableStream(), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

---

## 에디터 통합

### Tiptap 설정

```typescript
// components/editor/ProposalEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';

export function ProposalEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      // 커스텀 확장
      AIAssistant,
      TemplateBlock,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });
  
  return <EditorContent editor={editor} />;
}
```

---

## PDF 출력

```typescript
// lib/pdf/generator.ts
import { pdf } from '@react-pdf/renderer';
import { ProposalDocument } from '@/components/pdf/ProposalDocument';

export async function generatePDF(proposal: Proposal) {
  const blob = await pdf(
    <ProposalDocument proposal={proposal} />
  ).toBlob();
  
  return blob;
}
```

---

## 디렉토리 구조

```
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── proposals/
│   │   │   ├── page.tsx           # 제안서 목록
│   │   │   ├── new/page.tsx       # 새 제안서
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # 제안서 상세
│   │   │       └── edit/page.tsx  # 편집
│   │   └── templates/page.tsx     # 템플릿 관리
│   └── api/
│       ├── ai/
│       │   ├── analyze/route.ts
│       │   └── generate/route.ts
│       └── proposals/
├── components/
│   ├── editor/
│   │   ├── ProposalEditor.tsx
│   │   ├── Toolbar.tsx
│   │   └── AIAssistant.tsx
│   ├── pdf/
│   │   └── ProposalDocument.tsx
│   └── proposal/
│       ├── ProposalCard.tsx
│       └── TemplateSelector.tsx
├── lib/
│   ├── ai/
│   │   ├── claude.ts
│   │   └── prompts.ts
│   └── pdf/
│       └── generator.ts
└── types/
    └── proposal.ts
```

---

## 요금제 연동

| 플랜 | 제한 |
|------|------|
| Basic (₩39,000) | 월 5건, 기본 AI |
| Pro (₩129,000) | 월 30건, 고급 AI |
| Enterprise (₩349,000) | 무제한, 전용 모델 |

---

## 체크리스트

### AI 기능 개발 시
- [ ] 프롬프트 버전 관리
- [ ] 토큰 사용량 추적
- [ ] 에러 핸들링 (Rate Limit, Timeout)
- [ ] 결과 캐싱 전략

### 에디터 개발 시
- [ ] 자동 저장 구현
- [ ] 실시간 협업 고려
- [ ] 되돌리기/다시하기
- [ ] 키보드 단축키
