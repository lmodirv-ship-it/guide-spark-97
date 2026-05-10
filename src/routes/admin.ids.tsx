import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ids")({ component: IdsPage });

type Row = { id: string; public_id: string | null; name: string; created_at: string };

function IdsPage() {
  const [tab, setTab] = useState<"places" | "users" | "products">("places");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    if (tab === "places") {
      const { data } = await supabase.from("places").select("id,public_id,name,created_at").order("created_at", { ascending: false }).limit(200);
      setRows((data ?? []) as Row[]);
    } else if (tab === "users") {
      const { data } = await supabase.from("profiles").select("id,public_id,full_name,created_at").order("created_at", { ascending: false }).limit(200);
      setRows((data ?? []).map((r: any) => ({ id: r.id, public_id: r.public_id, name: r.full_name ?? "—", created_at: r.created_at })));
    } else {
      const { data } = await supabase.from("products").select("id,public_id,name,created_at").order("created_at", { ascending: false }).limit(200);
      setRows((data ?? []) as Row[]);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (r.public_id ?? "").toLowerCase().includes(s) || (r.name ?? "").toLowerCase().includes(s);
  });

  const copy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(`تم نسخ ${id}`);
  };

  return (
    <>
      <AdminTopbar title="المعرّفات (IDs)" subtitle="معرّف فريد A + 6 أرقام لكل عنصر" />
      <div className="rounded-2xl border bg-card shadow-card">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <div className="p-4 border-b flex flex-wrap items-center gap-3 justify-between">
            <TabsList>
              <TabsTrigger value="places">الأماكن</TabsTrigger>
              <TabsTrigger value="users">المستخدمون</TabsTrigger>
              <TabsTrigger value="products">المنتجات</TabsTrigger>
            </TabsList>
            <div className="relative max-w-xs flex-1">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="ابحث بالمعرّف أو الاسم..." value={q} onChange={(e) => setQ(e.target.value)} className="pe-9" />
            </div>
          </div>

          <TabsContent value={tab} className="m-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="text-start p-3">المعرّف</th>
                    <th className="text-start p-3">الاسم</th>
                    <th className="text-start p-3">تاريخ الإنشاء</th>
                    <th className="text-end p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <Badge variant="secondary" className="font-mono">{r.public_id ?? "—"}</Badge>
                      </td>
                      <td className="p-3 font-medium">{r.name}</td>
                      <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar")}</td>
                      <td className="p-3 text-end">
                        <div className="flex justify-end gap-2">
                          {r.public_id && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => copy(r.public_id!)}>
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Link to="/id/$publicId" params={{ publicId: r.public_id }}>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">لا توجد نتائج</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
