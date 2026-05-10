import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/admin/requests")({
  component: () => (
    <>
      <AdminTopbar title="طلبات الإضافة" subtitle="مراجعة الأماكن المرسلة من المستخدمين" />
      <Stub label="طلبات إضافة الأماكن قيد التطوير" />
    </>
  ),
});

export function Stub({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-16 text-center">
      <Construction className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
