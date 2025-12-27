import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { requestId } from 'hono/request-id';

import type { Env, Variables } from './types';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { errorHandler } from './middleware/error-handler';

// Routes
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { usersRoutes } from './routes/users';
import { tenantsRoutes } from './routes/tenants';
import { findRoutes } from './routes/find';
import { frameRoutes } from './routes/frame';
import { buildRoutes } from './routes/build';
import { keepRoutes } from './routes/keep';

// Durable Objects
export { RateLimiter } from './durable-objects/rate-limiter';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================
// 글로벌 미들웨어
// ============================================

// Request ID
app.use('*', requestId());

// 요청 시작 시간
app.use('*', async (c, next) => {
  c.set('startTime', Date.now());
  await next();
});

// Logger (개발 환경에서만)
app.use('*', async (c, next) => {
  if (c.env.ENVIRONMENT === 'development') {
    return logger()(c, next);
  }
  await next();
});

// CORS
app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowedOrigins = [
        'https://minu.best',
        'https://find.minu.best',
        'https://frame.minu.best',
        'https://build.minu.best',
        'https://keep.minu.best',
        'http://localhost:3000',
        'http://localhost:5173',
      ];
      return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    },
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Tenant-ID'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
  })
);

// Secure Headers
app.use('*', secureHeaders());

// Rate Limiting (인증 필요 없는 엔드포인트)
app.use('/api/v1/auth/*', rateLimitMiddleware({ limit: 20, window: 60 }));

// 에러 핸들러
app.onError(errorHandler);

// ============================================
// Public Routes (인증 불필요)
// ============================================

app.route('/health', healthRoutes);
app.route('/api/v1/auth', authRoutes);

// ============================================
// Protected Routes (인증 필요)
// ============================================

// 인증 미들웨어 적용
app.use('/api/v1/*', authMiddleware);

// Rate Limiting (인증된 요청)
app.use('/api/v1/*', rateLimitMiddleware({ limit: 100, window: 60 }));

// 라우트 등록
app.route('/api/v1/users', usersRoutes);
app.route('/api/v1/tenants', tenantsRoutes);
app.route('/api/v1/find', findRoutes);
app.route('/api/v1/frame', frameRoutes);
app.route('/api/v1/build', buildRoutes);
app.route('/api/v1/keep', keepRoutes);

// ============================================
// 404 핸들러
// ============================================

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${c.req.method} ${c.req.path} not found`,
      },
    },
    404
  );
});

export default app;
