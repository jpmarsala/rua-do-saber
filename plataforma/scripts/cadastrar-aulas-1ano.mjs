/**
 * Cadastra as 24 aulas do 1º Ano (Rua do Saber) no Supabase.
 * Uso: cd plataforma && node scripts/cadastrar-aulas-1ano.mjs
 * Requer .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const jsonPath = join(__dirname, "..", "..", "docs", "aulas-1ano-dados.json");
const aulas = JSON.parse(readFileSync(jsonPath, "utf-8"));

const COLLECTION_TITLE = "Rua do Saber - 1º Ano";
const GRADE_NAME = "1º ano";

async function getOrCreateCollection() {
  const { data } = await supabase.from("collections").select("id").ilike("title", COLLECTION_TITLE).limit(1).maybeSingle();
  if (data) return data.id;
  const { data: inserted } = await supabase.from("collections").insert({ title: COLLECTION_TITLE, year: new Date().getFullYear() }).select("id").single();
  return inserted?.id;
}

async function getOrCreateGrade() {
  const { data } = await supabase.from("grades").select("id").ilike("name", GRADE_NAME).limit(1).maybeSingle();
  if (data) return data.id;
  const { data: inserted } = await supabase.from("grades").insert({ name: GRADE_NAME, sort_order: 1 }).select("id").single();
  return inserted?.id;
}

async function cadastrarUma(aula, collectionId, gradeId) {
  const title = `Aula ${aula.n} — ${aula.title}`;
  const slug = `aula-${aula.n}-${aula.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`.slice(0, 80);

  const { data: lesson, error: eLesson } = await supabase
    .from("lessons")
    .insert({
      collection_id: collectionId,
      title,
      slug,
      summary: aula.descricao,
      grade_id: gradeId,
      pillar_id: null,
      skill_id: null,
      number_in_collection: aula.n,
      status: "draft",
    })
    .select("id")
    .single();

  if (eLesson || !lesson) {
    console.error("Erro lesson", aula.n, eLesson?.message);
    return;
  }

  const { data: version, error: eVersion } = await supabase
    .from("lesson_versions")
    .insert({ lesson_id: lesson.id, tenant_id: null, version_number: 1 })
    .select("id")
    .single();

  if (eVersion || !version) {
    await supabase.from("lessons").delete().eq("id", lesson.id);
    console.error("Erro version", aula.n, eVersion?.message);
    return;
  }

  const learning_objective = `${aula.habilidade}\n\n${aula.descricao}`;
  const discussion_questions = [aula.debate];

  await supabase.from("lesson_content").insert({
    lesson_version_id: version.id,
    learning_objective,
    teacher_introduction: aula.intro,
    discussion_questions,
    activity_description: aula.atividade,
    home_mission: aula.missao,
  });
  await supabase.from("lesson_media").insert({
    lesson_version_id: version.id,
    youtube_url: null,
    thumbnail_url: null,
  });
  await supabase.from("lesson_cards").insert({
    lesson_version_id: version.id,
    name: `Card Aula ${aula.n}`,
    description: aula.habilidade,
    image_url: null,
  });
  await supabase.from("lesson_games").insert({
    lesson_version_id: version.id,
    game_type: "quiz",
    config_json: {},
  });

  console.log("OK", aula.n, title.slice(0, 50) + "...");
}

async function main() {
  console.log("Coleção e ano...");
  const collectionId = await getOrCreateCollection();
  const gradeId = await getOrCreateGrade();
  if (!collectionId || !gradeId) {
    console.error("Não foi possível obter ou criar coleção/ano.");
    process.exit(1);
  }
  console.log("Cadastrando", aulas.length, "aulas...");
  for (const aula of aulas) {
    await cadastrarUma(aula, collectionId, gradeId);
  }
  console.log("Concluído.");
}

main();
