import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "hn_visit_counted_v1";

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const already = typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY);
        if (already) {
          const { data } = await supabase.from("site_stats").select("count").eq("id", "visitors").maybeSingle();
          if (!cancelled && data) setCount(Number(data.count));
          return;
        }
        const { data, error } = await supabase.rpc("increment_visitors");
        if (!error && !cancelled) {
          setCount(Number(data));
          sessionStorage.setItem(SESSION_KEY, "1");
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-xs font-semibold text-foreground/80"
      title="عدد الزوار"
      suppressHydrationWarning
    >
      <Eye className="h-3.5 w-3.5 text-primary" />
      <span className="tabular-nums">{count !== null ? count.toLocaleString("en-US") : "…"}</span>
    </div>
  );
}
