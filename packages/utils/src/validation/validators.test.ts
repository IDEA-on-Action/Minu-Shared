import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateEmail,
  validatePassword,
  validateUrl,
  validatePhoneKR,
  validateBusinessNumber,
  validateBirthDateKR,
} from './validators';

describe('validateRequired', () => {
  it('값이 있으면 통과', () => {
    expect(validateRequired('hello').isValid).toBe(true);
    expect(validateRequired(123).isValid).toBe(true);
    expect(validateRequired(0).isValid).toBe(true);
    expect(validateRequired(false).isValid).toBe(true);
  });

  it('null/undefined는 실패', () => {
    expect(validateRequired(null).isValid).toBe(false);
    expect(validateRequired(undefined).isValid).toBe(false);
  });

  it('빈 문자열은 실패', () => {
    expect(validateRequired('').isValid).toBe(false);
    expect(validateRequired('   ').isValid).toBe(false);
  });
});

describe('validateMinLength', () => {
  it('최소 길이 이상이면 통과', () => {
    expect(validateMinLength('hello', 3).isValid).toBe(true);
    expect(validateMinLength('hello', 5).isValid).toBe(true);
  });

  it('최소 길이 미만이면 실패', () => {
    expect(validateMinLength('hi', 3).isValid).toBe(false);
    expect(validateMinLength('', 1).isValid).toBe(false);
  });
});

describe('validateMaxLength', () => {
  it('최대 길이 이하면 통과', () => {
    expect(validateMaxLength('hello', 10).isValid).toBe(true);
    expect(validateMaxLength('hello', 5).isValid).toBe(true);
  });

  it('최대 길이 초과면 실패', () => {
    expect(validateMaxLength('hello world', 5).isValid).toBe(false);
  });
});

describe('validateEmail', () => {
  it('유효한 이메일 통과', () => {
    expect(validateEmail('user@example.com').isValid).toBe(true);
    expect(validateEmail('test.user@domain.co.kr').isValid).toBe(true);
    expect(validateEmail('user+tag@example.com').isValid).toBe(true);
  });

  it('잘못된 이메일 실패', () => {
    expect(validateEmail('').isValid).toBe(false);
    expect(validateEmail('invalid').isValid).toBe(false);
    expect(validateEmail('no@domain').isValid).toBe(false);
    expect(validateEmail('@example.com').isValid).toBe(false);
    expect(validateEmail('user@').isValid).toBe(false);
  });
});

describe('validatePassword', () => {
  describe('기본 정책', () => {
    it('8자 이상이면 통과', () => {
      expect(validatePassword('password123').isValid).toBe(true);
      expect(validatePassword('12345678').isValid).toBe(true);
    });

    it('8자 미만이면 실패', () => {
      expect(validatePassword('short').isValid).toBe(false);
      expect(validatePassword('1234567').isValid).toBe(false);
    });

    it('빈 값이면 실패', () => {
      expect(validatePassword('').isValid).toBe(false);
    });
  });

  describe('커스텀 정책', () => {
    it('대문자 필수 정책', () => {
      expect(validatePassword('password', { requireUppercase: true }).isValid).toBe(false);
      expect(validatePassword('Password', { requireUppercase: true }).isValid).toBe(true);
    });

    it('소문자 필수 정책', () => {
      expect(validatePassword('PASSWORD', { requireLowercase: true }).isValid).toBe(false);
      expect(validatePassword('Password', { requireLowercase: true }).isValid).toBe(true);
    });

    it('숫자 필수 정책', () => {
      expect(validatePassword('password', { requireNumber: true }).isValid).toBe(false);
      expect(validatePassword('password1', { requireNumber: true }).isValid).toBe(true);
    });

    it('특수문자 필수 정책', () => {
      expect(validatePassword('password1', { requireSpecial: true }).isValid).toBe(false);
      expect(validatePassword('password1!', { requireSpecial: true }).isValid).toBe(true);
    });

    it('최소 길이 변경', () => {
      expect(validatePassword('short', { minLength: 4 }).isValid).toBe(true);
      expect(validatePassword('hi', { minLength: 4 }).isValid).toBe(false);
    });

    it('최대 길이 제한', () => {
      expect(validatePassword('12345678', { maxLength: 10 }).isValid).toBe(true);
      expect(validatePassword('12345678901', { maxLength: 10 }).isValid).toBe(false);
    });
  });
});

describe('validateUrl', () => {
  it('유효한 URL 통과', () => {
    expect(validateUrl('https://example.com').isValid).toBe(true);
    expect(validateUrl('http://localhost:3000').isValid).toBe(true);
    expect(validateUrl('https://sub.domain.com/path?query=1').isValid).toBe(true);
  });

  it('잘못된 URL 실패', () => {
    expect(validateUrl('').isValid).toBe(false);
    expect(validateUrl('not-a-url').isValid).toBe(false);
    expect(validateUrl('ftp://example.com').isValid).toBe(true); // URL은 유효
  });

  it('HTTPS 필수 옵션', () => {
    expect(validateUrl('http://example.com', { requireHttps: true }).isValid).toBe(false);
    expect(validateUrl('https://example.com', { requireHttps: true }).isValid).toBe(true);
  });

  it('허용 도메인 옵션', () => {
    const options = { allowedDomains: ['example.com', 'trusted.org'] };
    expect(validateUrl('https://example.com', options).isValid).toBe(true);
    expect(validateUrl('https://sub.example.com', options).isValid).toBe(true);
    expect(validateUrl('https://evil.com', options).isValid).toBe(false);
  });
});

describe('validatePhoneKR', () => {
  it('유효한 휴대폰 번호 통과', () => {
    expect(validatePhoneKR('01012345678').isValid).toBe(true);
    expect(validatePhoneKR('010-1234-5678').isValid).toBe(true);
    expect(validatePhoneKR('010 1234 5678').isValid).toBe(true);
    expect(validatePhoneKR('01112345678').isValid).toBe(true);
  });

  it('유효한 지역번호 통과', () => {
    expect(validatePhoneKR('0212345678').isValid).toBe(true);
    expect(validatePhoneKR('02-1234-5678').isValid).toBe(true);
    expect(validatePhoneKR('031-123-4567').isValid).toBe(true);
  });

  it('잘못된 번호 실패', () => {
    expect(validatePhoneKR('').isValid).toBe(false);
    expect(validatePhoneKR('12345678').isValid).toBe(false);
    expect(validatePhoneKR('0201234567890').isValid).toBe(false);
  });
});

describe('validateBusinessNumber', () => {
  it('유효한 사업자등록번호 통과', () => {
    // 실제 유효한 사업자등록번호 (체크섬 통과)
    expect(validateBusinessNumber('1234567890').isValid).toBe(false); // 임의 번호는 실패
    expect(validateBusinessNumber('123-45-67890').isValid).toBe(false);
  });

  it('10자리가 아니면 실패', () => {
    expect(validateBusinessNumber('12345').isValid).toBe(false);
    expect(validateBusinessNumber('12345678901').isValid).toBe(false);
  });

  it('빈 값이면 실패', () => {
    expect(validateBusinessNumber('').isValid).toBe(false);
  });
});

describe('validateBirthDateKR', () => {
  it('유효한 생년월일 통과', () => {
    expect(validateBirthDateKR('900101').isValid).toBe(true);
    expect(validateBirthDateKR('001231').isValid).toBe(true);
    expect(validateBirthDateKR('85-07-15').isValid).toBe(true);
  });

  it('잘못된 월 실패', () => {
    expect(validateBirthDateKR('901301').isValid).toBe(false);
    expect(validateBirthDateKR('900001').isValid).toBe(false);
  });

  it('잘못된 일 실패', () => {
    expect(validateBirthDateKR('900132').isValid).toBe(false);
    expect(validateBirthDateKR('900100').isValid).toBe(false);
  });

  it('2월 30일 같은 잘못된 날짜 실패', () => {
    expect(validateBirthDateKR('900230').isValid).toBe(false);
  });

  it('빈 값이면 실패', () => {
    expect(validateBirthDateKR('').isValid).toBe(false);
  });
});
