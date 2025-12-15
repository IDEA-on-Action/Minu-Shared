import type { BaseEvent } from './base';

/**
 * HTTP 메서드
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * 실행 상태
 */
export type ExecutionStatus = 'success' | 'failed' | 'partial';

/**
 * 검색 타입
 */
export type SearchType = 'keyword' | 'semantic' | 'filter';

/**
 * API 사용량 보고 이벤트
 */
export interface ApiUsageEvent extends BaseEvent<'api.usage_reported'> {
  data: {
    endpoint: string;
    method: HttpMethod;
    statusCode: number;
    responseTimeMs: number;
    requestSize?: number;
    responseSize?: number;
  };
}

/**
 * Agent 실행 이벤트
 */
export interface AgentExecutedEvent extends BaseEvent<'agent.executed'> {
  data: {
    agentType: string;
    action?: string;
    executionTimeMs: number;
    tokenUsage?: {
      input: number;
      output: number;
    };
    status: ExecutionStatus;
    errorCode?: string;
  };
}

/**
 * 기회 검색 이벤트 (Find 전용)
 */
export interface OpportunitySearchedEvent extends BaseEvent<'opportunity.searched'> {
  data: {
    query?: string;
    filters?: Record<string, unknown>;
    resultCount: number;
    searchType: SearchType;
    responseTimeMs: number;
  };
}

/**
 * 사용량 이벤트 유니온
 */
export type UsageEvent =
  | ApiUsageEvent
  | AgentExecutedEvent
  | OpportunitySearchedEvent;

/**
 * 사용량 이벤트 타입 열거형
 */
export type UsageEventType = UsageEvent['type'];
