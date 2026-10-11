import { createClient } from "@supabase/supabase-js";

/** Base URL Supabase needs: scheme + host only. Trims whitespace, trailing
 *  slashes, and any pasted API path (e.g. /rest/v1); null when unusable. */
function cleanSupabaseUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

function adminClient() {
  const url = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch (e) {
    console.warn("[db] Supabase client unavailable — using local JSON store.", String((e as Error)?.message || e).slice(0, 120));
    return null;
  }
}

export function getSupabaseAdmin() {
  return adminClient();
}

export function getSupabaseAnon() {
  const url = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}
