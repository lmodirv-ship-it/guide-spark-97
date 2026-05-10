import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, MoreVertical, Search, Star, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/status-badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/places/")({ component: PlacesAdmin });

function PlacesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let query = supabase.from("places")
      .select("id, name, cover_image, status, phone, is_featured, is_verified, created_at, rating_avg, categories(name_ar), cities(name_ar), countries(name_ar, flag_emoji)")
      .order("created_at", { ascending: false }).limit(50);
    if (q) query = query.ilike("name", `%${q}%`);
    if (status) query = query.eq("status", status as any);
    const { data, error } = await query;
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, status]);

  const updateField = async (id: string, patch: any) => {
    const { error } = await supabase.from("places").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم التحديث");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const { error } = await supabase.from("places").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  };

  return (
    <>
      <AdminTopbar title="إدارة الأماكن" subtitle={`${rows.length} مكان`} />

      <div className="rounded-2xl border bg-card shadow-card">
        <div className="p-4 border-b flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="ابحث عن مكان..." value={q} onChange={(e) => setQ(e.target.value)} className="pe-9" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm">
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="pending">معلق</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
            <option value="rejected">مرفوض</option>
          </select>
          <Link to="/admin/places/new"><Button>+ مكان جديد</Button></Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="p-3 text-start font-semibold">ID</th>
                <th className="p-3 text-start font-semibold">الصورة</th>
                <th className="p-3 text-start font-semibold">الاسم</th>
                <th className="p-3 text-start font-semibold">التصنيف</th>
                <th className="p-3 text-start font-semibold">المدينة</th>
                <th className="p-3 text-start font-semibold">الدولة</th>
                <th className="p-3 text-start font-semibold">الهاتف</th>
                <th className="p-3 text-start font-semibold">التقييم</th>
                <th className="p-3 text-start font-semibold">الحالة</th>
                <th className="p-3 text-start font-semibold">التاريخ</th>
                <th className="p-3 text-start font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">لا توجد أماكن</td></tr>}
              {rows.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 text-xs text-muted-foreground tabular-nums">#{p.id.slice(0, 6)}</td>
                  <td className="p-3">
                    {p.cover_image
                      ? <img src={p.cover_image} alt={p.name} className="h-10 w-14 rounded-md object-cover" />
                      : <div className="h-10 w-14 rounded-md bg-muted" />}
                  </td>
                  <td className="p-3 font-medium flex items-center gap-1">
                    {p.name}
                    {p.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                    {p.is_featured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                  </td>
                  <td className="p-3 text-muted-foreground">{p.categories?.name_ar ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{p.cities?.name_ar ?? "—"}</td>
                  <td className="p-3">{p.countries?.flag_emoji} {p.countries?.name_ar}</td>
                  <td className="p-3 text-muted-foreground tabular-nums" dir="ltr">{p.phone ?? "—"}</td>
                  <td className="p-3 tabular-nums">★ {Number(p.rating_avg ?? 0).toFixed(1)}</td>
                  <td className="p-3"><StatusBadge status={p.status} /></td>
                  <td className="p-3 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString("ar-MA")}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Link to="/places/$id" params={{ id: p.id }}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-success"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-sky-600" onClick={() => updateField(p.id, { is_featured: !p.is_featured })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
