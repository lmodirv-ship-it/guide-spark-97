import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/id/$publicId")({ component: PublicIdPage });

function PublicIdPage() {
  const { publicId } = Route.useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<{ loading: boolean; kind?: string; data?: any; error?: string }>({ loading: true });

  useEffect(() => {
    (async () => {
      // try places first → redirect to place page
      const { data: place } = await supabase.from("places").select("id,public_id,name,description,address,phone,website").eq("public_id", publicId).maybeSingle();
      if (place) {
        navigate({ to: "/places/$id", params: { id: place.id } });
        return;
      }
      const { data: prod } = await supabase.from("products").select("id,public_id,name,description,price,currency,place_id").eq("public_id", publicId).maybeSingle();
      if (prod) { setState({ loading: false, kind: "product", data: prod }); return; }
      const { data: prof } = await supabase.from("profiles").select("id,public_id,full_name,avatar_url").eq("public_id", publicId).maybeSingle();
      if (prof) { setState({ loading: false, kind: "user", data: prof }); return; }
      setState({ loading: false, error: "لم يتم العثور على هذا المعرّف" });
    })();
  }, [publicId, navigate]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <Badge variant="secondary" className="font-mono text-base">{publicId}</Badge>
        <h1 className="text-2xl font-bold">{state.error}</h1>
        <Link to="/"><Button>العودة للرئيسية</Button></Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="font-mono text-base">{publicId}</Badge>
        <span className="text-muted-foreground text-sm">{state.kind === "product" ? "منتج" : "مستخدم"}</span>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        {state.kind === "product" && (
          <>
            <h1 className="text-2xl font-bold mb-2">{state.data.name}</h1>
            {state.data.description && <p className="text-muted-foreground mb-4">{state.data.description}</p>}
            {state.data.price && <div className="text-lg font-semibold">{state.data.price} {state.data.currency ?? "MAD"}</div>}
          </>
        )}
        {state.kind === "user" && (
          <>
            {state.data.avatar_url && <img src={state.data.avatar_url} alt="" className="h-20 w-20 rounded-full mb-3" />}
            <h1 className="text-2xl font-bold">{state.data.full_name ?? "مستخدم"}</h1>
          </>
        )}
      </div>
      <Link to="/"><Button variant="outline">العودة للرئيسية</Button></Link>
    </div>
  );
}
