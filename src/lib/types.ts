// ─────────────────────────────────────────────────────────────
// types.ts
// Shared TypeScript interfaces mirroring backend schemas
// ─────────────────────────────────────────────────────────────

export type ArticleStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "revision_requested"
  | "published";

export type UserRole = "author" | "editor";

export type Publication = "Dataquest" | "Voice&Data" | "PCQuest" | "CIOL";

export interface UserResponse {
  id: string;
  username: string;
  email?: string | null;
  full_name: string;
  role: UserRole;
  team?: string | null;
  can_review_pr?: boolean;
  can_edit_ai_draft?: boolean;
  can_approve?: boolean;
  can_publish?: boolean;
  can_access_monitoring?: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email?: string | null;
  full_name: string;
  role: UserRole;
  team?: string | null;
  can_review_pr?: boolean;
  can_edit_ai_draft?: boolean;
  can_approve?: boolean;
  can_publish?: boolean;
  can_access_monitoring?: boolean;
  is_active: boolean;
}

export interface ArticleListItem {
  id: string;
  title: string;
  publication: string;
  status: ArticleStatus;
  created_by_name: string;
  reviewed_by_name: string | null;
  author_rating?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleListResponse {
  articles: ArticleListItem[];
  total: number;
}

export interface ArticleDetail {
  id: string;
  title: string;
  publication: string;
  status: ArticleStatus;
  created_by_id: string;
  created_by_name: string;
  reviewed_by_id: string | null;
  reviewed_by_name: string | null;
  press_release: string;
  news_data: Record<string, any> | null;
  seo_data: Record<string, any> | null;
  impact_data: Record<string, any> | null;
  interview_data: Record<string, any> | null;
  review_data: Record<string, any> | null;
  social_data: Record<string, any> | null;
  creative_data: Record<string, any> | null;
  editor_notes: string | null;
  author_rating: number | null;
  author_rating_note: string | null;
  author_rated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewAction {
  action: "approve" | "request_revision";
  notes?: string | null;
}

export interface AuthorFeedback {
  rating: number; // 1 to 5
  note?: string | null;
}

export interface UserProductivityStats {
  user_id: string;
  full_name: string;
  username: string;
  email: string | null;
  role: UserRole;
  team: string;
  last_login_at: string | null;
  last_active_at: string | null;
  total_logins: number;
  total_active_minutes: number;
  status: "active_today" | "active_this_week" | "inactive";
  articles_drafted: number;
  articles_submitted: number;
  articles_approved: number;
  articles_revision_requested: number;
  avg_quality_rating: number | null;
  estimated_hours_saved: number;
}

export interface ActivityFeedItem {
  id: string;
  user_name: string;
  user_role: string;
  event_type: string;
  publication: string | null;
  created_at: string;
  details?: Record<string, any> | null;
}

export interface AnalyticsOverviewResponse {
  total_registered_users: number;
  active_users_today: number;
  active_users_this_week: number;
  adoption_rate_pct: number;
  total_articles_generated: number;
  total_articles_approved: number;
  approval_rate_pct: number;
  total_hours_saved: number;
  publication_breakdown: Record<string, number>;
  recent_activity: ActivityFeedItem[];
  team_productivity: UserProductivityStats[];
}
