import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { fetchHnArticles, hnImageUrl, type HnArticle } from "@/lib/hn-blog";

export const Route = createFileRoute("/feed")({
  component: FeedPage,
  head: () => ({
    meta: [
      { title: "آخر المقالات — دليلك" },
      { name: "description", content: "اطلع على آخر المقالات والأخبار من مدونة hnChat." },
    ],
  }),
});

function FeedPage() {
  const [posts, setPosts] = useState<HnArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHnArticles()
      .then((data) => setPosts(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 flex-1">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">آخر المقالات</h1>
        <p className="mt-2 text-muted-foreground">
          مقالات مستوردة مباشرة من مدونة hnChat.
        </p>

        {loading ? (
          <div className="mt-10 text-center text-muted-foreground">جاري التحميل...</div>
        ) : error ? (
          <div className="mt-10 text-center text-destructive">تعذر تحميل المقالات: {error}</div>
        ) : posts.length === 0 ? (
          <div className="mt-10 text-center text-muted-foreground">لا توجد مقالات منشورة بعد.</div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => {
              const img = hnImageUrl(p.featured_image);
              return (
                <Link
                  key={p.id}
                  to="/blog/$id"
                  params={{ id: p.id }}
                  className="group rounded-2xl border border-border/40 bg-card overflow-hidden shadow-card hover:shadow-elegant transition"
                >
                  {img && (
                    <img src={img} alt={p.title} className="w-full h-44 object-cover" />
                  )}
                  <div className="p-5">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      {p.published_at && (
                        <span>{new Date(p.published_at).toLocaleDateString("ar")}</span>
                      )}
                      {p.reading_time ? <span>· {p.reading_time} دقائق</span> : null}
                      {p.language ? <span>· {p.language.toUpperCase()}</span> : null}
                    </div>
                    <h2 className="mt-2 font-bold text-lg group-hover:text-primary transition line-clamp-2">
                      {p.title}
                    </h2>
                    {p.short_description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                        {p.short_description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
