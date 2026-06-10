
CREATE POLICY "Admins read portfolio objects"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert portfolio objects"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update portfolio objects"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete portfolio objects"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));
