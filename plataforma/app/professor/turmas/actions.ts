"use server";

import { getSession } from "@/lib/auth/get-session";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { revalidatePath } from "next/cache";

/** Professor cria uma nova turma na escola (e é auto-vinculado). Ano (gradeId) deve ser um dos que o professor leciona. */
export async function createClass(schoolId: string, name: string, gradeId: string | null) {
  const session = await getSession();
  if (!session?.id || session.role !== "teacher" || !session.tenantId) return { error: "Não autenticado" };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível" };

  const { data: school } = await db.from("schools").select("id, tenant_id").eq("id", schoolId).maybeSingle();
  if (!school || school.tenant_id !== session.tenantId) return { error: "Escola não encontrada ou não pertence à sua instituição." };
  const mySchoolIdsFromClasses: string[] = [];
  const { data: myLinks } = await db.from("teacher_classes").select("class_id").eq("teacher_id", session.id);
  if (myLinks?.length) {
    const { data: myClasses } = await db.from("classes").select("school_id").in("id", myLinks.map((x) => x.class_id));
    if (myClasses?.length) mySchoolIdsFromClasses.push(...myClasses.map((c) => c.school_id));
  }
  const { data: mySchoolLinks } = await db.from("teacher_schools").select("school_id").eq("teacher_id", session.id);
  const mySchoolIdsFromTs = (mySchoolLinks ?? []).map((r) => r.school_id);
  const allowedSchoolIds = [...new Set([...mySchoolIdsFromClasses, ...mySchoolIdsFromTs])];
  if (!allowedSchoolIds.includes(schoolId)) return { error: "Você só pode criar turmas em escolas às quais está vinculado." };
  const { data: profile } = await db.from("profiles").select("grade_ids").eq("id", session.id).maybeSingle();
  const teacherGradeIds: string[] = [];
  if (profile?.grade_ids) {
    const raw = profile.grade_ids;
    const arr = typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : raw;
    if (Array.isArray(arr)) teacherGradeIds.push(...arr);
  }
  if (gradeId && !teacherGradeIds.includes(gradeId)) return { error: "Selecione um ano que você leciona." };
  const insertPayload: { school_id: string; name: string; grade_id?: string } = { school_id: schoolId, name: name.trim() };
  if (gradeId) insertPayload.grade_id = gradeId;
  const { data: newClass, error: insErr } = await db.from("classes").insert(insertPayload).select("id").single();
  if (insErr) return { error: insErr.message };
  await db.from("teacher_classes").insert({ class_id: newClass.id, teacher_id: session.id });
  revalidatePath("/professor");
  revalidatePath("/professor/turmas");
  return { data: { id: newClass.id } };
}

/** Professor edita o nome da turma (apenas turmas em que atua). */
export async function updateClass(classId: string, name: string) {
  const session = await getSession();
  if (!session?.id || session.role !== "teacher") return { error: "Não autenticado" };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível" };

  const { data: link } = await db.from("teacher_classes").select("teacher_id").eq("class_id", classId).eq("teacher_id", session.id).maybeSingle();
  if (!link) return { error: "Turma não encontrada ou você não é professor desta turma." };
  const { error } = await db.from("classes").update({ name: name.trim() }).eq("id", classId);
  if (error) return { error: error.message };
  revalidatePath("/professor");
  revalidatePath("/professor/turmas");
  return { data: { ok: true } };
}
/** Professor exclui a turma (remove vínculos; não apaga perfis dos alunos). */
export async function deleteClass(classId: string) {
  const session = await getSession();
  if (!session?.id || session.role !== "teacher") return { error: "Não autenticado" };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível" };

  const { data: link } = await db.from("teacher_classes").select("teacher_id").eq("class_id", classId).eq("teacher_id", session.id).maybeSingle();
  if (!link) return { error: "Turma não encontrada ou você não é professor desta turma." };

  await db.from("student_classes").delete().eq("class_id", classId);
  await db.from("teacher_classes").delete().eq("class_id", classId);
  const { error } = await db.from("classes").delete().eq("id", classId);
  if (error) return { error: error.message };
  revalidatePath("/professor");
  revalidatePath("/professor/turmas");
  return { data: { ok: true } };
}


/** Professor convida aluno por e-mail para a turma (cria usuário e vincula). */
export async function inviteStudentToClass(classId: string, email: string, fullName?: string | null) {
  const session = await getSession();
  if (!session?.id || session.role !== "teacher" || !session.tenantId) return { error: "Não autenticado" };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível" };

  const { data: link } = await db.from("teacher_classes").select("teacher_id").eq("class_id", classId).eq("teacher_id", session.id).maybeSingle();
  if (!link) return { error: "Turma não encontrada ou você não é professor desta turma." };

  const emailTrim = email.trim().toLowerCase();
  if (!emailTrim) return { error: "E-mail é obrigatório." };

  const { data: existing } = await db.from("profiles").select("id, tenant_id, role").eq("email", emailTrim).maybeSingle();
  if (existing) {
    if (existing.tenant_id !== session.tenantId || existing.role !== "student") return { error: "Este e-mail já está cadastrado (não é aluno da sua instituição)." };
    const { data: alreadyIn } = await db.from("student_classes").select("student_id").eq("class_id", classId).eq("student_id", existing.id).maybeSingle();
    if (alreadyIn) return { error: "Este aluno já está nesta turma." };
    await db.from("student_classes").insert({ class_id: classId, student_id: existing.id });
    revalidatePath("/professor");
    revalidatePath("/professor/turmas");
    return { data: { ok: true } };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const redirectTo = base ? `${base}/auth/callback` : undefined;
  const inviteData = { full_name: (fullName?.trim() || emailTrim.split("@")[0]) as string, role: "student", tenant_id: session.tenantId };
  const { data: inviteResult, error: inviteError } = await db.auth.admin.inviteUserByEmail(emailTrim, { data: inviteData, redirectTo });
  if (inviteError) {
    if (inviteError.message.includes("already") || inviteError.message.includes("registered")) return { error: "Este e-mail já está cadastrado." };
    return { error: inviteError.message };
  }
  const uid = inviteResult?.user?.id;
  if (uid) {
    await db.from("profiles").upsert(
      { id: uid, email: emailTrim, full_name: inviteData.full_name, role: "student", tenant_id: session.tenantId, status: "pending" },
      { onConflict: "id" }
    );
    await db.from("student_classes").insert({ class_id: classId, student_id: uid });
  }
  revalidatePath("/professor");
  revalidatePath("/professor/turmas");
  return { data: { ok: true } };
}

/** Professor remove aluno da turma e da instituição (Auth + profiles + vínculos). */
export async function removeStudentFromClass(studentId: string, classId: string) {
  const session = await getSession();
  if (!session?.id || session.role !== "teacher") return { error: "Não autenticado" };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível" };

  const { data: link } = await db.from("teacher_classes").select("teacher_id").eq("class_id", classId).eq("teacher_id", session.id).maybeSingle();
  if (!link) return { error: "Turma não encontrada ou você não é professor desta turma." };
  const { data: enroll } = await db.from("student_classes").select("student_id").eq("class_id", classId).eq("student_id", studentId).maybeSingle();
  if (!enroll) return { error: "Aluno não está nesta turma." };

  const { data: profile } = await db.from("profiles").select("tenant_id, role").eq("id", studentId).maybeSingle();
  if (!profile || profile.tenant_id !== session.tenantId || profile.role !== "student") return { error: "Aluno não encontrado." };

  await db.from("student_classes").delete().eq("student_id", studentId);
  await db.from("student_lesson_progress").delete().eq("user_id", studentId);
  await db.from("student_cards").delete().eq("user_id", studentId);
  await db.from("profiles").delete().eq("id", studentId);
  const { error } = await db.auth.admin.deleteUser(studentId);
  if (error) return { error: error.message };
  revalidatePath("/professor");
  revalidatePath("/professor/turmas");
  return { data: { ok: true } };
}

/** Retorna alunos da turma (para o professor). */
export async function getClassStudentsAction(classId: string) {
  const session = await getSession();
  if (!session?.id || session.role !== "teacher") return { error: "Não autenticado", data: null };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível", data: null };
  const { data: link } = await db.from("teacher_classes").select("teacher_id").eq("class_id", classId).eq("teacher_id", session.id).maybeSingle();
  if (!link) return { error: "Turma não encontrada.", data: null };
  const { data: enrollments } = await db.from("student_classes").select("student_id").eq("class_id", classId);
  if (!enrollments?.length) return { data: [] };
  const ids = enrollments.map((e) => e.student_id);
  const { data: profiles } = await db.from("profiles").select("id, full_name, email, status").in("id", ids);
  return { data: (profiles ?? []).map((p) => ({ id: p.id, full_name: p.full_name ?? null, email: p.email ?? null, status: (p as { status?: string }).status ?? "pending" })) };
}

/** Alunos da turma com progresso (aulas com atividade e concluídas). */
export async function getClassStudentsWithProgressAction(classId: string) {
  const session = await getSession();
  if (!session?.id || session.role !== "teacher") return { error: "Não autenticado", data: null };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível", data: null };
  const { data: link } = await db.from("teacher_classes").select("teacher_id").eq("class_id", classId).eq("teacher_id", session.id).maybeSingle();
  if (!link) return { error: "Turma não encontrada.", data: null };
  const { data: enrollments } = await db.from("student_classes").select("student_id").eq("class_id", classId);
  if (!enrollments?.length) return { data: [] };
  const studentIds = enrollments.map((e) => e.student_id);
  const { data: profiles } = await db.from("profiles").select("id, full_name, email, status").in("id", studentIds);
  const { data: progressRows } = await db.from("student_lesson_progress").select("user_id, lesson_id, video_completed_at, game_completed_at, mission_validated_at").in("user_id", studentIds);
  const lessonsWithProgressPerUser = new Map<string, number>();
  const lessonsCompletedPerUser = new Map<string, number>();
  for (const r of progressRows ?? []) {
    const key = r.user_id;
    const hasProgress = (r.video_completed_at || r.game_completed_at || r.mission_validated_at) ? 1 : 0;
    lessonsWithProgressPerUser.set(key, (lessonsWithProgressPerUser.get(key) ?? 0) + hasProgress);
    const allDone = r.video_completed_at && r.game_completed_at && r.mission_validated_at ? 1 : 0;
    lessonsCompletedPerUser.set(key, (lessonsCompletedPerUser.get(key) ?? 0) + allDone);
  }
  return {
    data: (profiles ?? []).map((p) => ({
      id: p.id,
      status: (p as { status?: string }).status ?? "pending",
      full_name: p.full_name ?? null,
      email: p.email ?? null,
      lessons_with_progress: lessonsWithProgressPerUser.get(p.id) ?? 0,
      lessons_completed: lessonsCompletedPerUser.get(p.id) ?? 0,
    })),
  };
}

/** Importa alunos para a turma a partir de uma lista (ex.: CSV). */
export async function importStudentsFromCsvAction(classId: string, rows: { email: string; full_name?: string | null }[]) {
  const session = await getSession();
  if (!session?.id || session.role !== "teacher" || !session.tenantId) return { error: "Não autenticado", data: { added: 0, skipped: 0, errors: [] as string[] } };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível", data: { added: 0, skipped: 0, errors: [] } };
  const { data: link } = await db.from("teacher_classes").select("teacher_id").eq("class_id", classId).eq("teacher_id", session.id).maybeSingle();
  if (!link) return { error: "Turma não encontrada.", data: { added: 0, skipped: 0, errors: [] } };
  const errors: string[] = [];
  let added = 0;
  let skipped = 0;
  const base = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "");
  const redirectTo = base ? base + "/auth/callback" : undefined;
  for (const row of rows) {
    const emailTrim = (row.email || "").trim().toLowerCase();
    if (!emailTrim) continue;
    const fullName = row.full_name?.trim() || emailTrim.split("@")[0];
    const { data: existing } = await db.from("profiles").select("id, tenant_id, role").eq("email", emailTrim).maybeSingle();
    if (existing) {
      if (existing.tenant_id !== session.tenantId || existing.role !== "student") {
        errors.push(emailTrim + ": já cadastrado em outra instituição ou não é aluno.");
        continue;
      }
      const { data: alreadyIn } = await db.from("student_classes").select("student_id").eq("class_id", classId).eq("student_id", existing.id).maybeSingle();
      if (alreadyIn) { skipped++; continue; }
      await db.from("student_classes").insert({ class_id: classId, student_id: existing.id });
      added++;
      continue;
    }
    const inviteData = { full_name: fullName, role: "student", tenant_id: session.tenantId };
    const { data: inviteResult, error: inviteError } = await db.auth.admin.inviteUserByEmail(emailTrim, { data: inviteData, redirectTo });
    if (inviteError) { errors.push(emailTrim + ": " + inviteError.message); continue; }
    const uid = inviteResult?.user?.id;
    if (uid) {
      await db.from("profiles").upsert({ id: uid, email: emailTrim, full_name: fullName, role: "student", tenant_id: session.tenantId, status: "pending" }, { onConflict: "id" });
      await db.from("student_classes").insert({ class_id: classId, student_id: uid });
      added++;
    }
  }
  revalidatePath("/professor");
  revalidatePath("/professor/turmas");
  return { data: { added, skipped, errors } };
}
