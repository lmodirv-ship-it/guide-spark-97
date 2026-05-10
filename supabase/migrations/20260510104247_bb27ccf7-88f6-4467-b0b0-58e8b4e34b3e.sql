-- Generic generator
CREATE OR REPLACE FUNCTION public.generate_unique_public_id(_table regclass)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_id text;
  exists_count int;
BEGIN
  LOOP
    new_id := 'A' || lpad(floor(random() * 1000000)::int::text, 6, '0');
    EXECUTE format('SELECT count(*) FROM %s WHERE public_id = $1', _table)
      INTO exists_count USING new_id;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN new_id;
END;
$$;

-- Add columns
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS public_id text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_id text UNIQUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS public_id text UNIQUE;

-- Trigger functions per table (need to know table name)
CREATE OR REPLACE FUNCTION public.set_public_id_places()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.public_id IS NULL OR NEW.public_id = '' THEN
    NEW.public_id := public.generate_unique_public_id('public.places'::regclass);
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.set_public_id_profiles()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.public_id IS NULL OR NEW.public_id = '' THEN
    NEW.public_id := public.generate_unique_public_id('public.profiles'::regclass);
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.set_public_id_products()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.public_id IS NULL OR NEW.public_id = '' THEN
    NEW.public_id := public.generate_unique_public_id('public.products'::regclass);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_places_public_id ON public.places;
CREATE TRIGGER trg_places_public_id BEFORE INSERT ON public.places
FOR EACH ROW EXECUTE FUNCTION public.set_public_id_places();

DROP TRIGGER IF EXISTS trg_profiles_public_id ON public.profiles;
CREATE TRIGGER trg_profiles_public_id BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_public_id_profiles();

DROP TRIGGER IF EXISTS trg_products_public_id ON public.products;
CREATE TRIGGER trg_products_public_id BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_public_id_products();

-- Backfill
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.places WHERE public_id IS NULL LOOP
    UPDATE public.places SET public_id = public.generate_unique_public_id('public.places'::regclass) WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id FROM public.profiles WHERE public_id IS NULL LOOP
    UPDATE public.profiles SET public_id = public.generate_unique_public_id('public.profiles'::regclass) WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id FROM public.products WHERE public_id IS NULL LOOP
    UPDATE public.products SET public_id = public.generate_unique_public_id('public.products'::regclass) WHERE id = r.id;
  END LOOP;
END $$;