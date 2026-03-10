import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { getSession } from "./get-session";

export async function getCollectionsAndLessonsForCurrentTenant() {
  const session = await getSession();
  if (!session) return { collections: [], lessons: [], session: null };
  const tenantId = session.tenantId;
  const db = createServiceRoleClient();
  if (!db) return { collections: [], lessons: [], session };
  const { data: assigned } = await db.from("tenant_collections").select("collection_id").eq("tenant_id", tenantId ?? "");
  const collectionIds = assigned?.length ? assigned.map((r) => r.collection_id) : null;
  const { data: allCollections } = await db.from("collections").select("id, title, year").order("year", { ascending: false });
  const collections = collectionIds?.length
    ? (allCollections ?? []).filter((c) => collectionIds.includes(c.id))
    : (allCollections ?? []);
  const ids = collections.map((c) => c.id);
  const { data: lessonsRaw } = ids.length
    ? await db.from("lessons").select("id, title, summary, number_in_collection, collection_id, grade_id").in("collection_id", ids).order("number_in_collection")
    : { data: [] };
  let lessons = lessonsRaw ?? [];

  if (session.role === "teacher" && session.id) {
    // use db from above
    const { data: profile } = db
      ? await db.from("profiles").select("grade_ids").eq("id", session.id).maybeSingle()
      : { data: null };
    let allowedGradeIds: string[] = [];
    if (profile?.grade_ids) {
      try {
        const parsed = typeof profile.grade_ids === "string" ? JSON.parse(profile.grade_ids) : profile.grade_ids;
        allowedGradeIds = Array.isArray(parsed) ? parsed : [];
      } catch {
        allowedGradeIds = [];
      }
    }
    if (allowedGradeIds.length > 0) {
      lessons = lessons.filter((l) => l.grade_id != null && allowedGradeIds.includes(l.grade_id));
    }
  }

  return { collections, lessons, session };
}
