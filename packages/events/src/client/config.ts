import type { ServiceName, Environment } from '../types/base';

/**
 * 인증 방식
 */
export type AuthMethod = 'bearer' | 'hmac';

/**
 * Bearer 토큰 인증 설정
 */
export interface BearerAuthConfig {
  method: 'bearer';
  /** JWT 토큰 또는 토큰 제공 함수 */
  getToken: () => string | Promise<string>;
}

/**
 * HMAC 인증 설정
 */
export interface HmacAuthConfig {
  method: 'hmac';
  /** HMAC 서명용 시크릿 키 */
  secret: string;
  /** 서비스 ID (X-Service-Id 헤더) */
  serviceId: string;
}

/**
 * 인증 설정 (Bearer 또는 HMAC)
 */
export type AuthConfig = BearerAuthConfig | HmacAuthConfig;

/**
 * 재시도 설정
 */
export interface RetryConfig {
  /** 최대 재시도 횟수 (기본: 3) */
  maxRetries: number;
  /** 초기 지연 시간 (ms) (기본: 1000) */
  initialDelayMs: number;
  /** 최대 지연 시간 (ms) (기본: 30000) */
  maxDelayMs: number;
  /** 백오프 배수 (기본: 2) */
  backoffMultiplier: number;
}

/**
 * 배치 설정
 */
export interface BatchConfig {
  /** 최대 배치 크기 (기본: 100) */
  maxBatchSize: number;
  /** 플러시 간격 (ms) (기본: 5000) */
  flushIntervalMs: number;
}

/**
 * 버퍼 설정
 */
export interface BufferConfig {
  /** 최대 버퍼 크기 (기본: 10000) */
  maxSize: number;
  /** 오버플로우 처리 방식 */
  onOverflow: 'drop-oldest' | 'drop-newest' | 'error';
}

/**
 * EventClient 설정
 */
export interface EventClientConfig {
  /** ideaonaction.ai 이벤트 수신 엔드포인트 */
  endpoint: string;

  /** 발신 서비스 식별자 */
  service: ServiceName;

  /** 환경 */
  environment: Environment;

  /**
   * 인증 설정
   * - Bearer: JWT 토큰 기반 (기본, 서버 환경 권장)
   * - HMAC: 서명 기반 (Vercel 등 서버리스 환경 권장)
   */
  auth?: AuthConfig;

  /**
   * @deprecated auth 옵션 사용 권장. 하위 호환성을 위해 유지됨.
   * auth 옵션이 없을 때 Bearer 인증에 사용됩니다.
   */
  getToken?: () => string | Promise<string>;

  /** 스키마 버전 (기본: '1.0') */
  schemaVersion?: string;

  /** 재시도 설정 */
  retry?: Partial<RetryConfig>;

  /** 배치 설정 */
  batch?: Partial<BatchConfig>;

  /** 버퍼 설정 */
  buffer?: Partial<BufferConfig>;

  /** 디버그 모드 (로깅 활성화) */
  debug?: boolean;

  /** 비활성화 (이벤트 발송 안함, 테스트용) */
  disabled?: boolean;
}

/**
 * 기본 재시도 설정
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

/**
 * 기본 배치 설정
 */
export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxBatchSize: 100,
  flushIntervalMs: 5000,
};

/**
 * 기본 버퍼 설정
 */
export const DEFAULT_BUFFER_CONFIG: BufferConfig = {
  maxSize: 10000,
  onOverflow: 'drop-oldest',
};

/**
 * 완전한 설정 타입 (모든 필드 필수)
 */
export interface ResolvedEventClientConfig {
  endpoint: string;
  service: ServiceName;
  environment: Environment;
  auth: AuthConfig;
  schemaVersion: string;
  retry: RetryConfig;
  batch: BatchConfig;
  buffer: BufferConfig;
  debug: boolean;
  disabled: boolean;
}

/**
 * 설정 병합 유틸리티
 */
export function resolveConfig(config: EventClientConfig): ResolvedEventClientConfig {
  // 인증 설정 결정: auth 옵션 우선, 없으면 getToken으로 Bearer 인증
  let auth: AuthConfig;

  if (config.auth) {
    auth = config.auth;
  } else if (config.getToken) {
    // 하위 호환성: getToken이 있으면 Bearer 인증으로 변환
    auth = { method: 'bearer', getToken: config.getToken };
  } else {
    throw new Error('EventClientConfig: auth 또는 getToken 중 하나는 필수입니다.');
  }

  return {
    endpoint: config.endpoint,
    service: config.service,
    environment: config.environment,
    auth,
    schemaVersion: config.schemaVersion ?? '1.0',
    retry: { ...DEFAULT_RETRY_CONFIG, ...config.retry },
    batch: { ...DEFAULT_BATCH_CONFIG, ...config.batch },
    buffer: { ...DEFAULT_BUFFER_CONFIG, ...config.buffer },
    debug: config.debug ?? false,
    disabled: config.disabled ?? false,
  };
}
