import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readCollection<T>(name: string, fallback: T): Promise<T> {
  try {
    await ensureDir();
    const raw = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeCollection(name: string, value: unknown): Promise<void> {
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
