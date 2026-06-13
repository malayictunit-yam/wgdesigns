import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Paperclip, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadChatFile, isImageType } from "@/lib/chatUpload";

type Msg = {
  id: string;
  sender: "visitor" | "admin";
  body: string | null;
  created_at: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
};

const KEY = "wg_chat_session_id";
const NAME_KEY = "wg_chat_visitor_name";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [unread, setUnread] = useState(0);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sid = localStorage.getItem(KEY);
    const nm = localStorage.getItem(NAME_KEY) || "";
    setName(nm);
    if (sid) setSessionId(sid);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const sid = sessionId;
    let cancelled = false;
    const seenIds = new Set<string>();

    async function poll() {
      const { data } = await supabase
        .from("chat_messages")
        .select("id,sender,body,created_at,attachment_url,attachment_name,attachment_type")
        .eq("session_id", sid)
        .order("created_at", { ascending: true });
      if (cancelled || !data) return;
      const fresh = data as Msg[];
      const newAdminMsgs = fresh.filter((m) => !seenIds.has(m.id) && m.sender === "admin");
      const isFirst = seenIds.size === 0;
      fresh.forEach((m) => seenIds.add(m.id));
      setMessages(fresh);
      if (!isFirst && newAdminMsgs.length && !open) {
        setUnread((u) => u + newAdminMsgs.length);
      }
    }
    poll();
    const interval = setInterval(poll, 2500);
    return () => { cancelled = true; clearInterval(interval); };
  }, [sessionId, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        inputRef.current?.focus();
      });
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

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const sid = await ensureSession();
    if (!sid) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        try {
          const att = await uploadChatFile(file, sid);
          const { error } = await supabase.from("chat_messages").insert({
            session_id: sid,
            sender: "visitor",
            body: null,
            attachment_url: att.url,
            attachment_name: att.name,
            attachment_type: att.type,
          });
          if (error) throw error;
        } catch (e: any) {
          console.error(e);
          alert(`Upload failed: ${e?.message || e}`);
        }
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <>
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

      {open && (
        <div className="fixed bottom-24 right-5 z-[60] flex h-[520px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 border-b border-border bg-card/60 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--gold)] text-black">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">Chat with William</div>
              <div className="text-[11px] text-muted-foreground">Send a message or jersey design</div>
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
                Send a message or attach your design — I'll reply here.
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} m={m} mine={m.sender === "visitor"} />
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-end gap-2 border-t border-border bg-card/60 p-2"
          >
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.pdf,.ai,.psd,.cdr,.svg,.eps"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
              aria-label="Attach file"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            </button>
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

function MessageBubble({ m, mine }: { m: Msg; mine: boolean }) {
  const hasAttachment = !!m.attachment_url;
  const image = hasAttachment && isImageType(m.attachment_type);
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] space-y-1 rounded-2xl px-3 py-2 text-sm ${
          mine ? "rounded-br-sm bg-[color:var(--gold)] text-black" : "rounded-bl-sm bg-secondary text-foreground"
        }`}
      >
        {image && (
          <a href={m.attachment_url!} target="_blank" rel="noopener noreferrer">
            <img src={m.attachment_url!} alt={m.attachment_name || "attachment"} className="max-h-60 rounded-md object-cover" />
          </a>
        )}
        {hasAttachment && !image && (
          <a href={m.attachment_url!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline">
            <Paperclip className="h-3.5 w-3.5" />
            <span className="truncate">{m.attachment_name || "Download file"}</span>
          </a>
        )}
        {m.body && <div className="whitespace-pre-wrap break-words">{m.body}</div>}
      </div>
    </div>
  );
}
