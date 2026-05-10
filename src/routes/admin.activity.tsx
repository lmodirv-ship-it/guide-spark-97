import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { History } from "lucide-react";

export const Route = createFileRoute("/admin/activity")({ component: Activity });

function Activity() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("activity_logs").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(100).then(({ data }) => setRows(data ?? []));
  }, []);

  return (
    <>
      <AdminTopbar title="سجل النشاطات" subtitle="جميع العمليات التي تمت على النظام" />
      <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="p-3 text-start">المستخدم</th><th className="p-3 text-start">الإجراء</th><th className="p-3 text-start">الكيان</th><th className="p-3 text-start">التاريخ</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-muted-foreground"><History className="h-8 w-8 mx-auto mb-2 opacity-40" />لا توجد نشاطات مسجلة بعد</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.profiles?.full_name ?? "نظام"}</td>
                <td className="p-3"><span className="inline-block rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">{r.action}</span></td>
                <td className="p-3 text-muted-foreground text-xs">{r.entity_type}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("ar-MA")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
