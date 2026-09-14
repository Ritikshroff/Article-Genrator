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
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
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
