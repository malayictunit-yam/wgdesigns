import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Session = {
  id: string;
  visitor_name: string;
  last_message_at: string;
  unread_for_admin: number;
};
type Msg = { id: string; sender: "visitor" | "admin"; body: string; created_at: string };

export function AdminChat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load sessions + realtime
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chat_sessions")
        .select("id,visitor_name,last_message_at,unread_for_admin")
        .order("last_message_at", { ascending: false })
        .limit(100);
      if (!cancelled && data) setSessions(data as Session[]);
    })();

    const ch = supabase
      .channel("admin:sessions")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, async () => {
        const { data } = await supabase
          .from("chat_sessions")
          .select("id,visitor_name,last_message_at,unread_for_admin")
          .order("last_message_at", { ascending: false })
          .limit(100);
        if (data) setSessions(data as Session[]);
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, []);

  // Active conversation
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id,sender,body,created_at")
        .eq("session_id", activeId)
        .order("created_at", { ascending: true });
      if (!cancelled && data) setMessages(data as Msg[]);
      // clear unread for admin
      await supabase.from("chat_sessions").update({ unread_for_admin: 0 }).eq("id", activeId);
    })();
    const ch = supabase
      .channel(`admin:msgs:${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${activeId}` }, (payload) => {
        const m = payload.new as Msg;
        setMessages((prev) => (prev.some(p => p.id === m.id) ? prev : [...prev, m]));
        if (m.sender === "visitor") supabase.from("chat_sessions").update({ unread_for_admin: 0 }).eq("id", activeId).then(() => {});
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [activeId]);

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
  }, [messages.length, activeId]);

  async function send() {
    const body = text.trim();
    if (!body || !activeId) return;
    setText("");
    const { error } = await supabase.from("chat_messages").insert({ session_id: activeId, sender: "admin", body });
    if (error) { console.error(error); setText(body); }
  }

  async function deleteSession(id: string) {
    if (!confirm("Delete this conversation?")) return;
    await supabase.from("chat_sessions").delete().eq("id", id);
    if (activeId === id) setActiveId(null);
    setSessions((s) => s.filter((x) => x.id !== id));
  }

  const active = sessions.find((s) => s.id === activeId);

  return (
    <section className="mt-10 rounded-xl border border-border bg-card/40">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <MessageCircle className="h-4 w-4 text-[color:var(--gold)]" />
        <h2 className="font-display text-lg">Client chat inbox</h2>
        <span className="ml-auto text-xs text-muted-foreground">{sessions.length} conversation{sessions.length === 1 ? "" : "s"}</span>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]" style={{ height: 520 }}>
        {/* Sessions list */}
        <div className="overflow-y-auto border-b border-border md:border-b-0 md:border-r">
          {sessions.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No messages yet.</div>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 border-b border-border/60 px-3 py-2 text-sm ${activeId === s.id ? "bg-secondary/50" : ""}`}
            >
              <button onClick={() => setActiveId(s.id)} className="flex flex-1 flex-col items-start text-left">
                <span className="flex w-full items-center gap-2">
                  <span className="truncate font-medium">{s.visitor_name || "Anonymous"}</span>
                  {s.unread_for_admin > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{s.unread_for_admin}</span>
                  )}
                </span>
                <span className="text-[11px] text-muted-foreground">{new Date(s.last_message_at).toLocaleString()}</span>
              </button>
              <button onClick={() => deleteSession(s.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Conversation */}
        <div className="flex min-h-0 flex-col">
          {!active ? (
            <div className="grid flex-1 place-items-center text-sm text-muted-foreground">Select a conversation</div>
          ) : (
            <>
              <div className="border-b border-border px-4 py-2 text-sm font-medium">{active.visitor_name || "Anonymous"}</div>
              <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                      m.sender === "admin" ? "rounded-br-sm bg-[color:var(--gold)] text-black" : "rounded-bl-sm bg-secondary text-foreground"
                    }`}>
                      {m.body}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2 border-t border-border p-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1}
                  placeholder="Type your reply…"
                  className="max-h-32 min-h-[40px] flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                />
                <button type="submit" disabled={!text.trim()} className="flex h-10 w-10 items-center justify-center rounded-md bg-[color:var(--gold)] text-black disabled:opacity-40" aria-label="Send">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
