import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://hnguide.online";
const SITE_NAME = "دليلك — Dalilik";

type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at?: string;
};

const FEED_DESCRIPTION =
  "تصفح أحدث مقالات مدونة دليلك: نصائح، أدلة، وأخبار حول أفضل المطاعم والمقاهي والخدمات في مدينتك.";

export const Route = createFileRoute("/feed")({
  loader: async () => {
    const { data } = await supabase
      .from("posts")
      .select("id, title, excerpt, cover_image, created_at, updated_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);
    return { posts: (data ?? []) as Post[] };
  },
  head: ({ loaderData }) => {
    const url = `${SITE_URL}/feed`;
    const posts = loaderData?.posts ?? [];
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${url}#blog`,
      url,
      name: `مدونة ${SITE_NAME}`,
      description: FEED_DESCRIPTION,
      inLanguage: "ar",
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
      },
      blogPost: posts.slice(0, 10).map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: `${SITE_URL}/blog/${p.id}`,
        datePublished: new Date(p.created_at).toISOString(),
        dateModified: new Date(p.updated_at || p.created_at).toISOString(),
        image: p.cover_image || undefined,
      })),
    };
    const breadcrumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "المدونة", item: url },
      ],
    };
    return {
      meta: [
        { title: `المدونة | ${SITE_NAME}` },
        { name: "description", content: FEED_DESCRIPTION },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: `المدونة | ${SITE_NAME}` },
        { property: "og:description", content: FEED_DESCRIPTION },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `المدونة | ${SITE_NAME}` },
        { name: "twitter:description", content: FEED_DESCRIPTION },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(jsonLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbs) },
      ],
    };
  },
  component: FeedPage,
});

function FeedPage() {
  const initial = Route.useLoaderData();
  const [posts, setPosts] = useState<Post[]>(initial.posts);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, title, excerpt, cover_image, created_at, updated_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(50);
      setPosts((data ?? []) as Post[]);
    };
    const interval = setInterval(fetchPosts, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 flex-1">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-3">
          <ol className="flex items-center gap-1">
            <li><Link to="/" className="hover:text-primary">الرئيسية</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-foreground">المدونة</li>
          </ol>
        </nav>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">مدونة دليلك — آخر المقالات</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">{FEED_DESCRIPTION}</p>

        {posts.length === 0 ? (
          <div className="mt-10 text-center text-muted-foreground">لا توجد مقالات منشورة بعد.</div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, idx) => (
              <Link
                key={p.id}
                to="/blog/$id"
                params={{ id: p.id }}
                className="group rounded-2xl border border-border/40 bg-card overflow-hidden shadow-card hover:shadow-elegant transition"
              >
                {p.cover_image && (
                  <img
                    src={p.cover_image}
                    alt={p.title}
                    loading={idx < 3 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-44 object-cover"
                  />
                )}
                <div className="p-5">
                  <time dateTime={new Date(p.created_at).toISOString()} className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                  </time>
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
