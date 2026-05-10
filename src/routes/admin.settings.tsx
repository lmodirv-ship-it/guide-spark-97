import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Globe, Palette, Mail, Search, Shield, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

function Settings() {
  const save = () => toast.success("تم حفظ الإعدادات");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const updateCredentials = async () => {
    if (!email && !password) return toast.error("أدخل بريدًا أو كلمة سر جديدة");
    setLoading(true);
    const payload: { email?: string; password?: string } = {};
    if (email) payload.email = email;
    if (password) {
      if (password.length < 6) { setLoading(false); return toast.error("كلمة السر يجب 6 أحرف على الأقل"); }
      payload.password = password;
    }
    const { error } = await supabase.auth.updateUser(payload);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("تم تحديث بيانات الدخول");
    setEmail(""); setPassword("");
  };

  return (
    <>
      <AdminTopbar title="إعدادات الموقع" subtitle="الإعدادات العامة للمنصة" />
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general"><Globe className="h-4 w-4 me-1" /> عام</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-4 w-4 me-1" /> المظهر</TabsTrigger>
          <TabsTrigger value="email"><Mail className="h-4 w-4 me-1" /> البريد</TabsTrigger>
          <TabsTrigger value="search"><Search className="h-4 w-4 me-1" /> البحث الآلي</TabsTrigger>
          <TabsTrigger value="policy"><Shield className="h-4 w-4 me-1" /> النشر</TabsTrigger>
          <TabsTrigger value="account"><KeyRound className="h-4 w-4 me-1" /> حساب المدير</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <p className="text-xs text-muted-foreground">يجب أن تكون مسجّلًا بحساب المدير لتغيير البريد أو كلمة السر.</p>
            <Field label="البريد الإلكتروني الجديد"><Input dir="ltr" type="email" placeholder="lmodirv@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="كلمة سر جديدة"><Input dir="ltr" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
            <Button onClick={updateCredentials} disabled={loading}>{loading ? "جارٍ الحفظ..." : "تحديث بيانات الدخول"}</Button>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <Field label="اسم الموقع"><Input defaultValue="دليلك" /></Field>
            <Field label="الوصف"><Textarea defaultValue="دليل الأماكن والخدمات" /></Field>
            <Field label="اللغة الافتراضية">
              <select className="rounded-lg border bg-background px-3 py-2 text-sm w-full" defaultValue="ar">
                <option value="ar">العربية</option><option value="fr">Français</option><option value="en">English</option>
              </select>
            </Field>
            <Button onClick={save}>حفظ</Button>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <Field label="اللون الأساسي"><Input type="color" defaultValue="#10b981" className="h-10 w-24" /></Field>
            <Field label="رابط الشعار"><Input dir="ltr" placeholder="/logo.png" /></Field>
            <Button onClick={save}>حفظ</Button>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <Field label="بريد المرسل"><Input dir="ltr" placeholder="noreply@dalilik.com" /></Field>
            <Field label="اسم المرسل"><Input defaultValue="دليلك" /></Field>
            <Button onClick={save}>حفظ</Button>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <Field label="مصدر افتراضي">
              <select className="rounded-lg border bg-background px-3 py-2 text-sm w-full">
                <option>OpenStreetMap</option><option>Google Places</option>
              </select>
            </Field>
            <Field label="حد النتائج لكل مهمة"><Input type="number" defaultValue={50} /></Field>
            <Button onClick={save}>حفظ</Button>
          </Card>
        </TabsContent>

        <TabsContent value="policy">
          <Card>
            <Field label="مراجعة قبل النشر">
              <select className="rounded-lg border bg-background px-3 py-2 text-sm w-full">
                <option value="true">إجبارية</option><option value="false">تلقائية</option>
              </select>
            </Field>
            <Field label="سياسة النشر"><Textarea rows={4} placeholder="اكتب الشروط..." /></Field>
            <Button onClick={save}>حفظ</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4 max-w-2xl">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
