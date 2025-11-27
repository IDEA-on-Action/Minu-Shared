import { nanoid, customAlphabet } from 'nanoid';

/**
 * ID 생성 옵션
 */
export interface GenerateIdOptions {
  /** ID 길이 (기본: 21) */
  size?: number;
  /** 커스텀 알파벳 (기본: URL-safe) */
  alphabet?: string;
  /** 접두사 */
  prefix?: string;
}

/**
 * URL-safe 알파벳 (nanoid 기본값)
 */
export const URL_SAFE_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

/**
 * 숫자만 사용하는 알파벳
 */
export const NUMERIC_ALPHABET = '0123456789';

/**
 * 영문 대문자만 사용하는 알파벳
 */
export const UPPERCASE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * 영문 소문자만 사용하는 알파벳
 */
export const LOWERCASE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

/**
 * 영문자만 사용하는 알파벳
 */
export const ALPHA_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * 영문자 + 숫자 알파벳
 */
export const ALPHANUMERIC_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * 고유 ID 생성
 *
 * @param options - ID 생성 옵션
 * @returns 생성된 고유 ID
 *
 * @example
 * ```tsx
 * // 기본 사용 (21자 URL-safe)
 * const id = generateId();
 * // => 'V1StGXR8_Z5jdHi6B-myT'
 *
 * // 커스텀 길이
 * const shortId = generateId({ size: 10 });
 * // => 'IRFa-VaY2b'
 *
 * // 접두사 포함
 * const prefixedId = generateId({ prefix: 'user_' });
 * // => 'user_V1StGXR8_Z5jdHi6B-myT'
 *
 * // 숫자만 사용
 * const numericId = generateId({ alphabet: NUMERIC_ALPHABET, size: 6 });
 * // => '839104'
 * ```
 */
export function generateId(options: GenerateIdOptions = {}): string {
  const { size = 21, alphabet, prefix = '' } = options;

  let id: string;

  if (alphabet) {
    const customNanoid = customAlphabet(alphabet, size);
    id = customNanoid();
  } else {
    id = nanoid(size);
  }

  return prefix ? `${prefix}${id}` : id;
}

/**
 * 커스텀 ID 생성기 팩토리
 *
 * @param alphabet - 사용할 알파벳
 * @param defaultSize - 기본 ID 길이
 * @returns ID 생성 함수
 *
 * @example
 * ```tsx
 * // 숫자만 사용하는 6자리 ID 생성기
 * const generateOTP = createIdGenerator(NUMERIC_ALPHABET, 6);
 * const otp = generateOTP(); // => '839104'
 *
 * // 영문 대문자 8자리 ID 생성기
 * const generateCode = createIdGenerator(UPPERCASE_ALPHABET, 8);
 * const code = generateCode(); // => 'ABCDEFGH'
 * ```
 */
export function createIdGenerator(
  alphabet: string,
  defaultSize: number = 21
): (size?: number) => string {
  return (size?: number) => {
    const customNanoid = customAlphabet(alphabet, size ?? defaultSize);
    return customNanoid();
  };
}
