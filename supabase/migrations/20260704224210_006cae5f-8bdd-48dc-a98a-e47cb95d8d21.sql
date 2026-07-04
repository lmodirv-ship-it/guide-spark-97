
CREATE TABLE IF NOT EXISTS public.site_stats (
  id text PRIMARY KEY,
  count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_stats TO anon, authenticated;
GRANT ALL ON public.site_stats TO service_role;
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read site stats" ON public.site_stats;
CREATE POLICY "public read site stats" ON public.site_stats FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.site_stats (id, count) VALUES ('visitors', 1000)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.increment_visitors()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  INSERT INTO public.site_stats (id, count) VALUES ('visitors', 1001)
  ON CONFLICT (id) DO UPDATE SET count = public.site_stats.count + 1, updated_at = now()
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_visitors() TO anon, authenticated;
