import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, X } from "lucide-react";

type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  status: string;
  created_at: string;
};

export const Route = createFileRoute("/blog-editor")({
  component: BlogEditor,
  head: () => ({ meta: [{ title: "محرر المدونة" }] }),
});

function BlogEditor() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("published");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const u = s.session?.user ?? null;
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.id);
      setIsAdmin((roles ?? []).some((r: any) => r.role === "admin"));
    })();
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data ?? []) as Post[]);
  };

  useEffect(() => {
    if (isAdmin) loadPosts();
  }, [isAdmin]);

  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setCoverImage("");
    setStatus("published");
    setShowForm(false);
  };

  const startEdit = (p: Post) => {
    setEditing(p);
    setTitle(p.title);
    setExcerpt(p.excerpt ?? "");
    setContent(p.content ?? "");
    setCoverImage(p.cover_image ?? "");
    setStatus(p.status);
    setShowForm(true);
  };

  const save = async () => {
    if (!title.trim()) {
      toast.error("العنوان مطلوب");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim() || null,
      content: content.trim() || null,
      cover_image: coverImage.trim() || null,
      status,
      author_id: user?.id ?? null,
    };
    const { error } = editing
      ? await supabase.from("posts").update(payload).eq("id", editing.id)
      : await supabase.from("posts").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "تم تحديث المقال" : "تم إنشاء المقال");
    resetForm();
    loadPosts();
  };

  const remove = async (id: string) => {
    if (!confirm("هل تريد حذف هذا المقال؟")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("تم الحذف");
    loadPosts();
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">جاري التحميل...</main>
        <SiteFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center flex-col gap-3">
          <p>يجب تسجيل الدخول للوصول لمحرر المدونة.</p>
          <Link to="/auth"><Button>تسجيل الدخول</Button></Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center text-center px-4">
          <p>هذه الصفحة مخصصة للمشرفين فقط.</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 flex-1 max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">محرر المدونة</h1>
            <p className="text-sm text-muted-foreground mt-1">إدارة مقالات المدونة</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 me-1" /> مقال جديد
            </Button>
          )}
        </div>

        {showForm && (
          <div className="mt-6 rounded-2xl border border-border/40 bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">{editing ? "تعديل المقال" : "مقال جديد"}</h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4">
              <div>
                <Label>العنوان</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان المقال" />
              </div>
              <div>
                <Label>صورة الغلاف (رابط)</Label>
                <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>الملخص</Label>
                <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
              </div>
              <div>
                <Label>المحتوى</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} />
              </div>
              <div>
                <Label>الحالة</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="published">منشور</option>
                  <option value="draft">مسودة</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={save} disabled={saving}>
                  {saving ? "جاري الحفظ..." : editing ? "تحديث" : "نشر"}
                </Button>
                <Button variant="outline" onClick={resetForm}>إلغاء</Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-3">
          {posts.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">لا توجد مقالات بعد.</div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-4">
                {p.cover_image && (
                  <img src={p.cover_image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold truncate">{p.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      p.status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                    }`}>
                      {p.status === "published" ? "منشور" : "مسودة"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(p.created_at).toLocaleDateString("ar")} · ID: {p.id.slice(0, 8)}
                  </div>
                </div>
                <Link to="/blog/$id" params={{ id: p.id }}>
                  <Button variant="ghost" size="sm">عرض</Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => startEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
