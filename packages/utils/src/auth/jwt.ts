import type { JWTPayload, MinuService } from '@minu/types';

/**
 * JWT 토큰을 파싱하여 페이로드 반환
 * 서명 검증은 하지 않음 (서버에서 검증 필요)
 *
 * @example
 * ```tsx
 * const payload = parseJWT(token);
 * if (payload) {
 *   console.log(payload.email);
 *   console.log(payload.services);
 * }
 * ```
 */
export function parseJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * JWT 토큰 만료 여부 확인
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }
  // 만료 10초 전부터 만료로 처리 (버퍼)
  return Date.now() >= (payload.exp * 1000) - 10000;
}

/**
 * JWT에서 특정 서비스 접근 권한 확인
 */
export function hasServiceAccess(token: string, service: MinuService): boolean {
  const payload = parseJWT(token);
  if (!payload || !payload.services) {
    return false;
  }
  return payload.services.includes(service);
}

/**
 * JWT에서 구독 플랜 확인
 */
export function getSubscriptionPlan(token: string): string | null {
  const payload = parseJWT(token);
  return payload?.plan ?? null;
}

/**
 * JWT에서 사용자 ID 추출
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = parseJWT(token);
  return payload?.sub ?? null;
}

/**
 * JWT에서 테넌트 ID 추출 (멀티테넌시)
 */
export function getTenantIdFromToken(token: string): string | null {
  const payload = parseJWT(token);
  return payload?.tenant_id ?? null;
}
