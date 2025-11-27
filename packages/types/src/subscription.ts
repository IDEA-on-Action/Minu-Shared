import type { MinuService, SubscriptionPlan } from './user';

/**
 * 확장된 구독 상태
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'paused'
  | 'incomplete';

/**
 * 결제 주기
 */
export type BillingCycle = 'monthly' | 'yearly';

/**
 * 결제 상태
 */
export type PaymentStatus = 'succeeded' | 'failed' | 'pending' | 'refunded';

/**
 * 확장된 구독 정보
 */
export interface SubscriptionExtended {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  services: MinuService[];
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_ends_at?: string;
  paused_at?: string;
  resumed_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 구독 사용량
 */
export interface SubscriptionUsage {
  subscription_id: string;
  service: MinuService;
  feature: string;
  used: number;
  limit: number;
  reset_at: string;
}

/**
 * 결제 이력
 */
export interface PaymentHistory {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  invoice_url?: string;
  created_at: string;
}

/**
 * 플랜별 제한
 */
export interface PlanLimits {
  plan: SubscriptionPlan;
  max_projects: number;
  max_members_per_project: number;
  max_proposals_per_project: number;
  storage_gb: number;
  api_calls_per_month: number;
}

/**
 * 플랜 기능 정의
 */
export interface PlanFeatures {
  plan: SubscriptionPlan;
  features: string[];
  limits: PlanLimits;
}
