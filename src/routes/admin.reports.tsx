import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { StatCard } from "@/components/admin/stat-card";
import { Store, Star, Users, Search, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/admin/reports")({ component: Reports });

function Reports() {
  const [stats, setStats] = useState({ places: 0, active: 0, reviews: 0, users: 0, imports: 0 });
  const [byCity, setByCity] = useState<any[]>([]);
  const [byCat, setByCat] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const counts = await Promise.all([
        supabase.from("places").select("*", { count: "exact", head: true }),
        supabase.from("places").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("import_jobs").select("*", { count: "exact", head: true }),
      ]);
      setStats({ places: counts[0].count ?? 0, active: counts[1].count ?? 0, reviews: counts[2].count ?? 0, users: counts[3].count ?? 0, imports: counts[4].count ?? 0 });

      const { data: cities } = await supabase.from("cities").select("name_ar, places(count)").limit(8);
      setByCity((cities ?? []).map((c: any) => ({ name: c.name_ar, count: c.places?.[0]?.count ?? 0 })));
      const { data: cats } = await supabase.from("categories").select("name_ar, places(count)").is("parent_id", null).limit(8);
      setByCat((cats ?? []).map((c: any) => ({ name: c.name_ar, count: c.places?.[0]?.count ?? 0 })));
    })();
  }, []);

  return (
    <>
      <AdminTopbar title="التقارير والإحصائيات" subtitle="نظرة شاملة على أداء المنصة" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="إجمالي الأماكن" value={stats.places} icon={Store} tone="violet" />
        <StatCard label="النشطة" value={stats.active} icon={TrendingUp} tone="primary" />
        <StatCard label="التقييمات" value={stats.reviews} icon={Star} tone="amber" />
        <StatCard label="المستخدمون" value={stats.users} icon={Users} tone="sky" />
        <StatCard label="الاستيرادات" value={stats.imports} icon={Search} tone="rose" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold">أكثر المدن نشاطاً</h3>
            <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 me-1" /> تصدير</Button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCity}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold">حسب التصنيف</h3>
            <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 me-1" /> تصدير</Button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCat} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
