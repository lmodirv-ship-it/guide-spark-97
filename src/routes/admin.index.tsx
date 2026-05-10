import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Store, Users, ShoppingBag, Globe2, TrendingUp, Star, Search } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

const monthly = [
  { d: "1 مايو", v: 30 }, { d: "8 مايو", v: 95 }, { d: "15 مايو", v: 70 },
  { d: "22 مايو", v: 110 }, { d: "29 مايو", v: 180 },
];

const COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

function AdminDashboard() {
  const [stats, setStats] = useState({ places: 0, active: 0, pending: 0, users: 0, cities: 0, categories: 0, reviews: 0, imports: 0 });
  const [byCategory, setByCategory] = useState<{ name: string; value: number }[]>([]);
  const [byCity, setByCity] = useState<{ name: string; value: number }[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const counts = await Promise.all([
        supabase.from("places").select("*", { count: "exact", head: true }),
        supabase.from("places").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("places").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("cities").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("import_jobs").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        places: counts[0].count ?? 0, active: counts[1].count ?? 0, pending: counts[2].count ?? 0,
        users: counts[3].count ?? 0, cities: counts[4].count ?? 0, categories: counts[5].count ?? 0,
        reviews: counts[6].count ?? 0, imports: counts[7].count ?? 0,
      });

      const { data: cats } = await supabase.from("categories").select("name_ar, places(count)").limit(6);
      if (cats) setByCategory(cats.map((c: any) => ({ name: c.name_ar, value: c.places?.[0]?.count ?? 0 })).filter(x => x.value > 0));

      const { data: cities } = await supabase.from("cities").select("name_ar, places(count)").limit(5);
      if (cities) setByCity(cities.map((c: any) => ({ name: c.name_ar, value: c.places?.[0]?.count ?? 0 })).sort((a, b) => b.value - a.value));

      const { data: r } = await supabase
        .from("places")
        .select("id, name, cover_image, status, phone, created_at, categories(name_ar), cities(name_ar)")
        .order("created_at", { ascending: false }).limit(5);
      setRecent(r ?? []);
    })();
  }, []);

  const totalCity = byCity.reduce((s, c) => s + c.value, 0) || 1;

  return (
    <>
      <AdminTopbar title="لوحة التحكم" subtitle="مرحباً بك في لوحة تحكم دليلك" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatCard label="إجمالي الأماكن" value={stats.places.toLocaleString()} icon={Store} change={12.5} hint="من الشهر الماضي" tone="violet" />
        <StatCard label="المستخدمون" value={stats.users.toLocaleString()} icon={Users} change={8.3} hint="من الشهر الماضي" tone="sky" />
        <StatCard label="التقييمات" value={stats.reviews.toLocaleString()} icon={Star} change={15.7} hint="من الشهر الماضي" tone="primary" />
        <StatCard label="المدن" value={stats.cities} icon={Globe2} change={2.1} hint={`${stats.categories} تصنيف`} tone="amber" />
        <StatCard label="عمليات استيراد" value={stats.imports} icon={Search} change={10.2} hint="هذا الشهر" tone="rose" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1 rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">الأماكن المضافة</h3>
            <select className="text-xs rounded-lg border bg-background px-2 py-1">
              <option>هذا الشهر</option><option>السنة</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="d" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="v" stroke="oklch(0.62 0.16 155)" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <h3 className="font-bold mb-4">الأماكن حسب التصنيف</h3>
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">لا توجد بيانات</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">توزيع الأماكن على المدن</h3>
            <span className="text-xs text-primary cursor-pointer">عرض الكل</span>
          </div>
          <div className="space-y-3">
            {byCity.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">لا توجد بيانات</p>}
            {byCity.map((c, i) => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground tabular-nums">{c.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(c.value / totalCity) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent table */}
      <div className="rounded-2xl border bg-card shadow-card">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold">أحدث الأماكن المضافة</h3>
          <a href="/admin/places" className="text-sm text-primary">عرض الكل</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="text-start p-3 font-semibold">الاسم</th>
                <th className="text-start p-3 font-semibold">التصنيف</th>
                <th className="text-start p-3 font-semibold">المدينة</th>
                <th className="text-start p-3 font-semibold">الهاتف</th>
                <th className="text-start p-3 font-semibold">الحالة</th>
                <th className="text-start p-3 font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">لا توجد بيانات بعد</td></tr>
              )}
              {recent.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30 transition">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.categories?.name_ar ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{p.cities?.name_ar ?? "—"}</td>
                  <td className="p-3 text-muted-foreground tabular-nums">{p.phone ?? "—"}</td>
                  <td className="p-3"><StatusBadge status={p.status} /></td>
                  <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("ar-MA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

