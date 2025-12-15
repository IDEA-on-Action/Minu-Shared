import { generateId } from '@idea-on-action/utils';

/**
 * 이벤트 ID 접두사
 */
export const EVENT_ID_PREFIX = 'evt_';

/**
 * 이벤트 ID 기본 길이 (접두사 제외)
 */
export const EVENT_ID_SIZE = 16;

/**
 * 이벤트 ID 생성
 *
 * @returns evt_ 접두사가 붙은 고유 ID
 * @example
 * ```ts
 * generateEventId() // => 'evt_V1StGXR8_Z5jdHi6'
 * ```
 */
export function generateEventId(): string {
  return generateId({ prefix: EVENT_ID_PREFIX, size: EVENT_ID_SIZE });
}
