import type { BaseEvent } from '../types/base';

/**
 * 버퍼에 저장된 이벤트 (메타데이터 포함)
 */
export interface BufferedEvent<T extends BaseEvent = BaseEvent> {
  /** 이벤트 */
  event: T;
  /** 큐에 추가된 시간 (Unix timestamp) */
  enqueuedAt: number;
  /** 재시도 횟수 */
  retryCount: number;
}

/**
 * 이벤트 버퍼 인터페이스
 */
export interface EventBuffer<T extends BaseEvent = BaseEvent> {
  /**
   * 이벤트 추가
   * @param event - 추가할 이벤트
   */
  enqueue(event: T): void;

  /**
   * 이벤트 배치 조회 (버퍼에서 제거하지 않음)
   * @param count - 조회할 개수
   * @returns 조회된 이벤트 배열
   */
  peek(count: number): BufferedEvent<T>[];

  /**
   * 이벤트 배치 제거 (전송 성공 후 호출)
   * @param count - 제거할 개수
   */
  remove(count: number): void;

  /**
   * 현재 버퍼 크기
   */
  size(): number;

  /**
   * 버퍼가 비어있는지 확인
   */
  isEmpty(): boolean;

  /**
   * 버퍼 비우기
   */
  clear(): void;

  /**
   * 전체 이벤트 조회 (디버깅용)
   */
  getAll(): BufferedEvent<T>[];
}
