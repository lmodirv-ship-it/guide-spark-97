import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Check, X } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { toast } from "sonner";
import { IdCell } from "@/components/admin/id-cell";

export const Route = createFileRoute("/admin/reviews")({ component: Reviews });

function Reviews() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("");

  const load = async () => {
    let q = supabase.from("reviews").select("*, places(name), profiles(full_name)").order("created_at", { ascending: false }).limit(100);
    if (filter) q = q.eq("status", filter);
    const { data } = await q;
    setRows(data ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("reviews").update({ status }).eq("id", id);
    toast.success("تم التحديث"); load();
  };
  const remove = async (id: string) => { if (!confirm("حذف التقييم؟")) return; await supabase.from("reviews").delete().eq("id", id); load(); };

  return (
    <>
      <AdminTopbar title="التقييمات والمراجعات" subtitle={`${rows.length} تقييم`} />
      <div className="flex gap-2 mb-4">
        {[{ v: "", l: "الكل" }, { v: "pending", l: "معلقة" }, { v: "approved", l: "مقبولة" }, { v: "rejected", l: "مرفوضة" }].map((t) => (
          <Button key={t.v} variant={filter === t.v ? "default" : "outline"} size="sm" onClick={() => setFilter(t.v)}>{t.l}</Button>
        ))}
      </div>
      <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr><th className="p-3 text-start">المستخدم</th><th className="p-3 text-start">المكان</th><th className="p-3 text-start">التقييم</th><th className="p-3 text-start">التعليق</th><th className="p-3 text-start">الحالة</th><th className="p-3 text-start">التاريخ</th><th className="p-3 text-start">إجراءات</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">لا توجد تقييمات</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.profiles?.full_name ?? "مستخدم"}</td>
                <td className="p-3 text-muted-foreground">{r.places?.name}</td>
                <td className="p-3"><div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-muted"}`} />)}</div></td>
                <td className="p-3 max-w-md truncate text-muted-foreground">{r.comment ?? "—"}</td>
                <td className="p-3"><StatusBadge status={r.status} /></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-MA")}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={() => setStatus(r.id, "approved")}><Check className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600" onClick={() => setStatus(r.id, "rejected")}><X className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
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
