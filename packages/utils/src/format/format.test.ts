import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatFileSize,
} from './format';

describe('formatDate', () => {
  describe('long format (기본)', () => {
    it('Date 객체를 한국어 형식으로 포맷한다', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'long');
      expect(result).toContain('2024');
      expect(result).toContain('1월');
      expect(result).toContain('15');
    });

    it('문자열 날짜를 포맷한다', () => {
      const result = formatDate('2024-06-20', 'long');
      expect(result).toContain('2024');
      expect(result).toContain('6월');
      expect(result).toContain('20');
    });

    it('타임스탬프를 포맷한다', () => {
      const timestamp = new Date('2024-03-10').getTime();
      const result = formatDate(timestamp, 'long');
      expect(result).toContain('2024');
      expect(result).toContain('3월');
      expect(result).toContain('10');
    });

    it('기본 format은 long이다', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toContain('1월');
    });
  });

  describe('short format', () => {
    it('짧은 형식으로 포맷한다', () => {
      const date = new Date('2024-01-05');
      const result = formatDate(date, 'short');
      expect(result).toMatch(/2024.*01.*0?5/);
    });
  });

  describe('relative format', () => {
    it('상대적 시간으로 포맷한다', () => {
      const now = new Date();
      const result = formatDate(now, 'relative');
      expect(result).toBe('방금 전');
    });
  });

  describe('유효하지 않은 날짜', () => {
    it('잘못된 날짜는 "-"를 반환한다', () => {
      expect(formatDate('invalid')).toBe('-');
      expect(formatDate(NaN)).toBe('-');
    });
  });
});

describe('formatDateTime', () => {
  it('날짜와 시간을 포맷한다', () => {
    const date = new Date('2024-01-15T14:30:00');
    const result = formatDateTime(date);
    expect(result).toContain('2024');
    expect(result).toContain('1월');
    expect(result).toContain('15');
  });

  it('잘못된 날짜는 "-"를 반환한다', () => {
    expect(formatDateTime('invalid')).toBe('-');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('60초 미만은 "방금 전"을 반환한다', () => {
    const date = new Date('2024-06-15T11:59:30');
    expect(formatRelativeTime(date)).toBe('방금 전');
  });

  it('60분 미만은 "N분 전"을 반환한다', () => {
    const date = new Date('2024-06-15T11:30:00');
    expect(formatRelativeTime(date)).toBe('30분 전');
  });

  it('24시간 미만은 "N시간 전"을 반환한다', () => {
    const date = new Date('2024-06-15T09:00:00');
    expect(formatRelativeTime(date)).toBe('3시간 전');
  });

  it('7일 미만은 "N일 전"을 반환한다', () => {
    const date = new Date('2024-06-12T12:00:00');
    expect(formatRelativeTime(date)).toBe('3일 전');
  });

  it('4주 미만은 "N주 전"을 반환한다', () => {
    const date = new Date('2024-06-01T12:00:00');
    expect(formatRelativeTime(date)).toBe('2주 전');
  });

  it('12개월 미만은 "N개월 전"을 반환한다', () => {
    const date = new Date('2024-03-15T12:00:00');
    expect(formatRelativeTime(date)).toBe('3개월 전');
  });

  it('12개월 이상은 short 날짜를 반환한다', () => {
    const date = new Date('2022-06-15T12:00:00');
    const result = formatRelativeTime(date);
    expect(result).toMatch(/2022/);
  });
});

describe('formatCurrency', () => {
  describe('기본 포맷', () => {
    it('숫자를 원화 형식으로 포맷한다', () => {
      expect(formatCurrency(1234567)).toBe('1,234,567원');
    });

    it('0을 포맷한다', () => {
      expect(formatCurrency(0)).toBe('0원');
    });

    it('음수를 포맷한다', () => {
      expect(formatCurrency(-1000)).toBe('-1,000원');
    });
  });

  describe('short 옵션', () => {
    it('1억 이상은 억 단위로 표시한다', () => {
      expect(formatCurrency(123456789, { short: true })).toBe('1억원');
      expect(formatCurrency(500000000, { short: true })).toBe('5억원');
    });

    it('1만 이상은 만 단위로 표시한다', () => {
      expect(formatCurrency(50000, { short: true })).toBe('5만원');
      expect(formatCurrency(123456, { short: true })).toBe('12만원');
    });

    it('1만 미만은 전체 표시한다', () => {
      expect(formatCurrency(9999, { short: true })).toBe('9,999원');
    });
  });

  describe('symbol 옵션', () => {
    it('통화 기호를 변경할 수 있다', () => {
      expect(formatCurrency(1000, { symbol: '$' })).toBe('1,000$');
    });

    it('short와 symbol을 함께 사용할 수 있다', () => {
      expect(formatCurrency(50000, { short: true, symbol: '달러' })).toBe('5만달러');
    });
  });
});

describe('formatNumber', () => {
  it('천 단위 구분자를 추가한다', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('0을 포맷한다', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('음수를 포맷한다', () => {
    expect(formatNumber(-9876543)).toBe('-9,876,543');
  });

  it('소수점을 유지한다', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });
});

describe('formatPercent', () => {
  it('퍼센트 형식으로 포맷한다', () => {
    expect(formatPercent(75.5)).toBe('75.5%');
  });

  it('기본 소수점은 1자리이다', () => {
    expect(formatPercent(33.333)).toBe('33.3%');
  });

  it('소수점 자리수를 지정할 수 있다', () => {
    expect(formatPercent(33.3333, 2)).toBe('33.33%');
    expect(formatPercent(100, 0)).toBe('100%');
  });

  it('0%를 포맷한다', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });
});

describe('formatFileSize', () => {
  it('0 바이트를 포맷한다', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('바이트 단위를 포맷한다', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('KB 단위를 포맷한다', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('MB 단위를 포맷한다', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(5242880)).toBe('5 MB');
  });

  it('GB 단위를 포맷한다', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('TB 단위를 포맷한다', () => {
    expect(formatFileSize(1099511627776)).toBe('1 TB');
  });
});
