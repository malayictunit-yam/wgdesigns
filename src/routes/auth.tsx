import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — WG Designs" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) afterLogin();
    });
  }, []);

  async function afterLogin() {
    try { await supabase.rpc("claim_admin_if_first"); } catch {}
    navigate({ to: "/admin" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const fn = mode === "signin" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await fn({ email, password, options: mode === "signup" ? { emailRedirectTo: window.location.origin + "/auth" } : undefined } as any);
    setLoading(false);
    if (error) { setMsg(error.message); return; }
    if (mode === "signup") { setMsg("Check your email to confirm, then sign in."); return; }
    afterLogin();
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setMsg((r.error as Error).message);
  }

  return (
    <main className="min-h-screen grid place-items-center bg-background px-5 py-20">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/60 p-8 backdrop-blur">
        <h1 className="font-display text-3xl">{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Admin access to WG Designs studio.</p>
        <button onClick={google} className="mt-6 w-full rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium hover:bg-secondary/80">Continue with Google</button>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" /></div>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm" />
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm" />
          <button disabled={loading} className="w-full rounded-md bg-[color:var(--gold)] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50">{loading ? "…" : mode === "signin" ? "Sign in" : "Sign up"}</button>
        </form>
        {msg && <p className="mt-3 text-sm text-muted-foreground">{msg}</p>}
        <button onClick={() => setMode(m => m === "signin" ? "signup" : "signin")} className="mt-4 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
