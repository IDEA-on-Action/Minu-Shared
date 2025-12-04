# @minu/ui

## 2.0.0

### Major Changes

- Initaial deployment

## 1.1.0

### Minor Changes

- 1f44b86: feat(ui): Switch, Textarea 컴포넌트 추가

  ### Switch 컴포넌트

  - 토글 스위치 UI 컴포넌트
  - 제어/비제어 모드 지원
  - 3가지 크기: sm, md, lg
  - 폼 통합 지원 (숨겨진 input)
  - 접근성: role="switch", aria-checked

  ### Textarea 컴포넌트

  - 다중 행 텍스트 입력 컴포넌트
  - 에러 상태 및 메시지 표시
  - 글자 수 카운터 (showCount + maxLength)
  - 리사이즈 옵션: none, vertical, horizontal, both
  - 접근성: aria-invalid, aria-describedby

## 1.0.0

### Major Changes

- ## v1.0.0 릴리스

  ### @minu/types

  - User, Project, Proposal, Subscription 타입 정의

  ### @minu/utils

  - API 클라이언트 (ApiClient, createApiClient)
  - JWT 유틸리티 (decodeJwt, isTokenExpired)
  - 토큰 갱신 (TokenRefreshManager)
  - 검증 유틸리티 (이메일, URL, 전화번호 등)
  - 포맷 유틸리티 (날짜, 숫자, 통화)
  - 타이밍 유틸리티 (debounce, throttle)
  - ID 생성 유틸리티 (generateId, createIdGenerator)

  ### @minu/ui

  - 15개 컴포넌트: Button, Input, Card, Badge, Alert, Avatar, Checkbox, Radio, Select, Tabs, Modal, Drawer, Toast, Spinner, Skeleton
  - 7개 훅: useDebounce, useThrottle, useMediaQuery, useLockBodyScroll, useClickOutside, useFocusTrap, useLocalStorage
  - 4개 프리미티브: Portal, VisuallyHidden, FocusTrap, ClickOutside
  - Storybook 스토리 (Button, Input, Card)
