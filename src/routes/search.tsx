import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceCard, type PlaceCardData } from "@/components/place-card";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  sort: z.string().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(schema),
  component: SearchPage,
});

function SearchPage() {
  const { q, city, category, sort } = Route.useSearch();
  const [places, setPlaces] = useState<PlaceCardData[]>([]);

  useEffect(() => {
    (async () => {
      let query = supabase
        .from("places")
        .select(`id, name, description, cover_image, address, phone, rating_avg, rating_count, is_open, category:categories(name_ar, name_fr, name_en, color, slug)`)
        .eq("status", "active");
      if (q) query = query.ilike("name", `%${q}%`);
      if (city) query = query.eq("city_id", city);
      if (sort === "rating") query = query.order("rating_avg", { ascending: false });
      else query = query.order("created_at", { ascending: false });
      const { data } = await query.limit(40);
      let rows = (data ?? []) as any[];
      if (category) rows = rows.filter((r) => r.category?.slug === category);
      setPlaces(rows);
    })();
  }, [q, city, category, sort]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">نتائج البحث {q && <>عن "<span className="text-primary">{q}</span>"</>}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {places.map((p) => <PlaceCard key={p.id} p={p} />)}
        </div>
        {places.length === 0 && <p className="text-muted-foreground text-center py-12">لا توجد نتائج.</p>}
      </main>
      <SiteFooter />
    </div>
  );
}
