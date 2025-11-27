import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTokenRefreshManager } from './token-refresh';

// 테스트용 JWT 생성 함수
function createTestJWT(expiresInSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: 'user123',
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    })
  );
  const signature = 'test-signature';
  return `${header}.${payload}.${signature}`;
}

describe('createTokenRefreshManager', () => {
  let accessToken: string | null;
  let refreshToken: string | null;

  beforeEach(() => {
    accessToken = null;
    refreshToken = 'refresh-token';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createManager = (overrides = {}) => {
    return createTokenRefreshManager({
      getAccessToken: () => accessToken,
      getRefreshToken: () => refreshToken,
      refreshFn: vi.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
      onTokenRefreshed: vi.fn(),
      onRefreshFailed: vi.fn(),
      ...overrides,
    });
  };

  describe('refreshTokenIfNeeded', () => {
    it('토큰이 없으면 갱신 시도', async () => {
      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      });
      const manager = createManager({ refreshFn });

      await manager.refreshTokenIfNeeded();

      expect(refreshFn).toHaveBeenCalled();
    });

    it('토큰이 만료되지 않았으면 갱신 안 함', async () => {
      accessToken = createTestJWT(3600); // 1시간 후 만료
      const refreshFn = vi.fn();
      const manager = createManager({ refreshFn });

      const result = await manager.refreshTokenIfNeeded();

      expect(result).toBe(true);
      expect(refreshFn).not.toHaveBeenCalled();
    });

    it('토큰이 만료되었으면 갱신', async () => {
      accessToken = createTestJWT(-10); // 이미 만료
      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      });
      const manager = createManager({ refreshFn });

      await manager.refreshTokenIfNeeded();

      expect(refreshFn).toHaveBeenCalled();
    });
  });

  describe('forceRefresh', () => {
    it('강제 갱신 성공 시 true 반환', async () => {
      const onTokenRefreshed = vi.fn();
      const manager = createManager({ onTokenRefreshed });

      const result = await manager.forceRefresh();

      expect(result).toBe(true);
      expect(onTokenRefreshed).toHaveBeenCalledWith({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('갱신 실패 시 false 반환 및 콜백 호출', async () => {
      const onRefreshFailed = vi.fn();
      const refreshFn = vi.fn().mockRejectedValue(new Error('Network error'));
      const manager = createManager({ refreshFn, onRefreshFailed });

      const result = await manager.forceRefresh();

      expect(result).toBe(false);
      expect(onRefreshFailed).toHaveBeenCalled();
    });

    it('리프레시 토큰 없으면 실패', async () => {
      refreshToken = null;
      const onRefreshFailed = vi.fn();
      const manager = createManager({ onRefreshFailed });

      const result = await manager.forceRefresh();

      expect(result).toBe(false);
      expect(onRefreshFailed).toHaveBeenCalled();
    });
  });

  describe('isRefreshing', () => {
    it('갱신 중이 아니면 false', () => {
      const manager = createManager();

      expect(manager.isRefreshing()).toBe(false);
    });

    it('갱신 중이면 true', async () => {
      let resolveRefresh: (value: unknown) => void;
      const refreshFn = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
      );
      const manager = createManager({ refreshFn });

      const refreshPromise = manager.forceRefresh();
      expect(manager.isRefreshing()).toBe(true);

      resolveRefresh!({ accessToken: 'new', refreshToken: 'new' });
      await refreshPromise;

      expect(manager.isRefreshing()).toBe(false);
    });
  });

  describe('동시 요청 처리', () => {
    it('동시에 여러 번 호출해도 한 번만 갱신', async () => {
      const refreshFn = vi.fn().mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      });
      const manager = createManager({ refreshFn });

      // 동시에 3번 호출
      const results = await Promise.all([
        manager.forceRefresh(),
        manager.forceRefresh(),
        manager.forceRefresh(),
      ]);

      expect(refreshFn).toHaveBeenCalledTimes(1);
      expect(results).toEqual([true, true, true]);
    });
  });
});
