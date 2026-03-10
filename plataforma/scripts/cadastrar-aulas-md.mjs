/**
 * Cadastra aulas a partir de arquivos .md dentro de um zip (template Rua do Saber).
 * Uso: node scripts/cadastrar-aulas-md.mjs "<caminho-do-zip>" "<nome-do-ano>"
 * Ex.: node scripts/cadastrar-aulas-md.mjs "/path/rua-do-saber-aulas-ano2.zip" "2º ano"
 * Requer .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, mkdtempSync, readdirSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
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

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { front: {}, body: "" };
  const front = {};
  match[1].split(/\r?\n/).forEach((line) => {
    const m = line.match(/^(\w+):\s*["']?([^"']*)["']?$/);
    if (m) front[m[1]] = m[2].trim();
  });
  return { front, body: match[2] };
}

function parseSections(body) {
  const sections = {};
  let current = null;
  let buf = [];
  body.split(/\r?\n/).forEach((line) => {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      if (current) sections[current] = buf.join("\n").trim();
      current = h[1].trim();
      buf = [];
    } else if (current) buf.push(line);
  });
  if (current) sections[current] = buf.join("\n").trim();
  return sections;
}

function bulletListToArray(text) {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((s) => s.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean);
}

async function getOrCreateCollection(title) {
  const { data } = await supabase.from("collections").select("id").ilike("title", title).limit(1).maybeSingle();
  if (data) return data.id;
  const { data: inserted } = await supabase.from("collections").insert({ title, year: new Date().getFullYear() }).select("id").single();
  return inserted?.id;
}

async function getOrCreateGrade(name, sortOrder) {
  const { data } = await supabase.from("grades").select("id").ilike("name", name).limit(1).maybeSingle();
  if (data) return data.id;
  const { data: inserted } = await supabase.from("grades").insert({ name, sort_order: sortOrder }).select("id").single();
  return inserted?.id;
}

async function getOrCreatePillar(name) {
  const { data } = await supabase.from("pillars").select("id").ilike("name", name).limit(1).maybeSingle();
  if (data) return data.id;
  const { data: inserted } = await supabase.from("pillars").insert({ name }).select("id").single();
  return inserted?.id;
}

async function getOrCreateSkill(name, pillarId) {
  const { data } = await supabase.from("skills").select("id").eq("pillar_id", pillarId).ilike("name", name).limit(1).maybeSingle();
  if (data) return data.id;
  const { data: inserted } = await supabase.from("skills").insert({ name, pillar_id: pillarId }).select("id").single();
  return inserted?.id;
}

async function cadastrarUma(filePath, collectionId, gradeId, pillarId, skillId) {
  const raw = readFileSync(filePath, "utf-8");
  const { front, body } = parseFrontmatter(raw);
  const sections = parseSections(body);

  const num = parseInt(front.number_in_collection, 10) || 0;
  const title = front.title || "Aula " + num;
  const slug = (front.slug || "aula-" + num + "-" + title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")).slice(0, 100);
  const summary = front.summary || "";

  const { data: lesson, error: eLesson } = await supabase
    .from("lessons")
    .insert({
      collection_id: collectionId,
      title: "Aula " + num + " — " + title,
      slug,
      summary,
      grade_id: gradeId,
      pillar_id: pillarId || null,
      skill_id: skillId || null,
      number_in_collection: num,
      status: (front.status || "draft").toLowerCase() === "published" ? "published" : "draft",
    })
    .select("id")
    .single();

  if (eLesson || !lesson) {
    console.error("Erro lesson", num, eLesson?.message);
    return;
  }

  const { data: version, error: eVersion } = await supabase
    .from("lesson_versions")
    .insert({ lesson_id: lesson.id, tenant_id: null, version_number: 1 })
    .select("id")
    .single();

  if (eVersion || !version) {
    await supabase.from("lessons").delete().eq("id", lesson.id);
    console.error("Erro version", num, eVersion?.message);
    return;
  }

  const learning_objective = sections["Objetivo de aprendizagem"] || "";
  const teacher_introduction = sections["Introdução para o professor"] || "";
  const discussion_questions = bulletListToArray(sections["Perguntas para debate"] || "");
  const activity_description = sections["Descrição da atividade"] || "";
  const home_mission = sections["Missão para casa"] || "";

  await supabase.from("lesson_content").insert({
    lesson_version_id: version.id,
    learning_objective,
    teacher_introduction,
    discussion_questions,
    activity_description,
    home_mission,
  });

  await supabase.from("lesson_media").insert({
    lesson_version_id: version.id,
    youtube_url: front.youtube_url || null,
    thumbnail_url: front.thumbnail_url || null,
  });

  await supabase.from("lesson_cards").insert({
    lesson_version_id: version.id,
    name: front.card_name || "Card Aula " + num,
    description: front.card_description || summary,
    image_url: front.card_image_url || null,
  });

  await supabase.from("lesson_games").insert({
    lesson_version_id: version.id,
    game_type: front.game_type || "quiz",
    config_json: {},
  });

  console.log("OK", num, title.slice(0, 45) + (title.length > 45 ? "..." : ""));
}

async function main() {
  const zipPath = process.argv[2];
  const gradeName = process.argv[3];

  if (!zipPath || !gradeName) {
    console.error('Uso: node scripts/cadastrar-aulas-md.mjs "<caminho-do-zip>" "<nome-do-ano>"');
    process.exit(1);
  }

  const sortOrderByGrade = { "1º ano": 1, "2º ano": 2, "3º ano": 3, "4º ano": 4, "5º ano": 5 };
  const sortOrder = sortOrderByGrade[gradeName] ?? 99;
  const collectionTitle = "Rua do Saber - " + gradeName;

  let tmpDir;
  try {
    tmpDir = mkdtempSync(join("/tmp", "rua-aulas-"));
    const r = spawnSync("unzip", ["-q", "-o", zipPath, "-d", tmpDir], { stdio: "inherit" });
    if (r.status !== 0) throw new Error("unzip falhou");
  } catch (e) {
    console.error("Erro ao extrair zip:", e.message);
    process.exit(1);
  }

  const files = readdirSync(tmpDir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => {
      const na = parseInt((a.match(/aula-(\d+)/) || [])[1] || "0", 10);
      const nb = parseInt((b.match(/aula-(\d+)/) || [])[1] || "0", 10);
      return na - nb;
    });

  if (files.length === 0) {
    console.error("Nenhum arquivo .md encontrado no zip.");
    rmSync(tmpDir, { recursive: true });
    process.exit(1);
  }

  console.log("Coleção e ano...");
  const collectionId = await getOrCreateCollection(collectionTitle);
  const gradeId = await getOrCreateGrade(gradeName, sortOrder);
  if (!collectionId || !gradeId) {
    console.error("Não foi possível obter ou criar coleção/ano.");
    rmSync(tmpDir, { recursive: true });
    process.exit(1);
  }

  console.log("Cadastrando", files.length, "aulas para", gradeName, "...");
  for (const f of files) {
    const fullPath = join(tmpDir, f);
    const raw = readFileSync(fullPath, "utf-8");
    const { front } = parseFrontmatter(raw);
    let pillarId = null;
    let skillId = null;
    if (front.pillar) {
      pillarId = await getOrCreatePillar(front.pillar);
      if (front.skill && pillarId) skillId = await getOrCreateSkill(front.skill, pillarId);
    }
    await cadastrarUma(fullPath, collectionId, gradeId, pillarId, skillId);
  }

  rmSync(tmpDir, { recursive: true });
  console.log("Concluído.");
}

main();
