import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, MapPin, ArrowUpDown, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export interface SearchBarProps {
  cities: { id: string; name: string }[];
  categories: { id: string; slug: string; name: string }[];
}

export function SearchBar({ cities, categories }: SearchBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>("");
  const [cat, setCat] = useState<string>("");
  const [sort, setSort] = useState<string>("nearest");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    navigate({ to: "/search", search: { q: q || undefined, city: city || undefined, category: cat || undefined, sort } });
  };

  return (
    <form
      onSubmit={submit}
      className="bg-card/95 backdrop-blur-xl rounded-2xl p-3 shadow-elegant border border-border/40 grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr_1fr] gap-2"
    >
      <div className="relative md:order-5 col-span-1">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("hero.searchPlaceholder")}
          className="w-full h-12 ps-10 pe-3 rounded-xl bg-background border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label={t("hero.searchLabel")}
        />
      </div>

      <div className="md:order-4">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="h-12 rounded-xl">
            <div className="flex items-center gap-2 text-start">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <div className="text-[10px] text-muted-foreground leading-none">{t("hero.cityLabel")}</div>
                <SelectValue placeholder={t("hero.all")} />
              </div>
            </div>
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="md:order-3">
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="h-12 rounded-xl">
            <div className="flex items-center gap-2 text-start">
              <Grid3x3 className="h-4 w-4 text-primary" />
              <div>
                <div className="text-[10px] text-muted-foreground leading-none">{t("hero.categoryLabel")}</div>
                <SelectValue placeholder={t("hero.all")} />
              </div>
            </div>
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="md:order-2">
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-12 rounded-xl">
            <div className="flex items-center gap-2 text-start">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              <div>
                <div className="text-[10px] text-muted-foreground leading-none">{t("hero.sortLabel")}</div>
                <SelectValue />
              </div>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nearest">{t("hero.nearest")}</SelectItem>
            <SelectItem value="rating">{t("hero.topRated")}</SelectItem>
            <SelectItem value="newest">{t("hero.newest")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="md:order-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-6">
        <Search className="h-4 w-4" />
        {t("hero.searchBtn")}
      </Button>
    </form>
  );
}
