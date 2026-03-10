import { z } from "zod";

export const lessonStatusEnum = z.enum(["draft", "review", "published", "archived"]);

export const lessonFormSchema = z.object({
  // Dados gerais
  collection_id: z.string().uuid().nullable(),
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().optional(),
  summary: z.string().optional(),
  grade_id: z.string().uuid().nullable(),
  pillar_id: z.string().uuid().nullable(),
  skill_id: z.string().uuid().nullable(),
  number_in_collection: z.coerce.number().int().min(0).optional().nullable(),
  // Pedagogia
  learning_objective: z.string().optional(),
  teacher_introduction: z.string().optional(),
  discussion_questions: z.array(z.string()).default([]),
  activity_description: z.string().optional(),
  home_mission: z.string().optional(),
  // Vídeo
  youtube_url: z.union([z.string().url(), z.literal("")]).optional(),
  thumbnail_url: z.union([z.string().url(), z.literal("")]).optional(),
  // Jogo
  game_type: z.string().default("quiz"),
  game_config_json: z.record(z.string(), z.unknown()).optional(),
  // Card
  card_name: z.string().optional(),
  card_description: z.string().optional(),
  card_image_url: z.union([z.string().url(), z.literal("")]).optional(),
  // Publicação
  status: lessonStatusEnum.default("draft"),
});

export type LessonFormValues = z.infer<typeof lessonFormSchema>;
