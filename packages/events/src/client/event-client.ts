import type { BaseEvent, EventPayload, EventMetadata } from '../types/base';
import type { EventClientConfig, ResolvedEventClientConfig } from './config';
import { resolveConfig } from './config';
import { generateEventId } from '../utils/id';
import { MemoryBuffer } from '../buffer/memory-buffer';
import { BatchProcessor, type BatchSendResult } from '../batch/batch-processor';
import { withRetry, isRetryableError } from './retry';
import { getUserIdFromToken, getTenantIdFromToken } from '@idea-on-action/utils';

/**
 * 즉시 발송 결과
 */
export interface SendResult {
  /** 성공 여부 */
  success: boolean;
  /** 이벤트 ID */
  eventId: string;
  /** 에러 (실패 시) */
  error?: Error;
}

/**
 * 플러시 결과
 */
export interface FlushResult {
  /** 성공 여부 */
  success: boolean;
  /** 전송 성공한 이벤트 수 */
  sentCount: number;
  /** 전송 실패한 이벤트 수 */
  failedCount: number;
  /** 에러 목록 (실패 시) */
  errors?: Error[];
}

/**
 * 클라이언트 상태
 */
export interface ClientStatus {
  /** 정상 상태 여부 */
  isHealthy: boolean;
  /** 대기 중인 이벤트 수 */
  pendingCount: number;
  /** 처리 중 여부 */
  isProcessing: boolean;
  /** 마지막 에러 */
  lastError?: Error;
}

/**
 * EventClient 클래스
 *
 * Minu 서비스에서 ideaonaction.ai로 이벤트를 발송하는 클라이언트입니다.
 *
 * @example
 * ```ts
 * const client = createEventClient({
 *   endpoint: 'https://api.ideaonaction.ai/events',
 *   getToken: () => accessToken,
 *   service: 'find',
 *   environment: 'production',
 * });
 *
 * // 즉시 발송
 * await client.send({
 *   type: 'agent.executed',
 *   data: { agentType: 'discovery', status: 'success' },
 * });
 *
 * // 배치 큐에 추가
 * await client.enqueue({
 *   type: 'user.opportunity_viewed',
 *   data: { opportunityId: 'opp-123' },
 * });
 *
 * // 종료
 * await client.shutdown();
 * ```
 */
export class EventClient {
  private readonly config: ResolvedEventClientConfig;
  private readonly buffer: MemoryBuffer;
  private readonly batchProcessor: BatchProcessor;
  private lastError?: Error;

  constructor(config: EventClientConfig) {
    this.config = resolveConfig(config);

    this.buffer = new MemoryBuffer(this.config.buffer);

    this.batchProcessor = new BatchProcessor({
      buffer: this.buffer,
      batchConfig: this.config.batch,
      retryConfig: this.config.retry,
      sendEvents: this.sendBatch.bind(this),
      onError: (error) => {
        this.lastError = error;
        this.log(`Batch error: ${error.message}`);
      },
      debug: this.config.debug,
    });

    // 배치 프로세서 시작
    this.batchProcessor.start();
  }

  /**
   * 즉시 발송 (중요 이벤트용)
   *
   * @param payload - 이벤트 페이로드
   * @returns 발송 결과
   */
  async send<T extends string, D extends Record<string, unknown>>(
    payload: EventPayload<T, D>
  ): Promise<SendResult> {
    if (this.config.disabled) {
      const eventId = generateEventId();
      this.log(`[DISABLED] Would send event: ${payload.type}`);
      return { success: true, eventId };
    }

    const event = await this.createEvent(payload);

    try {
      await withRetry(
        () => this.sendBatch([event]),
        this.config.retry,
        isRetryableError
      );

      this.log(`Sent event: ${event.type} (${event.id})`);
      return { success: true, eventId: event.id };
    } catch (error) {
      this.lastError = error as Error;
      this.log(`Failed to send event: ${event.type} - ${(error as Error).message}`);
      return {
        success: false,
        eventId: event.id,
        error: error as Error,
      };
    }
  }

  /**
   * 배치 큐에 추가 (일반 이벤트용)
   *
   * @param payload - 이벤트 페이로드
   */
  async enqueue<T extends string, D extends Record<string, unknown>>(
    payload: EventPayload<T, D>
  ): Promise<void> {
    if (this.config.disabled) {
      this.log(`[DISABLED] Would enqueue event: ${payload.type}`);
      return;
    }

    const event = await this.createEvent(payload);
    this.buffer.enqueue(event);
    this.log(`Enqueued event: ${event.type} (${event.id})`);
  }

  /**
   * 수동 플러시
   *
   * @returns 플러시 결과
   */
  async flush(): Promise<FlushResult> {
    return this.batchProcessor.flush();
  }

  /**
   * 클라이언트 정상 상태 여부
   */
  isHealthy(): boolean {
    return !this.lastError;
  }

  /**
   * 대기 중인 이벤트 수
   */
  getPendingCount(): number {
    return this.buffer.size();
  }

  /**
   * 클라이언트 상태 조회
   */
  getStatus(): ClientStatus {
    return {
      isHealthy: this.isHealthy(),
      pendingCount: this.getPendingCount(),
      isProcessing: this.batchProcessor.isActive(),
      lastError: this.lastError,
    };
  }

  /**
   * 클라이언트 종료 (남은 이벤트 플러시 후 정리)
   */
  async shutdown(): Promise<void> {
    this.log('Shutting down EventClient...');
    await this.batchProcessor.shutdown();
    this.log('EventClient shutdown complete');
  }

  /**
   * 마지막 에러 초기화
   */
  clearError(): void {
    this.lastError = undefined;
  }

  /**
   * 이벤트 생성 (내부용)
   */
  private async createEvent<T extends string, D extends Record<string, unknown>>(
    payload: EventPayload<T, D>
  ): Promise<BaseEvent<T, D>> {
    const token = await this.config.getToken();

    // 토큰에서 메타데이터 추출 (토큰이 없거나 파싱 실패 시 null)
    let userId: string | undefined;
    let tenantId: string | undefined;

    try {
      userId = getUserIdFromToken(token) ?? undefined;
      tenantId = getTenantIdFromToken(token) ?? undefined;
    } catch {
      // 토큰 파싱 실패 시 무시
    }

    // payload의 메타데이터가 토큰에서 추출한 값보다 우선
    const metadata: EventMetadata = {
      environment: this.config.environment,
      userId: payload.metadata?.userId ?? userId,
      tenantId: payload.metadata?.tenantId ?? tenantId,
      sessionId: payload.metadata?.sessionId,
      correlationId: payload.metadata?.correlationId,
    };

    return {
      id: generateEventId(),
      type: payload.type,
      service: this.config.service,
      timestamp: new Date().toISOString(),
      version: this.config.schemaVersion,
      metadata,
      data: payload.data,
    } as BaseEvent<T, D>;
  }

  /**
   * 배치 전송 (내부용)
   */
  private async sendBatch(events: BaseEvent[]): Promise<void> {
    const token = await this.config.getToken();

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      const error = new Error(
        `Event send failed: ${response.status} ${response.statusText}`
      ) as Error & { statusCode?: number };
      error.statusCode = response.status;
      throw error;
    }
  }

  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[EventClient] ${message}`);
    }
  }
}

/**
 * EventClient 팩토리 함수
 *
 * @param config - 클라이언트 설정
 * @returns EventClient 인스턴스
 */
export function createEventClient(config: EventClientConfig): EventClient {
  return new EventClient(config);
}
