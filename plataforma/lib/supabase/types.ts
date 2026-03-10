export type UserRole = "student" | "teacher" | "manager" | "super_admin" | "editor" | "support";
export type GameType =
  | "decision"
  | "match"
  | "quiz"
  | "memory"
  | "garage"
  | "novel";
export type TenantClientType = "prefeitura" | "agencia_transito" | "escola";
export type Pillar = string; // ex: "comportamento", "sinais", "mecânica"

export interface Tenant {
  client_type?: TenantClientType;
  id: string;
  name: string;
  slug: string;
  theme_json?: Record<string, unknown>;
  logo_url?: string;
  mascot_url?: string;
}

export interface Collection {
  id: string;
  tenant_id: string;
  title: string;
  year?: number;
  description?: string;
}

export interface Episode {
  id: string;
  collection_id: string;
  title: string;
  summary?: string;
  pillar?: Pillar;
  grade_min?: number;
  grade_max?: number;
  video_url?: string;
  teacher_guide_md?: string;
  worksheet_pdf_url?: string;
  published_at?: string;
}

export interface Game {
  id: string;
  episode_id: string;
  type: GameType;
  config_json: Record<string, unknown>;
}

export interface ProgressEventType {
  video_view: void;
  game_start: void;
  game_complete: void;
  episode_applied: void;
}

export type ProfileStatus = "active" | "inactive";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  tenant_id: string | null;
  status: ProfileStatus;
  created_at?: string;
  updated_at?: string;
}

export interface TenantBranding {
  id: string;
  tenant_id: string;
  theme_json?: Record<string, unknown>;
  logo_url?: string;
  mascot_url?: string;
}

export interface School {
  id: string;
  tenant_id: string;
  name: string;
  slug?: string | null;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  grade_level?: number | null;
  year?: number | null;
  created_at?: string;
  updated_at?: string;
}

// ---- Fase 2: Núcleo editorial ----

export type LessonStatus = "draft" | "review" | "published" | "archived";

export interface Grade {
  id: string;
  name: string;
  sort_order?: number;
  created_at?: string;
}

export interface PillarRow {
  id: string;
  name: string;
  slug?: string | null;
  sort_order?: number;
  created_at?: string;
}

export interface SkillRow {
  id: string;
  pillar_id: string | null;
  name: string;
  slug?: string | null;
  sort_order?: number;
  created_at?: string;
}

/** Coleção editorial (nacional); sem tenant_id */
export interface EditorialCollection {
  id: string;
  title: string;
  slug?: string | null;
  year?: number | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  collection_id: string | null;
  title: string;
  slug?: string | null;
  summary?: string | null;
  grade_id: string | null;
  pillar_id: string | null;
  skill_id: string | null;
  number_in_collection?: number | null;
  status: LessonStatus;
  created_at?: string;
  updated_at?: string;
}

export interface LessonVersion {
  id: string;
  lesson_id: string;
  tenant_id: string | null;
  version_number: number;
  created_at?: string;
  updated_at?: string;
}

export interface LessonContent {
  id: string;
  lesson_version_id: string;
  learning_objective?: string | null;
  teacher_introduction?: string | null;
  discussion_questions?: unknown;
  activity_description?: string | null;
  home_mission?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LessonMedia {
  id: string;
  lesson_version_id: string;
  youtube_url?: string | null;
  thumbnail_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LessonCard {
  id: string;
  lesson_version_id: string;
  name?: string | null;
  description?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LessonGame {
  id: string;
  lesson_version_id: string;
  game_type: string;
  config_json?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}
