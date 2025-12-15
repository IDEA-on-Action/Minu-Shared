/**
 * HMAC 서명 유틸리티
 *
 * Vercel 등 서버리스 환경에서 JWT 토큰 갱신 대신 사용할 수 있는
 * HMAC-SHA256 기반 요청 서명 방식을 제공합니다.
 */

/**
 * HMAC 서명 결과
 */
export interface HmacSignature {
  /** HMAC-SHA256 서명 (hex) */
  signature: string;
  /** 타임스탬프 (ISO 8601) */
  timestamp: string;
  /** 논스 (요청 고유값) */
  nonce: string;
}

/**
 * HMAC 서명용 헤더
 */
export interface HmacHeaders {
  'X-Service-Id': string;
  'X-Timestamp': string;
  'X-Nonce': string;
  'X-Signature-256': string;
}

/**
 * 랜덤 논스 생성
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * HMAC-SHA256 서명 생성
 *
 * @param secret - HMAC 시크릿 키
 * @param payload - 서명할 데이터 (요청 본문)
 * @returns 서명 결과
 */
export async function createHmacSignature(
  secret: string,
  payload: string
): Promise<HmacSignature> {
  const timestamp = new Date().toISOString();
  const nonce = generateNonce();

  // 서명할 메시지: timestamp.nonce.payload
  const message = `${timestamp}.${nonce}.${payload}`;

  // HMAC-SHA256 서명 생성
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

  // ArrayBuffer를 hex 문자열로 변환
  const signatureArray = new Uint8Array(signatureBuffer);
  const signature = Array.from(signatureArray, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  return { signature, timestamp, nonce };
}

/**
 * HMAC 인증 헤더 생성
 *
 * @param serviceId - 서비스 ID
 * @param secret - HMAC 시크릿 키
 * @param payload - 요청 본문
 * @returns HMAC 인증 헤더
 */
export async function createHmacHeaders(
  serviceId: string,
  secret: string,
  payload: string
): Promise<HmacHeaders> {
  const { signature, timestamp, nonce } = await createHmacSignature(secret, payload);

  return {
    'X-Service-Id': serviceId,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Signature-256': `sha256=${signature}`,
  };
}
