import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Msg = { id: string; sender: "visitor" | "admin"; body: string; created_at: string };

const KEY = "wg_chat_session_id";
const NAME_KEY = "wg_chat_visitor_name";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load saved session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sid = localStorage.getItem(KEY);
    const nm = localStorage.getItem(NAME_KEY) || "";
    setName(nm);
    if (sid) setSessionId(sid);
  }, []);

  // Load messages + realtime when session exists
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id,sender,body,created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (!cancelled && data) setMessages(data as Msg[]);
    })();

    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` }, (payload) => {
        const m = payload.new as Msg;
        setMessages((prev) => (prev.some(p => p.id === m.id) ? prev : [...prev, m]));
        if (m.sender === "admin" && !open) setUnread((u) => u + 1);
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [sessionId, open]);

  // Scroll to bottom + clear unread on open
  useEffect(() => {
    if (open) {
      setUnread(0);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        inputRef.current?.focus();
      });
      // mark visitor-side read
      if (sessionId) {
        supabase.from("chat_sessions").update({ unread_for_visitor: 0 }).eq("id", sessionId).then(() => {});
      }
    }
  }, [open, messages.length, sessionId]);

  async function ensureSession(): Promise<string | null> {
    if (sessionId) return sessionId;
    const visitor = (name || "Anonymous").slice(0, 60);
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ visitor_name: visitor })
      .select("id")
      .single();
    if (error || !data) { console.error(error); return null; }
    localStorage.setItem(KEY, data.id);
    if (name) localStorage.setItem(NAME_KEY, name);
    setSessionId(data.id);
    return data.id;
  }

  async function send() {
    const body = text.trim();
    if (!body) return;
    const sid = await ensureSession();
    if (!sid) return;
    setText("");
    const { error } = await supabase.from("chat_messages").insert({ session_id: sid, sender: "visitor", body });
    if (error) { console.error(error); setText(body); }
  }

  return (
    <>
      {/* Floating button */}
      <button
        aria-label="Open chat"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--gold)] text-black shadow-xl shadow-black/40 transition hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">{unread}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] flex h-[520px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 border-b border-border bg-card/60 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--gold)] text-black">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">Chat with William</div>
              <div className="text-[11px] text-muted-foreground">Usually replies within a few hours</div>
            </div>
          </div>

          {!sessionId && (
            <div className="border-b border-border px-4 py-3">
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Your name (optional)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anonymous"
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
          )}

          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {messages.length === 0 && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Send a message — I'll reply here as soon as I can.
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "visitor" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                    m.sender === "visitor"
                      ? "rounded-br-sm bg-[color:var(--gold)] text-black"
                      : "rounded-bl-sm bg-secondary text-foreground"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-end gap-2 border-t border-border bg-card/60 p-2"
          >
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="Type a message…"
              rows={1}
              className="max-h-32 min-h-[40px] flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-[color:var(--gold)] text-black disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
