
DROP POLICY IF EXISTS "Visitor can update own session name" ON public.chat_sessions;

ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_sessions;
