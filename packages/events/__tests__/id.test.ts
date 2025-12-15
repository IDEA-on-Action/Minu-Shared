import { describe, it, expect } from 'vitest';
import { generateEventId, EVENT_ID_PREFIX, EVENT_ID_SIZE } from '../src/utils/id';

describe('generateEventId', () => {
  it('evt_ 접두사로 시작하는 ID를 생성해야 한다', () => {
    const id = generateEventId();
    expect(id.startsWith(EVENT_ID_PREFIX)).toBe(true);
  });

  it('총 길이가 접두사 + 설정된 크기여야 한다', () => {
    const id = generateEventId();
    const expectedLength = EVENT_ID_PREFIX.length + EVENT_ID_SIZE;
    expect(id.length).toBe(expectedLength);
  });

  it('매번 고유한 ID를 생성해야 한다', () => {
    const ids = new Set<string>();
    const count = 1000;

    for (let i = 0; i < count; i++) {
      ids.add(generateEventId());
    }

    expect(ids.size).toBe(count);
  });

  it('URL-safe 문자만 포함해야 한다', () => {
    const id = generateEventId();
    // nanoid의 기본 URL-safe 문자셋: A-Za-z0-9_-
    const urlSafePattern = /^[A-Za-z0-9_-]+$/;

    // 접두사 제거 후 검증
    const idWithoutPrefix = id.slice(EVENT_ID_PREFIX.length);
    expect(urlSafePattern.test(idWithoutPrefix)).toBe(true);
  });
});

describe('EVENT_ID_PREFIX', () => {
  it('evt_이어야 한다', () => {
    expect(EVENT_ID_PREFIX).toBe('evt_');
  });
});

describe('EVENT_ID_SIZE', () => {
  it('16이어야 한다', () => {
    expect(EVENT_ID_SIZE).toBe(16);
  });
});
