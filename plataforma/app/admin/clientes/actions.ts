"use server";

import { getSession } from "@/lib/auth/get-session";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { revalidatePath } from "next/cache";

function normalizeSlug(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export type CreateTenantResult = { data?: { id: string; inviteWarning?: string }; error?: string };

export async function createTenant(
  formData: FormData
): Promise<CreateTenantResult> {
  const session = await getSession();
  if (!session || (session.role !== "super_admin" && session.role !== "editor")) {
    return { error: "Sem permissão para criar clientes." };
  }

  const name = formData.get("name")?.toString()?.trim();
  const slugRaw = formData.get("slug")?.toString()?.trim();
  const active = formData.get("active") === "on";
  const clientType = (formData.get("client_type")?.toString() ?? "prefeitura") as "prefeitura" | "agencia_transito" | "escola";
  const validTypes = ["prefeitura", "agencia_transito", "escola"];
  const client_type = validTypes.includes(clientType) ? clientType : "prefeitura";
  const managerEmail = formData.get("manager_email")?.toString()?.trim()?.toLowerCase() || null;
  const managerName = formData.get("manager_name")?.toString()?.trim() || null;

  if (!name) return { error: "Nome é obrigatório." };
  const slug = slugRaw ? normalizeSlug(slugRaw) : normalizeSlug(name);
  if (!slug) return { error: "Slug inválido (use letras, números e hífens)." };

  const admin = createServiceRoleClient();
  if (!admin) return { error: "Serviço indisponível." };

  const { data: existing } = await admin.from("tenants").select("id").eq("slug", slug).maybeSingle();
  if (existing) {
    const { data: sameBase } = await admin.from("tenants").select("slug").like("slug", `${slug}%`);
    const used = new Set((sameBase ?? []).map((r: { slug: string }) => r.slug));
    let suggested = `${slug}-2`;
    for (let n = 2; used.has(suggested); n++) suggested = `${slug}-${n}`;
    return { error: `Já existe um cliente com esse slug. Tente usar: ${suggested}` };
  }

  const { data, error } = await admin
    .from("tenants")
    .insert({
      name,
      slug,
      active,
      client_type,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Já existe um cliente com esse slug. Escolha outro (ex.: com número no final)." };
    return { error: error.message };
  }

  const tenantId = data.id;

  if (managerEmail) {
    const base = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
    const redirectTo = base ? `${base}/auth/callback` : undefined;
    const inviteData: Record<string, unknown> = {
      full_name: managerName || managerEmail.split("@")[0],
      role: "manager",
      tenant_id: tenantId,
    };
    const { data: inviteDataResult, error: inviteError } = await admin.auth.admin.inviteUserByEmail(managerEmail, {
      data: inviteData,
      redirectTo,
    });
    if (inviteError) {
      if (inviteError.message.includes("already") || inviteError.message.includes("registered")) {
        let uidToRemove: string | null = null;
        const { data: profileByEmail } = await admin.from("profiles").select("id, tenant_id").eq("email", managerEmail).maybeSingle();
        if (profileByEmail?.id) {
          const { data: tenantExists } = await admin.from("tenants").select("id").eq("id", profileByEmail.tenant_id).maybeSingle();
          if (!tenantExists) uidToRemove = profileByEmail.id;
        } else {
          const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
          const authUser = users?.find((u) => u.email?.toLowerCase() === managerEmail);
          if (authUser?.id) uidToRemove = authUser.id;
        }
        if (uidToRemove) {
          await admin.auth.admin.deleteUser(uidToRemove);
          await admin.from("profiles").delete().eq("id", uidToRemove);
          const retry = await admin.auth.admin.inviteUserByEmail(managerEmail, { data: inviteData, redirectTo });
          if (!retry.error && retry.data?.user?.id) {
            await admin.from("profiles").upsert(
              { id: retry.data.user.id, email: retry.data.user.email ?? managerEmail, full_name: inviteData.full_name as string, role: "manager", tenant_id: tenantId },
              { onConflict: "id" }
            );
            revalidatePath("/admin/clientes");
            revalidatePath(`/admin/clientes/${tenantId}`);
            return { data: { id: tenantId } };
          }
        }
        return { error: "Cliente criado, mas o e-mail do gestor já está cadastrado. Você pode convidar outro e-mail na página do cliente." };
      }
      const isRateLimit = /rate limit|rate_limit|limit exceeded/i.test(inviteError.message);
      if (isRateLimit) {
        return { data: { id: tenantId, inviteWarning: "Cliente criado. O convite não pôde ser enviado agora (limite de e-mails). Reenvie o convite em alguns minutos na página do cliente." } };
      }
      return { error: `Cliente criado, mas o convite falhou: ${inviteError.message}` };
    }
    const invitedUser = inviteDataResult?.user;
    if (invitedUser?.id) {
      await admin.from("profiles").upsert(
        {
          id: invitedUser.id,
          email: invitedUser.email ?? managerEmail,
          full_name: inviteData.full_name as string,
          role: "manager",
          tenant_id: tenantId,
        },
        { onConflict: "id" }
      );
    }
  }

  return { data: { id: tenantId } };
}

export async function inviteManagerForTenant(tenantId: string, email: string, fullName?: string | null) {
  const session = await getSession();
  if (!session || (session.role !== "super_admin" && session.role !== "editor")) {
    return { error: "Sem permissão." };
  }
  const admin = createServiceRoleClient();
  if (!admin) return { error: "Serviço indisponível." };
  const emailTrim = email.trim().toLowerCase();
  if (!emailTrim) return { error: "E-mail é obrigatório." };
  const base = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const redirectTo = base ? `${base}/auth/callback` : undefined;
  const inviteData: Record<string, unknown> = {
    full_name: (fullName?.trim() || emailTrim.split("@")[0]) as string,
    role: "manager",
    tenant_id: tenantId,
  };
  const { data: inviteDataResult, error: inviteError } = await admin.auth.admin.inviteUserByEmail(emailTrim, {
    data: inviteData,
    redirectTo,
  });
  if (inviteError) {
    if (inviteError.message.includes("already") || inviteError.message.includes("registered")) {
      const profile = await admin.from("profiles").select("id, tenant_id, role").eq("email", emailTrim).maybeSingle();
      if (profile?.data?.tenant_id !== tenantId || profile?.data?.role !== "manager") {
        return { error: "Este e-mail já está cadastrado em outra conta ou não é gestor deste cliente." };
      }
      const { error: linkError } = await admin.auth.admin.generateLink({
        type: "recovery",
        email: emailTrim,
        options: { redirectTo: base ? `${base}/auth/callback` : undefined },
      });
      if (linkError) return { error: "Não foi possível enviar o link de acesso. Tente novamente." };
      revalidatePath("/admin/clientes");
      revalidatePath(`/admin/clientes/${tenantId}`);
      return { data: { ok: true, resendExisting: true } };
    }
    if (/rate limit|rate_limit|limit exceeded/i.test(inviteError.message)) {
      return { error: "Limite de e-mails atingido. Tente novamente em alguns minutos." };
    }
    return { error: inviteError.message };
  }
  const invitedUser = inviteDataResult?.user;
  if (invitedUser?.id) {
    await admin.from("profiles").upsert(
      {
        id: invitedUser.id,
        email: invitedUser.email ?? emailTrim,
        full_name: inviteData.full_name as string,
        role: "manager",
        tenant_id: tenantId,
      },
      { onConflict: "id" }
    );
  }
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${tenantId}`);
  return { data: { ok: true } };
}

export async function deleteTenant(tenantId: string) {
  const session = await getSession();
  if (!session || (session.role !== "super_admin" && session.role !== "editor")) {
    return { error: "Sem permissão." };
  }
  const admin = createServiceRoleClient();
  if (!admin) return { error: "Serviço indisponível." };
  await admin.from("tenant_collections").delete().eq("tenant_id", tenantId);
  const { data: schools } = await admin.from("schools").select("id").eq("tenant_id", tenantId);
  const schoolIds = (schools ?? []).map((s: { id: string }) => s.id);
  if (schoolIds.length > 0) {
    const { data: classes } = await admin.from("classes").select("id").in("school_id", schoolIds);
    const classIds = (classes ?? []).map((c: { id: string }) => c.id);
    if (classIds.length > 0) {
      await admin.from("teacher_classes").delete().in("class_id", classIds);
      await admin.from("student_classes").delete().in("class_id", classIds);
    }
    await admin.from("classes").delete().in("school_id", schoolIds);
  }
  await admin.from("schools").delete().eq("tenant_id", tenantId);
  const { data: profilesToRemove } = await admin.from("profiles").select("id").eq("tenant_id", tenantId);
  const userIds = (profilesToRemove ?? []).map((p: { id: string }) => p.id);
  for (const uid of userIds) {
    const { error: authErr } = await admin.auth.admin.deleteUser(uid);
    if (authErr) {
      return { error: `Não foi possível excluir o cliente: o usuário na autenticação não pôde ser removido. Tente novamente. (${authErr.message})` };
    }
  }
  await admin.from("profiles").delete().eq("tenant_id", tenantId);
  // Libera o slug antes de deletar: assim o slug fica reutilizável mesmo com soft delete ou se o delete falhar depois
  await admin.from("tenants").update({ slug: `deleted-${tenantId}`, updated_at: new Date().toISOString() }).eq("id", tenantId);
  const { error } = await admin.from("tenants").delete().eq("id", tenantId);
  if (error) return { error: error.message };
  revalidatePath("/admin/clientes");
  return { data: { ok: true } };
}
