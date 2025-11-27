/**
 * 날짜 포맷팅 유틸리티
 */

type DateInput = Date | string | number;

/**
 * 날짜를 한국어 형식으로 포맷
 *
 * @example
 * formatDate(new Date()) // "2024년 1월 15일"
 * formatDate(new Date(), 'short') // "2024.01.15"
 * formatDate(new Date(), 'relative') // "3일 전"
 */
export function formatDate(
  date: DateInput,
  format: 'long' | 'short' | 'relative' = 'long'
): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '-';
  }

  switch (format) {
    case 'long':
      return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    case 'short':
      return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\. /g, '.').replace(/\.$/, '');

    case 'relative':
      return formatRelativeTime(d);

    default:
      return d.toLocaleDateString('ko-KR');
  }
}

/**
 * 날짜/시간을 한국어 형식으로 포맷
 */
export function formatDateTime(date: DateInput): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '-';
  }

  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 상대적 시간 표시 (예: "3일 전", "방금 전")
 */
export function formatRelativeTime(date: DateInput): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) {
    return '방금 전';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }
  if (diffWeeks < 4) {
    return `${diffWeeks}주 전`;
  }
  if (diffMonths < 12) {
    return `${diffMonths}개월 전`;
  }
  return formatDate(d, 'short');
}

/**
 * 숫자 포맷팅 유틸리티
 */

/**
 * 숫자를 한국어 통화 형식으로 포맷
 *
 * @example
 * formatCurrency(1234567) // "1,234,567원"
 * formatCurrency(1234567, { short: true }) // "123만원"
 */
export function formatCurrency(
  amount: number,
  options?: { short?: boolean; symbol?: string }
): string {
  const { short = false, symbol = '원' } = options ?? {};

  if (short) {
    if (amount >= 100000000) {
      return `${Math.floor(amount / 100000000)}억${symbol}`;
    }
    if (amount >= 10000) {
      return `${Math.floor(amount / 10000)}만${symbol}`;
    }
  }

  return `${amount.toLocaleString('ko-KR')}${symbol}`;
}

/**
 * 숫자를 천 단위 구분자로 포맷
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * 퍼센트 포맷
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 파일 크기 포맷
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
