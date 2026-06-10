import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { uploadProjectImage } from "@/lib/projects.functions";
import { describeProjectImage } from "@/lib/describe.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — WG Designs" }] }),
  component: AdminPage,
});

type Row = {
  id: string; title: string; category: string; client: string; image_url: string;
  description: string; featured: boolean; sort_order: number;
};

const CATEGORIES = ["Basketball","Volleyball","Running","Cycling","Esports","Corporate","Event","T-Shirt"];

function AdminPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const upload = useServerFn(uploadProjectImage);
  const describe = useServerFn(describeProjectImage);

  async function load() {
    const { data } = await supabase.from("projects").select("*").order("sort_order");
    setRows((data as Row[]) || []);
  }

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      await supabase.rpc("claim_admin_if_first");
      const { data: r } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      setIsAdmin(!!r);
      if (r) load();
    })();
  }, []);

  async function save(row: Row) {
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("projects").update({
      title: row.title, category: row.category, client: row.client,
      description: row.description, featured: row.featured, sort_order: row.sort_order,
      image_url: row.image_url,
    }).eq("id", row.id);
    setBusy(false);
    setMsg(error ? error.message : "Saved");
  }

  async function remove(id: string) {
    if (!confirm("Delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    load();
  }

  async function fileToBase64(file: File): Promise<string> {
    // Chunked encode — avoids "Maximum call stack size exceeded" on large images
    const buf = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < buf.length; i += CHUNK) {
      binary += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + CHUNK)));
    }
    return btoa(binary);
  }

  async function onUpload(row: Row, file: File) {
    setBusy(true); setMsg("Uploading…");
    try {
      const b64 = await fileToBase64(file);
      const { url } = await upload({ data: { fileBase64: b64, filename: file.name, contentType: file.type || "image/jpeg" } });
      setRows(rs => rs.map(r => r.id === row.id ? { ...r, image_url: url } : r));
      const { error } = await supabase.from("projects").update({ image_url: url }).eq("id", row.id);
      if (error) throw error;
      setMsg("Image updated");
    } catch (e: any) {
      console.error("upload failed", e);
      setMsg(e?.message || "Upload failed");
    } finally { setBusy(false); }
  }

  async function addNew(file: File, title: string, category: string) {
    if (!title || !file) return;
    setBusy(true); setMsg("Uploading…");
    try {
      const b64 = await fileToBase64(file);
      const { url } = await upload({ data: { fileBase64: b64, filename: file.name, contentType: file.type || "image/jpeg" } });
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40) + "_" + Date.now();
      const maxOrder = Math.max(0, ...rows.map(r => r.sort_order)) + 10;
      const { error } = await supabase.from("projects").insert({
        id, title, category, client: "", image_url: url, description: "", palette: [], featured: false, sort_order: maxOrder,
      });
      if (error) throw error;
      setMsg("Added");
      load();
    } catch (e: any) {
      console.error("add failed", e);
      setMsg(e?.message || "Add failed");
    } finally { setBusy(false); }
  }


  if (isAdmin === null) return <main className="grid min-h-screen place-items-center text-muted-foreground">Loading…</main>;
  if (!isAdmin) return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div><h1 className="font-display text-3xl">Not authorized</h1><p className="mt-2 text-sm text-muted-foreground">Your account is signed in but doesn't have admin access.</p></div>
    </main>
  );

  return (
    <main className="min-h-screen bg-background px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl">Manage Portfolio</h1>
            <p className="text-sm text-muted-foreground">Rename projects, replace images, add new ones.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">View site</Link>
            <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }} className="rounded-md border border-border px-3 py-1.5 text-sm">Sign out</button>
          </div>
        </header>

        {msg && <div className="mb-4 rounded-md border border-border bg-card px-4 py-2 text-sm">{msg}</div>}

        <AddNew onAdd={addNew} busy={busy} />

        <div className="space-y-4">
          {rows.map((r, idx) => (
            <div key={r.id} className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card/50 p-4 sm:grid-cols-[140px_1fr_auto]">
              <img src={r.image_url} alt={r.title} className="aspect-square w-full rounded-md object-cover sm:w-[140px]" />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input label="Title" value={r.title} onChange={v => setRows(rs => rs.map((x,i) => i===idx ? {...x, title:v} : x))} />
                <Select label="Category" value={r.category} options={CATEGORIES} onChange={v => setRows(rs => rs.map((x,i) => i===idx ? {...x, category:v} : x))} />
                <Input label="Client" value={r.client} onChange={v => setRows(rs => rs.map((x,i) => i===idx ? {...x, client:v} : x))} />
                <Input label="Sort order" type="number" value={String(r.sort_order)} onChange={v => setRows(rs => rs.map((x,i) => i===idx ? {...x, sort_order: Number(v)||0} : x))} />
                <label className="col-span-full text-xs uppercase tracking-widest text-muted-foreground">Description
                  <textarea value={r.description} onChange={e => setRows(rs => rs.map((x,i) => i===idx ? {...x, description:e.target.value} : x))} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" rows={2} />
                </label>
                <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <input type="checkbox" checked={r.featured} onChange={e => setRows(rs => rs.map((x,i) => i===idx ? {...x, featured:e.target.checked} : x))} />
                  Featured
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => save(r)} disabled={busy} className="rounded-md bg-[color:var(--gold)] px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50">Save</button>
                <label className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-center text-xs hover:bg-secondary">
                  Replace image
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onUpload(r, e.target.files[0])} />
                </label>
                <button onClick={() => remove(r.id)} className="rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm normal-case tracking-normal text-foreground" />
    </label>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}
      <select value={value} onChange={e => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm normal-case tracking-normal text-foreground">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
function AddNew({ onAdd, busy }: { onAdd: (f: File, t: string, c: string) => void; busy: boolean }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Basketball");
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-dashed border-border bg-card/30 p-4 sm:grid-cols-[1fr_180px_180px_auto]">
      <Input label="New project title" value={title} onChange={setTitle} />
      <Select label="Category" value={category} options={CATEGORIES} onChange={setCategory} />
      <label className="text-xs uppercase tracking-widest text-muted-foreground">Image
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="mt-1 w-full text-xs text-foreground" />
      </label>
      <button disabled={busy || !title || !file} onClick={() => file && onAdd(file, title, category)} className="self-end rounded-md bg-[color:var(--gold)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">Add project</button>
    </div>
  );
}
