import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";

type Props = {
  placeId: string;
  placeName?: string;
  nightlyPrice?: number | null;
  currency?: string | null;
  productId?: string | null;
  trigger?: React.ReactNode;
};

export function ReservationDialog({ placeId, placeName, nightlyPrice, currency, productId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [form, setForm] = useState({
    guest_name: "", guest_phone: "", guest_email: "",
    check_in: today, check_out: tomorrow, guests: 1, rooms: 1, notes: "",
  });

  const nights = useMemo(() => {
    const a = new Date(form.check_in).getTime();
    const b = new Date(form.check_out).getTime();
    return Math.max(1, Math.round((b - a) / 86400000));
  }, [form.check_in, form.check_out]);

  const total = nightlyPrice ? Number(nightlyPrice) * nights * Number(form.rooms || 1) : null;

  const submit = async () => {
    if (!form.guest_name || !form.guest_phone) {
      toast.error("الاسم والهاتف مطلوبان");
      return;
    }
    if (nights < 1) {
      toast.error("تواريخ غير صحيحة");
      return;
    }
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("reservations").insert({
      place_id: placeId,
      product_id: productId ?? null,
      user_id: auth.user?.id ?? null,
      guest_name: form.guest_name,
      guest_phone: form.guest_phone,
      guest_email: form.guest_email || null,
      check_in: form.check_in,
      check_out: form.check_out,
      guests: Number(form.guests) || 1,
      rooms: Number(form.rooms) || 1,
      nightly_price: nightlyPrice ?? null,
      total_price: total,
      currency: currency || "MAD",
      notes: form.notes || null,
    });
    setLoading(false);
    if (error) { toast.error("تعذر إرسال الطلب: " + error.message); return; }
    toast.success("تم إرسال طلب الحجز بنجاح");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1"><CalendarCheck className="h-4 w-4" /> احجز</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>طلب حجز{placeName ? ` — ${placeName}` : ""}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>تاريخ الدخول</Label><Input type="date" value={form.check_in} min={today} onChange={(e) => setForm({ ...form, check_in: e.target.value })} /></div>
            <div><Label>تاريخ الخروج</Label><Input type="date" value={form.check_out} min={form.check_in} onChange={(e) => setForm({ ...form, check_out: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>عدد النزلاء</Label><Input type="number" min={1} value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} /></div>
            <div><Label>عدد الغرف</Label><Input type="number" min={1} value={form.rooms} onChange={(e) => setForm({ ...form, rooms: Number(e.target.value) })} /></div>
          </div>
          <div><Label>الاسم الكامل *</Label><Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>الهاتف *</Label><Input value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} /></div>
            <div><Label>البريد</Label><Input type="email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} /></div>
          </div>
          <div><Label>ملاحظات</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          {nightlyPrice ? (
            <div className="rounded-lg bg-muted p-3 text-sm flex items-center justify-between">
              <span>{nightlyPrice} {currency || "MAD"} × {nights} ليلة × {form.rooms} غرفة</span>
              <span className="font-extrabold text-primary">{total} {currency || "MAD"}</span>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={submit} disabled={loading}>{loading ? "جارٍ الإرسال..." : "تأكيد الطلب"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
