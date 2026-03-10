"use server";

import { getSession } from "@/lib/auth/get-session";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { revalidatePath } from "next/cache";

function getEffectiveTenantId(tenantIdOverride: string | null | undefined, session: { role: string; tenantId: string | null }) {
  if (session.role === "super_admin") return tenantIdOverride ?? session.tenantId;
  if (session.role === "manager") return session.tenantId;
  return null;
}


export async function inviteTeacher(
  email: string,
  fullName: string,
  tenantIdOverride?: string | null,
  gradeIds?: string[] | null,
  schoolIds?: string[] | null
) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const tenantId = getEffectiveTenantId(tenantIdOverride, session);
  if (!tenantId) return { error: "Nenhuma instituição selecionada" };

  const supabase = createServiceRoleClient();
  if (!supabase) return { error: "Serviço indisponível" };

  const emailTrim = email.trim().toLowerCase();
  if (!emailTrim) return { error: "E-mail é obrigatório" };

  const { data: existing } = await supabase.from("profiles").select("id").eq("email", emailTrim).maybeSingle();
  if (existing) return { error: "Já existe um usuário com este e-mail." };

  const data: Record<string, unknown> = {
    full_name: fullName.trim() || emailTrim.split("@")[0],
    role: "teacher",
    tenant_id: tenantId,
  };
  if (gradeIds?.length) data.grade_ids = JSON.stringify(gradeIds);

  const base = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  const redirectTo = base ? `${base}/auth/callback` : undefined;
  const { data: inviteData, error } = await supabase.auth.admin.inviteUserByEmail(emailTrim, {
    data,
    redirectTo,
  });
  if (error) return { error: error.message };

  let userId: string | null = inviteData?.user?.id ?? null;
  if (!userId) {
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const found = users?.find((u) => u.email?.toLowerCase() === emailTrim);
    userId = found?.id ?? null;
  }
  if (userId) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email: emailTrim,
        full_name: (data.full_name as string) ?? emailTrim.split("@")[0],
        role: "teacher",
        tenant_id: tenantId,
        grade_ids: gradeIds?.length ? JSON.stringify(gradeIds) : null,
        status: "pending",
      },
      { onConflict: "id" }
    );
    if (profileError) return { error: `Convite enviado, mas falha ao registrar professor: ${profileError.message}` };
    if (schoolIds?.length) {
      const { data: schools } = await supabase.from("schools").select("id").eq("tenant_id", tenantId).in("id", schoolIds);
      const validIds = (schools ?? []).map((r) => r.id);
      for (const schoolId of validIds) {
        const { error: tsError } = await supabase.from("teacher_schools").upsert(
          { teacher_id: userId, school_id: schoolId },
          { onConflict: "teacher_id,school_id" }
        );
        if (tsError) return { error: `Convite enviado, mas falha ao vincular à escola: ${tsError.message}` };
      }
    }
  }

  revalidatePath("/gestor");
  revalidatePath("/gestor/professores");
  revalidatePath("/gestor/escolas");
  return { data: { ok: true } };
}

export async function resendTeacherInvite(email: string, tenantIdOverride?: string | null) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const tenantId = getEffectiveTenantId(tenantIdOverride, session);
  if (!tenantId) return { error: "Nenhuma instituição selecionada" };

  const supabase = createServiceRoleClient();
  if (!supabase) return { error: "Serviço indisponível" };

  const emailTrim = email.trim().toLowerCase();
  if (!emailTrim) return { error: "E-mail é obrigatório" };

  const { data: profile } = await supabase.from("profiles").select("full_name, grade_ids").eq("email", emailTrim).eq("tenant_id", tenantId).eq("role", "teacher").maybeSingle();
  if (!profile) return { error: "Professor não encontrado nesta instituição." };

  const data: Record<string, unknown> = {
    full_name: profile.full_name ?? emailTrim.split("@")[0],
    role: "teacher",
    tenant_id: tenantId,
  };
  if (profile.grade_ids) data.grade_ids = profile.grade_ids;

  const base = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "");
  const redirectTo = base ? base + "/auth/callback" : undefined;

  const { error } = await supabase.auth.admin.inviteUserByEmail(emailTrim, { data, redirectTo });
  if (error) {
    if (error.message.includes("already been registered") || error.message.includes("already registered")) {
      return { error: "Este professor já ativou a conta. Não é possível reenviar o convite." };
    }
    return { error: error.message };
  }
  revalidatePath("/gestor");
  revalidatePath("/gestor/professores");
  return { data: { ok: true } };
}

export async function updateTeacherGradeIds(
  teacherId: string,
  gradeIds: string[] | null,
  tenantIdOverride?: string | null
) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const tenantId = getEffectiveTenantId(tenantIdOverride, session);
  if (!tenantId) return { error: "Nenhuma instituição selecionada" };

  const supabase = createServiceRoleClient();
  if (!supabase) return { error: "Serviço indisponível" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", teacherId)
    .eq("tenant_id", tenantId)
    .eq("role", "teacher")
    .maybeSingle();
  if (!profile) return { error: "Professor não encontrado." };

  const value = gradeIds?.length ? JSON.stringify(gradeIds) : null;
  const { error } = await supabase.from("profiles").update({ grade_ids: value }).eq("id", teacherId);
  if (error) return { error: error.message };
  revalidatePath("/gestor");
  revalidatePath("/gestor/professores");
  revalidatePath("/gestor/escolas");
  return { data: { ok: true } };
}

export async function removeTeacherByEmail(email: string, tenantIdOverride?: string | null) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const tenantId = getEffectiveTenantId(tenantIdOverride, session);
  if (!tenantId) return { error: "Nenhuma instituição selecionada" };

  const supabase = createServiceRoleClient();
  if (!supabase) return { error: "Serviço indisponível" };

  const emailTrim = email.trim().toLowerCase();
  if (!emailTrim) return { error: "E-mail é obrigatório" };

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const authUser = users?.find((u) => u.email?.toLowerCase() === emailTrim);
  if (!authUser) {
    const profileExists = await supabase.from("profiles").select("id").eq("email", emailTrim).eq("tenant_id", tenantId).maybeSingle();
    if (profileExists.data) {
      await supabase.from("teacher_schools").delete().eq("teacher_id", profileExists.data.id);
      await supabase.from("teacher_classes").delete().eq("teacher_id", profileExists.data.id);
      await supabase.from("profiles").delete().eq("id", profileExists.data.id);
    }
    revalidatePath("/gestor");
    revalidatePath("/gestor/professores");
    return { data: { ok: true } };
  }

  const uid = authUser.id;
  const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", uid).maybeSingle();
  if (profile && profile.tenant_id !== tenantId) return { error: "Este professor não pertence à sua instituição." };
  await supabase.from("teacher_schools").delete().eq("teacher_id", uid);
  await supabase.from("teacher_classes").delete().eq("teacher_id", uid);
  await supabase.from("profiles").delete().eq("id", uid).eq("tenant_id", tenantId);
  const { error } = await supabase.auth.admin.deleteUser(uid);
  if (error) return { error: error.message };
  revalidatePath("/gestor");
  revalidatePath("/gestor/professores");
  revalidatePath("/gestor/escolas");
  return { data: { ok: true } };
}

