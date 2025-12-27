import type { Context } from 'hono';
import type { Env, Variables } from '../types';

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 사전 정의된 에러
 */
export const Errors = {
  BAD_REQUEST: (message = 'Bad request', details?: Record<string, unknown>) =>
    new ApiError('BAD_REQUEST', message, 400, details),

  UNAUTHORIZED: (message = 'Unauthorized') =>
    new ApiError('UNAUTHORIZED', message, 401),

  FORBIDDEN: (message = 'Forbidden') =>
    new ApiError('FORBIDDEN', message, 403),

  NOT_FOUND: (resource = 'Resource') =>
    new ApiError('NOT_FOUND', `${resource} not found`, 404),

  CONFLICT: (message = 'Resource already exists') =>
    new ApiError('CONFLICT', message, 409),

  VALIDATION_ERROR: (details: Record<string, unknown>) =>
    new ApiError('VALIDATION_ERROR', 'Validation failed', 400, details),

  INTERNAL_ERROR: (message = 'Internal server error') =>
    new ApiError('INTERNAL_ERROR', message, 500),
};

/**
 * 글로벌 에러 핸들러
 */
export const errorHandler = (
  err: Error,
  c: Context<{ Bindings: Env; Variables: Variables }>
) => {
  const requestId = c.get('requestId');
  const startTime = c.get('startTime');
  const duration = startTime ? Date.now() - startTime : undefined;

  // API 에러인 경우
  if (err instanceof ApiError) {
    console.error(`[${requestId}] ApiError:`, {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      duration,
    });

    return c.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details && { details: err.details }),
        },
        meta: {
          requestId,
          ...(duration && { duration }),
        },
      },
      err.statusCode as any
    );
  }

  // 일반 에러인 경우
  console.error(`[${requestId}] Unhandled error:`, err);

  // 프로덕션에서는 상세 에러 숨기기
  const isProduction = c.env.ENVIRONMENT === 'production';
  const message = isProduction
    ? 'An unexpected error occurred'
    : err.message;

  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message,
        ...((!isProduction && err.stack) && { stack: err.stack }),
      },
      meta: {
        requestId,
        ...(duration && { duration }),
      },
    },
    500
  );
};

/**
 * 에러 래퍼 - 비동기 핸들러에서 에러를 던질 때 사용
 */
export const throwError = (error: ApiError): never => {
  throw error;
};
