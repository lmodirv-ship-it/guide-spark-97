import { useSyncExternalStore } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image?: string | null;
  place_id: string;
  place_name?: string;
  qty: number;
};

const KEY = "dalilik-cart-v1";
let items: CartItem[] = [];
const listeners = new Set<() => void>();

const isBrowser = typeof window !== "undefined";

if (isBrowser) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
  } catch {}
}

const persist = () => {
  if (isBrowser) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }
  listeners.forEach((l) => l());
};

export const cart = {
  get: () => items,
  add(p: Omit<CartItem, "qty">, qty = 1) {
    const i = items.findIndex((x) => x.id === p.id);
    if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + qty };
    else items = [...items, { ...p, qty }];
    persist();
  },
  setQty(id: string, qty: number) {
    if (qty <= 0) items = items.filter((x) => x.id !== id);
    else items = items.map((x) => (x.id === id ? { ...x, qty } : x));
    persist();
  },
  remove(id: string) {
    items = items.filter((x) => x.id !== id);
    persist();
  },
  clear() { items = []; persist(); },
  subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); },
};

const emptySnapshot: CartItem[] = [];

export function useCart() {
  return useSyncExternalStore(
    (cb) => cart.subscribe(cb),
    () => items,
    () => emptySnapshot,
  );
}

export const cartTotal = (xs: CartItem[]) =>
  xs.reduce((s, x) => s + (Number(x.price) || 0) * x.qty, 0);

export const cartCount = (xs: CartItem[]) => xs.reduce((s, x) => s + x.qty, 0);
