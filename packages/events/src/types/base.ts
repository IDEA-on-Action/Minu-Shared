/**
 * 서비스 식별자
 */
export type ServiceName = 'find' | 'frame' | 'build' | 'keep' | 'portal';

/**
 * 환경 타입
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * 이벤트 메타데이터
 */
export interface EventMetadata {
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  correlationId?: string;
  environment: Environment;
}

/**
 * 기본 이벤트 인터페이스
 */
export interface BaseEvent<T extends string = string, D = Record<string, unknown>> {
  /** 고유 이벤트 ID (evt_ 접두사) */
  id: string;
  /** 이벤트 타입 */
  type: T;
  /** 발신 서비스 */
  service: ServiceName;
  /** ISO 8601 타임스탬프 */
  timestamp: string;
  /** 스키마 버전 */
  version: string;
  /** 메타데이터 */
  metadata: EventMetadata;
  /** 이벤트 데이터 */
  data: D;
}

/**
 * 이벤트 생성 페이로드 (id, timestamp, service, version 자동 생성)
 */
export type EventPayload<T extends string = string, D = Record<string, unknown>> = {
  type: T;
  metadata?: Partial<Omit<EventMetadata, 'environment'>>;
  data: D;
};

/**
 * 모든 이벤트 타입 유니온 (확장 가능)
 */
export type AnyEvent = BaseEvent<string, Record<string, unknown>>;
