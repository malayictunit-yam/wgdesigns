
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_name text,
  ADD COLUMN IF NOT EXISTS attachment_type text;

ALTER TABLE public.chat_messages ALTER COLUMN body DROP NOT NULL;

CREATE POLICY "Public read chat uploads"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'chat-uploads');

CREATE POLICY "Anyone can upload chat files"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'chat-uploads');

CREATE POLICY "Admins delete chat uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'chat-uploads' AND has_role(auth.uid(), 'admin'));
