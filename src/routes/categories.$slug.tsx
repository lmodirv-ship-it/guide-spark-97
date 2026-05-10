import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceCard, type PlaceCardData } from "@/components/place-card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/categories/$slug")({ component: CategoryPage });

function CategoryPage() {
  const { slug } = Route.useParams();
  const [places, setPlaces] = useState<PlaceCardData[]>([]);
  const [title, setTitle] = useState(slug);

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase.from("categories").select("id, name_ar").eq("slug", slug).single();
      if (!cat) return;
      setTitle(cat.name_ar);
      const { data } = await supabase
        .from("places")
        .select(`id, name, description, cover_image, address, phone, rating_avg, rating_count, is_open, category:categories(name_ar, name_fr, name_en, color)`)
        .eq("status", "active").eq("category_id", cat.id).order("rating_avg", { ascending: false });
      setPlaces((data ?? []) as any);
    })();
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {places.map((p) => <PlaceCard key={p.id} p={p} />)}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
