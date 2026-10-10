"use client";
import { useEffect, useState } from "react";
import { Shell, useMe } from "@/components/admin";

export default function GalleryAdmin() {
  const { me, loading } = useMe();
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [cat, setCat] = useState("All Photos");
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/collections?name=gallery");
    const j = await r.json();
    if (r.ok) setItems([...j.data].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
    else setMsg(j.error);
  }
  useEffect(() => { load(); }, []);

  async function saveAll(next: any[], note: string) {
    setBusy(true);
    const r = await fetch("/api/admin/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "gallery", data: next, action: note }),
    });
    setMsg(r.ok ? "Saved." : (await r.json()).error);
    if (r.ok) setItems(next);
    setBusy(false);
  }

  function patch(id: string, p: any) {
    saveAll(items.map((x) => (x.id === id ? { ...x, ...p } : x)), "edit");
  }
  function move(id: string, d: number) {
    const i = items.findIndex((x) => x.id === id);
    const j = i + d;
    if (i < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    next.forEach((x, k) => (x.order = k + 1));
    saveAll(next, "reorder");
  }
  async function remove(id: string) {
    const rmFiles = confirm("Delete this photo entry?\nOK = also delete the image files.\nCancel = keep files, remove entry only.") ;
    if (!confirm("Confirm delete?")) return;
    const r = await fetch("/api/admin/gallery/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, removeFiles: rmFiles }),
    });
    if (r.ok) { setMsg("Deleted."); load(); }
    else setMsg((await r.json()).error);
  }
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setMsg("Uploading…");
    const r = await fetch("/api/admin/gallery/upload", { method: "POST", body: fd });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { setMsg(j.error); return; }
    setMsg(`${j.added.length} photo(s) added as UNPUBLISHED — set alt text, then publish.`);
    setCat("All Photos");
    load();
  }

  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Gallery — upload, edit, publish">
      <form onSubmit={upload} className="rounded-2xl border bg-white p-4 flex flex-wrap items-end gap-3 text-sm">
        <label className="grid gap-1">Photos (up to 10, JPG/PNG/WebP, max 8MB each)<input type="file" name="files" multiple accept=".jpg,.jpeg,.png,.webp" required className="border rounded-xl px-3 py-2 bg-white" /></label>
        <label className="grid gap-1">Album<input name="category" defaultValue="All Photos" className="border rounded-xl px-3 py-2" /></label>
        <button disabled={busy} className="rounded-full bg-forest text-ivory px-5 py-2 font-semibold">Upload as unpublished</button>
        {msg && <p role="status" className="w-full">{msg}</p>}
      </form>
      <p className="mt-3 text-sm text-forest-muted">
        Only publish photographs approved for public use, with factual alt text. Order here is display order (lower first). Tip: place originals in <code>public/images/gallery/</code> and run <code>scripts/sync-gallery.ps1</code> for optimised versions.
      </p>
      <div className="mt-4 space-y-3">
        {items.map((g, k) => (
          <div key={g.id} className="rounded-2xl border bg-white p-3 grid gap-3 md:grid-cols-[120px_1fr_auto] md:items-start text-sm">
            <img src={g.thumb || g.image} alt="" className="w-[120px] h-[90px] object-cover rounded-xl border" loading="lazy" />
            <div className="grid gap-2">
              <label className="grid gap-1">Alt text (factual — what is visible)<input value={g.alt || ""} onChange={(e) => setItems(items.map((x) => (x.id === g.id ? { ...x, alt: e.target.value } : x)))} onBlur={() => patch(g.id, { alt: g.alt || "" })} className="border rounded-xl px-3 py-1.5" placeholder="e.g. Volunteers and children holding flags outside a building" /></label>
              <label className="grid gap-1">Caption (only if the client provided one)<input value={g.caption || ""} onChange={(e) => setItems(items.map((x) => (x.id === g.id ? { ...x, caption: e.target.value } : x)))} onBlur={() => patch(g.id, { caption: g.caption || "" })} className="border rounded-xl px-3 py-1.5" placeholder="Empty = no caption shown" /></label>
              <div className="flex flex-wrap gap-2 items-center">
                <label className="flex gap-1 items-center">Album <input value={g.category || ""} onChange={(e) => setItems(items.map((x) => (x.id === g.id ? { ...x, category: e.target.value } : x)))} onBlur={() => patch(g.id, { category: g.category || "All Photos" })} className="border rounded-xl px-2 py-1 w-36" /></label>
                <label className="flex gap-1 items-center font-semibold"><input type="checkbox" checked={g.published !== false} onChange={(e) => patch(g.id, { published: e.target.checked })} /> Published</label>
                <span className="text-forest-muted">#{k + 1}</span>
              </div>
            </div>
            <div className="flex md:flex-col gap-1">
              <button onClick={() => move(g.id, -1)} disabled={k === 0 || busy} aria-label="Move up" className="rounded-full border px-3 py-1">↑</button>
              <button onClick={() => move(g.id, 1)} disabled={k === items.length - 1 || busy} aria-label="Move down" className="rounded-full border px-3 py-1">↓</button>
              <button onClick={() => remove(g.id)} disabled={busy} className="rounded-full border border-red-300 text-red-700 px-3 py-1">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-forest-muted">No photos yet.</p>}
      </div>
    </Shell>
  );
}
