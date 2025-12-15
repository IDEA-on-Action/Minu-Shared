import type { BaseEvent } from '../types/base';
import type { BufferConfig } from '../client/config';
import type { EventBuffer, BufferedEvent } from './types';

/**
 * 버퍼 오버플로우 에러
 */
export class BufferOverflowError extends Error {
  constructor(maxSize: number) {
    super(`Buffer overflow: maximum size of ${maxSize} exceeded`);
    this.name = 'BufferOverflowError';
  }
}

/**
 * 인메모리 이벤트 버퍼
 */
export class MemoryBuffer<T extends BaseEvent = BaseEvent> implements EventBuffer<T> {
  private buffer: BufferedEvent<T>[] = [];
  private readonly config: BufferConfig;

  constructor(config: BufferConfig) {
    this.config = config;
  }

  /**
   * 이벤트 추가
   */
  enqueue(event: T): void {
    const bufferedEvent: BufferedEvent<T> = {
      event,
      enqueuedAt: Date.now(),
      retryCount: 0,
    };

    // 오버플로우 처리
    if (this.buffer.length >= this.config.maxSize) {
      switch (this.config.onOverflow) {
        case 'drop-oldest':
          this.buffer.shift();
          break;
        case 'drop-newest':
          // 새 이벤트 무시
          return;
        case 'error':
          throw new BufferOverflowError(this.config.maxSize);
      }
    }

    this.buffer.push(bufferedEvent);
  }

  /**
   * 이벤트 배치 조회 (제거하지 않음)
   */
  peek(count: number): BufferedEvent<T>[] {
    return this.buffer.slice(0, Math.min(count, this.buffer.length));
  }

  /**
   * 앞에서부터 지정된 개수만큼 제거
   */
  remove(count: number): void {
    this.buffer.splice(0, Math.min(count, this.buffer.length));
  }

  /**
   * 현재 버퍼 크기
   */
  size(): number {
    return this.buffer.length;
  }

  /**
   * 버퍼가 비어있는지 확인
   */
  isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  /**
   * 버퍼 비우기
   */
  clear(): void {
    this.buffer = [];
  }

  /**
   * 전체 이벤트 조회 (복사본 반환)
   */
  getAll(): BufferedEvent<T>[] {
    return [...this.buffer];
  }
}
