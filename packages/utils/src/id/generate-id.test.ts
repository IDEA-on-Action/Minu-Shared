import { describe, it, expect } from 'vitest';
import {
  generateId,
  createIdGenerator,
  URL_SAFE_ALPHABET,
  NUMERIC_ALPHABET,
  UPPERCASE_ALPHABET,
  LOWERCASE_ALPHABET,
  ALPHA_ALPHABET,
  ALPHANUMERIC_ALPHABET,
} from './generate-id';

describe('generateId', () => {
  describe('기본 동작', () => {
    it('기본 21자 ID를 생성해야 한다', () => {
      const id = generateId();
      expect(id).toHaveLength(21);
    });

    it('URL-safe 문자만 포함해야 한다', () => {
      const id = generateId();
      const urlSafeRegex = /^[A-Za-z0-9_-]+$/;
      expect(id).toMatch(urlSafeRegex);
    });

    it('매번 고유한 ID를 생성해야 한다', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(1000);
    });
  });

  describe('size 옵션', () => {
    it('지정된 길이의 ID를 생성해야 한다', () => {
      expect(generateId({ size: 10 })).toHaveLength(10);
      expect(generateId({ size: 5 })).toHaveLength(5);
      expect(generateId({ size: 32 })).toHaveLength(32);
    });

    it('size가 1이어도 동작해야 한다', () => {
      const id = generateId({ size: 1 });
      expect(id).toHaveLength(1);
    });
  });

  describe('prefix 옵션', () => {
    it('접두사가 포함된 ID를 생성해야 한다', () => {
      const id = generateId({ prefix: 'user_' });
      expect(id).toMatch(/^user_[A-Za-z0-9_-]+$/);
      expect(id).toHaveLength(26); // 'user_' (5) + 21
    });

    it('접두사와 size를 함께 사용할 수 있어야 한다', () => {
      const id = generateId({ prefix: 'id_', size: 10 });
      expect(id).toMatch(/^id_[A-Za-z0-9_-]+$/);
      expect(id).toHaveLength(13); // 'id_' (3) + 10
    });

    it('빈 접두사는 무시해야 한다', () => {
      const id = generateId({ prefix: '' });
      expect(id).toHaveLength(21);
    });
  });

  describe('alphabet 옵션', () => {
    it('숫자만 포함하는 ID를 생성해야 한다', () => {
      const id = generateId({ alphabet: NUMERIC_ALPHABET, size: 10 });
      expect(id).toMatch(/^[0-9]+$/);
      expect(id).toHaveLength(10);
    });

    it('영문 대문자만 포함하는 ID를 생성해야 한다', () => {
      const id = generateId({ alphabet: UPPERCASE_ALPHABET, size: 10 });
      expect(id).toMatch(/^[A-Z]+$/);
    });

    it('영문 소문자만 포함하는 ID를 생성해야 한다', () => {
      const id = generateId({ alphabet: LOWERCASE_ALPHABET, size: 10 });
      expect(id).toMatch(/^[a-z]+$/);
    });

    it('영문자만 포함하는 ID를 생성해야 한다', () => {
      const id = generateId({ alphabet: ALPHA_ALPHABET, size: 10 });
      expect(id).toMatch(/^[A-Za-z]+$/);
    });

    it('영문자+숫자만 포함하는 ID를 생성해야 한다', () => {
      const id = generateId({ alphabet: ALPHANUMERIC_ALPHABET, size: 10 });
      expect(id).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe('조합 옵션', () => {
    it('모든 옵션을 함께 사용할 수 있어야 한다', () => {
      const id = generateId({
        prefix: 'order_',
        size: 8,
        alphabet: UPPERCASE_ALPHABET,
      });
      expect(id).toMatch(/^order_[A-Z]{8}$/);
      expect(id).toHaveLength(14);
    });
  });
});

describe('createIdGenerator', () => {
  describe('기본 동작', () => {
    it('ID 생성기를 반환해야 한다', () => {
      const generator = createIdGenerator(NUMERIC_ALPHABET);
      expect(typeof generator).toBe('function');
    });

    it('생성기가 올바른 형식의 ID를 반환해야 한다', () => {
      const generator = createIdGenerator(NUMERIC_ALPHABET, 6);
      const id = generator();
      expect(id).toMatch(/^[0-9]{6}$/);
    });
  });

  describe('기본 크기', () => {
    it('기본 크기로 ID를 생성해야 한다', () => {
      const generator = createIdGenerator(UPPERCASE_ALPHABET, 8);
      expect(generator()).toHaveLength(8);
      expect(generator()).toHaveLength(8);
    });

    it('호출 시 크기를 재정의할 수 있어야 한다', () => {
      const generator = createIdGenerator(LOWERCASE_ALPHABET, 10);
      expect(generator(5)).toHaveLength(5);
      expect(generator(15)).toHaveLength(15);
    });
  });

  describe('다양한 알파벳', () => {
    it('숫자 ID 생성기', () => {
      const generateOTP = createIdGenerator(NUMERIC_ALPHABET, 6);
      const otp = generateOTP();
      expect(otp).toMatch(/^[0-9]{6}$/);
    });

    it('영문 대문자 ID 생성기', () => {
      const generateCode = createIdGenerator(UPPERCASE_ALPHABET, 8);
      const code = generateCode();
      expect(code).toMatch(/^[A-Z]{8}$/);
    });

    it('URL-safe ID 생성기', () => {
      const generateSlug = createIdGenerator(URL_SAFE_ALPHABET, 12);
      const slug = generateSlug();
      expect(slug).toMatch(/^[A-Za-z0-9_-]{12}$/);
    });
  });

  describe('고유성', () => {
    it('생성된 ID는 고유해야 한다', () => {
      const generator = createIdGenerator(ALPHANUMERIC_ALPHABET, 16);
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        ids.add(generator());
      }
      expect(ids.size).toBe(1000);
    });
  });
});

describe('알파벳 상수', () => {
  it('URL_SAFE_ALPHABET은 64자여야 한다', () => {
    expect(URL_SAFE_ALPHABET).toHaveLength(64);
  });

  it('NUMERIC_ALPHABET은 10자여야 한다', () => {
    expect(NUMERIC_ALPHABET).toHaveLength(10);
  });

  it('UPPERCASE_ALPHABET은 26자여야 한다', () => {
    expect(UPPERCASE_ALPHABET).toHaveLength(26);
  });

  it('LOWERCASE_ALPHABET은 26자여야 한다', () => {
    expect(LOWERCASE_ALPHABET).toHaveLength(26);
  });

  it('ALPHA_ALPHABET은 52자여야 한다', () => {
    expect(ALPHA_ALPHABET).toHaveLength(52);
  });

  it('ALPHANUMERIC_ALPHABET은 62자여야 한다', () => {
    expect(ALPHANUMERIC_ALPHABET).toHaveLength(62);
  });
});
