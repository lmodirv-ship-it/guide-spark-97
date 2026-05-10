import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Stub } from "./admin.requests";
export const Route = createFileRoute("/admin/import")({
  component: () => (<><AdminTopbar title="البحث الأوتوماتيكي" subtitle="استيراد أماكن من مصادر خارجية" /><Stub label="محرك الاستيراد التلقائي قيد التطوير — سيدعم OpenStreetMap وAPI خارجي" /></>),
});
