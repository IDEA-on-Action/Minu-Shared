# @idea-on-action/events

Minu 시리즈 서비스(Find, Frame, Build, Keep, Portal)에서 ideaonaction.ai로 이벤트를 발송하는 클라이언트 패키지입니다.

## 설치

```bash
pnpm add @idea-on-action/events
```

## 사용법

### 기본 사용

```typescript
import { createEventClient } from '@idea-on-action/events';

const client = createEventClient({
  endpoint: 'https://api.ideaonaction.ai/events',
  getToken: () => accessToken,
  service: 'find',
  environment: 'production',
});

// 즉시 발송 (중요 이벤트)
await client.send({
  type: 'agent.executed',
  data: {
    agentType: 'discovery',
    executionTimeMs: 1234,
    status: 'success',
  },
  metadata: {
    userId: 'user-123',
    sessionId: 'session-456',
  },
});

// 배치 큐에 추가 (일반 이벤트)
await client.enqueue({
  type: 'user.opportunity_viewed',
  data: {
    opportunityId: 'opp-789',
    opportunityTitle: 'AI 시스템 구축',
  },
});

// 수동 플러시
await client.flush();

// 종료 시 클린업
await client.shutdown();
```

### 설정 옵션

```typescript
interface EventClientConfig {
  // 필수
  endpoint: string;                              // 이벤트 수신 엔드포인트
  getToken: () => string | Promise<string>;      // JWT 토큰 제공 함수
  service: ServiceName;                          // 발신 서비스 ('find' | 'frame' | 'build' | 'keep' | 'portal')
  environment: Environment;                      // 환경 ('development' | 'staging' | 'production')

  // 선택
  schemaVersion?: string;                        // 스키마 버전 (기본: '1.0')
  retry?: Partial<RetryConfig>;                  // 재시도 설정
  batch?: Partial<BatchConfig>;                  // 배치 설정
  buffer?: Partial<BufferConfig>;                // 버퍼 설정
  debug?: boolean;                               // 디버그 모드
  disabled?: boolean;                            // 비활성화 (테스트용)
}
```

### 기본 설정값

```typescript
// 재시도 설정
DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
}

// 배치 설정
DEFAULT_BATCH_CONFIG = {
  maxBatchSize: 100,
  flushIntervalMs: 5000,
}

// 버퍼 설정
DEFAULT_BUFFER_CONFIG = {
  maxSize: 10000,
  onOverflow: 'drop-oldest',
}
```

## 이벤트 타입

### 사용량 이벤트 (Usage)

- `api.usage_reported` - API 사용량 보고
- `agent.executed` - Agent 실행
- `opportunity.searched` - 기회 검색 (Find 전용)

### 사용자 활동 이벤트 (Activity)

- `user.opportunity_viewed` - 기회 상세 조회
- `user.filter_created` - 필터 생성
- `user.briefing_shared` - 브리핑 공유
- `user.favorite_added` - 즐겨찾기 추가

### 시스템 이벤트 (System)

- `source.synced` - 소스 동기화 완료
- `opportunity.ingested` - 기회 수집
- `system.health_check` - 시스템 헬스 체크

## API

### EventClient

```typescript
class EventClient {
  // 즉시 발송 (중요 이벤트)
  async send<T, D>(payload: EventPayload<T, D>): Promise<SendResult>;

  // 배치 큐에 추가 (일반 이벤트)
  async enqueue<T, D>(payload: EventPayload<T, D>): Promise<void>;

  // 수동 플러시
  async flush(): Promise<FlushResult>;

  // 상태 확인
  isHealthy(): boolean;
  getPendingCount(): number;
  getStatus(): ClientStatus;

  // 에러 초기화
  clearError(): void;

  // 클린업
  async shutdown(): Promise<void>;
}
```

### 결과 타입

```typescript
interface SendResult {
  success: boolean;
  eventId: string;
  error?: Error;
}

interface FlushResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors?: Error[];
}

interface ClientStatus {
  isHealthy: boolean;
  pendingCount: number;
  isProcessing: boolean;
  lastError?: Error;
}
```

## 재시도 로직

- **재시도 가능한 에러**: 5xx, 429, 408, 네트워크 에러
- **재시도 불가한 에러**: 4xx (429, 408 제외)
- **백오프 전략**: 지수 백오프 + 지터 (0-20%)

## 라이선스

MIT
