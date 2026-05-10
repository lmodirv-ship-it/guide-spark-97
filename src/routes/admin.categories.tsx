import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AutoSearchPanel } from "@/components/admin/auto-search-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { IdCell } from "@/components/admin/id-cell";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({ component: Categories });

function Categories() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ name_ar: "", name_fr: "", name_en: "", icon: "", color: "#10b981", parent_id: "", sort_order: 0 });
  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.name_ar) return toast.error("الاسم العربي مطلوب");
    const slug = form.name_en?.toLowerCase().replace(/\s+/g, "-") || form.name_ar;
    const { error } = await supabase.from("categories").insert({
      ...form, slug, parent_id: form.parent_id || null, sort_order: Number(form.sort_order),
    });
    if (error) return toast.error(error.message);
    toast.success("تمت الإضافة");
    setForm({ name_ar: "", name_fr: "", name_en: "", icon: "", color: "#10b981", parent_id: "", sort_order: 0 });
    load();
  };

  const remove = async (id: string) => { if (!confirm("حذف التصنيف؟")) return; await supabase.from("categories").delete().eq("id", id); load(); };

  const parents = rows.filter((r) => !r.parent_id);

  return (
    <>
      <AdminTopbar title="إدارة التصنيفات" subtitle={`${rows.length} تصنيف`} />
      <AutoSearchPanel kind="categories" onSaved={load} />
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="grid md:grid-cols-7 gap-2 mb-4">
          <Input placeholder="اسم عربي *" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
          <Input placeholder="Nom FR" value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} />
          <Input placeholder="Name EN" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
          <Input placeholder="أيقونة (Pizza)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm">
            <option value="">— تصنيف رئيسي —</option>
            {parents.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
          </select>
          <Button onClick={add}><Plus className="h-4 w-4 me-1" /> إضافة</Button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr><th className="p-3 text-start">ID</th><th className="p-3 text-start">اللون</th><th className="p-3 text-start">الاسم</th><th className="p-3 text-start">FR / EN</th><th className="p-3 text-start">الأب</th><th className="p-3 text-start">الترتيب</th><th className="p-3 text-start"></th></tr>
          </thead>
          <tbody>
            {parents.map((p) => (
              <FragmentRows key={p.id} parent={p} children={rows.filter((r) => r.parent_id === p.id)} onRemove={remove} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FragmentRows({ parent, children, onRemove }: { parent: any; children: any[]; onRemove: (id: string) => void }) {
  return (
    <>
      <tr className="border-t bg-muted/20">
        <td className="p-3"><span className="inline-block h-4 w-4 rounded" style={{ backgroundColor: parent.color || "#10b981" }} /></td>
        <td className="p-3 font-bold">{parent.name_ar}</td>
        <td className="p-3 text-muted-foreground text-xs">{parent.name_fr} / {parent.name_en}</td>
        <td className="p-3 text-muted-foreground">—</td>
        <td className="p-3 tabular-nums">{parent.sort_order}</td>
        <td className="p-3"><Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onRemove(parent.id)}><Trash2 className="h-4 w-4" /></Button></td>
      </tr>
      {children.map((c) => (
        <tr key={c.id} className="border-t">
          <td className="p-3 ps-8"><span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: c.color || "#94a3b8" }} /></td>
          <td className="p-3 ps-8 text-sm">└ {c.name_ar}</td>
          <td className="p-3 text-muted-foreground text-xs">{c.name_fr} / {c.name_en}</td>
          <td className="p-3 text-xs text-muted-foreground">{parent.name_ar}</td>
          <td className="p-3 tabular-nums">{c.sort_order}</td>
          <td className="p-3"><Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onRemove(c.id)}><Trash2 className="h-4 w-4" /></Button></td>
        </tr>
      ))}
    </>
  );
}
