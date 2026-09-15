# گزارش فنی مرجع و نقطه ادامه پروژه Shohada-app / GolzarStone

> این فایل مرجع اصلی ادامه پروژه است. در هر گفت‌وگوی جدید ابتدا این فایل خوانده شود و سپس وضعیت زنده GitHub / GitHub Pages / Vercel / Supabase با آن تطبیق داده شود.

**آخرین به‌روزرسانی:** 2026-09-15 — انتشار نسخه نهایی
**مخزن:** `forog1980-star/Shohada-app`
**نسخه عملیاتی نهایی:** `main`
**Commit نهایی فعلی:** `bdc91f692877467972ae4111fac7ff60fbbe43bd`

---

## 1. پروتکل اجباری پروژه

**Recovery/Backup → Diagnose/Check → Minimal Change → Recheck → Technical Test → Deployment/Version Check → Practical User Test → Final Confirmation**

- `main` محل آزمایش و خطا نیست.
- Force reset / force push روی `main` ممنوع است.
- قبل از تغییر مهم Recovery Point ایجاد شود.
- Supabase در تغییرات QA/Release بدون نیاز عملیاتی، read-only بماند.
- Secret و Service Role Key در مستندات ثبت نشود.
- کد، تست فنی، Deploy و تست عملی کاربر وضعیت‌های جدا هستند.

---

## 2. QA عملی تأییدشده

در جلسه 2026-09-14 کاربر موارد اصلی را عملی تست کرد و PASS اعلام شد:

- Exact Search
- تفکیک `نتایج دقیق جستجو` و `نتایج مشابه`
- جستجوی قطعه/ردیف/شماره
- Detail → Back و حفظ فیلترها/نتایج
- Excel Export
- حذف `نام پدر` از Excel
- حفظ ستون‌های تاریخ آخرین ویرایش و توضیحات ویرایش

نمونه‌های QA:
- نام/نام خانوادگی: ۹ دقیق + ۵ مشابه
- قطعه ۲۸: ۴۸۴ دقیق
- قطعه ۲۸ + ردیف ۱۰: ۴ دقیق + ۴۵ مشابه
- قطعه ۲۸ + ردیف ۱۰ + شماره ۱: صفر دقیق + ۲۰ مشابه
- قطعه ۲۸ + ردیف ۱۰ + شماره ۲۰: ۲ دقیق + ۱ مشابه
- ردیف ۱۰ از ردیف ۱۰۱ به‌درستی تفکیک شد.

خروجی Excel نیز عملی بررسی شد و `نام پدر` در آن وجود نداشت.

---

## 3. Integration نهایی با main

Recovery قبل از Integration:
`recovery/main-before-integration-20260915`

مبنای Recovery:
`7bd5083a3ddaa7ded6f5d497837b1ea787222fc1`

QA تأییدشده:
`cf8a1c67efc4f29544a8086a00ade42f2ddc18a7`

Integration commit:
`a1d985aa1ad8fa4dc6df4921b6701fc959aaa268`

PR نهایی:
`#23`

Merge commit:
`8f9f80c92c2229afd22422c82838fbca3313abae`

PR با موفقیت merge شد و `main` اکنون نسخه یکپارچه را دارد. `main` به QA reset یا force-push نشده است.

Recovery بعد از Integration و قبل از اصلاح Release Pages:
`recovery/main-before-pages-release-20260915`

---

## 4. GitHub Pages — PASS نهایی

URL نهایی برای استفاده:
`https://forog1980-star.github.io/Shohada-app/`

Workflow نهایی از `main` نیز فعال شد.

Run نهایی:
`34943150552`

Job:
`104296262549`

Commit مستقر در این Deploy:
`bdc91f692877467972ae4111fac7ff60fbbe43bd`

نتیجه:
`success`

مراحل checkout، validation `frontend/index.html`، configure Pages، upload artifact و deploy همگی موفق شدند.

---

## 5. Vercel

برای commit Integration:
`a1d985aa1ad8fa4dc6df4921b6701fc959aaa268`

هر دو Check ثبت‌شده موفق بودند:
- `Vercel – shohada-app-v2-pwa`: success
- `Vercel – shohada-app`: success

این Checkها موفقیت استقرار/Build را نشان می‌دهند؛ مرجع نهایی قابل ارائه به نیروها GitHub Pages است.

---

## 6. Supabase

Project: `Shohada-app`
Ref: `bafrksgdcmglahyrppfy`
Status بررسی‌شده: `ACTIVE_HEALTHY`
Postgres: `17.6`

آخرین بررسی read-only ثبت‌شده:
- `martyrs`: 2762 rows، max id = 12558
- `new_martyr_registrations`: 0 rows
- RLS فعال است.

در فرآیند QA و Release اخیر هیچ Supabase write یا schema change انجام نشد.

هشدارهای Security Advisor درباره policyهای عمومی `martyrs` و leaked password protection عمداً دست‌نخورده مانده‌اند و باید در پروژه امنیتی جداگانه بررسی شوند.

---

## 7. معماری و نقطه اتصال

`frontend/index.html` نقطه اتصال مرکزی است و باید پایدار بماند.

مسیر اصلی:
`GitHub Pages → frontend/index.html → master-loader.js → app.js + modules → Supabase`

Loader/ماژول‌های مهم شامل stage-definition، final-qa-fix، navigation، pagination، export، exact search، runtime، back/restore، exact-group و statistics هستند.

All Martyrs نیز در `frontend/all-martyrs/` و داده‌های آن در `AllMartyrsData/` قرار دارد.

---

## 8. Exact Search و Excel

`frontend/search-exact-group-fix.js`:
- normalize متن
- exact match برای name / lastname / piece / grave_row / grave_number / stone_type
- خواندن Supabase در pageهای 1000تایی
- حداکثر 100 page
- de-duplicate بر اساس id
- نمایش exact قبل از similar
- هماهنگ با Detail → Back
- بدون schema/data write

`search-export-fix.js`:
- خروجی متناسب با فیلدهای فعلی فرم
- حذف عمدی `نام پدر`
- cache-busting: `search-export-fix.js?v=20260914-02`

---

## 9. Stage Definition — منبع رسمی

فقط `frontend/stage-definition.js` و متن برنامه منبع رسمی عنوان مراحل هستند.

ترمیمی:
1. `طرح سنگ به واحد مرمت ارسال شد`
2. `سنگ مرمتی آماده است`
3. `نصب سنگ مرمت شده`

تعویضی:
1. `طرح سنگ به واحد تعویض ارسال شد`
2. `سنگ تعویضی آماده است`
3. `سنگ تعویضی نصب شد`

---

## 10. Recoveryهای اصلی

- `recovery/qa-before-pages-fix-20260914`
- `recovery/qa-before-pages-environment-fix-20260914`
- `recovery/qa-final-practical-pass-20260914`
- `recovery/main-before-final-merge-20260914`
- `recovery/main-before-integration-20260915`
- `recovery/main-before-pages-release-20260915`

این Recoveryها تا تثبیت نهایی و تأیید بهره‌برداری حفظ شوند.

---

## 11. وضعیت نهایی انتشار

**QA عملی:** PASS

**Integration با main:** PASS

**GitHub Pages Deploy از main:** PASS

**Vercel checks:** PASS

**Supabase:** بدون تغییر

**main:** نسخه نهایی منتشرشده

**لینک نهایی:**
`https://forog1980-star.github.io/Shohada-app/`

### نقطه پایان این مرحله
نسخه نهایی سامانه در `main` قرار گرفت و GitHub Pages از `main` با موفقیت Deploy شد.

### نقطه شروع بعدی
فقط در صورت درخواست توسعه جدید:
`Request → Recovery → Diagnose → Branch → Change → Technical Test → Deploy → Practical Test`

**از این نقطه به بعد، تغییر جدید روی نسخه منتشرشده فقط با درخواست مشخص و Recovery انجام شود.**
