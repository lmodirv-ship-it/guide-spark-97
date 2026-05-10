## نظرة عامة

موقع **دليلك** — دليل أماكن وخدمات متعدد اللغات (AR/FR/EN) مع لوحة تحكم إدارية كاملة، مستوحى من التصميمين المرفوعين.

### ملاحظة تقنية مهمة
Lovable يبني تطبيقات **TypeScript فقط**. لا يمكن تشغيل Python/FastAPI/Scrapy داخل المنصة. سنستخدم البديل المكافئ:

| المطلوب | البديل في Lovable |
|---|---|
| Next.js + TypeScript | TanStack Start + TypeScript |
| FastAPI + Python | Server Functions (`createServerFn`) بـ TypeScript |
| PostgreSQL + Prisma | PostgreSQL عبر Lovable Cloud (Supabase تحت الغطاء) |
| Playwright/Scrapy | استيراد CSV + استدعاء APIs خارجية من Edge Functions |
| AI (تلخيص/اقتراح) | Lovable AI Gateway (Gemini/GPT بدون مفاتيح) |

---

## نطاق الإطلاق المقترح (مرحلتان)

### المرحلة 1 — الواجهة العامة + قاعدة البيانات + المصادقة
1. **تفعيل Lovable Cloud** (PostgreSQL + Auth + Storage).
2. **مخطط قاعدة البيانات** كما حددته:
   - `countries` (id, name_ar/fr/en, code)
   - `cities` (id, country_id, name_ar/fr/en)
   - `categories` (id, slug, name_ar/fr/en, icon, parent_id) — مع 11 فئة رئيسية وفئات فرعية
   - `places` (id, country_id, city_id, category_id, name, phone, email, address, website, lat, lng, description, status, is_featured, created_at, owner_id)
   - `products` (id, place_id, name, description, price, currency, image, is_available)
   - `place_images` (id, place_id, image_url, sort_order)
   - `reviews` (id, place_id, user_id, rating, comment, created_at)
   - `favorites` (id, user_id, place_id)
   - `user_roles` (id, user_id, role: 'admin'|'owner'|'user') — جدول منفصل + RLS
   - `import_jobs` (id, query, country, city, category, status, created_at)
3. **i18n**: ثلاث لغات AR (RTL) + FR + EN عبر `i18next`، مع روابط `/ar/...` `/fr/...` `/en/...`.
4. **الصفحة الرئيسية** (مطابقة للتصميم الأول):
   - Header مع تبديل اللغة + اختيار الدولة + زر "أضف مكانك"
   - Hero بصورة + شريط بحث (نص + مدينة + تصنيف + فرز)
   - شبكة الفئات (11 فئة بأيقونات وعدّاد)
   - "أفضل الأماكن القريبة منك" (Carousel)
   - بطاقة تطبيق الجوال + بطاقة تصفية البحث + خريطة
   - قسم المميزات (تقييمات حقيقية، دعم 24/7، ...)
5. **صفحات إضافية**:
   - `/[lang]/categories/$slug` — قائمة الأماكن في الفئة
   - `/[lang]/places/$id` — تفاصيل المكان (صور، خريطة، تقييمات، منتجات، أوقات العمل)
   - `/[lang]/cities/$slug` — أماكن المدينة
   - `/[lang]/search` — بحث متقدم مع فلاتر URL
   - `/[lang]/login` `/[lang]/signup` — مصادقة
   - `/[lang]/favorites` — المفضلة
   - `/[lang]/add-place` — نموذج إضافة مكان للمستخدمين
6. **البحث**: Server Function تستخدم `ilike` + `tsvector` على PostgreSQL.

### المرحلة 2 — لوحة التحكم الإدارية (مطابقة للتصميم الثاني)
- `/admin` محمية بدور `admin`
- KPIs (إجمالي الأماكن، المستخدمين، الطلبات، الدول، الإيرادات)
- مخططات (Recharts): الأماكن المضافة شهرياً، Donut حسب التصنيف، شريط حسب المدينة
- جدول CRUD لـ: الأماكن، الفئات، المدن/الدول، المنتجات، التقييمات، المستخدمين، الإعلانات
- استيراد CSV للأماكن
- إعدادات + اشتراكات

---

## البنية التقنية

```text
src/
├── routes/
│   ├── __root.tsx              (Header + Footer + i18n provider + RTL)
│   ├── $lang/
│   │   ├── index.tsx           (Home)
│   │   ├── categories.$slug.tsx
│   │   ├── places.$id.tsx
│   │   ├── search.tsx          (validateSearch + URL filters)
│   │   ├── login.tsx / signup.tsx
│   │   └── favorites.tsx
│   └── admin/                  (محمية بـ requireSupabaseAuth + role check)
│       ├── index.tsx           (Dashboard)
│       ├── places.tsx
│       ├── categories.tsx
│       ├── cities.tsx
│       └── users.tsx
├── lib/
│   ├── places.functions.ts     (createServerFn: list/get/search/create)
│   ├── reviews.functions.ts
│   ├── admin.functions.ts
│   └── i18n.ts
└── components/
    ├── PlaceCard, CategoryGrid, SearchBar, MapView, ReviewList, ...
    └── admin/ (KPICard, DataTable, Charts...)
```

### نظام التصميم
- ألوان مستوحاة من التصميم: أخضر primary `oklch(~0.62 0.17 155)`، خلفية بيضاء، رمادي ناعم
- خط: **Cairo** للعربية + **Inter** للاتيني
- جميع الألوان كـ semantic tokens في `src/styles.css`
- دعم RTL تلقائي عند `lang=ar`

### المكتبات المضافة
- `i18next` + `react-i18next` — تعدد اللغات
- `react-leaflet` — الخرائط
- `recharts` (موجود) — مخططات الأدمن
- `@tanstack/zod-adapter` — validation للـ search params

---

## ما لن نبنيه الآن
- تطبيق Android/iOS (الموقع يعمل كـ PWA متجاوب)
- بوابات الدفع والاشتراكات (مرحلة لاحقة عبر Stripe)
- Crawler تلقائي بـ Playwright (نستبدله باستيراد CSV + Google Places API لاحقاً)
- ميزات AI (تلخيص التقييمات، اقتراح أماكن) — تُضاف بعد استقرار MVP

---

## خطوات التنفيذ بالترتيب
1. تفعيل Lovable Cloud + إنشاء جميع الجداول + RLS + بيانات تجريبية (المغرب + 6 مدن + 11 فئة + ~30 مكان)
2. إعداد i18n + RTL + نظام التصميم (ألوان + خطوط)
3. الصفحة الرئيسية كاملة بتصميم مطابق للصورة الأولى
4. صفحات الفئة / تفاصيل المكان / البحث
5. المصادقة + المفضلة + إضافة مكان
6. لوحة التحكم الإدارية بتصميم الصورة الثانية