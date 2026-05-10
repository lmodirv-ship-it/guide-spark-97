import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  color: string | null;
  count?: number;
}

export function CategoryGrid({ categories, title, more }: { categories: CategoryItem[]; title: string; more: string }) {
  const items = categories.slice(0, 6);
  const hasMore = categories.length > 6;
  return (
    <section className="container mx-auto px-4 -mt-12 relative z-10">
      <div className="grid grid-cols-3 md:grid-cols-7 gap-3 lg:gap-4">
        {items.map((c) => {
          const Icon = (Icons[(c.icon || "Store") as keyof typeof Icons] as LucideIcon) || Icons.Store;
          return (
            <Link
              key={c.id}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="bg-card border border-border/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all"
            >
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center"
                style={{ background: `${c.color}1a`, color: c.color ?? "var(--primary)" }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-sm font-bold text-foreground text-center line-clamp-1">{c.name}</div>
              {c.count !== undefined && <div className="text-xs text-muted-foreground">{c.count.toLocaleString()}</div>}
            </Link>
          );
        })}
        <Link
          to="/search"
          className="bg-card border border-border/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-card hover:shadow-elegant transition"
        >
          <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center">
            <div className="flex gap-0.5">
              <span className="w-1 h-1 bg-foreground rounded-full" />
              <span className="w-1 h-1 bg-foreground rounded-full" />
              <span className="w-1 h-1 bg-foreground rounded-full" />
            </div>
          </div>
          <div className="text-sm font-bold">{hasMore ? more : title}</div>
        </Link>
      </div>
    </section>
  );
}
