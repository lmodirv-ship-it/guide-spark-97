import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Search, Database, History } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/import")({ component: ImportPage });

function ImportPage() {
  const [form, setForm] = useState({ query: "", country_id: "", city_id: "", category_id: "", source: "openstreetmap" });
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const loadJobs = async () => {
    const { data } = await supabase.from("import_jobs").select("*").order("created_at", { ascending: false }).limit(20);
    setJobs(data ?? []);
  };
  useEffect(() => {
    supabase.from("countries").select("id, name_ar, flag_emoji").then(({ data }) => setCountries(data ?? []));
    supabase.from("categories").select("id, name_ar").is("parent_id", null).then(({ data }) => setCats(data ?? []));
    loadJobs();
  }, []);
  useEffect(() => {
    if (!form.country_id) { setCities([]); return; }
    supabase.from("cities").select("id, name_ar").eq("country_id", form.country_id).then(({ data }) => setCities(data ?? []));
  }, [form.country_id]);

  const runImport = async () => {
    if (!form.query) return toast.error("أدخل كلمة البحث");
    const { error } = await supabase.from("import_jobs").insert({
      query: form.query, source: form.source,
      country_id: form.country_id || null, city_id: form.city_id || null, category_id: form.category_id || null,
      status: "pending",
    });
    if (error) return toast.error(error.message);
    toast.success("تم إنشاء مهمة استيراد جديدة — ستُعالج قريباً");
    setForm({ ...form, query: "" });
    loadJobs();
  };

  return (
    <>
      <AdminTopbar title="البحث الأوتوماتيكي" subtitle="استيراد أماكن من مصادر خارجية مثل OpenStreetMap" />

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Bot className="h-5 w-5" /></div>
            <div>
              <h3 className="font-bold">إنشاء مهمة استيراد</h3>
              <p className="text-xs text-muted-foreground">سيقوم النظام بجلب الأماكن من المصدر المختار</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="مثال: مطاعم، صيدليات، فنادق..." value={form.query} onChange={(e) => setForm({ ...form, query: e.target.value })} />
            <select className="rounded-lg border bg-background px-3 py-2 text-sm" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              <option value="openstreetmap">OpenStreetMap</option>
              <option value="google_places">Google Places</option>
              <option value="manual_csv">CSV يدوي</option>
            </select>
            <select className="rounded-lg border bg-background px-3 py-2 text-sm" value={form.country_id} onChange={(e) => setForm({ ...form, country_id: e.target.value, city_id: "" })}>
              <option value="">كل الدول</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{c.flag_emoji} {c.name_ar}</option>)}
            </select>
            <select className="rounded-lg border bg-background px-3 py-2 text-sm" value={form.city_id} onChange={(e) => setForm({ ...form, city_id: e.target.value })} disabled={!form.country_id}>
              <option value="">كل المدن</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
            <select className="rounded-lg border bg-background px-3 py-2 text-sm md:col-span-2" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">كل التصنيفات</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          </div>
          <Button className="mt-4 w-full" onClick={runImport}><Search className="h-4 w-4 me-1" /> بدء الاستيراد</Button>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Database className="h-4 w-4" /> الإحصائيات</h3>
          <div className="space-y-3 text-sm">
            <Row label="المهام الكلية" value={jobs.length} />
            <Row label="ناجحة" value={jobs.filter(j => j.status === "completed").length} />
            <Row label="قيد الانتظار" value={jobs.filter(j => j.status === "pending").length} />
            <Row label="فاشلة" value={jobs.filter(j => j.status === "failed").length} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-card">
        <div className="p-4 border-b flex items-center gap-2">
          <History className="h-4 w-4" /> <h3 className="font-bold">سجل المهام</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr><th className="p-3 text-start">الكلمة</th><th className="p-3 text-start">المصدر</th><th className="p-3 text-start">النتائج</th><th className="p-3 text-start">المستوردة</th><th className="p-3 text-start">الحالة</th><th className="p-3 text-start">التاريخ</th></tr>
          </thead>
          <tbody>
            {jobs.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد مهام بعد</td></tr>}
            {jobs.map((j) => (
              <tr key={j.id} className="border-t">
                <td className="p-3 font-medium">{j.query}</td>
                <td className="p-3 text-muted-foreground text-xs">{j.source ?? "—"}</td>
                <td className="p-3 tabular-nums">{j.total_found ?? 0}</td>
                <td className="p-3 tabular-nums text-success">{j.total_imported ?? 0}</td>
                <td className="p-3"><StatusBadge status={j.status} /></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(j.created_at).toLocaleDateString("ar-MA")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}
