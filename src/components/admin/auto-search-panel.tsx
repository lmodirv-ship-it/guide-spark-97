import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Database, Loader2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { runAutoSearch } from "@/lib/auto-search.functions";
import { adminCreateUsers } from "@/lib/admin-create-users.functions";

type Kind = "places" | "cities" | "countries" | "categories" | "products" | "ads" | "users" | "reviews";

interface Props {
  kind: Kind;
  title?: string;
  hint?: string;
  /** Optional context to pass to AI (e.g., selected place_id for products) */
  context?: string;
  /** Called after successful save so the parent can refresh its list */
  onSaved?: () => void;
}

const TABLE_BY_KIND: Record<Kind, string> = {
  places: "import_results",
  cities: "cities",
  countries: "countries",
  categories: "categories",
  products: "products",
  ads: "ads",
  users: "profiles",
  reviews: "reviews",
};

const slugify = (s: string) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || `item-${Date.now()}`;

export function AutoSearchPanel({ kind, title, hint, context, onSaved }: Props) {
  const fn = useServerFn(runAutoSearch);
  const createUsersFn = useServerFn(adminCreateUsers);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  const columns = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => Object.keys(r ?? {}).forEach((k) => set.add(k)));
    return Array.from(set).slice(0, 8);
  }, [results]);

  const search = async () => {
    if (!query.trim()) return toast.error("أدخل كلمة البحث");
    setLoading(true);
    setResults([]);
    setSelected({});
    try {
      const out = await fn({ data: { kind, query: query.trim(), context } });
      if (out.error) toast.error(out.error);
      else if (!out.results.length) toast.message("لا توجد نتائج");
      else toast.success(`تم العثور على ${out.results.length} نتيجة`);
      setResults(out.results || []);
      const all: Record<number, boolean> = {};
      (out.results || []).forEach((_: any, i: number) => (all[i] = true));
      setSelected(all);
    } catch (e: any) {
      toast.error(e?.message || "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    const picked = results.filter((_, i) => selected[i]);
    if (!picked.length) return toast.error("لم يتم اختيار أي صف");
    if (kind === "users") {
      setSaving(true);
      try {
        const users = picked.map((r: any) => ({
          full_name: r.full_name ?? r.name ?? "مستخدم",
          phone: r.phone ?? null,
          preferred_language: r.preferred_language ?? "ar",
          avatar_url: r.avatar_url ?? null,
          email: r.email ?? null,
        }));
        const out = await createUsersFn({ data: { users } });
        if (out.created > 0) toast.success(`تم إنشاء ${out.created} مستخدم`);
        if (out.errors?.length) toast.error(out.errors.slice(0, 3).join(" | "));
        setResults([]); setSelected({}); onSaved?.();
      } catch (e: any) {
        toast.error(e?.message || "فشل إنشاء المستخدمين");
      } finally { setSaving(false); }
      return;
    }
    if (kind === "reviews" && !context) {
      return toast.error("اختر مكاناً أولاً لإضافة تقييمات له");
    }
    setSaving(true);
    try {
      const table = TABLE_BY_KIND[kind];
      let rows = picked.map((r) => prepareRow(kind, r, context)).filter(Boolean);
      if (kind === "reviews") {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id;
        if (!uid) throw new Error("يجب تسجيل الدخول");
        rows = rows.map((r: any) => ({ ...r, user_id: uid }));
      }
      const { error } = await supabase.from(table as any).insert(rows as any);
      if (error) throw error;
      toast.success(`تم حفظ ${rows.length} عنصر في قاعدة البيانات`);
      setResults([]);
      setSelected({});
      onSaved?.();
    } catch (e: any) {
      toast.error(e?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const allChecked = results.length > 0 && results.every((_, i) => selected[i]);

  return (
    <div className="rounded-2xl border bg-card shadow-card mb-4">
      <div className="p-4 border-b flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm flex items-center gap-1">
            <Bot className="h-4 w-4" /> {title ?? "البحث الأوتوماتيكي / التوليد"}
          </h3>
          <p className="text-xs text-muted-foreground">{hint ?? "اكتب ما تريد، سيقوم النظام بجلب نتائج جاهزة لمراجعتها وحفظها."}</p>
        </div>
      </div>

      <div className="p-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="مثال: مطاعم في الدار البيضاء، مدن المغرب، تصنيفات السياحة..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="pe-9"
          />
        </div>
        <Button onClick={search} disabled={loading} className="gap-1">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} بحث أوتوماتيكي
        </Button>
        <Button onClick={saveAll} disabled={saving || !results.length} variant="default" className="gap-1 bg-success text-success-foreground hover:bg-success/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />} حفظ في قاعدة البيانات
        </Button>
      </div>

      {results.length > 0 && (
        <div className="overflow-x-auto border-t">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[11px] text-muted-foreground">
              <tr>
                <th className="p-2 text-start">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => {
                      const v: Record<number, boolean> = {};
                      results.forEach((_, i) => (v[i] = e.target.checked));
                      setSelected(v);
                    }}
                  />
                </th>
                {columns.map((c) => (
                  <th key={c} className="p-2 text-start font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-t hover:bg-muted/30">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={!!selected[i]}
                      onChange={(e) => setSelected({ ...selected, [i]: e.target.checked })}
                    />
                  </td>
                  {columns.map((c) => (
                    <td key={c} className="p-2 max-w-[220px] truncate" title={String(r?.[c] ?? "")}>
                      {typeof r?.[c] === "object" ? JSON.stringify(r[c]) : String(r?.[c] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function prepareRow(kind: Kind, r: any, context?: string): any {
  switch (kind) {
    case "places":
      // Save as draft into import_results for review
      return {
        import_job_id: null as any,
        name: r.name ?? null,
        address: r.address ?? null,
        phone: r.phone ?? null,
        website: r.website ?? null,
        latitude: r.latitude ? Number(r.latitude) : null,
        longitude: r.longitude ? Number(r.longitude) : null,
        status: "pending",
        raw_data: r,
        normalized_data: r,
      };
    case "countries":
      return {
        code: (r.code || "XX").toUpperCase().slice(0, 2),
        name_ar: r.name_ar ?? r.name ?? "",
        name_fr: r.name_fr ?? r.name ?? "",
        name_en: r.name_en ?? r.name ?? "",
        slug: slugify(r.name_en || r.name_ar || r.code),
        flag_emoji: r.flag_emoji ?? null,
        currency: r.currency ?? null,
        phone_code: r.phone_code ?? null,
        languages: r.languages ?? null,
      };
    case "cities":
      return {
        country_id: context || null,
        name_ar: r.name_ar ?? r.name ?? "",
        name_fr: r.name_fr ?? r.name ?? "",
        name_en: r.name_en ?? r.name ?? "",
        slug: slugify(r.name_en || r.name_ar),
        latitude: r.latitude ? Number(r.latitude) : null,
        longitude: r.longitude ? Number(r.longitude) : null,
      };
    case "categories":
      return {
        name_ar: r.name_ar ?? r.name ?? "",
        name_fr: r.name_fr ?? r.name ?? "",
        name_en: r.name_en ?? r.name ?? "",
        slug: slugify(r.name_en || r.name_ar),
        icon: r.icon ?? null,
        color: r.color ?? null,
      };
    case "products":
      return {
        place_id: context,
        name: r.name ?? "",
        category_name: r.category_name ?? null,
        price: r.price ? Number(r.price) : null,
        currency: r.currency ?? "MAD",
        description: r.description ?? null,
      };
    case "ads":
      return {
        title: r.title ?? r.name ?? "إعلان",
        target_url: r.target_url ?? null,
        image_url: r.image_url ?? null,
        status: r.status ?? "active",
      };
    case "reviews":
      return {
        place_id: context,
        user_id: null, // filled in saveAll from auth
        rating: Math.max(1, Math.min(5, Number(r.rating) || 5)),
        comment: r.comment ?? "",
        status: "pending",
      };
    case "users":
      // profiles.id must equal auth.users.id — cannot auto-create. Preview only.
      return null;
  }
}
