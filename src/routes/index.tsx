import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Smartphone, MapPin as MapIcon, Star, ShieldCheck, Headphones } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchBar } from "@/components/search-bar";
import { CategoryGrid, type CategoryItem } from "@/components/category-grid";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { HN_RESTAURANTS } from "@/lib/hn-restaurants";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { t, i18n } = useTranslation();
  const [cats, setCats] = useState<CategoryItem[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [places] = useState(() => HN_RESTAURANTS);

  useEffect(() => {
    const lang = i18n.language;
    const nameCol = lang === "fr" ? "name_fr" : lang === "en" ? "name_en" : "name_ar";

    (async () => {
      const [catsRes, citiesRes, countsRes] = await Promise.all([
        supabase.from("categories").select(`id, slug, icon, color, ${nameCol}`).is("parent_id", null).order("sort_order"),
        supabase.from("cities").select(`id, ${nameCol}`).order(nameCol),
        supabase.from("places").select("category_id", { count: "exact", head: false }).eq("status", "active"),
      ]);

      const counts = new Map<string, number>();
      (countsRes.data ?? []).forEach((r: any) => counts.set(r.category_id, (counts.get(r.category_id) ?? 0) + 1));

      setCats(
        (catsRes.data ?? []).map((c: any) => ({
          id: c.id, slug: c.slug, icon: c.icon, color: c.color,
          name: c[nameCol], count: counts.get(c.id) ?? 0,
        })),
      );
      setCities((citiesRes.data ?? []).map((c: any) => ({ id: c.id, name: c[nameCol] })));
    })();
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[460px] md:h-[520px] overflow-hidden">
          <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
          <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg">
              {t("hero.title").split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-primary-glow">{t("hero.title").split(" ").slice(-1)}</span>
            </h1>
            <p className="mt-3 text-base md:text-lg text-white/85 max-w-2xl">{t("hero.subtitle")}</p>
          </div>
        </div>

        {/* Search bar overlapping */}
        <div className="container mx-auto px-4 -mt-12 relative z-10">
          <SearchBar
            cities={cities}
            categories={cats.map((c) => ({ id: c.id, slug: c.slug, name: c.name }))}
          />
        </div>
      </section>

      {/* Categories */}
      <div className="mt-8">
        <CategoryGrid categories={cats} title={t("categories.title")} more={t("categories.more")} />
      </div>

      {/* Main content + sidebar */}
      <section className="container mx-auto px-4 mt-12 grid lg:grid-cols-[1fr_340px] gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-primary" />
              {t("nearby.title")}
            </h2>
            <Button asChild variant="ghost" size="sm"><Link to="/delivery">{t("nearby.viewAll")}</Link></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {places.map((p, i) => (
              <Link key={`${p.name}-${i}`} to="/delivery" className="group block bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all border border-border/40">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 start-3 h-9 w-9 rounded-full bg-card/95 backdrop-blur flex items-center justify-center shadow-soft">
                    <Heart className="h-4 w-4 text-destructive" />
                  </span>
                  <Badge className="absolute top-3 end-3 bg-card/95 text-foreground hover:bg-card/95 backdrop-blur">
                    <span className={`h-1.5 w-1.5 rounded-full me-1.5 ${p.open ? "bg-success" : "bg-destructive"}`} />
                    {p.category}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-base text-foreground line-clamp-1">{p.name}</h3>
                  {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <span className="flex items-center gap-1 font-semibold"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{p.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">{p.time} · {p.fee}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-gradient-to-br from-sidebar to-[oklch(0.22_0.04_265)] text-sidebar-foreground rounded-2xl p-6 shadow-elegant">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary-glow" />
              </div>
              <div>
                <div className="font-bold">تطبيق HN Driver</div>
                <div className="text-xs opacity-75">حمّل تطبيق التوصيل الآن</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <a
                href="https://typamugwwatqmdkxkfof.supabase.co/storage/v1/object/public/blog-images/downloads%2Fhn-driver.apk"
                download
                className="flex-1 text-center bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs font-semibold hover:opacity-90 transition"
              >
                ⬇ تحميل APK
              </a>
            </div>
          </div>
        </aside>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: MapIcon, key: "places", color: "var(--primary)" },
            { icon: Star, key: "reviews", color: "#f59e0b" },
            { icon: ShieldCheck, key: "info", color: "#10b981" },
            { icon: Headphones, key: "support", color: "#6366f1" },
          ].map(({ icon: Icon, key, color }) => (
            <div key={key} className="bg-card border border-border/40 rounded-2xl p-5 flex items-center gap-4 shadow-card">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: `${color}1a`, color }}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground">{t(`features.${key}.t`)}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{t(`features.${key}.d`)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
