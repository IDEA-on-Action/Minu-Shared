import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { Errors } from '../middleware/error-handler';

export const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * 토큰 검증
 * ideaonaction.ai에서 발급된 JWT를 검증합니다.
 */
authRoutes.post('/verify', async (c) => {
  const { token } = await c.req.json<{ token: string }>();

  if (!token) {
    throw Errors.BAD_REQUEST('Token is required');
  }

  // JWT 검증은 auth 미들웨어에서 수행
  // 여기서는 토큰 형식만 확인
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw Errors.BAD_REQUEST('Invalid token format');
  }

  try {
    // 페이로드 디코딩 (검증 없이)
    const payload = JSON.parse(atob(parts[1]));

    return c.json({
      success: true,
      data: {
        valid: true,
        payload: {
          sub: payload.sub,
          email: payload.email,
          exp: payload.exp,
        },
      },
    });
  } catch {
    throw Errors.BAD_REQUEST('Invalid token format');
  }
});

/**
 * 토큰 갱신 요청
 * ideaonaction.ai로 토큰 갱신 요청을 프록시합니다.
 */
authRoutes.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();

  if (!refreshToken) {
    throw Errors.BAD_REQUEST('Refresh token is required');
  }

  // TODO: ideaonaction.ai의 토큰 갱신 엔드포인트 호출
  // const response = await fetch('https://api.ideaonaction.ai/auth/refresh', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ refreshToken }),
  // });

  return c.json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Token refresh should be done through ideaonaction.ai',
    },
  }, 501);
});

/**
 * 로그아웃 (토큰 블랙리스트)
 */
authRoutes.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw Errors.BAD_REQUEST('Authorization header is required');
  }

  const token = authHeader.slice(7);
  const tokenSuffix = token.slice(-16);

  // 토큰을 블랙리스트에 추가 (24시간 TTL)
  await c.env.SESSION_KV.put(
    `blacklist:${tokenSuffix}`,
    'revoked',
    { expirationTtl: 86400 }
  );

  return c.json({
    success: true,
    message: 'Successfully logged out',
  });
});
