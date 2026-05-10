// Generate a sample menu for static restaurants from hn-restaurants.
// Items are not persisted; they are used inline to populate the cart.

export type SampleItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  category_name: string;
};

const FOOD_BY_CAT: Record<string, { name: string; price: number; img: string; desc: string }[]> = {
  "مطاعم": [
    { name: "طاجين لحم بالخوخ", price: 75, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600", desc: "طاجين تقليدي بلحم العجل والخوخ والبصل" },
    { name: "كسكس بالخضر", price: 60, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600", desc: "كسكس مغربي بلحم الغنم والخضروات الطازجة" },
    { name: "بسطيلة دجاج", price: 80, img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600", desc: "بسطيلة محشوة بالدجاج واللوز" },
    { name: "سلطة مغربية", price: 25, img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600", desc: "طماطم، خيار، فلفل، زيتون" },
    { name: "حلوى الكعب الغزال", price: 20, img: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600", desc: "حلوى مغربية تقليدية باللوز" },
  ],
  "مخبزات": [
    { name: "خبز فرنسي تقليدي", price: 8, img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", desc: "باغيت طازج" },
    { name: "كرواسون بالزبدة", price: 10, img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600", desc: "كرواسون فرنسي بالزبدة" },
    { name: "بان أو شوكولا", price: 12, img: "https://images.unsplash.com/photo-1623334044303-241021148842?w=600", desc: "بقشة بقطع الشوكولا" },
    { name: "كيكة الفواكه", price: 35, img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600", desc: "كيكة طازجة بالفواكه الموسمية" },
  ],
  "صيدليات": [
    { name: "دواء مسكن (باراسيتامول)", price: 18, img: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600", desc: "علبة 16 قرص 500mg" },
    { name: "فيتامين C فوار", price: 35, img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600", desc: "20 قرص فوار" },
    { name: "كمامات طبية (50)", price: 25, img: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600", desc: "علبة من 50 كمامة" },
  ],
  "مقاهي": [
    { name: "قهوة نسكافيه", price: 12, img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600", desc: "قهوة كلاسيكية ساخنة" },
    { name: "قهوة كابتشينو", price: 18, img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600", desc: "كابتشينو كريمي" },
    { name: "شاي بالنعناع", price: 10, img: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600", desc: "شاي مغربي تقليدي" },
    { name: "عصير برتقال طازج", price: 15, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600", desc: "عصير طبيعي 100%" },
  ],
};

const DEFAULT_ITEMS = FOOD_BY_CAT["مطاعم"];

// Stable UUID v5-like generator from string (deterministic per restaurant)
export function stableUUID(input: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  const a = hex(h1);
  const b = hex(h2);
  // Format as a UUID-shaped string
  return `${a.slice(0, 8)}-${a.slice(0, 4)}-4${b.slice(1, 4)}-8${b.slice(4, 7)}-${b}${a.slice(0, 4)}`;
}

export function getSampleMenu(restaurantName: string, category: string): SampleItem[] {
  const items = FOOD_BY_CAT[category] || DEFAULT_ITEMS;
  return items.map((it, i) => ({
    id: stableUUID(`${restaurantName}-${it.name}-${i}`),
    name: it.name,
    description: it.desc,
    price: it.price,
    currency: "MAD",
    image: it.img,
    category_name: category,
  }));
}
