import type { Context } from 'hono';

/**
 * 표준 API 응답 형식
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    requestId?: string;
    duration?: number;
  };
}

/**
 * 성공 응답 생성
 */
export function successResponse<T>(
  c: Context,
  data: T,
  statusCode: number = 200
) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      requestId: c.get('requestId'),
      duration: c.get('startTime') ? Date.now() - c.get('startTime') : undefined,
    },
  };

  return c.json(response, statusCode as any);
}

/**
 * 페이지네이션 응답 생성
 */
export function paginatedResponse<T>(
  c: Context,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
) {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
    meta: {
      requestId: c.get('requestId'),
      duration: c.get('startTime') ? Date.now() - c.get('startTime') : undefined,
    },
  };

  return c.json(response);
}

/**
 * 에러 응답 생성
 */
export function errorResponse(
  c: Context,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: Record<string, unknown>
) {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: {
      requestId: c.get('requestId'),
    },
  };

  return c.json(response, statusCode as any);
}
