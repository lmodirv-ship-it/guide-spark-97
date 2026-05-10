import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { Check, X, Eye, Inbox } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/requests")({ component: Requests });

function Requests() {
  const [rows, setRows] = useState<any[]>([]);
  const [tab, setTab] = useState<"pending" | "all">("pending");

  const load = async () => {
    let q = supabase.from("places")
      .select("id, name, cover_image, phone, status, created_at, source, categories(name_ar), cities(name_ar)")
      .order("created_at", { ascending: false }).limit(50);
    if (tab === "pending") q = q.in("status", ["pending", "pending_review", "draft"] as any);
    const { data } = await q;
    setRows(data ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("places").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "active" ? "تم القبول والنشر" : "تم الرفض");
    load();
  };

  return (
    <>
      <AdminTopbar title="طلبات الإضافة" subtitle="مراجعة الأماكن المرسلة من المستخدمين" />
      <div className="flex gap-2 mb-4">
        <Button variant={tab === "pending" ? "default" : "outline"} size="sm" onClick={() => setTab("pending")}>
          <Inbox className="h-4 w-4 me-1" /> قيد الانتظار
        </Button>
        <Button variant={tab === "all" ? "default" : "outline"} size="sm" onClick={() => setTab("all")}>الكل</Button>
      </div>

      <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="p-3 text-start">الصورة</th>
              <th className="p-3 text-start">الاسم</th>
              <th className="p-3 text-start">التصنيف</th>
              <th className="p-3 text-start">المدينة</th>
              <th className="p-3 text-start">المصدر</th>
              <th className="p-3 text-start">الحالة</th>
              <th className="p-3 text-start">التاريخ</th>
              <th className="p-3 text-start">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">لا توجد طلبات</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="p-3">{r.cover_image ? <img src={r.cover_image} className="h-10 w-14 rounded-md object-cover" /> : <div className="h-10 w-14 rounded-md bg-muted" />}</td>
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3 text-muted-foreground">{r.categories?.name_ar ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{r.cities?.name_ar ?? "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">{r.source ?? "يدوي"}</td>
                <td className="p-3"><StatusBadge status={r.status} /></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-MA")}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={() => setStatus(r.id, "active")}><Check className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setStatus(r.id, "rejected")}><X className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function Stub({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-16 text-center">
      <Inbox className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
