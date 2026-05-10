DROP POLICY IF EXISTS "reviews public read" ON public.reviews;
CREATE POLICY "reviews public read approved"
ON public.reviews
FOR SELECT
USING (
  status = 'approved'
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);