"use server";

import { getSession } from "@/lib/auth/get-session";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { revalidatePath } from "next/cache";

function getEffectiveTenantId(tenantIdOverride: string | null | undefined, session: { role: string; tenantId: string | null }) {
  if (session.role === "super_admin") return tenantIdOverride ?? session.tenantId;
  if (session.role === "manager") return session.tenantId;
  return null;
}

export async function updateClass(classId: string, name: string) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  if (session.role !== "manager" && session.role !== "super_admin") return { error: "Sem permissão" };

  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível" };

  const { error } = await db.from("classes").update({ name: name.trim() }).eq("id", classId);
  if (error) return { error: error.message };
  revalidatePath("/gestor/turmas");
  revalidatePath("/gestor/professores");
  return { data: { ok: true } };
}

/** Atribui os professores à turma (substitui vínculos existentes). */
export async function setClassTeachers(classId: string, teacherIds: string[], tenantIdOverride?: string | null) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const tenantId = getEffectiveTenantId(tenantIdOverride, session);
  if (!tenantId) return { error: "Nenhuma instituição selecionada" };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível" };
  const { data: cls } = await db.from("classes").select("id, school_id").eq("id", classId).maybeSingle();
  if (!cls) return { error: "Turma não encontrada." };
  const { data: school } = await db.from("schools").select("tenant_id").eq("id", cls.school_id).maybeSingle();
  if (!school || school.tenant_id !== tenantId) return { error: "Turma não pertence à sua instituição." };
  await db.from("teacher_classes").delete().eq("class_id", classId);
  if (teacherIds.length > 0) {
    const rows = teacherIds.map((teacher_id) => ({ class_id: classId, teacher_id }));
    const { error: insErr } = await db.from("teacher_classes").insert(rows);
    if (insErr) return { error: insErr.message };
  }
  revalidatePath("/gestor/turmas");
  revalidatePath("/gestor/professores");
  revalidatePath("/gestor/turmas/" + classId);
  return { data: { ok: true } };
}

/** Remove o aluno da instituição: desvincula das turmas, remove progresso e cards, deleta perfil e usuário na Auth (libera o e-mail). */
export async function removeStudent(studentId: string, tenantIdOverride?: string | null) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const tenantId = getEffectiveTenantId(tenantIdOverride, session);
  if (!tenantId) return { error: "Nenhuma instituição selecionada" };

  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível" };

  const { data: profile } = await db.from("profiles").select("tenant_id, role").eq("id", studentId).maybeSingle();
  if (!profile) return { error: "Aluno não encontrado." };
  if (profile.tenant_id !== tenantId) return { error: "Este aluno não pertence à sua instituição." };
  if (profile.role !== "student") return { error: "Este usuário não é um aluno." };

  await db.from("student_classes").delete().eq("student_id", studentId);
  await db.from("student_lesson_progress").delete().eq("user_id", studentId);
  await db.from("student_cards").delete().eq("user_id", studentId);
  await db.from("profiles").delete().eq("id", studentId).eq("tenant_id", tenantId);
  const { error } = await db.auth.admin.deleteUser(studentId);
  if (error) return { error: error.message };
  revalidatePath("/gestor/turmas");
  revalidatePath("/gestor");
  return { data: { ok: true } };
}
