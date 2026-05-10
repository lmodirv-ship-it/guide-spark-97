## الهدف
رفع نتائج Lighthouse من (الأداء 47 / SEO 47 / إمكانية الوصول 82) إلى نطاق 90+ عبر معالجة الأسباب الجذرية الظاهرة في التقرير.

## المشاكل الأساسية المكتشفة

1. **شعارات ضخمة جدًا**: `logo-ar.png` (631KB) و `logo-en.png` (534KB) تُعرَض بحجم 77×77 فقط — هدر ~1.1MB.
2. **خلل Hydration**: `__root.tsx` يضع `lang="ar" dir="rtl"`، لكن `SiteHeader` و `BrandLogo` يعتمدان على `i18n.language` على العميل فقط، فتتبدّل الصورة والنص بعد التحميل ⇒ خطأ React #418 + اضطراب CLS + إرباك Googlebot (يرى صفحة `lang="en"` مع محتوى عربي ⇒ SEO 47).
3. **صورة LCP (hero.jpg 231KB)** بدون `fetchpriority="high"` و بدون WebP.
4. **صور Unsplash** بدون `&fm=webp&q=70` — ~250KB إضافية.
5. **CLS 0.113** من بطاقات الفئات بدون أبعاد ثابتة + الصور بدون `width/height`.
6. **إمكانية الوصول**: أزرار أيقونية (Bell، Heart، Cart، User) بدون `aria-label`؛ روابط `/favorites` و `/add-place` بلا نص؛ غياب `<main>` landmark؛ تباين منخفض على زر "Search" وزر تحميل APK.
7. **مساحات لمس صغيرة** على رابط "مدونة".
8. **خط CameraPlay** من `cdn.gpteng.co` (131KB) بدون `font-display: swap` ولا `preconnect`.

## الإصلاحات المقترحة

### 1) تصغير الصور (أكبر مكسب أداء)
- استبدال `logo-ar.png` و `logo-en.png` بنسخ WebP ≤ 256×256 وحجم ~10-15KB لكل واحدة، عبر `nix run nixpkgs#libwebp`.
- تحويل `hero.jpg` إلى WebP بجودة 70 (~50KB) مع الإبقاء على JPG للنسخ الاحتياطي.
- إضافة `fetchPriority="high"` و `loading="eager"` على صورة الـ hero.
- إضافة معامل `&fm=webp&q=70` لجميع روابط Unsplash في `src/lib/hn-restaurants.ts` ومكونات بطاقات الأماكن.

### 2) إصلاح Hydration وعدم تطابق اللغة
- جعل `<html lang dir>` يُحدَّد ديناميكيًا من جلسة/كوكي على الخادم بدل قيمة ثابتة، أو — أبسط — تثبيت `lang="ar" dir="rtl"` بصفة افتراضية و **عدم تغيير الشعار حسب i18n على العميل** (استعمال شعار موحّد بدون شرط لغوي، أو إخفاء الشعار حتى الـ mount عبر CSS بدون تبديل JSX).
- في `BrandLogo`: استعمال شعار واحد افتراضي على SSR ثم التبديل بعد `useEffect` فقط إذا اختلفت اللغة (مع `suppressHydrationWarning`).
- في `SiteHeader`: لفّ نص العلامة `{t("brand")}` بـ `suppressHydrationWarning` أو استعمال نص ثابت SSR.

### 3) إمكانية الوصول
- إضافة `aria-label` لكل زر أيقوني (Bell، Heart، Cart، User، حقول الفلترة).
- إضافة `aria-label` لروابط `/favorites` و `/add-place`.
- لفّ المحتوى الرئيسي في كل مسار بـ `<main>` بدل `<div>` الحالي.
- زيادة contrast لزر Search وزر تحميل APK (تعديل tokens في `src/styles.css` أو الكلاس المستعمل).
- زيادة hit area لرابط "مدونة" (إضافة `min-h-11`).

### 4) CLS
- إضافة `width` و `height` على جميع `<img>` في `place-card.tsx` و `category-grid.tsx`.
- ضبط `aspect-ratio` على بطاقات الفئات لمنع القفز.

### 5) SEO إضافي
- إضافة `<link rel="preconnect" href="https://images.unsplash.com">` و `<link rel="preconnect" href="https://snoqwelzpvwdvanritpa.supabase.co">` في `__root.tsx`.
- التأكد أن `lang` للصفحة يطابق المحتوى (عربي).
- إضافة `og:locale="ar_AR"` افتراضيًا.

## الملفات المتأثرة (تقدير)
- `src/assets/logo-ar.png|.webp`, `src/assets/logo-en.png|.webp`, `src/assets/hero.webp` (تحويل + إضافة)
- `src/components/brand-logo.tsx`
- `src/components/site-header.tsx`
- `src/components/place-card.tsx`, `src/components/category-grid.tsx`
- `src/routes/__root.tsx`, `src/routes/index.tsx`
- `src/lib/hn-restaurants.ts`
- `src/styles.css` (تباين)

## النتيجة المتوقعة
- توفير ~1.4MB من الصور ⇒ LCP من 10.4s ⇒ ~2.5s.
- إزالة Hydration error ⇒ CLS من 0.113 ⇒ <0.05.
- SEO من 47 ⇒ 95+ بفضل تطابق اللغة وثبات الـ DOM.
- A11y من 82 ⇒ 95+ بإضافة aria-label و landmarks.
