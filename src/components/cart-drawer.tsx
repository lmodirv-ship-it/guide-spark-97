import { useState } from "react";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCart, cart, cartCount, cartTotal } from "@/lib/cart-store";
import { toast } from "sonner";

export function CartDrawer() {
  const items = useCart();
  const [open, setOpen] = useState(false);
  const count = cartCount(items);
  const total = cartTotal(items);
  const currency = items[0]?.currency ?? "MAD";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <Badge className="absolute -top-1 -end-1 h-5 min-w-5 rounded-full p-0 px-1 flex items-center justify-center text-[10px]">
              {count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>سلة المشتريات ({count})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 mt-4 space-y-3">
          {items.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-40" />
              السلة فارغة
            </div>
          )}
          {items.map((it) => (
            <div key={it.id} className="flex gap-3 rounded-xl border p-3">
              {it.image ? (
                <img src={it.image} className="h-16 w-16 rounded-lg object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{it.name}</div>
                {it.place_name && <div className="text-xs text-muted-foreground truncate">{it.place_name}</div>}
                <div className="text-sm tabular-nums mt-1">
                  {it.price} {it.currency}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => cart.setQty(it.id, it.qty - 1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm tabular-nums">{it.qty}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => cart.setQty(it.id, it.qty + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => cart.remove(it.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">المجموع</span>
              <span className="text-xl font-extrabold tabular-nums">
                {total.toFixed(2)} {currency}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => cart.clear()}>إفراغ</Button>
              <Button className="flex-1" onClick={() => { toast.success("تم تأكيد الطلب (تجريبي)"); cart.clear(); setOpen(false); }}>
                إتمام الطلب
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
