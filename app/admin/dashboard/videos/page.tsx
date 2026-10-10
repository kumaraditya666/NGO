"use client";
import { useEffect, useState } from "react";
import { Shell, useMe } from "@/components/admin";

const empty = { title: "", caption: "", platform: "youtube", url: "", cover: "", coverAlt: "", order: 99, published: false };

export default function VideosAdmin() {
  const { me, loading } = useMe();
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<any>({ ...empty });
  const [editing, setEditing] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/collections?name=videos");
    const j = await r.json();
    if (r.ok) setItems([...(j.data || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
    else setMsg(j.error);
  }
  useEffect(() => { load(); }, []);

  async function saveAll(next: any[], note: string) {
    setBusy(true);
    const r = await fetch("/api/admin/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "videos", data: next, action: note }),
    });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? "Saved." : j.error || "Save failed — check URLs, covers and platforms.");
    if (r.ok) setItems(next);
    setBusy(false);
  }

  function startEdit(v: any) {
    setEditing(v.id);
    setDraft({ ...empty, ...v });
  }
  function cancelEdit() {
    setEditing(null);
    setDraft({ ...empty });
  }
  function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim() || !draft.url.trim() || !draft.cover.trim()) {
      setMsg("Title, URL and cover image are required.");
      return;
    }
    if (editing) {
      saveAll(items.map((x) => (x.id === editing ? { ...x, ...draft, order: Number(draft.order) || 0 } : x)), "edit");
    } else {
      const id = "vid_" + Date.now().toString(36);
      saveAll([...items, { ...draft, id, order: Number(draft.order) || items.length + 1 }], "add");
    }
    cancelEdit();
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
    if (!confirm("Unpublish and remove this video entry? This cannot be undone.")) return;
    saveAll(items.filter((x) => x.id !== id), "delete");
  }

  if (loading) return <p className="p-8">Loading…</p>;
  return (
    <Shell me={me} title="Featured videos — add, edit, publish">
      <p className="text-sm text-forest-muted max-w-2xl">
        Only <strong>published</strong> entries with a real URL and an uploaded cover appear on
        the homepage. YouTube cards open the popup player; Instagram cards open the exact reel
        link. Upload covers first in <strong>Gallery</strong>, then paste the cover path here
        (e.g. <code>/images/gallery/large/….jpg</code>).
      </p>

      <form onSubmit={submitEdit} className="mt-4 rounded-2xl border bg-white p-4 grid gap-3 max-w-2xl text-sm">
        <h2 className="font-semibold">{editing ? "Edit video" : "Add video"}</h2>
        <label className="grid gap-1">Title *<input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="border rounded-xl px-3 py-2" /></label>
        <label className="grid gap-1">Caption (optional)<input value={draft.caption || ""} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} className="border rounded-xl px-3 py-2" /></label>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="grid gap-1">Platform *
            <select value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value })} className="border rounded-xl px-3 py-2 bg-white">
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
            </select>
          </label>
          <label className="grid gap-1">Display order<input type="number" value={draft.order} onChange={(e) => setDraft({ ...draft, order: e.target.value })} className="border rounded-xl px-3 py-2" /></label>
        </div>
        <label className="grid gap-1">Exact video/reel URL (https) *
          <input required value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://www.youtube.com/watch?v=… or https://www.instagram.com/reel/…" className="border rounded-xl px-3 py-2" />
        </label>
        <label className="grid gap-1">Cover image path (uploaded file) *
          <input required value={draft.cover} onChange={(e) => setDraft({ ...draft, cover: e.target.value })} placeholder="/images/gallery/large/….jpg" className="border rounded-xl px-3 py-2" />
        </label>
        <label className="grid gap-1">Cover alt text *
          <input required value={draft.coverAlt} onChange={(e) => setDraft({ ...draft, coverAlt: e.target.value })} placeholder="What the cover shows" className="border rounded-xl px-3 py-2" />
        </label>
        <label className="flex gap-2 items-center font-semibold">
          <input type="checkbox" checked={draft.published === true} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} /> Published (visible on homepage)
        </label>
        <div className="flex gap-2">
          <button disabled={busy} className="rounded-full bg-forest text-ivory px-5 py-2 font-semibold disabled:opacity-60">{editing ? "Save changes" : "Add video"}</button>
          {editing && <button type="button" onClick={cancelEdit} className="rounded-full border px-5 py-2">Cancel</button>}
        </div>
        {msg && <p role="status">{msg}</p>}
      </form>

      <div className="mt-4 space-y-3 max-w-2xl">
        {items.map((v, k) => (
          <div key={v.id} className="rounded-2xl border bg-white p-3 flex gap-3 items-start text-sm">
            {v.cover ? <img src={v.cover} alt="" className="w-[120px] h-[68px] object-cover rounded-xl border shrink-0" loading="lazy" /> : <div className="w-[120px] h-[68px] rounded-xl border grid place-items-center text-forest-muted shrink-0">no cover</div>}
            <div className="flex-1 min-w-0">
              <p><strong>{v.title || "(untitled)"}</strong> · {v.platform} · {v.published ? "published" : "draft"}</p>
              <p className="text-forest-muted truncate">{v.url}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <button onClick={() => startEdit(v)} className="rounded-full border px-3 py-0.5 text-xs">Edit</button>
                <button onClick={() => move(v.id, -1)} disabled={k === 0 || busy} aria-label="Move up" className="rounded-full border px-3 py-0.5 text-xs">↑</button>
                <button onClick={() => move(v.id, 1)} disabled={k === items.length - 1 || busy} aria-label="Move down" className="rounded-full border px-3 py-0.5 text-xs">↓</button>
                <button onClick={() => remove(v.id)} disabled={busy} className="rounded-full border border-red-300 text-red-700 px-3 py-0.5 text-xs">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-forest-muted">No videos yet. The homepage section stays hidden until a published entry exists.</p>}
      </div>
    </Shell>
  );
}
