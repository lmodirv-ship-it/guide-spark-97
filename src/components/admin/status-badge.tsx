import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "نشط", cls: "bg-success/10 text-success" },
    published: { label: "منشور", cls: "bg-success/10 text-success" },
    pending: { label: "معلق", cls: "bg-warning/10 text-amber-600 dark:text-amber-400" },
    pending_review: { label: "بانتظار المراجعة", cls: "bg-warning/10 text-amber-600 dark:text-amber-400" },
    draft: { label: "مسودة", cls: "bg-muted text-muted-foreground" },
    rejected: { label: "مرفوض", cls: "bg-destructive/10 text-destructive" },
    archived: { label: "مؤرشف", cls: "bg-muted text-muted-foreground" },
  };
  const v = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return <Badge variant="secondary" className={v.cls + " font-medium border-0"}>● {v.label}</Badge>;
}
