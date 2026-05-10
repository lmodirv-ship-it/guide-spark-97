import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AutoSearchPanel } from "@/components/admin/auto-search-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { IdCell, ValidateButton } from "@/components/admin/id-cell";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({ component: Products });

function Products() {
  const [rows, setRows] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [form, setForm] = useState({ place_id: "", name: "", price: "", currency: "MAD", image: "", category_name: "" });
  const load = async () => {
    const { data } = await supabase.from("products").select("*, places(name)").order("created_at", { ascending: false }).limit(100);
    setRows(data ?? []);
  };
  useEffect(() => {
    load();
    supabase.from("places").select("id, name").limit(200).then(({ data }) => setPlaces(data ?? []));
  }, []);

  const add = async () => {
    if (!form.place_id || !form.name) return toast.error("المكان والاسم مطلوبان");
    const { error } = await supabase.from("products").insert({ ...form, price: form.price ? Number(form.price) : null });
    if (error) return toast.error(error.message);
    toast.success("تمت الإضافة"); setForm({ place_id: "", name: "", price: "", currency: "MAD", image: "", category_name: "" }); load();
  };
  const toggle = async (r: any) => { await supabase.from("products").update({ is_available: !r.is_available }).eq("id", r.id); load(); };
  const remove = async (id: string) => { if (!confirm("حذف المنتج؟")) return; await supabase.from("products").delete().eq("id", id); load(); };

  return (
    <>
      <AdminTopbar title="المنتجات والقوائم" subtitle={`${rows.length} منتج`} />
      {form.place_id ? (
        <AutoSearchPanel
          kind="products"
          context={form.place_id}
          title="توليد قائمة منتجات أوتوماتيكياً للمكان المختار"
          hint="اختر المكان من النموذج أدناه أولاً، ثم اكتب نوع القائمة (مثلاً: قائمة بيتزا)."
          onSaved={load}
        />
      ) : (
        <div className="rounded-2xl border border-dashed p-3 text-xs text-muted-foreground mb-4">
          ⚡ اختر مكاناً من النموذج أدناه لتفعيل البحث/التوليد الأوتوماتيكي للمنتجات.
        </div>
      )}
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="grid md:grid-cols-7 gap-2 mb-4">
          <select value={form.place_id} onChange={(e) => setForm({ ...form, place_id: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm">
            <option value="">المكان</option>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Input placeholder="اسم المنتج" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="فئة فرعية" value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })} />
          <Input placeholder="السعر" type="number" dir="ltr" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input placeholder="MAD" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          <Input placeholder="رابط الصورة" dir="ltr" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <Button onClick={add}><Plus className="h-4 w-4 me-1" /> إضافة</Button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr><th className="p-3 text-start">الصورة</th><th className="p-3 text-start">المنتج</th><th className="p-3 text-start">المكان</th><th className="p-3 text-start">السعر</th><th className="p-3 text-start">متوفر</th><th className="p-3 text-start">التاريخ</th><th className="p-3 text-start"></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">لا توجد منتجات بعد</td></tr>}
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.image ? <img src={p.image} className="h-10 w-10 rounded-md object-cover" /> : <div className="h-10 w-10 rounded-md bg-muted" />}</td>
                <td className="p-3 font-medium">{p.name} {p.category_name && <span className="text-xs text-muted-foreground">/ {p.category_name}</span>}</td>
                <td className="p-3 text-muted-foreground">{p.places?.name}</td>
                <td className="p-3 tabular-nums">{p.price ? `${p.price} ${p.currency}` : "—"}</td>
                <td className="p-3"><button onClick={() => toggle(p)} className={p.is_available ? "text-success text-xs" : "text-muted-foreground text-xs"}>● {p.is_available ? "متوفر" : "غير متوفر"}</button></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("ar-MA")}</td>
                <td className="p-3"><Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
