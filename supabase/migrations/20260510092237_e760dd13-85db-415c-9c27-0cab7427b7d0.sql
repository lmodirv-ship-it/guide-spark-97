
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.slugify(v text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' from regexp_replace(lower(public.unaccent(coalesce(v,''))), '[^a-z0-9]+', '-', 'g'))
$$;

ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS slug text;
UPDATE public.countries SET slug = public.slugify(coalesce(name_en, name_fr, name_ar, code)) WHERE slug IS NULL OR slug = '';
ALTER TABLE public.countries ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS countries_slug_key ON public.countries(slug);

ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS slug text;
UPDATE public.cities SET slug = public.slugify(coalesce(name_en, name_fr, name_ar)) WHERE slug IS NULL OR slug = '';
ALTER TABLE public.cities ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS cities_country_slug_key ON public.cities(country_id, slug);

ALTER TABLE public.places ADD COLUMN IF NOT EXISTS slug text;
UPDATE public.places SET slug = public.slugify(name) || '-' || substr(id::text, 1, 6) WHERE slug IS NULL OR slug = '';
ALTER TABLE public.places ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS places_city_slug_key ON public.places(city_id, slug);
