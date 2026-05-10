import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, icon: Icon, change, tone = "primary", hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  tone?: "primary" | "violet" | "amber" | "rose" | "sky";
  hint?: string;
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  };
  const positive = (change ?? 0) >= 0;
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card hover:shadow-soft transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight">{value}</div>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(change !== undefined || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {change !== undefined && (
            <span className={cn("inline-flex items-center gap-0.5 font-bold", positive ? "text-success" : "text-destructive")}>
              {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
}
