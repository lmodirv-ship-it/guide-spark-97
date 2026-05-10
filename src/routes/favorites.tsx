import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/favorites")({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">المفضلة</h1>
        <p className="text-muted-foreground mt-4">سجّل دخولك لعرض الأماكن المفضلة لديك.</p>
      </main>
      <SiteFooter />
    </div>
  ),
});
