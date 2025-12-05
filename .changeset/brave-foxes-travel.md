---
"@idea-on-action/ui": minor
"@idea-on-action/utils": patch
---

# Phase 6: 고급 컴포넌트 및 훅 추가 (v1.2.0)

## @idea-on-action/ui

### 새로운 컴포넌트
- **Popover**: 트리거 기반 팝오버 컴포넌트 (포커스 트랩, 키보드 탐색 지원)
- **Menu**: 드롭다운 메뉴 컴포넌트 (화살표 키 탐색, 자동 포커스)
- **Accordion**: 확장/축소 가능한 아코디언 컴포넌트 (단일/다중 확장 모드)
- **Progress**: 진행률 표시 컴포넌트 (determinate/indeterminate 모드)

### 새로운 훅
- **useMediaQuery**: 미디어 쿼리 상태 감지 훅
- **useDebounce**: 값 디바운싱 훅
- **useDebouncedCallback**: 콜백 함수 디바운싱 훅

### 개선 사항
- 테스트 환경 메모리 최적화 (--maxWorkers=50%)
- 컴포넌트 접근성 개선 (ARIA 속성, 키보드 탐색)
- TypeScript 타입 안정성 강화

## @idea-on-action/utils

### 수정 사항
- 패키지 스코프 변경 (`@minu` → `@idea-on-action`) 관련 업데이트
- 의존성 참조 수정
