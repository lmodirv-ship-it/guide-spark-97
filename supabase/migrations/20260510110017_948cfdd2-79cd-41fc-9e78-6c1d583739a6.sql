-- Add public_id (A + 6 digits) to remaining admin-managed tables
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS public_id text UNIQUE;
ALTER TABLE public.countries  ADD COLUMN IF NOT EXISTS public_id text UNIQUE;
ALTER TABLE public.cities     ADD COLUMN IF NOT EXISTS public_id text UNIQUE;
ALTER TABLE public.ads        ADD COLUMN IF NOT EXISTS public_id text UNIQUE;
ALTER TABLE public.reviews    ADD COLUMN IF NOT EXISTS public_id text UNIQUE;

-- Generic trigger function
CREATE OR REPLACE FUNCTION public.set_public_id_generic()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.public_id IS NULL OR NEW.public_id = '' THEN
    NEW.public_id := public.generate_unique_public_id(TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS set_public_id ON public.categories;
CREATE TRIGGER set_public_id BEFORE INSERT ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_public_id_generic();
DROP TRIGGER IF EXISTS set_public_id ON public.countries;
CREATE TRIGGER set_public_id BEFORE INSERT ON public.countries FOR EACH ROW EXECUTE FUNCTION public.set_public_id_generic();
DROP TRIGGER IF EXISTS set_public_id ON public.cities;
CREATE TRIGGER set_public_id BEFORE INSERT ON public.cities FOR EACH ROW EXECUTE FUNCTION public.set_public_id_generic();
DROP TRIGGER IF EXISTS set_public_id ON public.ads;
CREATE TRIGGER set_public_id BEFORE INSERT ON public.ads FOR EACH ROW EXECUTE FUNCTION public.set_public_id_generic();
DROP TRIGGER IF EXISTS set_public_id ON public.reviews;
CREATE TRIGGER set_public_id BEFORE INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_public_id_generic();

-- Backfill existing rows
DO $$
DECLARE r record; t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['categories','countries','cities','ads','reviews'] LOOP
    FOR r IN EXECUTE format('SELECT id FROM public.%I WHERE public_id IS NULL', t) LOOP
      EXECUTE format('UPDATE public.%I SET public_id = public.generate_unique_public_id(''public.%I''::regclass) WHERE id = $1', t, t) USING r.id;
    END LOOP;
  END LOOP;
END $$;