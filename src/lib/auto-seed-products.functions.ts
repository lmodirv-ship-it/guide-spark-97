import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Item = { name: string; description: string; price: number; category_name: string; image: string };

const RESTAURANT_MENU: Item[] = [
  { category_name: "المقبلات", name: "سلطة مغربية", description: "طماطم، خيار، فلفل، بصل وزيت زيتون", price: 35, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" },
  { category_name: "المقبلات", name: "بريوات بالجبن", description: "بريوات مقرمشة محشوة بالجبن", price: 45, image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=800" },
  { category_name: "المقبلات", name: "حريرة مغربية", description: "شوربة مغربية تقليدية", price: 30, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800" },
  { category_name: "الأطباق الرئيسية", name: "طاجين لحم بالبرقوق", description: "طاجين لحم العجل مع البرقوق واللوز", price: 120, image: "https://images.unsplash.com/photo-1535400875775-0fcce71f59cb?w=800" },
  { category_name: "الأطباق الرئيسية", name: "طاجين دجاج بالليمون", description: "دجاج بالليمون المخلل والزيتون", price: 95, image: "https://images.unsplash.com/photo-1604908554027-9d6f76e2cdc4?w=800" },
  { category_name: "الأطباق الرئيسية", name: "كسكس الجمعة", description: "كسكس بسبع خضر ولحم العجل", price: 110, image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800" },
  { category_name: "الأطباق الرئيسية", name: "بسطيلة دجاج", description: "بسطيلة بالدجاج واللوز والقرفة", price: 130, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800" },
  { category_name: "البيتزا والساندويتش", name: "بيتزا مارغريتا", description: "صلصة طماطم، موزاريلا، ريحان", price: 70, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800" },
  { category_name: "البيتزا والساندويتش", name: "بيتزا أربعة أجبان", description: "موزاريلا، شيدر، بارميزان، جبن أزرق", price: 90, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" },
  { category_name: "البيتزا والساندويتش", name: "برغر لحم", description: "برغر بقري مع جبن شيدر وبطاطا", price: 75, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" },
  { category_name: "المشروبات", name: "أتاي بالنعناع", description: "الشاي الأخضر بالنعناع المغربي", price: 15, image: "https://images.unsplash.com/photo-1597318236127-0d2c8e9c5b1d?w=800" },
  { category_name: "المشروبات", name: "عصير برتقال طازج", description: "برتقال طبيعي معصور لحظيًا", price: 25, image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800" },
  { category_name: "المشروبات", name: "قهوة نص نص", description: "قهوة بالحليب على الطريقة المغربية", price: 18, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800" },
  { category_name: "الحلويات", name: "كعب الغزال", description: "حلويات مغربية باللوز", price: 35, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800" },
  { category_name: "الحلويات", name: "تشيز كيك", description: "تشيز كيك بالفراولة", price: 45, image: "https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=800" },
];

const CAFE_MENU: Item[] = [
  { category_name: "القهوة", name: "إسبريسو", description: "قهوة مركزة", price: 12, image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800" },
  { category_name: "القهوة", name: "كابتشينو", description: "إسبريسو مع رغوة الحليب", price: 22, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800" },
  { category_name: "القهوة", name: "لاتيه", description: "قهوة بالحليب", price: 25, image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=800" },
  { category_name: "المشروبات الباردة", name: "آيس لاتيه", description: "لاتيه مثلج", price: 30, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800" },
  { category_name: "المشروبات الباردة", name: "عصير ليمون بالنعناع", description: "منعش وطبيعي", price: 25, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800" },
  { category_name: "الحلويات", name: "كرواسون", description: "كرواسون بالزبدة", price: 18, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800" },
  { category_name: "الحلويات", name: "ماكرون", description: "ماكرون فرنسي بنكهات متنوعة", price: 28, image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=800" },
];

const PHARMACY_MENU: Item[] = [
  { category_name: "أدوية بدون وصفة", name: "دوليبران 1000mg", description: "مسكن للألم وخافض للحرارة", price: 18, image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800" },
  { category_name: "أدوية بدون وصفة", name: "إيبوبروفين 400mg", description: "مضاد للالتهاب", price: 22, image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800" },
  { category_name: "العناية بالبشرة", name: "كريم مرطب", description: "للبشرة الجافة", price: 85, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800" },
  { category_name: "العناية بالبشرة", name: "واقي شمس SPF 50", description: "حماية عالية من الشمس", price: 120, image: "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=800" },
  { category_name: "الفيتامينات", name: "فيتامين C 1000mg", description: "مكمل غذائي", price: 60, image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=800" },
];

const HOTEL_MENU: Item[] = [
  { category_name: "غرف", name: "غرفة فردية", description: "غرفة بسرير واحد، إفطار مجاني", price: 350, image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800" },
  { category_name: "غرف", name: "غرفة مزدوجة", description: "غرفة بسرير مزدوج، إطلالة بحرية", price: 550, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800" },
  { category_name: "غرف", name: "جناح عائلي", description: "غرفتان، صالة، مطبخ صغير", price: 950, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800" },
  { category_name: "غرف", name: "جناح ملكي", description: "جاكوزي، خدمة الغرف 24/7", price: 1800, image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800" },
];

const SHOP_MENU: Item[] = [
  { category_name: "منتجات مميزة", name: "منتج رقم 1", description: "وصف المنتج", price: 99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
  { category_name: "منتجات مميزة", name: "منتج رقم 2", description: "وصف المنتج", price: 149, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" },
  { category_name: "منتجات مميزة", name: "منتج رقم 3", description: "وصف المنتج", price: 199, image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800" },
];

function pickMenu(slug: string, nameAr: string, nameEn: string): Item[] {
  const hay = `${slug} ${nameAr} ${nameEn}`.toLowerCase();
  if (/hotel|riad|lodging|فندق|نزل|رياض/.test(hay)) return HOTEL_MENU;
  if (/cafe|coffee|مقهى|قهوة/.test(hay)) return CAFE_MENU;
  if (/pharma|صيدلية|دواء/.test(hay)) return PHARMACY_MENU;
  if (/restau|food|مطعم|طعام|أكل/.test(hay)) return RESTAURANT_MENU;
  if (/shop|store|market|متجر|محل|سوق/.test(hay)) return SHOP_MENU;
  return RESTAURANT_MENU;
}

export const autoSeedProducts = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { placeId: string })
  .handler(async ({ data }) => {
    const { placeId } = data;
    // Skip if products already exist
    const { count } = await supabaseAdmin
      .from("products")
      .select("id", { head: true, count: "exact" })
      .eq("place_id", placeId);
    if ((count ?? 0) > 0) return { inserted: 0, skipped: true };

    const { data: place } = await supabaseAdmin
      .from("places")
      .select("id, category:categories(slug, name_ar, name_en)")
      .eq("id", placeId)
      .single();
    if (!place) return { inserted: 0, skipped: true };

    const cat: any = (place as any).category ?? {};
    const items = pickMenu(cat.slug ?? "", cat.name_ar ?? "", cat.name_en ?? "");

    const rows = items.map((it, idx) => ({
      place_id: placeId,
      name: it.name,
      description: it.description,
      price: it.price,
      currency: "MAD",
      image: it.image,
      category_name: it.category_name,
      sort_order: idx,
      is_available: true,
    }));

    const { error } = await supabaseAdmin.from("products").insert(rows);
    if (error) return { inserted: 0, skipped: false, error: error.message };
    return { inserted: rows.length, skipped: false };
  });
