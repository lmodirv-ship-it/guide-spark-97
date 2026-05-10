import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";

type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  created_at: string;
  status: string;
};

export const Route = createFileRoute("/blog/$id")({
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
      setPost(data as Post | null);
      setLoading(false);
    })();
  }, [id]);

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
            <div className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString("ar")}
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-foreground">{post.title}</h1>
            {post.excerpt && <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>}
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="mt-6 w-full rounded-2xl object-cover max-h-[480px]"
              />
            )}
            {post.content && (
              <div className="mt-8 whitespace-pre-wrap leading-relaxed text-foreground/90">
                {post.content}
              </div>
            )}
            <div className="mt-10">
              <Link to="/feed" className="text-primary underline">
                ← العودة لقائمة المقالات
              </Link>
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
