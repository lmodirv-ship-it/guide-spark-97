
-- =========================================================
-- 1. Extend existing tables
-- =========================================================

ALTER TABLE public.countries
  ADD COLUMN IF NOT EXISTS currency text,
  ADD COLUMN IF NOT EXISTS phone_code text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.cities
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Extend place_status enum with new lifecycle states
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'draft' AND enumtypid = 'place_status'::regtype) THEN
    ALTER TYPE place_status ADD VALUE 'draft';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_review' AND enumtypid = 'place_status'::regtype) THEN
    ALTER TYPE place_status ADD VALUE 'pending_review';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'published' AND enumtypid = 'place_status'::regtype) THEN
    ALTER TYPE place_status ADD VALUE 'published';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'rejected' AND enumtypid = 'place_status'::regtype) THEN
    ALTER TYPE place_status ADD VALUE 'rejected';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'archived' AND enumtypid = 'place_status'::regtype) THEN
    ALTER TYPE place_status ADD VALUE 'archived';
  END IF;
END $$;

ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS price_level int,
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION public.places_update_search_vector()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.address, '')), 'C');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS places_search_vector_trg ON public.places;
CREATE TRIGGER places_search_vector_trg
BEFORE INSERT OR UPDATE OF name, description, address ON public.places
FOR EACH ROW EXECUTE FUNCTION public.places_update_search_vector();

UPDATE public.places SET name = name; -- backfill search_vector

ALTER TABLE public.place_images
  ADD COLUMN IF NOT EXISTS alt_text text,
  ADD COLUMN IF NOT EXISTS is_cover boolean NOT NULL DEFAULT false;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_name text,
  ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.import_jobs
  ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES public.countries(id),
  ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id),
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id),
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS total_found int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_imported int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_duplicates int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS finished_at timestamptz;

-- =========================================================
-- 2. New tables
-- =========================================================

CREATE TABLE IF NOT EXISTS public.opening_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time time,
  close_time time,
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opening_hours public read" ON public.opening_hours FOR SELECT USING (true);
CREATE POLICY "opening_hours owner write" ON public.opening_hours FOR ALL
  USING (EXISTS (SELECT 1 FROM public.places p WHERE p.id = opening_hours.place_id AND (p.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.places p WHERE p.id = opening_hours.place_id AND (p.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE TABLE IF NOT EXISTS public.place_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (place_id, user_id)
);
ALTER TABLE public.place_owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "place_owners self read" ON public.place_owners FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "place_owners admin write" ON public.place_owners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.import_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id uuid NOT NULL REFERENCES public.import_jobs(id) ON DELETE CASCADE,
  raw_data jsonb,
  normalized_data jsonb,
  name text,
  phone text,
  address text,
  website text,
  latitude double precision,
  longitude double precision,
  status text NOT NULL DEFAULT 'pending',
  duplicate_place_id uuid REFERENCES public.places(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.import_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "import_results admin all" ON public.import_results FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions read owner or admin" ON public.subscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin')
         OR EXISTS (SELECT 1 FROM public.places p WHERE p.id = subscriptions.place_id AND p.owner_id = auth.uid()));
CREATE POLICY "subscriptions admin write" ON public.subscriptions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid REFERENCES public.places(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text,
  target_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ads public read active" ON public.ads FOR SELECT
  USING (status = 'active' AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));
CREATE POLICY "ads admin all" ON public.ads FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_logs self or admin read" ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "activity_logs insert auth" ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 3. Indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS places_search_idx ON public.places USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS places_location_idx ON public.places (latitude, longitude);
CREATE INDEX IF NOT EXISTS places_city_idx ON public.places (city_id);
CREATE INDEX IF NOT EXISTS places_category_idx ON public.places (category_id);
CREATE INDEX IF NOT EXISTS places_status_idx ON public.places (status);
CREATE INDEX IF NOT EXISTS places_featured_idx ON public.places (is_featured);
CREATE INDEX IF NOT EXISTS products_place_idx ON public.products (place_id);
CREATE INDEX IF NOT EXISTS reviews_place_idx ON public.reviews (place_id);
CREATE INDEX IF NOT EXISTS opening_hours_place_idx ON public.opening_hours (place_id);
CREATE INDEX IF NOT EXISTS import_results_job_idx ON public.import_results (import_job_id);
CREATE INDEX IF NOT EXISTS activity_logs_user_idx ON public.activity_logs (user_id);
CREATE INDEX IF NOT EXISTS activity_logs_entity_idx ON public.activity_logs (entity_type, entity_id);
