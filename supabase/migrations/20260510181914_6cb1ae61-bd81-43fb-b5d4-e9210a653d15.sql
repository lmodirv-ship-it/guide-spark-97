DROP POLICY IF EXISTS "reviews update own" ON public.reviews;
CREATE POLICY "reviews update own" ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "reviews update admin" ON public.reviews
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));