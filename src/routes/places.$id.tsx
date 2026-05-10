import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, Phone, MapPin, Globe, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/places/$id")({ component: PlacePage });

function PlacePage() {
  const { id } = Route.useParams();
  const [place, setPlace] = useState<any>(null);

  useEffect(() => {
    supabase.from("places").select("*, category:categories(name_ar, color), city:cities(name_ar)").eq("id", id).single()
      .then(({ data }) => setPlace(data));
  }, [id]);

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
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
