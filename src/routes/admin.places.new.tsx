import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/places/new")({ component: NewPlace });

function NewPlace() {
  const nav = useNavigate();
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    name: "", description: "", phone: "", whatsapp: "", email: "", website: "",
    address: "", country_id: "", city_id: "", category_id: "",
    latitude: "", longitude: "", cover_image: "", status: "pending", price_level: 2,
  });

  useEffect(() => {
    supabase.from("countries").select("id, name_ar, flag_emoji").then(({ data }) => setCountries(data ?? []));
    supabase.from("categories").select("id, name_ar").order("sort_order").then(({ data }) => setCategories(data ?? []));
  }, []);
  useEffect(() => {
    if (!form.country_id) return setCities([]);
    supabase.from("cities").select("id, name_ar").eq("country_id", form.country_id).then(({ data }) => setCities(data ?? []));
  }, [form.country_id]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("سجّل الدخول أولاً"); setSaving(false); return; }
    const slug = form.name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 8);
    const { error } = await supabase.from("places").insert({
      ...form,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      price_level: Number(form.price_level),
      owner_id: user.id, created_by: user.id, slug,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم إضافة المكان");
    nav({ to: "/admin/places" });
  };

  return (
    <>
      <AdminTopbar title="إضافة مكان جديد" subtitle="املأ بيانات المكان بدقة" />
      <form onSubmit={submit} className="rounded-2xl border bg-card p-6 shadow-card space-y-6 max-w-5xl">
        <section className="grid md:grid-cols-2 gap-4">
          <Field label="اسم المكان *"><Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="التصنيف *">
            <select required value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm h-10">
              <option value="">اختر</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          </Field>
          <Field label="الدولة *">
            <select required value={form.country_id} onChange={(e) => set("country_id", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm h-10">
              <option value="">اختر</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{c.flag_emoji} {c.name_ar}</option>)}
            </select>
          </Field>
          <Field label="المدينة *">
            <select required value={form.city_id} onChange={(e) => set("city_id", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm h-10">
              <option value="">اختر</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          </Field>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <Field label="الهاتف"><Input dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="واتساب"><Input dir="ltr" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
          <Field label="الإيميل"><Input type="email" dir="ltr" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="الموقع الإلكتروني"><Input dir="ltr" value={form.website} onChange={(e) => set("website", e.target.value)} /></Field>
        </section>

        <Field label="العنوان"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <Field label="الوصف"><Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>

        <section className="grid md:grid-cols-3 gap-4">
          <Field label="خط العرض"><Input dir="ltr" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} /></Field>
          <Field label="خط الطول"><Input dir="ltr" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} /></Field>
          <Field label="مستوى السعر (1-4)"><Input type="number" min={1} max={4} value={form.price_level} onChange={(e) => set("price_level", e.target.value)} /></Field>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <Field label="رابط صورة الغلاف"><Input dir="ltr" value={form.cover_image} onChange={(e) => set("cover_image", e.target.value)} /></Field>
          <Field label="الحالة">
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm h-10">
              <option value="draft">مسودة</option>
              <option value="pending">معلق</option>
              <option value="active">نشط</option>
              <option value="published">منشور</option>
            </select>
          </Field>
        </section>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => nav({ to: "/admin/places" })}>إلغاء</Button>
          <Button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ المكان"}</Button>
        </div>
      </form>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-semibold">{label}</Label>{children}</div>;
}
