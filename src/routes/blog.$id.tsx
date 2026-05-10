import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  fetchHnArticle,
  hnArticleExternalUrl,
  hnImageUrl,
  type HnArticle,
} from "@/lib/hn-blog";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/blog/$id")({
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  const [post, setPost] = useState<HnArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchHnArticle(id)
      .then((p) => setPost(p))
      .finally(() => setLoading(false));
  }, [id]);

  const cover = hnImageUrl(post?.featured_image ?? null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 flex-1 max-w-3xl">
        {loading ? (
          <div className="text-center text-muted-foreground">جاري التحميل...</div>
        ) : !post ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold">المقال غير موجود</h1>
            <Link to="/feed" className="mt-4 inline-block text-primary underline">
              العودة للمدونة
            </Link>
          </div>
        ) : (
          <article>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              {post.published_at && (
                <span>{new Date(post.published_at).toLocaleDateString("ar")}</span>
              )}
              {post.reading_time ? <span>· {post.reading_time} دقائق</span> : null}
              {post.language ? <span>· {post.language.toUpperCase()}</span> : null}
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-foreground">
              {post.title}
            </h1>
            {post.short_description && (
              <p className="mt-3 text-lg text-muted-foreground">{post.short_description}</p>
            )}
            {cover && (
              <img
                src={cover}
                alt={post.title}
                className="mt-6 w-full rounded-2xl object-cover max-h-[480px]"
              />
            )}
            {post.content && (
              <div
                className="mt-8 prose prose-neutral dark:prose-invert max-w-none leading-relaxed text-foreground/90"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <Link to="/feed" className="text-primary underline">
                ← العودة لقائمة المقالات
              </Link>
              <a
                href={hnArticleExternalUrl(post.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
              >
                <ExternalLink className="h-4 w-4" />
                المصدر: hnChat
              </a>
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
