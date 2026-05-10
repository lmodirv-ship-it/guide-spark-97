import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Star, Phone, MapPin, Globe, Mail, Plus, ShoppingBag, BedDouble, CalendarCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cart } from "@/lib/cart-store";
import { toast } from "sonner";
import { ReservationDialog } from "@/components/reservation-dialog";

export const Route = createFileRoute("/places/$id")({ component: PlacePage });

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  image: string | null;
  category_name: string | null;
  is_available: boolean;
};

function PlacePage() {
  const { id } = Route.useParams();
  const [place, setPlace] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase.from("places").select("*, category:categories(name_ar, color), city:cities(name_ar)").eq("id", id).single()
      .then(({ data }) => setPlace(data));
    supabase.from("products").select("*").eq("place_id", id).order("sort_order").order("created_at")
      .then(({ data }) => setProducts((data ?? []) as any));
  }, [id]);

  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    products.forEach((p) => {
      const k = p.category_name || "القائمة";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    });
    return Array.from(map.entries());
  }, [products]);

  const addItem = (p: Product) => {
    if (!p.price) { toast.error("لا يوجد سعر لهذا المنتج"); return; }
    cart.add({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      currency: p.currency || "MAD",
      image: p.image,
      place_id: id,
      place_name: place?.name,
    });
    toast.success(`تمت إضافة ${p.name} إلى السلة`);
  };

  if (!place) return <div className="min-h-screen flex flex-col"><SiteHeader /><div className="flex-1 flex items-center justify-center text-muted-foreground">جارٍ التحميل...</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="relative h-72 md:h-96 bg-muted overflow-hidden">
          {place.cover_image && <img src={place.cover_image} alt={place.name} className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-card rounded-2xl shadow-elegant p-6 md:p-8 border border-border/40">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {place.category && <Badge style={{ background: `${place.category.color}1a`, color: place.category.color }}>{place.category.name_ar}</Badge>}
                <h1 className="text-2xl md:text-3xl font-extrabold mt-2">{place.name}</h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-semibold text-foreground">{Number(place.rating_avg ?? 0).toFixed(1)}</span>
                  <span>({place.rating_count} تقييم)</span>
                  <span>•</span><span>{place.city?.name_ar}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {place.phone && <Button asChild><a href={`tel:${place.phone}`}><Phone className="h-4 w-4 me-2" />اتصل</a></Button>}
              </div>
            </div>
            {place.description && <p className="mt-6 text-foreground/80 leading-relaxed">{place.description}</p>}
            <div className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
              {place.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{place.address}</div>}
              {place.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{place.phone}</div>}
              {place.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{place.email}</div>}
              {place.website && <a href={place.website} className="flex items-center gap-2 text-primary"><Globe className="h-4 w-4" />{place.website}</a>}
            </div>
          </div>

          {/* Menu / Products */}
          <section className="mt-10 mb-16">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-xl md:text-2xl font-extrabold">القائمة والمنتجات</h2>
              <Badge variant="secondary" className="ms-auto">{products.length} عنصر</Badge>
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-card p-12 text-center text-muted-foreground">
                لا توجد منتجات بعد لهذا المكان.
              </div>
            ) : (
              <div className="space-y-10">
                {groups.map(([cat, items]) => (
                  <div key={cat}>
                    <h3 className="text-lg font-bold mb-3 pb-2 border-b">{cat}</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((p) => (
                        <div key={p.id} className="group rounded-2xl border bg-card overflow-hidden shadow-card hover:shadow-elegant transition flex flex-col">
                          <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">لا توجد صورة</div>
                            )}
                            {!p.is_available && (
                              <Badge variant="secondary" className="absolute top-2 start-2 bg-destructive/90 text-destructive-foreground">غير متوفر</Badge>
                            )}
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="font-bold">{p.name}</div>
                            {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                            <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                              <div className="text-lg font-extrabold tabular-nums text-primary">
                                {p.price ? `${p.price} ${p.currency || "MAD"}` : "—"}
                              </div>
                              <Button size="sm" disabled={!p.is_available || !p.price} onClick={() => addItem(p)} className="gap-1">
                                <Plus className="h-4 w-4" /> أضف
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
