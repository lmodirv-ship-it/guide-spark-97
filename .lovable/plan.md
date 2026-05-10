## الهدف
إضافة معرّف تلقائي فريد بصيغة `A` + 6 أرقام (مثل `A111111`) لكل من **الأماكن، المستخدمين، والمنتجات**، مع صفحة جديدة في لوحة التحكم لعرضها وإدارتها، وصفحة عمومية لكل معرّف.

---

## 1) قاعدة البيانات (Migration)

إضافة عمود `public_id TEXT UNIQUE` إلى الجداول الثلاثة:
- `places.public_id`
- `profiles.public_id`
- `products.public_id`

**التوليد التلقائي:**
- إنشاء دالة `generate_public_id()` في PostgreSQL تُرجع `'A' || lpad(floor(random()*1000000)::text, 6, '0')` مع التحقق من عدم التكرار (loop حتى يكون فريداً).
- إنشاء **Trigger** `BEFORE INSERT` على كل جدول يضع `public_id` تلقائياً إن كان فارغاً.
- **Backfill**: تحديث جميع السجلات الموجودة لإعطائها معرّفات.

**فهارس:** `CREATE UNIQUE INDEX` على كل عمود `public_id`.

---

## 2) صفحة جديدة في لوحة التحكم: `/admin/ids`

- إضافة رابط في `admin-sidebar.tsx` بعنوان **"المعرّفات (IDs)"**.
- ملف جديد: `src/routes/admin.ids.tsx`.
- يعرض 3 تبويبات (Tabs): **الأماكن / المستخدمون / المنتجات**.
- جدول لكل تبويب يعرض: `public_id`, الاسم, تاريخ الإنشاء, زر نسخ, زر "فتح الصفحة".
- شريط بحث بالـ ID أو الاسم.

---

## 3) صفحة عمومية لكل معرّف: `/id/$publicId`

- ملف جديد: `src/routes/id.$publicId.tsx`.
- يبحث في الجداول الثلاثة عن السجل المطابق ويعرض تفاصيله، أو يعيد التوجيه إلى صفحة العنصر الأصلية (مثل `/places/$id`).

---

## 4) عرض المعرّف في الواجهات الموجودة

- إظهار `public_id` بجانب الاسم في:
  - `/admin/places` (قائمة الأماكن)
  - `/admin/users` (قائمة المستخدمين)
  - `/admin/products` (قائمة المنتجات)
- مع زر نسخ سريع.

---

## تفاصيل تقنية

```sql
-- مثال للدالة
CREATE OR REPLACE FUNCTION generate_public_id(table_name text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE new_id text; exists_count int;
BEGIN
  LOOP
    new_id := 'A' || lpad(floor(random()*1000000)::text, 6, '0');
    EXECUTE format('SELECT count(*) FROM %I WHERE public_id = $1', table_name)
      INTO exists_count USING new_id;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN new_id;
END $$;
```

---

## الملفات المتأثرة
- migration جديدة (إضافة الأعمدة + الدالة + الـ triggers + backfill)
- `src/routes/admin.ids.tsx` *(جديد)*
- `src/routes/id.$publicId.tsx` *(جديد)*
- `src/components/admin/admin-sidebar.tsx` *(تعديل)*
- `src/routes/admin.places.index.tsx` / `admin.users.tsx` / `admin.products.tsx` *(عرض المعرّف)*