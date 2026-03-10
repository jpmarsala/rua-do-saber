import { createClient } from "@supabase/supabase-js";

/**
 * Client with service role key. Use ONLY on the server and only to read/write
 * data that must not be affected by RLS (e.g. reading profile.role for session).
 * Never expose this client or the service role key to the client bundle.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
