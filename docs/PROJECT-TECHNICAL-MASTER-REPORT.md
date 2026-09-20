# گزارش فنی مرجع و نقطه ادامه پروژه Shohada-app / GolzarStone

> این فایل مرجع اصلی ادامه پروژه است. در هر گفت‌وگوی جدید ابتدا این فایل خوانده شود و سپس وضعیت زنده GitHub / GitHub Pages / Vercel / Supabase با آن تطبیق داده شود.

**آخرین به‌روزرسانی:** 2026-09-20 — تثبیت مدل رسمی QA / main و اصلاحات آمار و ناوبری
**مخزن:** `forog1980-star/Shohada-app`
**نسخه عملیاتی نهایی:** `main`
**Commit فعلی main:** `757dcc1373d3f5761cae08d7bc6c35b0bb6a34ba`

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

Commit مستقر در Deploy تاریخی ثبت‌شده:
`bdc91f692877467972ae4111fac7ff60fbbe43bd`

> این Deploy مربوط به نسخه تاریخی 2026-09-15 است و به معنی Deploy شدن commit فعلی main نیست. وضعیت Deploy فعلی باید جداگانه با Workflow جدید تأیید شود.

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

**GitHub Pages Deploy از main:** نیازمند تأیید Deploy جدید پس از تثبیت Workflow

**Vercel checks:** PASS

**Supabase:** بدون تغییر

**main:** `757dcc1373d3f5761cae08d7bc6c35b0bb6a34ba` — مرجع عملیاتی فعلی

**لینک عملیاتی:**
`https://forog1980-star.github.io/Shohada-app/`

**لینک تست QA:**
`https://shohada-app-git-qa-forog1980-8339.vercel.app/`

تعریف رسمی QA و main در `docs/PROJECT-ENVIRONMENT-AND-LINKS.md` ثبت شده است.

### نقطه پایان این مرحله
نسخه نهایی سامانه در `main` قرار گرفت و GitHub Pages از `main` با موفقیت Deploy شد.

### نقطه شروع بعدی
فقط در صورت درخواست توسعه جدید:
`Request → Recovery → Diagnose → Branch → Change → Technical Test → Deploy → Practical Test`

**از این نقطه به بعد، تغییر جدید روی نسخه منتشرشده فقط با درخواست مشخص و Recovery انجام شود.**


---

## 12. اصلاح همگام‌سازی آمار — 2026-09-19

علت‌های اصلی شناسایی‌شده:
- baseline قدیمی در `statistics-baseline-fix.js`
- انعکاس نادرست UPDATE رکوردهای قدیمی در محاسبه زنده
- نیاز به محاسبه delta برای INSERT / UPDATE / DELETE به جای بارگذاری کامل جدول پس از هر تغییر

baseline عملیاتی تأییدشده:
- کل درخواست‌ها: 3004
- عملیات پیگیری‌شده: 2936
- خارج از تفکیک: 68
- تعویضی: 1736 / انجام‌شده 1397 / باقی‌مانده 339
- ترمیمی: 1200 / انجام‌شده 619 / باقی‌مانده 581
- کل انجام‌شده: 2016
- کل باقی‌مانده: 920

فایل‌های اصلاح‌شده:
- `frontend/statistics.js`
- `frontend/statistics-baseline-fix.js`
- `frontend/statistics-live-calculator.js`
- `frontend/statistics-live-bridge-v2.js`
- `frontend/statistics.html`

تست فنی تغییر وضعیت رکورد موجود از مرحله آماده به مرحله نصب موفق شد و بدون Supabase write انجام شد.

PR مربوطه: `#24` — merge شده در `main`.

---

## 13. اصلاح ناوبری و Back — 2026-09-19/20

مشکل: بازگشت از بخش‌های «مدیریت و بهسازی سنگ مزار» در بعضی مسیرها مستقیماً به صفحه اصلی می‌رفت.

علت: منوی «مدیریت و بهسازی سنگ مزار» state مستقل `stone-menu` در history نداشت.

راه‌حل QA:
- ثبت state مستقل `stone-menu`
- بازسازی منوی بهسازی بدون ایجاد history اضافی
- اصلاح `navigation-fix.js`
- افزودن handling مربوط به `stone-menu` در `app.js`
- cache-busting برای loader و launcher
- اصلاح دکمه بازگشت صفحه نتایج به صورت `← بازگشت`

Branch:
`fix/navigation-stone-menu-20260919`

Recovery:
`recovery/main-before-navigation-fix-20260919`

PR:
`#25` — در زمان ثبت این گزارش هنوز برای merge نهایی نگه داشته شده تا تست عملی QA انجام شود.

---

## 14. مدل رسمی جدید Branch / Deployment

از 2026-09-20 تعریف رسمی پروژه:

- **نسخه مرجع تست و توسعه:** `qa`
- **نسخه مرجع عملیات:** `main`
- **لینک تست:** Vercel Preview متصل به branch `qa`
- **لینک عملیاتی:** GitHub Pages متصل فقط به `main`

GitHub Pages Workflow اصلاح شده تا فقط با push به `main` اجرا شود. Branchهای آزمایشی دیگر نباید همان سایت عملیاتی GitHub Pages را Deploy کنند.

چرخه:
`Recovery → QA → Technical Test → QA Link → Practical Test → Approval → main → GitHub Pages → Operational Link`

---

## 15. وضعیت فعلی

**Statistics fix:** فنی PASS و PR #24 merge شده.

**Navigation fix:** فنی PASS روی QA؛ تست عملی کاربر هنوز مرجع تصمیم برای merge نهایی PR #25 است.

**main فعلی:** `b1c0b3c4a2264622ac2d8ce64c085ecd7a40b22d`

**Supabase:** در اصلاحات اخیر بدون write/schema change.

**Pages:** Workflow فعلی فقط با push به `main` اجرا می‌شود؛ وضعیت Deploy زنده باید جداگانه بررسی شود.

**QA:** branch دائمی `qa` ایجاد شده و مبنای کار تستی است.

**پاک‌سازی فایل‌ها:** فقط فایل‌هایی که پس از بررسی dependency و Recovery واقعاً بلااستفاده بودنشان ثابت شود حذف خواهند شد؛ فایل‌های تاریخی/Recovery بدون بررسی حذف نمی‌شوند.



---

## 16. به‌روزرسانی وضعیت — 2026-09-20

### وضعیت نسخه‌ها
- **نسخه مرجع تست و توسعه:** `qa`
- **Commit فعلی QA:** `a8cd687357fde6342aa287ecefb0a884d375ddef`
- **نسخه مرجع عملیات:** `main`
- **Commit فعلی main:** `8fd5e4bc1152e60dc387e2849c32e15798c33f71`

مقایسه زنده GitHub نشان می‌دهد `qa` نسبت به `main`، **11 commit جلوتر و 1 commit عقب‌تر** است. بنابراین QA و main تاریخچه واگرا دارند و نباید با force-reset یا جابه‌جایی اجباری همسان شوند.

### PR شماره 26 — مدل رسمی QA / main
PR `#26` با عنوان «تعریف رسمی QA و main» در 2026-09-20 با موفقیت Merge شد.

موارد ثبت‌شده در آن:
- تعریف رسمی `qa` به‌عنوان نسخه مرجع تست/توسعه
- تعریف رسمی `main` به‌عنوان نسخه مرجع عملیات
- ثبت سند `docs/PROJECT-ENVIRONMENT-AND-LINKS.md`
- محدود شدن GitHub Pages به Deploy از `main`
- حفظ جداسازی نسخه تست از نسخه عملیاتی

Merge commit:
`8fd5e4bc1152e60dc387e2849c32e15798c33f71`

### PR شماره 25 — ناوبری Back
PR `#25` همچنان **باز و Draft** است و روی branch زیر قرار دارد:
`fix/navigation-stone-menu-20260919`

Commit شاخه:
`fbf1033518cae15ba12f31f7a15fca2f9c9b1a40`

این اصلاح تا انجام تست عملی کاربر و تأیید نهایی نباید وارد `main` شود.

### Recovery قبل از پاک‌سازی مخزن
Recovery Point ایجادشده:
`recovery/main-before-repository-cleanup-20260920`

شاخه کاری پاک‌سازی:
`maintenance/repository-cleanup-20260920`

### پاک‌سازی انجام‌شده در این مرحله
پس از بررسی ارجاع‌های اجرایی، فقط فایل‌هایی که در نسخه فعال مرجع اجرایی نداشتند و کارکردشان توسط نسخه جدید جایگزین شده بود در محدوده حذف قرار گرفتند.

Recoveryها، اسناد تاریخی اصلی، Loaderها، فایل‌های `fix` فعال و فایل‌های مرتبط با داده/عملیات حذف نمی‌شوند.

### لینک‌های رسمی
- لینک عملیاتی MAIN:
`https://forog1980-star.github.io/Shohada-app/`
- لینک تست QA:
`https://shohada-app-git-qa-forog1980-8339.vercel.app/`

اتصال زنده و Commit مستقر هر دو لینک باید هنگام تست عملی با Branch/Deployment واقعی تطبیق داده شوند.


---

## 17. نهایی‌سازی پاک‌سازی مخزن — 2026-09-20

PR پاک‌سازی مخزن `#27` با موفقیت Merge شد.

- Merge commit: `b1c0b3c4a2264622ac2d8ce64c085ecd7a40b22d`
- Recovery قبل از پاک‌سازی: `recovery/main-before-repository-cleanup-20260920`
- فایل‌های حذف‌شده پس از Merge در `main` نیز بررسی شدند و دیگر وجود ندارند.
- هیچ تغییر داده یا Schema در Supabase انجام نشد.
- فایل‌های فعال جایگزین و Loaderهای مرتبط حفظ شدند.
- وضعیت عملیاتی برنامه از نظر کد همچنان بر مبنای `main` است.
- وضعیت QA همچنان بر مبنای branch دائمی `qa` است.

### دو لینک رسمی برای مراجعه روزانه
1. **MAIN — نسخه مرجع عملیاتی:** `https://forog1980-star.github.io/Shohada-app/`
2. **QA — نسخه مرجع تست و توسعه:** `https://shohada-app-git-qa-forog1980-8339.vercel.app/`

### قانون مراجعه
برای هر کار جدید ابتدا وضعیت `qa` بررسی و تست می‌شود. فقط پس از تأیید نهایی، تغییر از مسیر Pull Request وارد `main` می‌شود. لینک اول برای استفاده عملیاتی و لینک دوم برای تست است.
