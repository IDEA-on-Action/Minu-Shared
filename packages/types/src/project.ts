import type { MinuService } from './user';

/**
 * 프로젝트 상태
 */
export type ProjectStatus = 'draft' | 'active' | 'archived' | 'completed';

/**
 * 프로젝트 멤버 역할
 */
export type ProjectRole = 'owner' | 'editor' | 'viewer';

/**
 * 프로젝트 정보
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  tenant_id?: string;
  status: ProjectStatus;
  service: MinuService;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * 프로젝트 멤버
 */
export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  joined_at: string;
}

/**
 * 프로젝트 통계
 */
export interface ProjectStats {
  project_id: string;
  proposal_count: number;
  member_count: number;
  last_activity_at: string;
}

/**
 * 프로젝트 생성 입력
 */
export type CreateProjectInput = Pick<Project, 'name' | 'service'> & {
  description?: string;
  tenant_id?: string;
};

/**
 * 프로젝트 수정 입력
 */
export type UpdateProjectInput = Partial<Pick<Project, 'name' | 'description' | 'status'>>;
