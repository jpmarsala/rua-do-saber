import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import type { UserRole } from "@/lib/supabase/types";

export interface SessionUser {
  id: string;
  email: string | null;
  role: UserRole;
  tenantId: string | null;
  fullName: string | null;
}

const VALID_ROLES: UserRole[] = [
  "super_admin",
  "editor",
  "support",
  "manager",
  "teacher",
  "student",
];

function normalizeRole(value: unknown): UserRole {
  if (typeof value !== "string") return "student";
  const normalized = value.trim().toLowerCase();
  if (VALID_ROLES.includes(normalized as UserRole)) return normalized as UserRole;
  return "student";
}

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createServiceRoleClient();
  let profile: { role: unknown; tenant_id: string | null; full_name: string | null } | null = null;
  let profileError: { message: string } | null = null;

  const profileClient = admin ?? supabase;
  const result = await profileClient
    .from("profiles")
    .select("role, tenant_id, full_name")
    .eq("id", user.id)
    .maybeSingle();
  profile = result.data;
  profileError = result.error;

  if (profileError && admin) {
    console.warn("[getSession] profiles query with service role failed:", profileError.message, "- retrying with session client");
    const fallback = await supabase
      .from("profiles")
      .select("role, tenant_id, full_name")
      .eq("id", user.id)
      .maybeSingle();
    profile = fallback.data;
    profileError = fallback.error;
  }
  if (profileError) {
    console.error("[getSession] profiles query error:", profileError.message);
  }

  if (!profile) {
    return {
      id: user.id,
      email: user.email ?? null,
      role: "student",
      tenantId: null,
      fullName: user.user_metadata?.full_name ?? null,
    };
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role: normalizeRole(profile.role),
    tenantId: profile.tenant_id ?? null,
    fullName: profile.full_name ?? null,
  };
}
