import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/add-place")({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">أضف مكانك</h1>
        <p className="text-muted-foreground mt-4">قريباً — نموذج إضافة مكان جديد للمراجعة من قبل الإدارة.</p>
      </main>
      <SiteFooter />
    </div>
  ),
});
