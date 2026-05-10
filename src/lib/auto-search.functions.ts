import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  kind: z.enum(["places", "cities", "countries", "categories", "products"]),
  query: z.string().min(1).max(300),
  context: z.string().max(500).optional(),
});

const FIELD_HINTS: Record<string, string> = {
  places: "name, category, country, city, address, phone, email, website, description, latitude, longitude",
  cities: "name_ar, name_fr, name_en, country (الاسم بالعربية), latitude, longitude",
  countries: "code (ISO2), name_ar, name_fr, name_en, flag_emoji, currency, phone_code",
  categories: "name_ar, name_fr, name_en, icon (lucide-react icon name), color (hex), description",
  products: "name, category_name, price, currency, description, image_keywords",
};

export const runAutoSearch = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { results: [], error: "LOVABLE_API_KEY غير متوفر" };
    }

    const fields = FIELD_HINTS[data.kind];
    const sys = `أنت مساعد بحث أوتوماتيكي. يبحث المستخدم عن بيانات حقيقية حول: "${data.query}".
أعد JSON صالح فقط بهذا الشكل: { "results": [ ... ] } بدون أي شرح.
كل عنصر يجب أن يحتوي على هذه الحقول حصراً (املأ ما تعرفه واترك غير المعروف فارغاً): ${fields}.
أعد بين 8 و 20 نتيجة دقيقة وموثوقة قدر الإمكان.${data.context ? "\nسياق إضافي: " + data.context : ""}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: sys },
            { role: "user", content: data.query },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (res.status === 429) return { results: [], error: "تجاوزت الحد المسموح. حاول لاحقاً." };
      if (res.status === 402) return { results: [], error: "نفدت رصيد الذكاء الاصطناعي." };
      if (!res.ok) return { results: [], error: `فشل الاستدعاء (${res.status})` };

      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(content);
      const results = Array.isArray(parsed?.results) ? parsed.results : [];
      return { results, error: null };
    } catch (e) {
      console.error("auto-search failed", e);
      return { results: [], error: "خطأ أثناء البحث الأوتوماتيكي." };
    }
  });
