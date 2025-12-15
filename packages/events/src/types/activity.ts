import type { BaseEvent } from './base';

/**
 * 브리핑 타입
 */
export type BriefingType = 'morning' | 'evening' | 'weekly';

/**
 * 공유 채널
 */
export type ShareChannel = 'email' | 'slack' | 'link';

/**
 * 즐겨찾기 아이템 타입
 */
export type FavoriteItemType = 'opportunity' | 'proposal' | 'project';

/**
 * 기회 상세 조회 이벤트
 */
export interface OpportunityViewedEvent extends BaseEvent<'user.opportunity_viewed'> {
  data: {
    opportunityId: string;
    opportunityTitle?: string;
    source?: string;
    viewDurationMs?: number;
  };
}

/**
 * 필터 생성 이벤트
 */
export interface FilterCreatedEvent extends BaseEvent<'user.filter_created'> {
  data: {
    filterId: string;
    filterName?: string;
    filterType: string;
    criteria: Record<string, unknown>;
  };
}

/**
 * 브리핑 공유 이벤트
 */
export interface BriefingSharedEvent extends BaseEvent<'user.briefing_shared'> {
  data: {
    briefingId: string;
    briefingType: BriefingType;
    shareChannel: ShareChannel;
    recipientCount?: number;
  };
}

/**
 * 즐겨찾기 추가 이벤트
 */
export interface FavoriteAddedEvent extends BaseEvent<'user.favorite_added'> {
  data: {
    itemId: string;
    itemType: FavoriteItemType;
  };
}

/**
 * 사용자 활동 이벤트 유니온
 */
export type ActivityEvent =
  | OpportunityViewedEvent
  | FilterCreatedEvent
  | BriefingSharedEvent
  | FavoriteAddedEvent;

/**
 * 사용자 활동 이벤트 타입 열거형
 */
export type ActivityEventType = ActivityEvent['type'];
