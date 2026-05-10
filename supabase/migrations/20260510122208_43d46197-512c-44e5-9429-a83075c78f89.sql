
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_id TEXT,
  place_id UUID NOT NULL,
  product_id UUID,
  user_id UUID,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  rooms INTEGER NOT NULL DEFAULT 1,
  nightly_price NUMERIC,
  total_price NUMERIC,
  currency TEXT DEFAULT 'MAD',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations insert anyone" ON public.reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "reservations select own or owner or admin" ON public.reservations
  FOR SELECT USING (
    (auth.uid() = user_id)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.places p WHERE p.id = reservations.place_id AND p.owner_id = auth.uid())
  );

CREATE POLICY "reservations update owner or admin" ON public.reservations
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.places p WHERE p.id = reservations.place_id AND p.owner_id = auth.uid())
  );

CREATE POLICY "reservations delete admin" ON public.reservations
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER reservations_set_updated_at BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TRIGGER reservations_set_public_id BEFORE INSERT ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_public_id_generic();

CREATE INDEX idx_reservations_place ON public.reservations(place_id);
CREATE INDEX idx_reservations_user ON public.reservations(user_id);
