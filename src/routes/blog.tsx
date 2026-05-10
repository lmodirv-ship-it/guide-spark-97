import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "المدونة — دليلك" },
      { name: "description", content: "آخر المقالات والأخبار من دليلك." },
    ],
  }),
});

function BlogPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 flex-1">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">المدونة</h1>
        <p className="mt-3 text-muted-foreground">مرحباً بك في مدونتنا. سيتم نشر المقالات قريباً.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <article key={i} className="rounded-2xl border border-border/40 bg-card p-5 shadow-card">
              <div className="text-xs text-muted-foreground">قريباً</div>
              <h2 className="mt-2 font-bold text-lg">مقال رقم {i}</h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                محتوى تجريبي للمقال. سيتم تحديث هذا القسم بمقالات حقيقية قريباً.
              </p>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
