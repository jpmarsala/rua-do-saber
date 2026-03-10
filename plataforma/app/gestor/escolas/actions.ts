"use server";

import { getSession } from "@/lib/auth/get-session";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { revalidatePath } from "next/cache";

function getEffectiveTenantId(tenantIdOverride: string | null | undefined, session: { role: string; tenantId: string | null }) {
  if (session.role === "super_admin") return tenantIdOverride ?? session.tenantId;
  if (session.role === "manager") return session.tenantId;
  return null;
}


export async function createSchool(
  name: string,
  active: boolean,
  tenantIdOverride?: string | null
) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const tenantId = getEffectiveTenantId(tenantIdOverride, session);
  if (!tenantId) return { error: "Nenhuma instituição selecionada" };

  const supabase = createServiceRoleClient();
  if (!supabase) return { error: "Serviço indisponível" };

  const trimName = name.trim();
  if (!trimName) return { error: "Nome da escola é obrigatório." };

  const slug = trimName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const { error } = await supabase.from("schools").insert({
    tenant_id: tenantId,
    name: trimName,
    slug: slug || null,
    active: !!active,
  });
  if (error) return { error: error.message };
  revalidatePath("/gestor/escolas");
  return { data: { ok: true } };
}

/** Atualiza as coleções (grades) ativas para uma escola. */
export async function updateSchoolGrades(
  schoolId: string,
  gradeIds: string[],
  tenantIdOverride?: string | null
) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const tenantId = getEffectiveTenantId(tenantIdOverride, session);
  if (!tenantId) return { error: "Nenhuma instituição selecionada" };

  const supabase = createServiceRoleClient();
  if (!supabase) return { error: "Serviço indisponível" };

  const { data: school } = await supabase
    .from("schools")
    .select("id")
    .eq("id", schoolId)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (!school) return { error: "Escola não encontrada." };

  await supabase.from("school_grades").delete().eq("school_id", schoolId);
  if (gradeIds.length > 0) {
    const rows = gradeIds.map((grade_id) => ({ school_id: schoolId, grade_id }));
    const { error } = await supabase.from("school_grades").insert(rows);
    if (error) return { error: error.message };
  }
  revalidatePath("/gestor/escolas");
  return { data: { ok: true } };
}

/** Remove a escola e todos os dados vinculados (turmas, vínculos). Mantém os professores no banco. */
export async function deleteSchool(
  schoolId: string,
  tenantIdOverride?: string | null
) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const tenantId = getEffectiveTenantId(tenantIdOverride, session);
  if (!tenantId) return { error: "Nenhuma instituição selecionada" };

  const supabase = createServiceRoleClient();
  if (!supabase) return { error: "Serviço indisponível" };

  const { data: school } = await supabase
    .from("schools")
    .select("id")
    .eq("id", schoolId)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (!school) return { error: "Escola não encontrada." };

  const { data: classRows } = await supabase.from("classes").select("id").eq("school_id", schoolId);
  const classIds = (classRows ?? []).map((c) => c.id);

  if (classIds.length > 0) {
    await supabase.from("student_classes").delete().in("class_id", classIds);
    await supabase.from("teacher_classes").delete().in("class_id", classIds);
  }
  await supabase.from("classes").delete().eq("school_id", schoolId);
  await supabase.from("teacher_schools").delete().eq("school_id", schoolId);
  await supabase.from("school_grades").delete().eq("school_id", schoolId);
  const { error } = await supabase.from("schools").delete().eq("id", schoolId).eq("tenant_id", tenantId);
  if (error) return { error: error.message };

  revalidatePath("/gestor/escolas");
  revalidatePath("/gestor");
  return { data: { ok: true } };
}

