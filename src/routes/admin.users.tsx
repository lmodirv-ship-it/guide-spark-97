import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { IdCell, ValidateButton } from "@/components/admin/id-cell";

export const Route = createFileRoute("/admin/users")({ component: Users });

function Users() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    let query = supabase.from("profiles").select("*, user_roles(role)").order("created_at", { ascending: false }).limit(100);
    if (q) query = query.ilike("full_name", `%${q}%`);
    const { data } = await query;
    setRows(data ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q]);

  const setRole = async (user_id: string, role: "admin" | "user" | "owner") => {
    await supabase.from("user_roles").delete().eq("user_id", user_id);
    const { error } = await supabase.from("user_roles").insert({ user_id, role });
    if (error) return toast.error(error.message);
    toast.success("تم تحديث الدور"); load();
  };

  return (
    <>
      <AdminTopbar title="المستخدمون والأدوار" subtitle={`${rows.length} مستخدم`} />
      <div className="rounded-2xl border bg-card shadow-card">
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="ابحث بالاسم..." value={q} onChange={(e) => setQ(e.target.value)} className="pe-9" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr><th className="p-3 text-start">ID</th><th className="p-3 text-start">المستخدم</th><th className="p-3 text-start">الهاتف</th><th className="p-3 text-start">اللغة</th><th className="p-3 text-start">الدور</th><th className="p-3 text-start">التاريخ</th><th className="p-3 text-start">إجراءات</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">لا توجد بيانات</td></tr>}
            {rows.map((u) => {
              const role = u.user_roles?.[0]?.role ?? "user";
              return (
                <tr key={u.id} className="border-t">
                  <td className="p-3"><IdCell publicId={u.public_id} /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        {u.avatar_url ? <img src={u.avatar_url} className="h-9 w-9 rounded-full object-cover" /> : <UserIcon className="h-4 w-4" />}
                      </div>
                      <div className="font-medium">{u.full_name ?? "—"}</div>
                    </div>
                  </td>
                  <td className="p-3 tabular-nums" dir="ltr">{u.phone ?? "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground uppercase">{u.preferred_language}</td>
                  <td className="p-3">
                    <Badge variant="secondary" className={role === "admin" ? "bg-primary/10 text-primary border-0" : "bg-muted text-muted-foreground border-0"}>
                      {role === "admin" && <Shield className="h-3 w-3 me-1" />}
                      {role === "admin" ? "مدير" : role === "owner" ? "مالك مكان" : "مستخدم"}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("ar-MA")}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <ValidateButton table="profiles" id={u.id} publicId={u.public_id} onDone={load} />
                      <select value={role} onChange={(e) => setRole(u.id, e.target.value as any)} className="rounded-lg border bg-background px-2 py-1 text-xs">
                        <option value="user">مستخدم</option>
                        <option value="owner">مالك مكان</option>
                        <option value="admin">مدير</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
