import { readCollection } from "./store";

/** Master switch for online donations. Enforced server-side on every payment route. */
export async function donationsEnabled(): Promise<boolean> {
  const s = await readCollection<{ donationsEnabled?: boolean }>("settings", {});
  return s.donationsEnabled === true;
}

export const DONATIONS_CLOSED =
  "Online donations are not open yet. The NGO's bank account is still being set up — please volunteer, donate supplies, or contact the team instead.";
