/**
 * Minu 서비스 종류
 */
export type MinuService = 'find' | 'frame' | 'build' | 'keep';

/**
 * 구독 플랜
 */
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

/**
 * 사용자 정보 (ideaonaction.ai에서 제공)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 구독 정보
 */
export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  services: MinuService[];
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 테넌트 (조직/팀) 정보
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan: SubscriptionPlan;
  services: MinuService[];
  created_at: string;
  updated_at: string;
}

/**
 * 테넌트 멤버
 */
export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

/**
 * JWT 페이로드 (ideaonaction.ai에서 발급)
 */
export interface JWTPayload {
  /** 사용자 ID */
  sub: string;
  /** 이메일 */
  email: string;
  /** 이름 */
  name: string;
  /** 아바타 URL */
  avatar_url?: string;
  /** 구독 플랜 */
  plan: SubscriptionPlan;
  /** 활성화된 Minu 서비스 목록 */
  services: MinuService[];
  /** 소속 테넌트 ID (멀티테넌시) */
  tenant_id?: string;
  /** 테넌트 내 역할 */
  tenant_role?: 'owner' | 'admin' | 'member';
  /** 발급 시간 (Unix timestamp) */
  iat: number;
  /** 만료 시간 (Unix timestamp) */
  exp: number;
  /** 발급자 */
  iss: 'ideaonaction.ai';
  /** 대상 */
  aud: 'minu-services';
}
