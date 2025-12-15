export {
  EventClient,
  createEventClient,
  type SendResult,
  type FlushResult,
  type ClientStatus,
} from './event-client';

export {
  type EventClientConfig,
  type RetryConfig,
  type BatchConfig,
  type BufferConfig,
  type ResolvedEventClientConfig,
  resolveConfig,
  DEFAULT_RETRY_CONFIG,
  DEFAULT_BATCH_CONFIG,
  DEFAULT_BUFFER_CONFIG,
} from './config';

export {
  isRetryableError,
  calculateBackoffDelay,
  delay,
  withRetry,
  type HttpError,
  type RetryResult,
} from './retry';
