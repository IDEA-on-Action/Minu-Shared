import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApiClient, type ApiClientConfig } from './api-client';

// fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('createApiClient', () => {
  let config: ApiClientConfig;
  let mockOnUnauthorized: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch.mockReset();
    mockOnUnauthorized = vi.fn();
    config = {
      baseUrl: 'https://api.example.com',
      getAccessToken: () => 'test-token',
      onUnauthorized: mockOnUnauthorized,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('request 헤더', () => {
    it('Authorization 헤더에 토큰을 포함한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1' }),
      });

      const api = createApiClient(config);
      await api.getUser();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/users/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('토큰이 없으면 Authorization 헤더를 포함하지 않는다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1' }),
      });

      const api = createApiClient({
        ...config,
        getAccessToken: () => null,
      });
      await api.getUser();

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers.Authorization).toBeUndefined();
    });
  });

  describe('getUser', () => {
    it('현재 사용자 정보를 조회한다', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const api = createApiClient(config);
      const result = await api.getUser();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockUser);
      }
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/users/me',
        expect.any(Object)
      );
    });
  });

  describe('getUserById', () => {
    it('특정 사용자 정보를 조회한다', async () => {
      const mockUser = { id: '123', email: 'user@example.com' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const api = createApiClient(config);
      const result = await api.getUserById('123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockUser);
      }
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/users/123',
        expect.any(Object)
      );
    });
  });

  describe('getSubscription', () => {
    it('현재 사용자 구독 정보를 조회한다', async () => {
      const mockSubscription = { id: 'sub-1', plan: 'pro', status: 'active' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSubscription),
      });

      const api = createApiClient(config);
      const result = await api.getSubscription();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockSubscription);
      }
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/subscriptions/me',
        expect.any(Object)
      );
    });
  });

  describe('updateProfile', () => {
    it('사용자 프로필을 업데이트한다', async () => {
      const mockUpdatedUser = { id: '1', name: 'Updated Name' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdatedUser),
      });

      const api = createApiClient(config);
      const result = await api.updateProfile({ name: 'Updated Name' });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/users/me',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated Name' }),
        })
      );
    });
  });

  describe('범용 메서드', () => {
    it('get 메서드로 GET 요청을 보낸다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      });

      const api = createApiClient(config);
      const result = await api.get('/api/custom');

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/custom',
        expect.any(Object)
      );
    });

    it('post 메서드로 POST 요청을 보낸다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'new-1' }),
      });

      const api = createApiClient(config);
      const result = await api.post('/api/items', { name: 'New Item' });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New Item' }),
        })
      );
    });

    it('put 메서드로 PUT 요청을 보낸다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', name: 'Updated' }),
      });

      const api = createApiClient(config);
      const result = await api.put('/api/items/1', { name: 'Updated' });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/items/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        })
      );
    });

    it('delete 메서드로 DELETE 요청을 보낸다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const api = createApiClient(config);
      const result = await api.delete('/api/items/1');

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/items/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('에러 처리', () => {
    it('401 응답 시 onUnauthorized를 호출하고 에러를 반환한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const api = createApiClient(config);
      const result = await api.getUser();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
        expect(result.error.message).toBe('인증이 필요합니다.');
      }
      expect(mockOnUnauthorized).toHaveBeenCalled();
    });

    it('401 응답 시 onUnauthorized가 없어도 동작한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const api = createApiClient({
        baseUrl: 'https://api.example.com',
        getAccessToken: () => 'token',
      });
      const result = await api.getUser();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('API 에러 시 에러 메시지를 반환한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: '잘못된 요청입니다.' }),
      });

      const api = createApiClient(config);
      const result = await api.getUser();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('API_ERROR');
        expect(result.error.message).toBe('잘못된 요청입니다.');
      }
    });

    it('API 에러 시 JSON 파싱 실패하면 기본 메시지를 사용한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('JSON parse error')),
      });

      const api = createApiClient(config);
      const result = await api.getUser();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('API_ERROR');
        expect(result.error.message).toBe('요청 처리 중 오류가 발생했습니다.');
      }
    });

    it('네트워크 에러 시 NETWORK_ERROR를 반환한다', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const api = createApiClient(config);
      const result = await api.getUser();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NETWORK_ERROR');
        expect(result.error.message).toBe('네트워크 오류가 발생했습니다.');
      }
    });
  });
});
