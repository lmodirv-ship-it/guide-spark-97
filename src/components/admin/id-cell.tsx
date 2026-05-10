import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Kind = "places" | "products" | "profiles";

export function IdCell({ publicId }: { publicId?: string | null }) {
  if (!publicId) return <span className="text-xs text-muted-foreground">—</span>;
  const copy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(publicId);
    toast.success(`تم نسخ ${publicId}`);
  };
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="secondary" className="font-mono text-[11px] px-2 py-0.5">{publicId}</Badge>
      <button onClick={copy} className="opacity-60 hover:opacity-100" title="نسخ">
        <Copy className="h-3 w-3" />
      </button>
    </div>
  );
}

export function ValidateButton({
  table, id, publicId, currentStatus, onDone,
}: {
  table: Kind;
  id: string;
  publicId?: string | null;
  currentStatus?: string | boolean | null;
  onDone?: () => void;
}) {
  const validate = async () => {
    let patch: any = null;
    if (table === "places") patch = { status: "active", is_verified: true };
    else if (table === "products") patch = { is_available: true };
    if (patch) {
      const { error } = await supabase.from(table).update(patch).eq("id", id);
      if (error) { toast.error(error.message); return; }
    }
    toast.success("تم التحقق ✓ تم فتح الصفحة في تبويب جديد");
    if (publicId) window.open(`/id/${publicId}`, "_blank");
    onDone?.();
  };
  const alreadyValid =
    (table === "places" && currentStatus === "active") ||
    (table === "products" && currentStatus === true);

  if (alreadyValid && publicId) {
    return (
      <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => window.open(`/id/${publicId}`, "_blank")}>
        <ExternalLink className="h-3.5 w-3.5" /> فتح
      </Button>
    );
  }
  return (
    <Button size="sm" className="h-8 gap-1 bg-success text-success-foreground hover:opacity-90" onClick={validate}>
      <CheckCircle2 className="h-3.5 w-3.5" /> تحقق
    </Button>
  );
}
