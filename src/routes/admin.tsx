import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/admin")({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-4">قريباً — لوحة إدارة الأماكن والفئات والمستخدمين والإحصاءات.</p>
      </main>
    </div>
  ),
});
