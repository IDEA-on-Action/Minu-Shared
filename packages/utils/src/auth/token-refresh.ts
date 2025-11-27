/**
 * 토큰 쌍
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * 토큰 갱신 설정
 */
export interface TokenRefreshConfig {
  /** 액세스 토큰 getter */
  getAccessToken: () => string | null;
  /** 리프레시 토큰 getter */
  getRefreshToken: () => string | null;
  /** 토큰 갱신 함수 (소비자가 구현) */
  refreshFn: (refreshToken: string) => Promise<TokenPair>;
  /** 토큰 갱신 성공 콜백 */
  onTokenRefreshed: (tokens: TokenPair) => void;
  /** 토큰 갱신 실패 콜백 */
  onRefreshFailed: (error: Error) => void;
  /** 만료 버퍼 시간 (ms), 기본 30초 */
  expirationBuffer?: number;
}

/**
 * 토큰 갱신 관리자 인터페이스
 */
export interface TokenRefreshManager {
  /** 토큰 만료 시 갱신 (이미 갱신 중이면 대기) */
  refreshTokenIfNeeded: () => Promise<boolean>;
  /** 강제 갱신 */
  forceRefresh: () => Promise<boolean>;
  /** 갱신 중 여부 */
  isRefreshing: () => boolean;
}

/**
 * 토큰 갱신 관리자 생성
 *
 * @example
 * ```tsx
 * const refreshManager = createTokenRefreshManager({
 *   getAccessToken: () => localStorage.getItem('accessToken'),
 *   getRefreshToken: () => localStorage.getItem('refreshToken'),
 *   refreshFn: async (refreshToken) => {
 *     const response = await fetch('/api/auth/refresh', {
 *       method: 'POST',
 *       body: JSON.stringify({ refreshToken }),
 *     });
 *     return response.json();
 *   },
 *   onTokenRefreshed: (tokens) => {
 *     localStorage.setItem('accessToken', tokens.accessToken);
 *     localStorage.setItem('refreshToken', tokens.refreshToken);
 *   },
 *   onRefreshFailed: () => {
 *     localStorage.clear();
 *     window.location.href = '/login';
 *   },
 * });
 * ```
 */
export function createTokenRefreshManager(
  config: TokenRefreshConfig
): TokenRefreshManager {
  const { expirationBuffer = 30000 } = config;

  let refreshPromise: Promise<boolean> | null = null;

  const doRefresh = async (): Promise<boolean> => {
    const refreshToken = config.getRefreshToken();

    if (!refreshToken) {
      config.onRefreshFailed(new Error('No refresh token available'));
      return false;
    }

    try {
      const tokens = await config.refreshFn(refreshToken);
      config.onTokenRefreshed(tokens);
      return true;
    } catch (error) {
      config.onRefreshFailed(
        error instanceof Error ? error : new Error('Token refresh failed')
      );
      return false;
    }
  };

  const refreshTokenIfNeeded = async (): Promise<boolean> => {
    const accessToken = config.getAccessToken();

    // 토큰이 없거나 만료되지 않았으면 갱신 불필요
    if (accessToken && !isTokenExpiredWithBuffer(accessToken, expirationBuffer)) {
      return true;
    }

    return forceRefresh();
  };

  const forceRefresh = async (): Promise<boolean> => {
    // 이미 갱신 중이면 기존 Promise 재사용 (중복 방지)
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });

    return refreshPromise;
  };

  const isRefreshing = (): boolean => {
    return refreshPromise !== null;
  };

  return {
    refreshTokenIfNeeded,
    forceRefresh,
    isRefreshing,
  };
}

/**
 * 버퍼를 적용한 토큰 만료 확인
 */
function isTokenExpiredWithBuffer(token: string, bufferMs: number): boolean {
  // isTokenExpired는 이미 10초 버퍼가 있으므로, 추가 버퍼 적용
  // 여기서는 커스텀 버퍼를 위해 직접 체크
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decoded);

    if (!parsed.exp) return true;

    return Date.now() >= parsed.exp * 1000 - bufferMs;
  } catch {
    return true;
  }
}
