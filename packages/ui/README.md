# @minu/ui

Minu 서비스 공용 React UI 컴포넌트 라이브러리

## 설치

```bash
pnpm add @minu/ui
```

## 사용법

```tsx
import { Button, Input, Card } from '@minu/ui';

function App() {
  return (
    <Card>
      <Input placeholder="이메일" />
      <Button variant="primary">로그인</Button>
    </Card>
  );
}
```

## 컴포넌트

### 기본 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `Button` | 버튼 (primary, secondary, outline, ghost, destructive) |
| `Input` | 텍스트 입력 필드 |
| `Card` | 카드 컨테이너 (CardHeader, CardContent, CardFooter) |
| `Badge` | 상태/라벨 배지 |
| `Avatar` | 사용자 아바타 |
| `Spinner` | 로딩 스피너 |
| `Skeleton` | 로딩 스켈레톤 |

### 폼 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `Checkbox` | 체크박스 |
| `Radio` | 라디오 버튼 (RadioGroup) |
| `Select` | 드롭다운 선택 |

### 오버레이 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `Modal` | 모달 다이얼로그 |
| `Drawer` | 슬라이드 패널 |
| `Toast` | 토스트 알림 (useToast) |
| `Alert` | 인라인 알림 |

### 네비게이션

| 컴포넌트 | 설명 |
|----------|------|
| `Tabs` | 탭 네비게이션 |

## 훅

| 훅 | 설명 |
|----|------|
| `useControllableState` | 제어/비제어 컴포넌트 상태 관리 |
| `useEscapeKey` | ESC 키 감지 |
| `useBodyScrollLock` | 바디 스크롤 잠금 |
| `useFocusTrap` | 포커스 트랩 |
| `useClickOutside` | 외부 클릭 감지 |
| `useId` | 접근성용 고유 ID 생성 |

## 프리미티브

| 프리미티브 | 설명 |
|-----------|------|
| `Portal` | React Portal 래퍼 |
| `Backdrop` | 반투명 오버레이 |
| `FocusScope` | 포커스 트랩 컨테이너 |
| `VisuallyHidden` | 스크린 리더 전용 콘텐츠 |

## Tailwind 프리셋

Tailwind CSS와 함께 사용하려면 `tailwind.config.js`에 프리셋을 추가하세요:

```js
// tailwind.config.js
import { minuPreset } from '@minu/ui/styles/tailwind-preset';

export default {
  presets: [minuPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@minu/ui/dist/**/*.{js,mjs}',
  ],
};
```

## 디자인 토큰

`@minu/ui`는 다음 디자인 토큰을 제공합니다:

- **Colors**: Primary, Secondary, Accent, Semantic (Success, Warning, Error, Info)
- **Typography**: Font sizes, weights, line heights
- **Spacing**: 일관된 간격 시스템
- **Border Radius**: 모서리 둥글기
- **Shadows**: 그림자 스타일

## 라이선스

Private - IDEA on Action
