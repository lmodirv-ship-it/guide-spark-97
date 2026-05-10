import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";

type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  created_at: string;
};

export const Route = createFileRoute("/feed")({
  component: FeedPage,
  head: () => ({
    meta: [
      { title: "آخر المقالات — دليلك" },
      { name: "description", content: "اطلع على آخر المقالات والأخبار من المدونة." },
    ],
  }),
});

function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, title, excerpt, cover_image, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      setPosts((data ?? []) as Post[]);
      setLoading(false);
    };
    fetchPosts();
    const interval = setInterval(fetchPosts, 4 * 60 * 1000); // كل 4 دقائق
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 flex-1">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">آخر المقالات</h1>
        <p className="mt-2 text-muted-foreground">تصفح أحدث ما نشرناه في المدونة.</p>

        {loading ? (
          <div className="mt-10 text-center text-muted-foreground">جاري التحميل...</div>
        ) : posts.length === 0 ? (
          <div className="mt-10 text-center text-muted-foreground">لا توجد مقالات منشورة بعد.</div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to="/blog/$id"
                params={{ id: p.id }}
                className="group rounded-2xl border border-border/40 bg-card overflow-hidden shadow-card hover:shadow-elegant transition"
              >
                {p.cover_image && (
                  <img src={p.cover_image} alt={p.title} className="w-full h-44 object-cover" />
                )}
                <div className="p-5">
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("ar")}
                  </div>
                  <h2 className="mt-2 font-bold text-lg group-hover:text-primary transition line-clamp-2">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
