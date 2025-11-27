# @minu/utils

Minu 서비스 공용 유틸리티 함수 라이브러리

## 설치

```bash
pnpm add @minu/utils
```

## API 클라이언트

```tsx
import { createApiClient } from '@minu/utils';

const api = createApiClient({
  baseUrl: 'https://api.ideaonaction.ai',
  getAccessToken: () => localStorage.getItem('access_token'),
  onUnauthorized: () => window.location.href = '/login',
});

// 사용자 정보 조회
const { success, data, error } = await api.getUser();

// 구독 정보 조회
const subscription = await api.getSubscription();

// 범용 요청
await api.get('/api/custom');
await api.post('/api/items', { name: 'New Item' });
await api.put('/api/items/1', { name: 'Updated' });
await api.delete('/api/items/1');
```

## JWT 유틸리티

```tsx
import {
  parseJWT,
  isTokenExpired,
  hasServiceAccess,
  getSubscriptionPlan,
  getUserIdFromToken,
  getTenantIdFromToken,
} from '@minu/utils';

// 토큰 파싱
const payload = parseJWT(token);

// 만료 확인
if (isTokenExpired(token)) {
  // 토큰 갱신 필요
}

// 서비스 접근 권한 확인
if (hasServiceAccess(token, 'find')) {
  // Find 서비스 접근 가능
}

// 구독 플랜 확인
const plan = getSubscriptionPlan(token); // 'free' | 'pro' | 'enterprise'
```

## 토큰 갱신 관리자

```tsx
import { createTokenRefreshManager } from '@minu/utils';

const tokenManager = createTokenRefreshManager({
  refreshToken: async () => {
    const response = await fetch('/api/auth/refresh');
    return response.json();
  },
  onRefreshSuccess: (tokens) => {
    localStorage.setItem('access_token', tokens.accessToken);
  },
  onRefreshError: () => {
    window.location.href = '/login';
  },
  refreshThreshold: 60000, // 만료 1분 전 갱신
});

// 토큰이 필요할 때 자동 갱신
const token = await tokenManager.getValidToken(currentToken);
```

## 검증 유틸리티

```tsx
import {
  validateEmail,
  validatePassword,
  validateUrl,
  validatePhoneKR,
  validateBusinessNumber,
} from '@minu/utils';

// 이메일 검증
validateEmail('test@example.com'); // { valid: true }
validateEmail('invalid'); // { valid: false, error: '올바른 이메일 형식이 아닙니다.' }

// 비밀번호 검증 (8자 이상, 영문+숫자+특수문자)
validatePassword('MyP@ss123'); // { valid: true }

// URL 검증
validateUrl('https://example.com'); // { valid: true }

// 한국 전화번호 검증
validatePhoneKR('010-1234-5678'); // { valid: true }
validatePhoneKR('01012345678'); // { valid: true }

// 사업자등록번호 검증
validateBusinessNumber('123-45-67890'); // { valid: true }
```

## 포맷팅 유틸리티

```tsx
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatFileSize,
} from '@minu/utils';

// 날짜 포맷
formatDate(new Date(), 'long');     // "2024년 1월 15일"
formatDate(new Date(), 'short');    // "2024.01.15"
formatDate(new Date(), 'relative'); // "3일 전"

// 통화 포맷
formatCurrency(1234567);                    // "1,234,567원"
formatCurrency(50000000, { short: true });  // "5천만원"

// 파일 크기
formatFileSize(1048576); // "1 MB"
```

## 타이밍 유틸리티

```tsx
import { debounce, throttle } from '@minu/utils';

// 디바운스 (입력 완료 후 실행)
const debouncedSearch = debounce((query: string) => {
  search(query);
}, 300);

// 쓰로틀 (일정 간격으로 실행)
const throttledScroll = throttle(() => {
  updatePosition();
}, 100);

// 취소
debouncedSearch.cancel();
throttledScroll.cancel();
```

## 라이선스

Private - IDEA on Action
