import { Link } from "@tanstack/react-router";
import { Heart, Star, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export interface PlaceCardData {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  address: string | null;
  phone: string | null;
  rating_avg: number | null;
  rating_count: number;
  is_open: boolean;
  category?: { name_ar: string; name_fr: string; name_en: string; color: string | null; slug?: string | null } | null;
}

const EXTERNAL_DELIVERY_URL = "https://www.hn-driver.com/delivery/restaurants";

function isFoodPlace(p: PlaceCardData) {
  const hay = `${p.category?.slug || ""} ${p.category?.name_en || ""} ${p.category?.name_ar || ""} ${p.category?.name_fr || ""}`.toLowerCase();
  return /restaurant|cafe|coffee|food|مطعم|مطاعم|مقهى|مقاهي|قهوة|كافيه/i.test(hay);
}

export function PlaceCard({ p }: { p: PlaceCardData }) {
  const { t, i18n } = useTranslation();
  const catName = p.category
    ? (i18n.language === "fr" ? p.category.name_fr : i18n.language === "en" ? p.category.name_en : p.category.name_ar)
    : null;

  const food = isFoodPlace(p);
  const className = "group block bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all border border-border/40";

  const inner = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {p.cover_image ? (
          <img src={p.cover_image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted to-accent" />
        )}
        <button
          onClick={(e) => { e.preventDefault(); }}
          className="absolute top-3 start-3 h-9 w-9 rounded-full bg-card/95 backdrop-blur flex items-center justify-center shadow-soft hover:scale-110 transition"
          aria-label="favorite"
        >
          <Heart className="h-4 w-4 text-destructive" />
        </button>
        {catName && (
          <Badge className="absolute top-3 end-3 bg-card/95 text-foreground hover:bg-card/95 backdrop-blur" style={{ borderColor: p.category?.color ?? undefined }}>
            <span className="h-1.5 w-1.5 rounded-full me-1.5" style={{ background: p.category?.color ?? "var(--primary)" }} />
            {catName}
          </Badge>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-base text-foreground line-clamp-1">{p.name}</h3>
        {p.address && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /><span className="line-clamp-1">{p.address}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="font-semibold">{Number(p.rating_avg ?? 0).toFixed(1)}</span>
          <span className="text-muted-foreground text-xs">({p.rating_count})</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {p.phone ? (
            <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
              <Phone className="h-3 w-3" /> {p.phone}
            </a>
          ) : <span />}
          <span className={`text-xs font-medium ${p.is_open ? "text-success" : "text-destructive"}`}>
            {p.is_open ? t("place.openNow") : t("place.closed")}
          </span>
        </div>
      </div>
    </>
  );

  if (food) {
    return (
      <a href={EXTERNAL_DELIVERY_URL} target="_blank" rel="noreferrer" className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link to="/places/$id" params={{ id: p.id }} className={className}>
      {inner}
    </Link>
  );
}
