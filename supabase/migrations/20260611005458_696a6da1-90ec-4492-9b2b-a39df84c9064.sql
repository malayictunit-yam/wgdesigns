-- Chat sessions (one per visitor)
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL DEFAULT 'Anonymous',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  unread_for_admin integer NOT NULL DEFAULT 0,
  unread_for_visitor integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.chat_sessions TO anon, authenticated;
GRANT ALL ON public.chat_sessions TO service_role;

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Visitors know their own session id (kept in localStorage, UUID acts as bearer secret)
CREATE POLICY "Anyone can create a chat session"
  ON public.chat_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Sessions readable by anyone with id"
  ON public.chat_sessions FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Visitor can update own session name"
  ON public.chat_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage sessions"
  ON public.chat_sessions FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('visitor','admin')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_session_created_idx ON public.chat_messages(session_id, created_at);

GRANT SELECT, INSERT ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read messages (id is secret)"
  ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Visitors can send visitor messages"
  ON public.chat_messages FOR INSERT TO anon, authenticated
  WITH CHECK (sender = 'visitor');

CREATE POLICY "Admins can send admin messages"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (sender = 'admin' AND has_role(auth.uid(),'admin'));

CREATE POLICY "Admins delete messages"
  ON public.chat_messages FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));

-- Bump session timestamp + unread counters on each new message
CREATE OR REPLACE FUNCTION public.touch_chat_session()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.chat_sessions
  SET last_message_at = NEW.created_at,
      updated_at = now(),
      unread_for_admin = CASE WHEN NEW.sender = 'visitor' THEN unread_for_admin + 1 ELSE unread_for_admin END,
      unread_for_visitor = CASE WHEN NEW.sender = 'admin' THEN unread_for_visitor + 1 ELSE unread_for_visitor END
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER chat_messages_touch_session
AFTER INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.touch_chat_session();

CREATE TRIGGER chat_sessions_touch_updated
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_sessions REPLICA IDENTITY FULL;