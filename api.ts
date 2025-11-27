/**
 * API 에러 코드
 */
export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR';

/**
 * API 에러
 */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * API 응답 (성공)
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * API 응답 (실패)
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

/**
 * API 응답 (통합)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 페이지네이션 메타 정보
 */
export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * 정렬 방향
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 정렬 옵션
 */
export interface SortOption<T extends string = string> {
  field: T;
  direction: SortDirection;
}
