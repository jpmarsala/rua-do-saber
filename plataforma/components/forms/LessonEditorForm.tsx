"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lessonFormSchema, type LessonFormValues } from "@/lib/validators/lesson";

type Option = { id: string; name: string };

interface LessonEditorFormProps {
  defaultValues: Partial<LessonFormValues>;
  lessonId?: string;
  collections: Option[];
  grades: Option[];
  pillars: Option[];
  skills: Option[];
  onSubmit: (data: LessonFormValues) => Promise<{ error?: string; data?: { lessonId: string } }>;
  onSuccess: (lessonId: string) => void;
}

const TABS = [
  { id: "geral", label: "Dados gerais" },
  { id: "pedagogia", label: "Pedagogia" },
  { id: "video", label: "Vídeo" },
  { id: "jogo", label: "Jogo" },
  { id: "atividade", label: "Atividade e missão" },
  { id: "card", label: "Card" },
  { id: "publicacao", label: "Publicação" },
];

export function LessonEditorForm({
  defaultValues,
  lessonId,
  collections,
  grades,
  pillars,
  skills,
  onSubmit,
  onSuccess,
}: LessonEditorFormProps) {
  const [tab, setTab] = useState("geral");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema) as Resolver<LessonFormValues>,
    defaultValues: {
      collection_id: null,
      title: "",
      slug: "",
      summary: "",
      grade_id: null,
      pillar_id: null,
      skill_id: null,
      number_in_collection: null,
      learning_objective: "",
      teacher_introduction: "",
      discussion_questions: [],
      activity_description: "",
      home_mission: "",
      youtube_url: "",
      thumbnail_url: "",
      game_type: "quiz",
      game_config_json: {},
      card_name: "",
      card_description: "",
      card_image_url: "",
      status: "draft",
      ...defaultValues,
    },
  });

  async function handleSubmit(data: LessonFormValues) {
    setError(null);
    setLoading(true);
    const result = await onSubmit(data);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.data?.lessonId) onSuccess(result.data.lessonId);
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap ${
              tab === t.id ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "geral" && (
        <div className="grid gap-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
            <input {...form.register("title")} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            {form.formState.errors.title && <p className="text-red-600 text-sm mt-1">{form.formState.errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <input {...form.register("slug")} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="url-amigavel" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resumo</label>
            <textarea {...form.register("summary")} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Coleção</label>
              <select {...form.register("collection_id")} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">—</option>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ano escolar</label>
              <select {...form.register("grade_id")} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">—</option>
                {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilar</label>
              <select {...form.register("pillar_id")} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">—</option>
                {pillars.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Habilidade</label>
              <select {...form.register("skill_id")} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                <option value="">—</option>
                {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Número na coleção</label>
            <input type="number" {...form.register("number_in_collection")} min={0} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
      )}

      {tab === "pedagogia" && (
        <div className="grid gap-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo de aprendizagem</label>
            <textarea {...form.register("learning_objective")} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Introdução para o professor</label>
            <textarea {...form.register("teacher_introduction")} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição da atividade prática</label>
            <textarea {...form.register("activity_description")} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Missão para casa</label>
            <textarea {...form.register("home_mission")} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
      )}

      {tab === "video" && (
        <div className="grid gap-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL do vídeo (YouTube)</label>
            <input {...form.register("youtube_url")} placeholder="https://youtube.com/..." className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL da thumbnail</label>
            <input {...form.register("thumbnail_url")} placeholder="https://..." className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
      )}

      {tab === "jogo" && (
        <div className="grid gap-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de jogo</label>
            <select {...form.register("game_type")} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="quiz">Quiz</option>
              <option value="decision">Decisão</option>
              <option value="memory">Memória</option>
              <option value="match">Match</option>
            </select>
          </div>
        </div>
      )}

      {tab === "atividade" && (
        <div className="text-slate-600 text-sm">Campos de atividade e missão estão na aba Pedagogia.</div>
      )}

      {tab === "card" && (
        <div className="grid gap-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do card</label>
            <input {...form.register("card_name")} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do card</label>
            <textarea {...form.register("card_description")} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL da imagem do card</label>
            <input {...form.register("card_image_url")} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
      )}

      {tab === "publicacao" && (
        <div className="max-w-xl">
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select {...form.register("status")} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
            <option value="draft">Rascunho</option>
            <option value="review">Revisão</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
      )}

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
          {loading ? "Salvando…" : lessonId ? "Salvar alterações" : "Criar aula"}
        </button>
        {
        lessonId && (
          <button type="button" disabled={loading} onClick={() => { form.setValue("status", "published"); form.handleSubmit(handleSubmit)(); }} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
            Publicar
          </button>
        )}
      </div>
    </form>
  );
}
