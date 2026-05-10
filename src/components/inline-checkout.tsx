import { useEffect, useState } from "react";
import { ShoppingCart, Trash2, Minus, Plus, CheckCircle2, UserPlus, Truck, Package, ChefHat, Bike, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart, cart, cartCount, cartTotal } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";



const TRACKING_STEPS = [
  { key: "pending", label: "تم استلام الطلب", icon: CheckCircle2 },
  { key: "preparing", label: "قيد التحضير", icon: ChefHat },
  { key: "on_the_way", label: "في الطريق إليك", icon: Bike },
  { key: "delivered", label: "تم التوصيل", icon: Home },
];

export function InlineCheckout({ placeId }: { placeId: string }) {
  const items = useCart();
  const placeItems = items.filter((i) => i.place_id === placeId);
  const count = cartCount(placeItems);
  const total = cartTotal(placeItems);
  const currency = placeItems[0]?.currency ?? "MAD";

  const [showRegister, setShowRegister] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [authed, setAuthed] = useState<boolean>(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", address: "" });
  const [busy, setBusy] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<{ items: typeof placeItems; total: number; currency: string } | null>(null);

  useEffect(() => {
    if (!showTracking) return;
    setTrackIdx(0);
    const t1 = setTimeout(() => setTrackIdx(1), 1500);
    const t2 = setTimeout(() => setTrackIdx(2), 5000);
    const t3 = setTimeout(() => setTrackIdx(3), 12000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [showTracking]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (placeItems.length === 0 && !showTracking) return null;

  const displayItems = showTracking && snapshot ? snapshot.items : placeItems;
  const displayTotal = showTracking && snapshot ? snapshot.total : total;
  const displayCurrency = showTracking && snapshot ? snapshot.currency : currency;

  const saveOrder = async (userId: string | null, info: { name: string; phone: string; email?: string; address?: string }) => {
    const { data, error } = await supabase.from("orders").insert({
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
    }).select("id").single();
    if (error) throw error;
    setOrderId(data?.id ?? null);
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
        setSnapshot({ items: placeItems, total, currency });
        cart.clear();
        setShowTracking(true);
      } catch (e: any) {
        toast.error(e.message || "تعذر إنشاء الطلب");
      }
    } else {
      setShowRegister(true);
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
      setSnapshot({ items: placeItems, total, currency });
      cart.clear();
      setShowTracking(true);
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
          <h2 className="text-lg md:text-xl font-extrabold">سلتك من هذا المكان ({displayItems.reduce((s, x) => s + x.qty, 0)})</h2>
          {!showTracking && (
            <Button variant="ghost" size="sm" className="ms-auto text-destructive" onClick={() => placeItems.forEach((i) => cart.remove(i.id))}>
              إفراغ
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {displayItems.map((it) => (
            <div key={it.id} className="flex items-center gap-3 rounded-xl border p-2">
              {it.image ? <img src={it.image} className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-muted" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{it.name}</div>
                <div className="text-xs text-muted-foreground tabular-nums">{it.price} {it.currency}</div>
              </div>
              {!showTracking ? (
                <>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => cart.setQty(it.id, it.qty - 1)}><Minus className="h-3 w-3" /></Button>
                    <span className="w-6 text-center text-sm tabular-nums">{it.qty}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => cart.setQty(it.id, it.qty + 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => cart.remove(it.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <span className="text-sm tabular-nums text-muted-foreground">×{it.qty}</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-muted-foreground">المجموع</span>
          <span className="text-xl font-extrabold tabular-nums">{displayTotal.toFixed(2)} {displayCurrency}</span>
        </div>
        {!showRegister && !showTracking && (
          <Button className="w-full mt-4 gap-2" size="lg" onClick={onConfirm}>
            <CheckCircle2 className="h-5 w-5" /> تأكيد الطلب
          </Button>
        )}
      </div>

      {/* Register panel (inline) */}
      {showRegister && !authed && !showTracking && (
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
          <div className="flex items-center gap-2 mb-1">
            <Truck className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">تتبع الطلب</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            تم تأكيد طلبك بنجاح{orderId ? ` — رقم الطلب #${orderId.slice(0, 8).toUpperCase()}` : ""}.
          </p>
          <div className="relative rounded-xl border bg-background p-5">
            <div className="absolute top-10 start-8 end-8 h-1 bg-muted rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${(trackIdx / (TRACKING_STEPS.length - 1)) * 100}%` }}
              />
            </div>
            <div className="relative grid grid-cols-4 gap-2">
              {TRACKING_STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = i <= trackIdx;
                const active = i === trackIdx;
                return (
                  <div key={s.key} className="flex flex-col items-center text-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        done ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted-foreground/30 text-muted-foreground"
                      } ${active ? "scale-110 shadow-elegant ring-4 ring-primary/20" : ""}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`mt-2 text-[11px] sm:text-xs font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>الوقت المتوقع للتوصيل: 25-40 دقيقة</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
