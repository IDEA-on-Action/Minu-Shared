/**
 * 검증 결과
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 비밀번호 정책
 */
export interface PasswordPolicy {
  /** 최소 길이 (기본 8) */
  minLength?: number;
  /** 최대 길이 */
  maxLength?: number;
  /** 대문자 필수 */
  requireUppercase?: boolean;
  /** 소문자 필수 */
  requireLowercase?: boolean;
  /** 숫자 필수 */
  requireNumber?: boolean;
  /** 특수문자 필수 */
  requireSpecial?: boolean;
}

/**
 * URL 검증 옵션
 */
export interface UrlValidationOptions {
  /** HTTPS 필수 */
  requireHttps?: boolean;
  /** 허용된 도메인 목록 */
  allowedDomains?: string[];
}

// ============================================
// 기본 검증 함수
// ============================================

/**
 * 필수값 검증
 */
export function validateRequired(value: unknown): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, error: '필수 입력값입니다.' };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: '필수 입력값입니다.' };
  }

  return { isValid: true };
}

/**
 * 최소 길이 검증
 */
export function validateMinLength(value: string, min: number): ValidationResult {
  if (value.length < min) {
    return { isValid: false, error: `최소 ${min}자 이상 입력해주세요.` };
  }
  return { isValid: true };
}

/**
 * 최대 길이 검증
 */
export function validateMaxLength(value: string, max: number): ValidationResult {
  if (value.length > max) {
    return { isValid: false, error: `최대 ${max}자까지 입력 가능합니다.` };
  }
  return { isValid: true };
}

// ============================================
// 이메일/비밀번호 검증
// ============================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 이메일 검증
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: '이메일을 입력해주세요.' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: '올바른 이메일 형식이 아닙니다.' };
  }

  return { isValid: true };
}

/**
 * 비밀번호 검증
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = {}
): ValidationResult {
  const {
    minLength = 8,
    maxLength,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false,
  } = policy;

  if (!password) {
    return { isValid: false, error: '비밀번호를 입력해주세요.' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `비밀번호는 최소 ${minLength}자 이상이어야 합니다.` };
  }

  if (maxLength && password.length > maxLength) {
    return { isValid: false, error: `비밀번호는 최대 ${maxLength}자까지 가능합니다.` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: '대문자를 포함해주세요.' };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, error: '소문자를 포함해주세요.' };
  }

  if (requireNumber && !/\d/.test(password)) {
    return { isValid: false, error: '숫자를 포함해주세요.' };
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: '특수문자를 포함해주세요.' };
  }

  return { isValid: true };
}

// ============================================
// URL 검증
// ============================================

/**
 * URL 검증
 */
export function validateUrl(
  url: string,
  options: UrlValidationOptions = {}
): ValidationResult {
  const { requireHttps = false, allowedDomains } = options;

  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL을 입력해주세요.' };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { isValid: false, error: '올바른 URL 형식이 아닙니다.' };
  }

  if (requireHttps && parsedUrl.protocol !== 'https:') {
    return { isValid: false, error: 'HTTPS URL만 허용됩니다.' };
  }

  if (allowedDomains && allowedDomains.length > 0) {
    const hostname = parsedUrl.hostname;
    const isAllowed = allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
    if (!isAllowed) {
      return { isValid: false, error: '허용되지 않은 도메인입니다.' };
    }
  }

  return { isValid: true };
}

// ============================================
// 한국 특화 검증
// ============================================

/**
 * 한국 휴대폰 번호 검증
 * 010-1234-5678, 01012345678, 010 1234 5678 등 지원
 */
export function validatePhoneKR(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: '전화번호를 입력해주세요.' };
  }

  // 숫자만 추출
  const digits = phone.replace(/\D/g, '');

  // 휴대폰: 010, 011, 016, 017, 018, 019
  // 지역번호: 02, 031~064
  const mobileRegex = /^01[016789]\d{7,8}$/;
  const seoulRegex = /^02\d{7,8}$/;
  const localRegex = /^0[3-6]\d{8,9}$/;

  if (mobileRegex.test(digits) || seoulRegex.test(digits) || localRegex.test(digits)) {
    return { isValid: true };
  }

  return { isValid: false, error: '올바른 전화번호 형식이 아닙니다.' };
}

/**
 * 사업자등록번호 검증 (10자리)
 * 체크섬 검증 포함
 */
export function validateBusinessNumber(number: string): ValidationResult {
  if (!number || number.trim() === '') {
    return { isValid: false, error: '사업자등록번호를 입력해주세요.' };
  }

  // 숫자만 추출
  const digits = number.replace(/\D/g, '');

  if (digits.length !== 10) {
    return { isValid: false, error: '사업자등록번호는 10자리입니다.' };
  }

  // 사업자등록번호 체크섬 검증
  const checkSum = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * checkSum[i];
  }

  sum += Math.floor((parseInt(digits[8], 10) * 5) / 10);
  const remainder = (10 - (sum % 10)) % 10;

  if (remainder !== parseInt(digits[9], 10)) {
    return { isValid: false, error: '유효하지 않은 사업자등록번호입니다.' };
  }

  return { isValid: true };
}

/**
 * 주민등록번호 형식 검증 (앞 6자리만)
 * 개인정보 보호를 위해 앞 6자리(생년월일)만 검증
 */
export function validateBirthDateKR(birthDate: string): ValidationResult {
  if (!birthDate || birthDate.trim() === '') {
    return { isValid: false, error: '생년월일을 입력해주세요.' };
  }

  const digits = birthDate.replace(/\D/g, '');

  if (digits.length !== 6) {
    return { isValid: false, error: '생년월일은 6자리(YYMMDD)입니다.' };
  }

  const month = parseInt(digits.substring(2, 4), 10);
  const day = parseInt(digits.substring(4, 6), 10);

  if (month < 1 || month > 12) {
    return { isValid: false, error: '올바른 월을 입력해주세요.' };
  }

  if (day < 1 || day > 31) {
    return { isValid: false, error: '올바른 일을 입력해주세요.' };
  }

  // 월별 일수 체크 (간단하게)
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) {
    return { isValid: false, error: '올바른 날짜를 입력해주세요.' };
  }

  return { isValid: true };
}
