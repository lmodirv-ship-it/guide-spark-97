import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, Clock, Truck, ExternalLink, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HN_RESTAURANTS } from "@/lib/hn-restaurants";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "المطاعم والمتاجر — التوصيل" },
      { name: "description", content: "قائمة المطاعم والمقاهي والمتاجر المتاحة للتوصيل في طنجة." },
    ],
  }),
  component: DeliveryPage,
});

const SOURCE = "https://www.hn-driver.com/delivery/restaurants";

function DeliveryPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("الكل");

  const cats = useMemo(() => {
    const s = new Set<string>();
    HN_RESTAURANTS.forEach((r) => s.add(r.category));
    return ["الكل", ...Array.from(s)];
  }, []);

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    return HN_RESTAURANTS.filter((r) => {
      if (cat !== "الكل" && r.category !== cat) return false;
      if (term && !r.name.toLowerCase().includes(term) && !r.category.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [q, cat]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">المطاعم والمتاجر</h1>
            <p className="text-sm text-muted-foreground mt-1">
              قائمة محدّثة من المطاعم والمتاجر المتاحة للتوصيل
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="ps-9" placeholder="ابحث عن مطعم أو متجر..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {cats.map((c) => (
            <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)}>
              {c}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((r, i) => (
            <a
              key={`${r.name}-${i}`}
              href={SOURCE}
              target="_blank"
              rel="noreferrer"
              className="group block bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition border border-border/40"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={r.image} alt={r.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {r.open && (
                  <Badge className="absolute top-3 start-3 bg-success/95 text-success-foreground hover:bg-success/95">✓ مفتوح</Badge>
                )}
                <Badge className="absolute top-3 end-3 bg-card/95 text-foreground hover:bg-card/95 backdrop-blur">{r.category}</Badge>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base line-clamp-1">{r.name}</h3>
                  {r.rating != null && (
                    <span className="flex items-center gap-1 text-sm shrink-0">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-semibold tabular-nums">{r.rating.toFixed(1)}</span>
                    </span>
                  )}
                </div>
                {r.description && <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>}
                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
                  {r.time && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.time}</span>
                  )}
                  {r.fee && (
                    <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> {r.fee}</span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center text-muted-foreground py-16">لا توجد نتائج مطابقة.</div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
