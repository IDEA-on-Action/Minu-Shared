# @idea-on-action/events

## 1.1.0

### Features

- **HMAC 인증 지원**: Vercel 등 서버리스 환경을 위한 HMAC-SHA256 인증 방식 추가
  - `auth: { method: 'hmac', secret, serviceId }` 설정으로 사용
  - `X-Service-Id`, `X-Timestamp`, `X-Nonce`, `X-Signature-256` 헤더 자동 생성

- **인증 설정 통합**: `auth` 옵션으로 Bearer/HMAC 인증 방식 선택
  - Bearer: `auth: { method: 'bearer', getToken }` (기존 방식)
  - HMAC: `auth: { method: 'hmac', secret, serviceId }` (신규)

### Deprecations

- `getToken` 옵션 deprecated → `auth: { method: 'bearer', getToken }` 권장
  - 하위 호환성 유지: `getToken`만 제공해도 Bearer 인증으로 동작

## 1.0.0

### Features

- **EventClient**: Minu 서비스에서 ideaonaction.ai로 이벤트 발송

  - `send()`: 즉시 발송 (중요 이벤트)
  - `enqueue()`: 배치 큐에 추가 (일반 이벤트)
  - `flush()`: 수동 플러시
  - `shutdown()`: 클린업

- **이벤트 타입**: 타입 안전한 이벤트 정의

  - Usage 이벤트: `api.usage_reported`, `agent.executed`, `opportunity.searched`
  - Activity 이벤트: `user.opportunity_viewed`, `user.filter_created`, `user.briefing_shared`, `user.favorite_added`
  - System 이벤트: `source.synced`, `opportunity.ingested`, `system.health_check`

- **재시도/백오프**: 지수 백오프 + 지터를 적용한 재시도 로직

  - 재시도 가능: 5xx, 429, 408, 네트워크 에러
  - 기본 3회 재시도, 최대 30초 지연

- **배치 발송**: 효율적인 이벤트 전송

  - 기본 5초 간격 자동 플러시
  - 최대 100개 이벤트 배치

- **메모리 버퍼**: 이벤트 큐잉

  - 최대 10,000개 이벤트 버퍼링
  - 오버플로우 전략: drop-oldest (기본), drop-newest, error

- **@idea-on-action/utils 통합**: 기존 유틸리티 재사용
  - `generateId()`: 이벤트 ID 생성 (evt\_ 접두사)
  - `getUserIdFromToken()`, `getTenantIdFromToken()`: 토큰에서 메타데이터 추출
