import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AutoSearchPanel } from "@/components/admin/auto-search-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Pencil } from "lucide-react";
import { IdCell } from "@/components/admin/id-cell";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/locations")({ component: Locations });

function Locations() {
  return (
    <>
      <AdminTopbar title="البلدان والمدن" subtitle="إدارة المواقع الجغرافية" />
      <Tabs defaultValue="countries">
        <TabsList>
          <TabsTrigger value="countries">الدول</TabsTrigger>
          <TabsTrigger value="cities">المدن</TabsTrigger>
        </TabsList>
        <TabsContent value="countries">
          <AutoSearchPanel kind="countries" title="بحث/توليد دول أوتوماتيكياً" />
          <CountriesTab />
        </TabsContent>
        <TabsContent value="cities"><CitiesTab /></TabsContent>
      </Tabs>
    </>
  );
}

function CountriesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ code: "", name_ar: "", name_fr: "", name_en: "", flag_emoji: "", currency: "", phone_code: "" });
  const load = async () => {
    const { data } = await supabase.from("countries").select("*").order("name_ar");
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.code || !form.name_ar) return toast.error("الرمز والاسم العربي مطلوبان");
    const slug = form.name_en?.toLowerCase().replace(/\s+/g, "-") || form.code.toLowerCase();
    const { error } = await supabase.from("countries").insert({ ...form, slug });
    if (error) return toast.error(error.message);
    toast.success("تمت الإضافة"); setForm({ code: "", name_ar: "", name_fr: "", name_en: "", flag_emoji: "", currency: "", phone_code: "" }); load();
  };

  const toggle = async (r: any) => {
    await supabase.from("countries").update({ is_active: !r.is_active }).eq("id", r.id);
    load();
  };
  const remove = async (id: string) => { if (!confirm("حذف الدولة؟")) return; await supabase.from("countries").delete().eq("id", id); load(); };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card mt-4">
      <div className="grid md:grid-cols-7 gap-2 mb-4">
        <Input placeholder="الرمز (MA)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <Input placeholder="اسم عربي" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
        <Input placeholder="Nom FR" value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} />
        <Input placeholder="Name EN" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
        <Input placeholder="🇲🇦" value={form.flag_emoji} onChange={(e) => setForm({ ...form, flag_emoji: e.target.value })} />
        <Input placeholder="MAD" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
        <Button onClick={add}><Plus className="h-4 w-4 me-1" /> إضافة</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr><th className="p-3 text-start">ID</th><th className="p-3 text-start">العلم</th><th className="p-3 text-start">الرمز</th><th className="p-3 text-start">الاسم</th><th className="p-3 text-start">العملة</th><th className="p-3 text-start">الحالة</th><th className="p-3 text-start"></th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3"><IdCell publicId={r.public_id} /></td>
              <td className="p-3 text-xl">{r.flag_emoji}</td>
              <td className="p-3 tabular-nums">{r.code}</td>
              <td className="p-3 font-medium">{r.name_ar}</td>
              <td className="p-3 text-muted-foreground">{r.currency ?? "—"}</td>
              <td className="p-3"><button onClick={() => toggle(r)} className={r.is_active ? "text-success text-xs" : "text-muted-foreground text-xs"}>● {r.is_active ? "نشط" : "موقوف"}</button></td>
              <td className="p-3"><Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CitiesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [form, setForm] = useState({ country_id: "", name_ar: "", name_fr: "", name_en: "", latitude: "", longitude: "" });
  const load = async () => {
    const { data } = await supabase.from("cities").select("*, countries(name_ar, flag_emoji)").order("name_ar");
    setRows(data ?? []);
  };
  useEffect(() => {
    load();
    supabase.from("countries").select("id, name_ar, flag_emoji").then(({ data }) => setCountries(data ?? []));
  }, []);

  const add = async () => {
    if (!form.country_id || !form.name_ar) return toast.error("الدولة والاسم مطلوبان");
    const slug = form.name_en?.toLowerCase().replace(/\s+/g, "-") || form.name_ar;
    const { error } = await supabase.from("cities").insert({
      ...form, slug,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    });
    if (error) return toast.error(error.message);
    toast.success("تمت الإضافة"); setForm({ country_id: "", name_ar: "", name_fr: "", name_en: "", latitude: "", longitude: "" }); load();
  };

  const remove = async (id: string) => { if (!confirm("حذف المدينة؟")) return; await supabase.from("cities").delete().eq("id", id); load(); };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card mt-4">
      <div className="grid md:grid-cols-7 gap-2 mb-4">
        <select value={form.country_id} onChange={(e) => setForm({ ...form, country_id: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="">الدولة</option>
          {countries.map((c) => <option key={c.id} value={c.id}>{c.flag_emoji} {c.name_ar}</option>)}
        </select>
        <Input placeholder="اسم عربي" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
        <Input placeholder="Nom FR" value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} />
        <Input placeholder="Name EN" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
        <Input placeholder="lat" dir="ltr" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
        <Input placeholder="lng" dir="ltr" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
        <Button onClick={add}><Plus className="h-4 w-4 me-1" /> إضافة</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="p-3 text-start">المدينة</th><th className="p-3 text-start">الدولة</th><th className="p-3 text-start">الإحداثيات</th><th className="p-3 text-start"></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3 font-medium">{r.name_ar}</td>
              <td className="p-3">{r.countries?.flag_emoji} {r.countries?.name_ar}</td>
              <td className="p-3 text-muted-foreground tabular-nums" dir="ltr">{r.latitude && r.longitude ? `${r.latitude}, ${r.longitude}` : "—"}</td>
              <td className="p-3"><Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
