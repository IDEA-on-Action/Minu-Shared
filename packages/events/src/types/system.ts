import type { BaseEvent } from './base';

/**
 * 동기화 상태
 */
export type SyncStatus = 'success' | 'partial' | 'failed';

/**
 * 헬스 상태
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * 소스 동기화 완료 이벤트
 */
export interface SourceSyncedEvent extends BaseEvent<'source.synced'> {
  data: {
    sourceId: string;
    sourceName: string;
    sourceType: string;
    recordsIngested: number;
    recordsUpdated: number;
    recordsSkipped: number;
    durationMs: number;
    status: SyncStatus;
    errorMessage?: string;
  };
}

/**
 * 기회 수집 이벤트
 */
export interface OpportunityIngestedEvent extends BaseEvent<'opportunity.ingested'> {
  data: {
    opportunityId: string;
    sourceId: string;
    isNew: boolean;
    category?: string;
    domain?: string;
  };
}

/**
 * 시스템 헬스 체크 이벤트
 */
export interface HealthCheckEvent extends BaseEvent<'system.health_check'> {
  data: {
    component: string;
    status: HealthStatus;
    responseTimeMs: number;
    details?: Record<string, unknown>;
  };
}

/**
 * 시스템 이벤트 유니온
 */
export type SystemEvent =
  | SourceSyncedEvent
  | OpportunityIngestedEvent
  | HealthCheckEvent;

/**
 * 시스템 이벤트 타입 열거형
 */
export type SystemEventType = SystemEvent['type'];
