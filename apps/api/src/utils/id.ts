/**
 * ID 생성 유틸리티
 *
 * nanoid 대신 crypto.randomUUID() 사용 (Workers 환경)
 */

/**
 * UUID v4 생성
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * 짧은 ID 생성 (12자)
 */
export function generateShortId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

/**
 * 슬러그 생성
 *
 * 한글, 영문, 숫자를 기반으로 URL-safe 슬러그 생성
 */
export function generateSlug(text: string): string {
  // 한글을 로마자로 변환하지 않고 제거
  const slug = text
    .toLowerCase()
    .replace(/[가-힣]/g, '') // 한글 제거
    .replace(/[^a-z0-9\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속 하이픈 제거
    .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거

  // 슬러그가 비어있으면 랜덤 ID 사용
  if (!slug) {
    return generateShortId();
  }

  // 유니크성을 위해 짧은 ID 추가
  return `${slug}-${generateShortId().slice(0, 4)}`;
}

/**
 * API 키 생성
 *
 * 형식: minu_sk_[prefix]_[random]
 */
export function generateApiKey(prefix = 'live'): { key: string; hash: string; prefix: string } {
  const random = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const key = `minu_sk_${prefix}_${random}`;
  const keyPrefix = key.slice(0, 12);

  // 해시 생성 (저장용)
  const encoder = new TextEncoder();
  const data = encoder.encode(key);

  // 동기식 해시가 필요한 경우 별도 처리
  return {
    key,
    hash: '', // 비동기 해시는 호출 측에서 처리
    prefix: keyPrefix,
  };
}

/**
 * API 키 해시 생성 (비동기)
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
