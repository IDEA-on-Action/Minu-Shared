// Types
export type {
  // Base types
  ServiceName,
  Environment,
  EventMetadata,
  BaseEvent,
  EventPayload,
  AnyEvent,
  // Usage events
  HttpMethod,
  ExecutionStatus,
  SearchType,
  ApiUsageEvent,
  AgentExecutedEvent,
  OpportunitySearchedEvent,
  UsageEvent,
  UsageEventType,
  // Activity events
  BriefingType,
  ShareChannel,
  FavoriteItemType,
  OpportunityViewedEvent,
  FilterCreatedEvent,
  BriefingSharedEvent,
  FavoriteAddedEvent,
  ActivityEvent,
  ActivityEventType,
  // System events
  SyncStatus,
  HealthStatus,
  SourceSyncedEvent,
  OpportunityIngestedEvent,
  HealthCheckEvent,
  SystemEvent,
  SystemEventType,
} from './types';

// Client
export {
  EventClient,
  createEventClient,
  type SendResult,
  type FlushResult,
  type ClientStatus,
} from './client/event-client';

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
} from './client/config';

// Retry utilities
export {
  isRetryableError,
  calculateBackoffDelay,
  delay,
  withRetry,
  type HttpError,
} from './client/retry';

// Buffer (고급 사용자용)
export { MemoryBuffer, BufferOverflowError } from './buffer/memory-buffer';
export type { EventBuffer, BufferedEvent } from './buffer/types';

// Batch (고급 사용자용)
export { BatchProcessor, type BatchSendResult, type SendEventsFn } from './batch/batch-processor';

// Utils
export { generateEventId, EVENT_ID_PREFIX, EVENT_ID_SIZE } from './utils/id';
