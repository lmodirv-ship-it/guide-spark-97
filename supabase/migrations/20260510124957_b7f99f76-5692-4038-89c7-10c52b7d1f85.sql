
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  place_id uuid NOT NULL,
  guest_name text NOT NULL,
  guest_phone text NOT NULL,
  guest_email text,
  address text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'MAD',
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders insert anyone" ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "orders select own or owner or admin" ON public.orders FOR SELECT USING (
  (auth.uid() = user_id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM public.places p WHERE p.id = orders.place_id AND p.owner_id = auth.uid())
);

CREATE POLICY "orders update owner or admin" ON public.orders FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM public.places p WHERE p.id = orders.place_id AND p.owner_id = auth.uid())
);

CREATE POLICY "orders delete admin" ON public.orders FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER orders_set_public_id BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_public_id_generic();

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_place_id_idx ON public.orders(place_id);
