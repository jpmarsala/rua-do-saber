export type UserRole = "student" | "teacher" | "manager" | "admin";
export type GameType =
  | "decision"
  | "match"
  | "quiz"
  | "memory"
  | "garage"
  | "novel";
export type Pillar = string; // ex: "comportamento", "sinais", "mecânica"

export interface Tenant {
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
