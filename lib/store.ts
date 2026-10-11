import fs from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "./supabase";
import { TABLE, orderColumn, toRow, fromRow } from "./dbmap";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/** Which persistent backend serves a collection: Postgres when wired, else local JSON. */
export function backendFor(name: string): "supabase" | "json" {
  if (TABLE[name] && getSupabaseAdmin()) return "supabase";
  return "json";
}

/**
 * Staff-safe database health summary (no secrets, no row data). Used by the
 * admin checklist to show exactly why Supabase reads/writes succeed or fail.
 */
export async function backendStatus(): Promise<{ backend: string; detail: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { backend: "json", detail: "Supabase URL/key not set — using local JSON files." };
  try {
    const { error } = await sb.from("volunteers").select("id").limit(1);
    if (error) throw error;
    return { backend: "supabase", detail: "Connected — submissions read/write Postgres." };
  } catch (e: any) {
    const msg = String(e?.message || e).slice(0, 160);
    return { backend: "supabase-error", detail: `Configured but failing (${msg}). Check the service_role key and that migrations 001-004 ran.` };
  }
}

function missingTable(e: any): boolean {
  const msg = String(e?.message || e) + " " + String(e?.code || "");
  return /42P01|relation .* does not exist|Could not find the table/i.test(msg);
}

async function readSupabase<T>(name: string): Promise<T> {
  const sb = getSupabaseAdmin()!;
  const { data, error } = await sb
    .from(TABLE[name])
    .select("*")
    .order(orderColumn(name), { ascending: false });
  if (error) throw error;
  return ((data || []).map((r) => fromRow(name, r)) as unknown) as T;
}

async function writeSupabase(name: string, value: unknown): Promise<void> {
  const sb = getSupabaseAdmin()!;
  const rows = (Array.isArray(value) ? value : [value]).map((r) => toRow(name, r));
  const { error } = await sb.from(TABLE[name]).upsert(rows, { onConflict: "id" });
  if (error) throw error;
  // Remove rows deleted through the app (admin deletes).
  const ids = new Set(rows.map((r) => String((r as any).id)));
  const { data: existing, error: listError } = await sb.from(TABLE[name]).select("id");
  if (listError) throw listError;
  const gone = (existing || []).map((r: any) => String(r.id)).filter((id) => !ids.has(id));
  if (gone.length > 0) {
    const { error: delError } = await sb.from(TABLE[name]).delete().in("id", gone);
    if (delError) throw delError;
  }
}

export async function readCollection<T>(name: string, fallback: T): Promise<T> {
  if (backendFor(name) === "supabase") {
    try {
      return await readSupabase<T>(name);
    } catch (e) {
      if (missingTable(e)) {
        console.warn(`[db] table missing for "${name}" — using local store until migrations run.`);
        // fall through to JSON
      } else {
        throw e;
      }
    }
  }
  try {
    await ensureDir();
    const raw = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeCollection(name: string, value: unknown): Promise<void> {
  if (backendFor(name) === "supabase") {
    try {
      await writeSupabase(name, value);
      return;
    } catch (e) {
      if (missingTable(e)) {
        console.warn(`[db] table missing for "${name}" — using local store until migrations run.`);
        // fall through to JSON
      } else {
        throw e;
      }
    }
  }
  await ensureDir();
  const tmp = path.join(DATA_DIR, `${name}.json.tmp`);
  const dest = path.join(DATA_DIR, `${name}.json`);
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf-8");
  await fs.rename(tmp, dest);
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function donationRef(): string {
  const y = new Date().getFullYear();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NGO-${y}-${r}`;
}

export function acknowledgementNo(): string {
  return `ACK-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
