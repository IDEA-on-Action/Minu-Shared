import type { BaseEvent } from '../types/base';
import type { BatchConfig, RetryConfig } from '../client/config';
import type { EventBuffer } from '../buffer/types';
import { withRetry, isRetryableError } from '../client/retry';

/**
 * 배치 발송 결과
 */
export interface BatchSendResult {
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
 * 이벤트 전송 함수 타입
 */
export type SendEventsFn = (events: BaseEvent[]) => Promise<void>;

/**
 * 배치 프로세서 옵션
 */
export interface BatchProcessorOptions<T extends BaseEvent = BaseEvent> {
  /** 이벤트 버퍼 */
  buffer: EventBuffer<T>;
  /** 배치 설정 */
  batchConfig: BatchConfig;
  /** 재시도 설정 */
  retryConfig: RetryConfig;
  /** 이벤트 전송 함수 */
  sendEvents: SendEventsFn;
  /** 에러 콜백 */
  onError?: (error: Error) => void;
  /** 디버그 모드 */
  debug?: boolean;
}

/**
 * 배치 프로세서
 *
 * 버퍼의 이벤트를 주기적으로 배치 전송합니다.
 */
export class BatchProcessor<T extends BaseEvent = BaseEvent> {
  private readonly buffer: EventBuffer<T>;
  private readonly batchConfig: BatchConfig;
  private readonly retryConfig: RetryConfig;
  private readonly sendEvents: SendEventsFn;
  private readonly onError?: (error: Error) => void;
  private readonly debug: boolean;

  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;
  private isShutdown = false;

  constructor(options: BatchProcessorOptions<T>) {
    this.buffer = options.buffer;
    this.batchConfig = options.batchConfig;
    this.retryConfig = options.retryConfig;
    this.sendEvents = options.sendEvents;
    this.onError = options.onError;
    this.debug = options.debug ?? false;
  }

  /**
   * 주기적 플러시 타이머 시작
   */
  start(): void {
    if (this.flushTimer) {
      return; // 이미 실행 중
    }

    this.isShutdown = false;
    this.flushTimer = setInterval(() => {
      this.flush().catch((error) => {
        this.onError?.(error as Error);
      });
    }, this.batchConfig.flushIntervalMs);

    this.log('BatchProcessor started');
  }

  /**
   * 타이머 중지
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.log('BatchProcessor stopped');
  }

  /**
   * 수동 플러시 (또는 타이머에 의한 자동 플러시)
   */
  async flush(): Promise<BatchSendResult> {
    // 종료 상태면 무시
    if (this.isShutdown) {
      return { success: false, sentCount: 0, failedCount: 0 };
    }

    // 이미 처리 중이면 건너뛰기
    if (this.isProcessing) {
      this.log('Already processing, skipping flush');
      return { success: true, sentCount: 0, failedCount: 0 };
    }

    // 빈 버퍼면 즉시 반환
    if (this.buffer.isEmpty()) {
      return { success: true, sentCount: 0, failedCount: 0 };
    }

    this.isProcessing = true;

    try {
      let totalSent = 0;
      let totalFailed = 0;
      const errors: Error[] = [];

      // 버퍼가 빌 때까지 배치 단위로 전송
      while (!this.buffer.isEmpty()) {
        const batch = this.buffer.peek(this.batchConfig.maxBatchSize);
        const events = batch.map((b) => b.event);

        try {
          await withRetry(
            () => this.sendEvents(events),
            this.retryConfig,
            isRetryableError
          );

          // 전송 성공 시 버퍼에서 제거
          this.buffer.remove(batch.length);
          totalSent += batch.length;
          this.log(`Sent ${batch.length} events`);
        } catch (error) {
          errors.push(error as Error);
          totalFailed += batch.length;
          // 실패한 배치는 버퍼에 남겨둠 (다음 플러시에서 재시도)
          this.log(`Failed to send ${batch.length} events: ${(error as Error).message}`);
          break;
        }
      }

      return {
        success: totalFailed === 0,
        sentCount: totalSent,
        failedCount: totalFailed,
        errors: errors.length > 0 ? errors : undefined,
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 종료 (남은 이벤트 플러시 후 정리)
   */
  async shutdown(): Promise<BatchSendResult> {
    this.log('Shutting down...');
    this.stop();

    // 마지막 플러시 시도 (isShutdown 설정 전에 실행)
    const result = await this.flush();

    this.isShutdown = true;
    this.log('Shutdown complete');

    return result;
  }

  /**
   * 처리 중 여부
   */
  isActive(): boolean {
    return this.isProcessing;
  }

  /**
   * 타이머 실행 중 여부
   */
  isRunning(): boolean {
    return this.flushTimer !== null;
  }

  private log(message: string): void {
    if (this.debug) {
      console.log(`[BatchProcessor] ${message}`);
    }
  }
}
