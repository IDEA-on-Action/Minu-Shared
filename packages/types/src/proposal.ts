/**
 * 제안서 상태
 */
export type ProposalStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';

/**
 * 리뷰 결과
 */
export type ReviewStatus = 'approved' | 'rejected' | 'revision_requested';

/**
 * 제안서
 */
export interface Proposal {
  id: string;
  project_id: string;
  author_id: string;
  title: string;
  content: string;
  status: ProposalStatus;
  version: number;
  parent_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

/**
 * 제안서 댓글
 */
export interface ProposalComment {
  id: string;
  proposal_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

/**
 * 제안서 리뷰
 */
export interface ProposalReview {
  id: string;
  proposal_id: string;
  reviewer_id: string;
  status: ReviewStatus;
  comment?: string;
  reviewed_at: string;
}

/**
 * 제안서 생성 입력
 */
export type CreateProposalInput = Pick<Proposal, 'project_id' | 'title' | 'content'>;

/**
 * 제안서 수정 입력
 */
export type UpdateProposalInput = Partial<Pick<Proposal, 'title' | 'content'>>;
