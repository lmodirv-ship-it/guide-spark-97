import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({ component: AuthPage });

const REMEMBER_KEY = "dalilik_remember_me";

function AuthPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        const { email: e, password: p } = JSON.parse(saved);
        if (e) setEmail(e);
        if (p) setPassword(p);
        setRemember(true);
      }
    } catch {}
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! تحقق من بريدك.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول");
        try {
          if (remember) localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, password }));
          else localStorage.removeItem(REMEMBER_KEY);
        } catch {}
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user!.id);
        const isAdmin = roles?.some((r: any) => r.role === "admin");
        nav({ to: isAdmin ? "/admin" : "/" });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-elegant border border-border/40 p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            {mode === "login" ? t("auth.loginTitle") : t("auth.signupTitle")}
          </h1>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <Input placeholder={t("auth.namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} required />
            )}
            <Input type="email" placeholder={t("auth.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder={t("auth.passwordPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            {mode === "login" && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-primary" />
                <span>تذكرني (حفظ البريد وكلمة السر)</span>
              </label>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {mode === "login" ? t("auth.loginBtn") : t("auth.signupBtn")}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-primary"
          >
            {mode === "login" ? t("auth.switchToSignup") : t("auth.switchToLogin")}
          </button>
        </div>
      </main>
    </div>
  );
}
