import { useEffect, useState } from "react";
import { ShoppingCart, Trash2, Minus, Plus, CheckCircle2, UserPlus, Truck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart, cart, cartCount, cartTotal } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TRACKING_URL = "https://www.hn-driver.com/delivery/tracking";

type Step = "cart" | "register" | "tracking";

export function InlineCheckout({ placeId }: { placeId: string }) {
  const items = useCart();
  const placeItems = items.filter((i) => i.place_id === placeId);
  const count = cartCount(placeItems);
  const total = cartTotal(placeItems);
  const currency = placeItems[0]?.currency ?? "MAD";

  const [step, setStep] = useState<Step>("cart");
  const [authed, setAuthed] = useState<boolean>(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", address: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (placeItems.length === 0) return null;

  const saveOrder = async (userId: string | null, info: { name: string; phone: string; email?: string; address?: string }) => {
    const { error } = await supabase.from("orders").insert({
      user_id: userId,
      place_id: placeId,
      guest_name: info.name,
      guest_phone: info.phone,
      guest_email: info.email,
      address: info.address,
      items: placeItems.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, currency: i.currency })),
      total,
      currency,
      status: "pending",
    });
    if (error) throw error;
  };

  const onConfirm = async () => {
    if (authed) {
      try {
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id ?? null;
        const { data: prof } = uid
          ? await supabase.from("profiles").select("full_name, phone, address").eq("id", uid).maybeSingle()
          : { data: null as any };
        await saveOrder(uid, {
          name: prof?.full_name || data.user?.email || "زبون",
          phone: prof?.phone || "",
          email: data.user?.email || undefined,
          address: prof?.address || undefined,
        });
        toast.success("تم تأكيد الطلب");
        cart.clear();
        setStep("tracking");
      } catch (e: any) {
        toast.error(e.message || "تعذر إنشاء الطلب");
      }
    } else {
      setStep("register");
    }
  };

  const onRegister = async () => {
    if (!form.email || !form.password || !form.full_name || !form.phone) {
      toast.error("الرجاء تعبئة جميع الحقول");
      return;
    }
    setBusy(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data: signUp, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: redirectUrl, data: { full_name: form.full_name, phone: form.phone } },
      });
      if (error) throw error;

      const uid = signUp.user?.id ?? null;
      // Save full profile (handle_new_user trigger creates the row; we update extras)
      if (uid) {
        await supabase.from("profiles").update({
          full_name: form.full_name,
          phone: form.phone,
          address: form.address || null,
        }).eq("id", uid);
      }

      // Link order to the new user
      await saveOrder(uid, {
        name: form.full_name,
        phone: form.phone,
        email: form.email,
        address: form.address,
      });

      toast.success("تم التسجيل وتأكيد الطلب");
      cart.clear();
      setStep("tracking");
    } catch (e: any) {
      toast.error(e.message || "تعذر التسجيل");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-10 mb-16 rounded-2xl border bg-card shadow-card overflow-hidden">
      {/* Cart panel */}
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h2 className="text-lg md:text-xl font-extrabold">سلتك من هذا المكان ({count})</h2>
          <Button variant="ghost" size="sm" className="ms-auto text-destructive" onClick={() => placeItems.forEach((i) => cart.remove(i.id))}>
            إفراغ
          </Button>
        </div>
        <div className="space-y-2">
          {placeItems.map((it) => (
            <div key={it.id} className="flex items-center gap-3 rounded-xl border p-2">
              {it.image ? <img src={it.image} className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-muted" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{it.name}</div>
                <div className="text-xs text-muted-foreground tabular-nums">{it.price} {it.currency}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => cart.setQty(it.id, it.qty - 1)}><Minus className="h-3 w-3" /></Button>
                <span className="w-6 text-center text-sm tabular-nums">{it.qty}</span>
                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => cart.setQty(it.id, it.qty + 1)}><Plus className="h-3 w-3" /></Button>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => cart.remove(it.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-muted-foreground">المجموع</span>
          <span className="text-xl font-extrabold tabular-nums">{total.toFixed(2)} {currency}</span>
        </div>
        {step === "cart" && (
          <Button className="w-full mt-4 gap-2" size="lg" onClick={onConfirm}>
            <CheckCircle2 className="h-5 w-5" /> تأكيد الطلب
          </Button>
        )}
      </div>

      {/* Register panel (inline) */}
      {step === "register" && !authed && (
        <div className="border-t p-5 md:p-6 bg-muted/30 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">معلومات التسجيل</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>الاسم الكامل</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <Label>الهاتف</Label>
              <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>كلمة المرور</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>عنوان التوصيل</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <Button
            className="w-full mt-4 gap-2"
            size="lg"
            disabled={busy || !form.full_name || !form.email || !form.password || !form.phone}
            onClick={onRegister}
          >
            <UserPlus className="h-5 w-5" /> {busy ? "جارٍ التسجيل..." : "تسجيل"}
          </Button>
        </div>
      )}

      {/* Tracking panel (inline) */}
      {step === "tracking" && (
        <div className="border-t p-5 md:p-6 bg-muted/30 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">تتبع الطلب</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">تم تأكيد طلبك. تابع حالة التوصيل أدناه:</p>
          <div className="rounded-xl overflow-hidden border bg-background">
            <iframe
              src={TRACKING_URL}
              title="تتبع الطلب"
              className="w-full h-[480px]"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
          <a href={TRACKING_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary text-sm mt-3 hover:underline">
            فتح في نافذة جديدة <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </section>
  );
}
