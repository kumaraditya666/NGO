import { readCollection, writeCollection, uid } from "./store";

export interface AuditEntry {
  id: string;
  at: string;
  by: string;
  action: string;
  entity: string;
  entityId: string;
  detail?: string;
}

export async function logAudit(e: Omit<AuditEntry, "id" | "at">) {
  const list = await readCollection<AuditEntry[]>("audit", []);
  list.unshift({ ...e, id: uid("audit"), at: new Date().toISOString() });
  await writeCollection("audit", list.slice(0, 2000));
}
