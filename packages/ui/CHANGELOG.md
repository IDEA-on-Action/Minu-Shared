# @minu/ui

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
