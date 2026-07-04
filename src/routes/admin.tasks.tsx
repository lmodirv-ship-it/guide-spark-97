import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle2, Clock, PlayCircle, XCircle, ListTodo } from "lucide-react";

export const Route = createFileRoute("/admin/tasks")({ component: TasksPage });

type Task = {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  status: "pending" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  created_at: string;
};

type Profile = { id: string; full_name: string | null };

const STATUS: Record<Task["status"], { label: string; icon: any; cls: string }> = {
  pending: { label: "قيد الانتظار", icon: Clock, cls: "bg-muted text-muted-foreground" },
  in_progress: { label: "قيد التنفيذ", icon: PlayCircle, cls: "bg-blue-500/10 text-blue-600" },
  done: { label: "منجز", icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-600" },
  cancelled: { label: "ملغى", icon: XCircle, cls: "bg-destructive/10 text-destructive" },
};
const PRIORITY: Record<Task["priority"], { label: string; cls: string }> = {
  low: { label: "منخفضة", cls: "bg-muted text-muted-foreground" },
  medium: { label: "متوسطة", cls: "bg-blue-500/10 text-blue-600" },
  high: { label: "عالية", cls: "bg-orange-500/10 text-orange-600" },
  urgent: { label: "عاجلة", cls: "bg-destructive/10 text-destructive" },
};

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [filter, setFilter] = useState<"all" | Task["status"]>("all");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: t }, { data: u }] = await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name").order("full_name"),
    ]);
    setTasks((t as any) ?? []);
    setUsers((u as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const userName = (id: string | null) => users.find((u) => u.id === id)?.full_name ?? "—";

  const createTask = async () => {
    if (!title.trim()) return toast.error("العنوان مطلوب");
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("tasks").insert({
      title: title.trim(),
      description: description.trim() || null,
      assigned_to: assignedTo || null,
      assigned_by: user?.id ?? null,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم إنشاء المهمة");
    setTitle(""); setDescription(""); setAssignedTo(""); setPriority("medium"); setDueDate("");
    load();
  };

  const updateStatus = async (id: string, status: Task["status"]) => {
    const patch: any = { status };
    if (status === "done") patch.completed_at = new Date().toISOString();
    const { error } = await supabase.from("tasks").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف المهمة؟")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف"); load();
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    cancelled: tasks.filter((t) => t.status === "cancelled").length,
  };

  return (
    <>
      <AdminTopbar title="إدارة المهام والأدوار" subtitle={`${tasks.length} مهمة`} />

      <div className="grid gap-4 md:grid-cols-4 mb-4">
        {(["all", "pending", "in_progress", "done"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-2xl border bg-card p-4 text-start shadow-card transition ${filter === k ? "ring-2 ring-primary" : ""}`}
          >
            <div className="text-xs text-muted-foreground">
              {k === "all" ? "الكل" : STATUS[k as Task["status"]].label}
            </div>
            <div className="text-2xl font-extrabold mt-1">{counts[k]}</div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-card shadow-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="h-4 w-4 text-primary" />
          <h3 className="font-bold">إسناد مهمة جديدة</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="عنوان المهمة" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm">
            <option value="">— اختر مستخدم —</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.full_name ?? u.id.slice(0, 8)}</option>)}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="rounded-lg border bg-background px-3 py-2 text-sm">
            {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>الأولوية: {v.label}</option>)}
          </select>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Textarea placeholder="الوصف (اختياري)" value={description} onChange={(e) => setDescription(e.target.value)} className="md:col-span-2" rows={3} />
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={createTask} disabled={saving}>
            <Plus className="h-4 w-4 me-1" /> إنشاء المهمة
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-card">
        <div className="p-4 border-b flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-primary" />
          <h3 className="font-bold">قائمة المهام</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="p-3 text-start">العنوان</th>
              <th className="p-3 text-start">المسند إليه</th>
              <th className="p-3 text-start">الأولوية</th>
              <th className="p-3 text-start">الاستحقاق</th>
              <th className="p-3 text-start">الحالة</th>
              <th className="p-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">لا توجد مهام</td></tr>
            )}
            {filtered.map((t) => {
              const S = STATUS[t.status];
              const P = PRIORITY[t.priority];
              return (
                <tr key={t.id} className="border-t align-top">
                  <td className="p-3">
                    <div className="font-medium">{t.title}</div>
                    {t.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</div>}
                  </td>
                  <td className="p-3">{userName(t.assigned_to)}</td>
                  <td className="p-3"><Badge className={`${P.cls} border-0`}>{P.label}</Badge></td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {t.due_date ? new Date(t.due_date).toLocaleDateString("ar-MA") : "—"}
                  </td>
                  <td className="p-3">
                    <Badge className={`${S.cls} border-0`}>
                      <S.icon className="h-3 w-3 me-1 inline" />
                      {S.label}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={t.status}
                        onChange={(e) => updateStatus(t.id, e.target.value as Task["status"])}
                        className="rounded-lg border bg-background px-2 py-1 text-xs"
                      >
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <Button size="icon" variant="ghost" onClick={() => remove(t.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
