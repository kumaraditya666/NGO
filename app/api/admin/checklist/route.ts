import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection } from "@/lib/store";
import { backendStatus } from "@/lib/store";
import { emailConfigured } from "@/lib/config";

export async function GET(req: Request) {
  const g = requireApiRole(req, ["editor", "reviewer"]);
  if ("error" in g) return g.error;
  const [settings, programs, campaigns, events, stories, articles, gallery, team, reports, opps, items, outbox] = await Promise.all([
    readCollection<any>("settings", {}),
    readCollection<any[]>("programs", []),
    readCollection<any[]>("campaigns", []),
    readCollection<any[]>("events", []),
    readCollection<any[]>("stories", []),
    readCollection<any[]>("articles", []),
    readCollection<any[]>("gallery", []),
    readCollection<any[]>("team", []),
    readCollection<any[]>("reports", []),
    readCollection<any[]>("opportunities", []),
    readCollection<any[]>("inkind_items", []),
    readCollection<any[]>("outbox", []),
  ]);
  const failedMail = outbox.filter((m: any) => m.status === "failed").length;
  const db = await backendStatus().catch(() => ({ backend: "json", detail: "Status check failed." }));
  const pub = (a: any[], k: string) => a.filter((x) => (x[k] || "draft") !== "draft").length;
  const draft = (a: any[], k: string) => a.filter((x) => (x[k] || "draft") === "draft").length;
  const groups = [
    {
      title: "Identity & contact",
      items: [
        { label: "Display name set", done: Boolean((settings.displayName || settings.ngoName || "").trim()), hint: "Working title until confirmed" },
        { label: "Legal (registered) name confirmed", done: Boolean((settings.legalName || "").trim()), hint: "Photos show a different name — confirm, do not guess" },
        { label: "Contact email published", done: Boolean((settings.contactEmail || "").trim()), hint: "Hidden from the site until set" },
        { label: "Contact phone published", done: Boolean((settings.contactPhone || "").trim()), hint: "Hidden from the site until set" },
        { label: "Address, hours & map link set", done: Boolean((settings.address || "").trim() && (settings.mapUrl || "").trim()), hint: "" },
        { label: "Team & founder content approved", done: team.length > 0, hint: `${team.length} member(s) stored` },
      ],
    },
    {
      title: "Public content",
      items: [
        { label: "Approved programmes published", done: pub(programs, "state") > 0, hint: `${pub(programs, "state")} published, ${draft(programs, "state")} in draft` },
        { label: "Gallery photos published", done: gallery.filter((x: any) => x.published !== false).length > 0, hint: `${gallery.length} stored` },
        { label: "Impact figures verified & published", done: false, hint: "No verified-metrics store yet — publish only approved figures" },
        { label: "Activity stories / articles published", done: pub(stories, "publish") + pub(articles, "publish") > 0, hint: `${draft(stories, "publish") + draft(articles, "publish")} in draft` },
        { label: "Real upcoming event published", done: events.filter((e: any) => e.publish === "published" && e.state === "upcoming").length > 0, hint: "Unconfirmed events stay drafted" },
        { label: "Volunteer roles published", done: opps.filter((o: any) => o.open).length > 0, hint: "Form works without roles too" },
        { label: "Supply needs published", done: items.length > 0, hint: "Pledge form works without a list too" },
        { label: "Reports / documents published", done: reports.length > 0, hint: "Transparency hides the section until then" },
        { label: "Legal policies reviewed", done: false, hint: "Privacy, terms & donation policy need client/legal review" },
      ],
    },
    {
      title: "Donations & integrations",
      items: [
        { label: "Online donations enabled (staff decision)", done: settings.donationsEnabled === true, hint: "Server-enforced; keep OFF until the bank account is active" },
        { label: "Verified payment details published", done: Boolean((settings.upiId || "").trim() && (settings.accountNumber || "").trim()), hint: "Never show samples publicly" },
        { label: "Active appeal published", done: pub(campaigns, "publish") > 0, hint: `${draft(campaigns, "publish")} in draft` },
        { label: "Supabase connected (persistent data)", done: db.backend === "supabase", hint: db.detail },
        { label: "Transactional email configured", done: emailConfigured, hint: emailConfigured ? "Notifications send via outbox" : "Outbox records failures; forms still save" },
        { label: "Admin notification recipient set", done: Boolean(((settings.adminNotificationEmail || process.env.ADMIN_NOTIFICATION_EMAIL || "") as string).trim()), hint: "Settings > adminNotificationEmail or ADMIN_NOTIFICATION_EMAIL env" },
        { label: "No failed notification emails", done: failedMail === 0, hint: failedMail ? `${failedMail} failed — see Admin > Notifications` : "Outbox clear" },
      ],
    },
  ];
  const all = groups.flatMap((gr) => gr.items);
  const done = all.filter((i) => i.done).length;
  return NextResponse.json({ groups, done, total: all.length });
}
