import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Megaphone, CreditCard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ads")({ component: AdsPage });

function AdsPage() {
  return (
    <>
      <AdminTopbar title="الإعلانات والاشتراكات" subtitle="إدارة الإعلانات الترويجية وخطط الاشتراك" />
      <Tabs defaultValue="ads">
        <TabsList>
          <TabsTrigger value="ads"><Megaphone className="h-4 w-4 me-1" /> الإعلانات</TabsTrigger>
          <TabsTrigger value="subs"><CreditCard className="h-4 w-4 me-1" /> الاشتراكات</TabsTrigger>
        </TabsList>
        <TabsContent value="ads"><AdsTab /></TabsContent>
        <TabsContent value="subs"><SubsTab /></TabsContent>
      </Tabs>
    </>
  );
}

function AdsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", target_url: "", image_url: "", status: "active" });

  const load = async () => {
    const { data } = await supabase.from("ads").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.title) return toast.error("العنوان مطلوب");
    const { error } = await supabase.from("ads").insert(form);
    if (error) return toast.error(error.message);
    toast.success("تم"); setForm({ title: "", target_url: "", image_url: "", status: "active" }); load();
  };
  const remove = async (id: string) => { if (!confirm("حذف الإعلان؟")) return; await supabase.from("ads").delete().eq("id", id); load(); };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card mt-4">
      <div className="grid md:grid-cols-5 gap-2 mb-4">
        <Input placeholder="عنوان الإعلان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input placeholder="الرابط" dir="ltr" value={form.target_url} onChange={(e) => setForm({ ...form, target_url: e.target.value })} />
        <Input placeholder="رابط الصورة" dir="ltr" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <select className="rounded-lg border bg-background px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="active">نشط</option><option value="inactive">موقوف</option><option value="draft">مسودة</option>
        </select>
        <Button onClick={add}><Plus className="h-4 w-4 me-1" /> إضافة</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="p-3 text-start">الصورة</th><th className="p-3 text-start">العنوان</th><th className="p-3 text-start">الرابط</th><th className="p-3 text-start">الحالة</th><th className="p-3 text-start"></th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد إعلانات</td></tr>}
          {rows.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-3">{a.image_url ? <img src={a.image_url} className="h-10 w-16 rounded-md object-cover" /> : <div className="h-10 w-16 rounded-md bg-muted" />}</td>
              <td className="p-3 font-medium">{a.title}</td>
              <td className="p-3 text-xs text-muted-foreground truncate max-w-xs" dir="ltr">{a.target_url}</td>
              <td className="p-3 text-xs">{a.status}</td>
              <td className="p-3"><Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubsTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("subscriptions").select("*, places(name)").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, []);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card mt-4">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="p-3 text-start">المكان</th><th className="p-3 text-start">الخطة</th><th className="p-3 text-start">الحالة</th><th className="p-3 text-start">يبدأ</th><th className="p-3 text-start">ينتهي</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد اشتراكات</td></tr>}
          {rows.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-3 font-medium">{s.places?.name}</td>
              <td className="p-3">{s.plan}</td>
              <td className="p-3 text-xs">{s.status}</td>
              <td className="p-3 text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString("ar-MA")}</td>
              <td className="p-3 text-xs text-muted-foreground">{s.expires_at ? new Date(s.expires_at).toLocaleDateString("ar-MA") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
