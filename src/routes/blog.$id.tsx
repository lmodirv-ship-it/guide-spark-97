import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
  content: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  status: string;
};

type RelatedPost = Pick<Post, "id" | "title" | "excerpt" | "cover_image" | "created_at">;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildMetaDescription(post: Post): string {
  const base =
    (post.excerpt && post.excerpt.trim()) ||
    (post.content ? stripHtml(post.content) : "") ||
    post.title;
  const clean = base.replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean.length < 150 ? `${clean} — اقرأ المزيد على ${SITE_NAME}.`.slice(0, 160) : clean;
  return clean.slice(0, 157).trimEnd() + "...";
}

function readingTime(content: string | null): number {
  if (!content) return 1;
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Extract Q&A pairs from HTML content for FAQPage schema (Featured Snippets).
 * Strategies (in order):
 *  1. Heading (h2/h3/h4) ending with "?" or "؟" → answer = following sibling content until next heading.
 *  2. Strong/bold line ending with "?" or "؟" → answer = remaining text in same <p> or next <p>.
 *  3. Plain paragraph lines: "Question? Answer." patterns.
 * Returns max 10 entries, each ≤ 300 chars for the answer.
 */
function extractFaqs(html: string | null): { question: string; answer: string }[] {
  if (!html) return [];
  const faqs: { question: string; answer: string }[] = [];
  const seen = new Set<string>();

  const isQuestion = (t: string) => /[?؟]\s*$/.test(t.trim());
  const clean = (t: string) => t.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  // 1. Headings followed by content
  const headingRe = /<(h[2-4])[^>]*>([\s\S]*?)<\/\1>([\s\S]*?)(?=<h[2-4][^>]*>|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(html)) !== null) {
    const q = clean(m[2]);
    const a = clean(m[3]);
    if (q && a && isQuestion(q) && !seen.has(q)) {
      seen.add(q);
      faqs.push({ question: q, answer: a.slice(0, 300) });
    }
  }

  // 2. <strong>/<b> question inside paragraphs
  if (faqs.length < 10) {
    const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pm: RegExpExecArray | null;
    const ps: string[] = [];
    while ((pm = pRe.exec(html)) !== null) ps.push(pm[1]);
    for (let i = 0; i < ps.length && faqs.length < 10; i++) {
      const inner = ps[i];
      const sm = /<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/i.exec(inner);
      if (sm) {
        const q = clean(sm[1]);
        if (isQuestion(q) && !seen.has(q)) {
          let a = clean(inner.replace(sm[0], ""));
          if (!a && i + 1 < ps.length) a = clean(ps[i + 1]);
          if (a) {
            seen.add(q);
            faqs.push({ question: q, answer: a.slice(0, 300) });
          }
        }
      }
    }
  }

  return faqs.slice(0, 10);
}

export const Route = createFileRoute("/blog/$id")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("posts")
      .select("id,title,excerpt,content,cover_image,created_at,updated_at,status")
      .eq("id", params.id)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) throw notFound();
    return { post: data as Post };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">المقال غير موجود</h1>
        <Link to="/feed" className="mt-4 inline-block text-primary underline">العودة للمدونة</Link>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">حدث خطأ</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </main>
      <SiteFooter />
    </div>
  ),
  head: ({ loaderData, params }) => {
    if (!loaderData?.post) return {};
    const post = loaderData.post;
    const url = `${SITE_URL}/blog/${params.id}`;
    const title = `${post.title} | ${SITE_NAME}`;
    const description = buildMetaDescription(post);
    const image = post.cover_image || `${SITE_URL}/og-default.jpg`;
    const published = new Date(post.created_at).toISOString();
    const modified = new Date(post.updated_at || post.created_at).toISOString();

    const faqs = extractFaqs(post.content);
    const graph: any[] = [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        headline: post.title,
        description,
        image: [image],
        datePublished: published,
        dateModified: modified,
        author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
        },
        inLanguage: "ar",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "المدونة", item: `${SITE_URL}/feed` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ];

    if (faqs.length > 0) {
      graph.push({
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      });
    }

    const jsonLd = { "@context": "https://schema.org", "@graph": graph };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
        { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: post.title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:url", content: url },
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:locale", content: "ar_AR" },
        { property: "article:published_time", content: published },
        { property: "article:modified_time", content: modified },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  const [related, setRelated] = useState<RelatedPost[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("posts")
        .select("id,title,excerpt,cover_image,created_at")
        .eq("status", "published")
        .neq("id", post.id)
        .order("created_at", { ascending: false })
        .limit(3);
      setRelated((data ?? []) as RelatedPost[]);
    })();
  }, [post.id]);

  const minutes = readingTime(post.content);
  const publishedDate = new Date(post.created_at);
  const updatedDate = new Date(post.updated_at || post.created_at);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 flex-1 max-w-3xl">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-4">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link to="/" className="hover:text-primary">الرئيسية</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link to="/feed" className="hover:text-primary">المدونة</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-foreground line-clamp-1 max-w-[60vw]">{post.title}</li>
          </ol>
        </nav>

        <article>
          <header>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
              {post.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>بواسطة <strong className="text-foreground">{SITE_NAME}</strong></span>
              <span aria-hidden="true">·</span>
              <time dateTime={publishedDate.toISOString()}>
                نُشر {publishedDate.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
              </time>
              {updatedDate.getTime() !== publishedDate.getTime() && (
                <>
                  <span aria-hidden="true">·</span>
                  <time dateTime={updatedDate.toISOString()}>
                    آخر تحديث {updatedDate.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                  </time>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{minutes} دقيقة قراءة</span>
            </div>
            {post.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
            )}
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="mt-6 w-full rounded-2xl object-cover max-h-[480px]"
              />
            )}
          </header>

          {post.content && (
            <div
              className="mt-8 prose prose-neutral dark:prose-invert max-w-none leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          <footer className="mt-10 pt-6 border-t border-border/40">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <Link to="/feed" className="text-primary hover:underline">← كل المقالات</Link>
              <Link to="/" className="text-muted-foreground hover:text-primary">الرئيسية</Link>
            </div>
          </footer>
        </article>

        {related.length > 0 && (
          <section className="mt-14" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-bold mb-4">مقالات ذات صلة</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to="/blog/$id"
                  params={{ id: r.id }}
                  className="group rounded-xl border border-border/40 bg-card overflow-hidden hover:shadow-elegant transition"
                >
                  {r.cover_image && (
                    <img
                      src={r.cover_image}
                      alt={r.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition line-clamp-2">
                      {r.title}
                    </h3>
                    {r.excerpt && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
