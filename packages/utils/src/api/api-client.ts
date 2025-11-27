import type { User, Subscription, ApiResponse } from '@minu/types';

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken: () => string | null;
  onUnauthorized?: () => void;
}

/**
 * ideaonaction.ai API 클라이언트
 *
 * @example
 * ```tsx
 * const api = createApiClient({
 *   baseUrl: process.env.NEXT_PUBLIC_PARENT_DOMAIN!,
 *   getAccessToken: () => localStorage.getItem('access_token'),
 *   onUnauthorized: () => router.push('/login'),
 * });
 *
 * const user = await api.getUser();
 * ```
 */
export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, getAccessToken, onUnauthorized } = config;

  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        onUnauthorized?.();
        return {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' },
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: 'API_ERROR',
            message: errorData.message || '요청 처리 중 오류가 발생했습니다.',
          },
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '네트워크 오류가 발생했습니다.',
        },
      };
    }
  }

  return {
    /**
     * 현재 사용자 정보 조회
     */
    getUser: () => request<User>('/api/users/me'),

    /**
     * 특정 사용자 정보 조회
     */
    getUserById: (userId: string) => request<User>(`/api/users/${userId}`),

    /**
     * 현재 사용자 구독 정보 조회
     */
    getSubscription: () => request<Subscription>('/api/subscriptions/me'),

    /**
     * 사용자 프로필 업데이트
     */
    updateProfile: (data: Partial<User>) =>
      request<User>('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    /**
     * 범용 GET 요청
     */
    get: <T>(endpoint: string) => request<T>(endpoint),

    /**
     * 범용 POST 요청
     */
    post: <T>(endpoint: string, data: unknown) =>
      request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /**
     * 범용 PUT 요청
     */
    put: <T>(endpoint: string, data: unknown) =>
      request<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    /**
     * 범용 DELETE 요청
     */
    delete: <T>(endpoint: string) =>
      request<T>(endpoint, { method: 'DELETE' }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
