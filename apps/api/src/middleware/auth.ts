import { createMiddleware } from 'hono/factory';
import * as jose from 'jose';
import type { Env, Variables, JwtPayload, AuthContext } from '../types';

/**
 * JWT 인증 미들웨어
 *
 * Authorization: Bearer <token> 헤더에서 JWT를 추출하고 검증합니다.
 * 검증된 사용자 정보는 c.get('auth')로 접근할 수 있습니다.
 */
export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      },
      401
    );
  }

  const token = authHeader.slice(7);

  try {
    // JWT 검증
    const payload = await verifyJwt(token, c.env.JWT_PUBLIC_KEY);

    // 토큰 만료 확인
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return c.json(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token has expired',
          },
        },
        401
      );
    }

    // 세션 유효성 확인 (KV에서 블랙리스트 체크)
    const isBlacklisted = await c.env.SESSION_KV.get(`blacklist:${token.slice(-16)}`);
    if (isBlacklisted) {
      return c.json(
        {
          success: false,
          error: {
            code: 'TOKEN_REVOKED',
            message: 'Token has been revoked',
          },
        },
        401
      );
    }

    // 인증 컨텍스트 설정
    const auth: AuthContext = {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      tenantId: payload.tenant_id,
      role: payload.role,
    };

    c.set('auth', auth);
    await next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or malformed token',
        },
      },
      401
    );
  }
});

/**
 * 선택적 인증 미들웨어
 *
 * 토큰이 있으면 검증하고, 없으면 통과합니다.
 */
export const optionalAuthMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyJwt(token, c.env.JWT_PUBLIC_KEY);

    if (payload.exp && payload.exp * 1000 >= Date.now()) {
      const auth: AuthContext = {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
        tenantId: payload.tenant_id,
        role: payload.role,
      };
      c.set('auth', auth);
    }
  } catch {
    // 토큰이 유효하지 않아도 통과
  }

  await next();
});

/**
 * 역할 기반 접근 제어 미들웨어
 */
export const requireRole = (...roles: string[]) => {
  return createMiddleware<{
    Bindings: Env;
    Variables: Variables;
  }>(async (c, next) => {
    const auth = c.get('auth');

    if (!auth) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        401
      );
    }

    if (!auth.role || !roles.includes(auth.role)) {
      return c.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        },
        403
      );
    }

    await next();
  });
};

/**
 * 테넌트 접근 검증 미들웨어
 */
export const requireTenant = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const auth = c.get('auth');

  if (!auth?.tenantId) {
    return c.json(
      {
        success: false,
        error: {
          code: 'TENANT_REQUIRED',
          message: 'Tenant context required',
        },
      },
      400
    );
  }

  await next();
});

/**
 * JWT 검증 함수
 */
async function verifyJwt(token: string, publicKeyPem: string): Promise<JwtPayload> {
  const publicKey = await jose.importSPKI(publicKeyPem, 'RS256');
  const { payload } = await jose.jwtVerify(token, publicKey, {
    issuer: 'ideaonaction.ai',
  });

  return payload as unknown as JwtPayload;
}
