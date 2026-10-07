# گزارش فنی مرجع و نقطه ادامه پروژه Shohada-app / GolzarStone

> این فایل مرجع اصلی ادامه پروژه است. در هر گفت‌وگوی جدید ابتدا این فایل خوانده شود و سپس وضعیت زنده GitHub / GitHub Pages / Vercel / Supabase با آن تطبیق داده شود.

**آخرین به‌روزرسانی:** 2026-10-07 — نهایی‌سازی و Merge کنترل کیفیت داده و تکمیل مستندات لایه AI
**مخزن:** `forog1980-star/Shohada-app`
**نسخه عملیاتی نهایی:** `main`
**Commit تثبیت‌کننده Live Statistics:** `68ab1061797e0548b3cf032910ef1e750865d47c`  
**Merge commit آخرین انتشار ثبت‌شده:** `9887a662049687ec525e62baf2529a56ea0550e0`

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

**main فعلی:** `8fd5e4bc1152e60dc387e2849c32e15798c33f71`

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

## 17. وضعیت جاری و تثبیت نهایی — 2026-09-20

این بخش آخرین وضعیت مرجع پروژه است و در صورت تعارض با بخش‌های قدیمی‌تر این گزارش، **مبنای فعلی ادامه کار** محسوب می‌شود. بخش‌های قبلی برای حفظ تاریخچه پروژه نگه داشته شده‌اند.

### 17-1. وضعیت نسخه‌ها
- **نسخه عملیاتی:** `main`
- **Commit فعلی main:** `e1c6cf32746b5b804ac3cd8e20eceb88f92c043c`
- **نسخه تست و توسعه:** `qa`
- **Commit فعلی QA:** `0409950de2745e7007ad1104932d32f0f16fd965`
- **وضعیت تاریخچه:** `qa` و `main` عمداً تاریخچه واگرا دارند و نباید با force-reset یا force-push یکسان شوند.

### 17-2. دو اصلاح ناوبری که در QA تأیید و در main منتشر شدند
**۱) بازگشت به بالای صفحه**
- فایل: `frontend/back-to-top-20260920.js`
- دکمه مستقل و شناور بازگشت به بالای صفحه.
- بدون تغییر در History، Search یا Supabase.

**۲) بازگشت مستقیم از جزئیات جستجو**
- فایل: `frontend/search-back-direct-20260920.js`
- مسیر `Search → Detail → Back` مستقیماً به نتایج قبلی جستجو بازمی‌گردد.
- فیلترها و نتایج قبلی حفظ می‌شوند.
- موقعیت اسکرول قبلی نیز بازیابی می‌شود.
- مسیرهای غیرجستجو دست‌نخورده باقی می‌مانند.

### 17-3. انتشار
- **PR #35:** افزودن Back-to-Top به QA و Merge موفق.
- **PR #36:** اصلاح مستقل Search → Detail → Back و Merge موفق در QA.
- **PR #37:** انتقال همین دو اصلاح تأییدشده به main و Merge موفق.
- **Merge commit نهایی main:** `e1c6cf32746b5b804ac3cd8e20eceb88f92c043c`
- مقایسه Main قبل از این انتشار نشان می‌دهد فقط این سه فایل به‌عنوان تغییر کدی وارد شده‌اند:
  - `frontend/back-to-top-20260920.js`
  - `frontend/search-back-direct-20260920.js`
  - `frontend/master-loader.js`

### 17-4. Recovery
قبل از انتقال این دو اصلاح به main، Recovery Point ساخته شد:
`recovery/main-before-two-qa-fixes-20260920`

این Recovery تا تثبیت نسخه جدید حفظ شود.

### 17-5. نتیجه تست عملی
کاربر هر دو اصلاح را ابتدا در QA و سپس در لینک عملیاتی Main تست و **PASS** کرده است:
- Back-to-Top: PASS
- Search → Detail → Back → همان نتایج/فیلترها/موقعیت قبلی: PASS

**لینک عملیاتی رسمی:**
`https://forog1980-star.github.io/Shohada-app/`

آدرس مورد استفاده کاربر با پارامتر UTM نیز به همین نسخه Main اشاره می‌کند:
`https://forog1980-star.github.io/Shohada-app/?utm_source=chatgpt.com`

### 17-6. وضعیت استقرار و داده
- Checks ثبت‌شده Vercel برای commit انتشار Main: **success**
  - `Vercel – shohada-app-v2-pwa`
  - `Vercel – shohada-app`
- در این انتقال هیچ تغییر Schema یا Write در Supabase انجام نشد.
- **Supabase:** بدون تغییر در این مرحله.
- Main همچنان تنها نسخه عملیاتی و QA تنها محیط توسعه/تست است.

### 17-7. نقطه شروع بعدی پروژه
ادامه کار از این مرحله باید ابتدا روی QA انجام شود و پس از تست به main منتقل گردد.

موضوعات برنامه‌ریزی‌شده بعدی:
1. بررسی و طراحی **اتصال گزارش‌ها به سامانه** و مشخص کردن اینکه گزارش در کدام نقطه از چرخه تولید/ثبت شود.
2. بررسی نیاز **احراز هویت و کاربران** برای استفاده چندنفره.
3. تعریف **سطوح دسترسی** به‌صورت روشن؛ اینکه چه کاربری فقط مشاهده کند و چه کاربری بتواند ثبت، ویرایش، تأیید، حذف، آمار یا خروجی بگیرد.
4. تعیین اینکه کدام بخش‌های برنامه برای همه کاربران قابل دسترسی و کدام عملیات فقط برای مسئول/ناظر مجاز باشند.

در طراحی احراز هویت و سطح دسترسی، **هیچ تغییری در Supabase Auth/RLS یا داده عملیاتی تا زمان تصویب مدل دسترسی انجام نشود**.


---

## 18. اتصال عکس و اطلاعات گلزارته — وضعیت جاری 2026-09-27

این بخش آخرین وضعیت فنی Integration با سامانه گلزار شهدای تهران است و در صورت تعارض با بخش‌های قدیمی‌تر این گزارش، مبنای ادامه کار محسوب می‌شود.

### 18-1. Branch و Commit جاری

- **Branch کاری:** `feature/golzarteh-photo-2026-09-27`
- **Commit فعلی ثبت‌شده:** `e841c81` — `fix: normalize location digits in Golzarteh exact query`
- **PR:** `#39`
- وضعیت PR: **Draft**
- `main` در این مرحله دست‌نخورده و مرجع عملیاتی باقی مانده است.
- Recovery Pointهای مربوط به این Integration ایجاد شده‌اند و تا پایان QA حفظ می‌شوند:
  - `recovery/golzarteh-photo-all-2026-09-27` → `2153b61`
  - `recovery/golzarteh-photo-loader-before-cachefix-20260927` → `24f154e`
  - `recovery/golzarteh-photo-before-integration-2026-09-27`
  - `recovery/golzarteh-photo-all-martyrs-before-integration-2026-09-27`
  - `recovery/golzarteh-photo-name-normalization-2026-09-27`
  - `recovery/golzarteh-2026-09-27`
  - `recovery/golzarteh-similar-before-2026-09-27`

### 18-2. API و زنجیره عکس

Endpoint مورد استفاده:
`https://api.golzarteh.ir/api/v1/martyr/summary`

دانلود فایل:
`https://api.golzarteh.ir/api/v1/files/download/{ID}`

نمونه‌های API که عملی تأیید شده‌اند:

**محمدعلی جهان‌آرا**
- API id: `18852`
- father: هدایت
- uniqueCode: `24098044`
- mainPhoto: `37058a7f-7ec8-4550-ac86-72cb93780b45`
- thumbnailKey: `506e0728-291c-4bac-8c32-c8f6893ecfdd`
- tomb photo: `f78ec56a-7ff7-4616-a2c9-fa546c214588`
- location: 24/98/44
- دانلود مستقیم فایل‌های عکس با HTTP 200 و image/jpeg تأیید شده است.

**سید مهدی سیدفاطمی**
- API id: `27557`
- firstName: سیدمهدی
- lastName: سیدفاطمی
- father: سیدجواد
- location: 17/81/39
- نام با فاصله و بدون فاصله در مسیر Normalization پشتیبانی می‌شود.

### 18-3. اصلاح نرمال‌سازی «ا / آ»

برای نام‌هایی مانند «آباده / اباده» منطق Controlled Alef Variant اضافه شده است.

توابع اصلی:
- `getLeadingAlefVariants`
- `getIdentityVariants`
- `getFamilyNameVariants`
- `getPersonNameVariants`
- `namesEquivalent`

این منطق فقط برای افزایش احتمال پیدا شدن Candidate در API استفاده می‌شود و به‌تنهایی باعث Exact شدن رکورد نمی‌شود.

### 18-4. تفکیک Exact و Similar

قانون فعلی:

- **Exact** نیازمند تطبیق محل قبر و سپس تطبیق هویتی معتبر است.
- در صورت اختلاف محل، رکورد نباید Exact شود.
- Similar می‌تواند Candidate هویتی معتبر را برای بررسی کاربر نمایش دهد.
- تطبیق صرفاً بر اساس نام/نام خانوادگی برای Exact کافی نیست.
- برای Exact، در صورت عدم تطبیق strict نام، حداقل یکی از father / birth / death باید همراه با تطبیق نام و نام خانوادگی تأیید شود.

توابع کلیدی:
- `isExactLocation`
- `strictNamesMatch`
- `isExactMatch`
- `isNameSimilar`
- `findExactGolzartehMartyr`
- `findSimilarGolzartehMartyrs`
- `findGolzartehMatches`
- `getGolzartehPhotos`

Export فعلی:
- `findMartyr`
- `findMatches`
- `getPhotos`
- `getPhotoUrl`

### 18-5. تست کلیدی «محسن آباده» — PASS عملی

رکورد برنامه با اطلاعات زیر تست شد:
- نام: محسن
- نام خانوادگی در رکورد محلی: اباده
- پدر: حسین
- تولد: ۱۳۴۲
- شهادت: ۱۶ دی ۱۳۶۳
- محل شهادت: ابوغریب
- محل مزار ثبت‌شده در برنامه: 27/105/8

API با «اباده» به‌صورت مستقیم Candidate نداد، اما با Variant «آباده» رکورد زیر پیدا شد:

- **id: 10378**
- نام: محسن
- نام خانوادگی: آباده
- پدر: حسین
- location در گلزارته: 24/104/1
- mainPhoto: `ca747139-0fd3-4bee-9f4f-009fea31c934`
- thumbnail: `98c1ce7b-1a7d-4776-9344-71a1d5f8f4a2`

جزئیات Match:
- nameMatch: true
- lastNameMatch: true
- fatherMatch: true
- birthMatch: null
- deathMatch: null
- locationMatch: false
- score: **90**

نتیجه رسمی تست:
`matchType = similar`

رکورد به‌درستی **Exact نشد**، زیرا محل مزار برنامه با محل مزار گلزارته متفاوت بود؛ اما Candidate معتبر برای بررسی کاربر نمایش داده شد.

### 18-6. تست عملی UI — PASS

پس از رفع Cache/Runtime در مرورگر:
- `window.GolzarTehPhoto` شامل `findMatches` شد.
- Similar Candidate برای محسن آباده در UI نمایش داده شد.
- عکس اصلی Candidate نیز نمایش داده شد.
- بنابراین زنجیره زیر عملی PASS شده است:

`Local Record → API Query → Name Normalization → Similar Match → Identity Corroboration → Photo ID → Similar Card → Photo Display`

### 18-7. مشکل Cache که در QA شناسایی و رفع شد

در ابتدا مرورگر نسخه قدیمی `golzarteh-photo.js?v=20260927-05` را در runtime داشت و فقط این توابع را expose می‌کرد:
- `findMartyr`
- `getPhotos`
- `getPhotoUrl`

در حالی که فایل محلی فعلی شامل `findMatches` و `findSimilarGolzartehMartyrs` بود.

با **Ctrl + Shift + R**، runtime به نسخه صحیح Reload شد و خروجی به چهار تابع رسید:
- `findMartyr`
- `findMatches`
- `getPhotos`
- `getPhotoUrl`

این مورد به‌عنوان **Cache/Runtime issue** ثبت می‌شود و نه خطای Matching.

### 18-8. وضعیت فایل‌های عکس

فایل‌های مرتبط فعلی:
- `frontend/golzarteh-photo.js?v=20260927-06`
- `frontend/golzarteh-detail-photo.js?v=20260927-03`
- `frontend/golzarteh-tomb-photo.js?v=20260927-01`

در تست محلی، فایل `golzarteh-photo.js` با طول 12489 بایت و وجود توابع Similar تأیید شد.

### 18-9. محدودیت مهم برای ادامه QA

تا این مرحله:
- Matching: **PASS**
- Similar UI: **PASS**
- Photo retrieval/display: **PASS**
- Exact/Simiar separation: **PASS**
- Supabase write/schema change: **انجام نشده**
- Merge به `main`: **انجام نشده**
- PR #39: همچنان **Draft**

بنابراین این Integration هنوز **برای Merge نهایی به main تأیید نشده** است.

### 18-10. نقطه ادامه بعدی

قبل از هر Merge:
1. تست مجدد نمونه‌های Exact قبلی، به‌خصوص محمدعلی جهان‌آرا و سید مهدی سیدفاطمی.
2. تست نمونه‌ای که نباید Match شود، مانند اصغر پرستاری.
3. بررسی اینکه Similar فقط Candidateهای هویتی معتبر را نشان دهد.
4. بررسی عکس اصلی و عکس مزار در چند Candidate.
5. سپس بررسی Deploy/Version و تست عملی نهایی.
6. فقط پس از PASS کامل، تصمیم برای انتقال از branch کاری به `main`.

**قاعده ثابت:** تا پایان این QA هیچ تغییر مستقیمی روی `main` و هیچ Mergeی انجام نشود.

### 18-11. اصلاح نهایی Query موقعیت قبر — 2026-09-27

در QA مشخص شد API گلزارته برای پارامترهای موقعیت قبر با ارقام فارسی/عربی Candidate دقیق برنمی‌گرداند، در حالی که همان درخواست با ارقام لاتین رکورد صحیح را برمی‌گرداند.

نمونه تأییدشده:
- ورودی برنامه: قطعه ۲۴ / ردیف ۹۸ / شماره ۴۴
- درخواست صحیح API: 24 / 98 / 44
- نتیجه: data.length = 1
- رکورد: id = 18852
- نام: محمدعلی
- نام خانوادگی: جهان آرا
- پدر: هدایت

علت ریشه‌ای:
findExactGolzartehMartyr() مقادیر piece / grave_row / grave_number را مستقیماً و بدون نرمال‌سازی عددی به Query API ارسال می‌کرد.

اصلاح حداقلی اعمال‌شده در:
frontend/golzarteh-photo.js

سه پارامتر Query اکنون از normalizeNumber() عبور می‌کنند:
- number: normalizeNumber(record.grave_number)
- section: normalizeNumber(record.piece)
- row: normalizeNumber(record.grave_row)

Commit اصلاح:
e841c81 — fix: normalize location digits in Golzarteh exact query

کنترل تغییر:
- فقط ۳ خط کد تغییر کرده است.
- git diff --check: PASS
- Encoding فایل حفظ شد.
- Commit و Push به branch کاری با موفقیت انجام شد.
- main هیچ تغییری نکرده است.
- Supabase write/schema change انجام نشده است.

تست مستقیم API پس از اصلاح:
24/98/44 + محمدعلی + جهان آرا → id 18852 : PASS

### 18-12. نقطه پایان کار امروز — 2026-09-27

کار امروز در همین نقطه متوقف می‌شود.

وضعیت پایان روز:
- Branch: feature/golzarteh-photo-2026-09-27
- Commit: e841c81
- PR: #39 — Draft
- main: دست‌نخورده
- Supabase: بدون Write و بدون Schema Change
- اصلاح Query موقعیت قبر: فنی PASS
- تست مستقیم API برای محمدعلی جهان آرا: PASS
- تست کامل UI روی نسخه Branch پس از این Commit: هنوز انجام نشده
- Merge به main: انجام نشده

نکته:
تلاش برای تست فایل روی GitHub Pages با مسیر ریشه اشتباه انجام شد و پاسخ 404 مربوط به مسیر نادرست بود؛ این مورد به‌عنوان نتیجه QA برنامه محسوب نمی‌شود و نیاز به اصلاح کد ندارد.

### 18-13. نقطه شروع فردا — 2026-09-28

نقطه شروع فردا دقیقاً همین‌جاست:
feature/golzarteh-photo-2026-09-27 @ e841c81

ترتیب ادامه کار:
1. خواندن همین گزارش فنی و تطبیق با وضعیت زنده GitHub.
2. بررسی Preview/Deployment مربوط به همین Branch.
3. تست عملی محمدعلی جهان آرا → انتظار: Exact, id 18852.
4. تست سید مهدی سیدفاطمی → انتظار: Exact, id 27557.
5. تست محسن آباده → انتظار: Similar, id 10378 و location mismatch.
6. تست اصغر پرستاری → انتظار: No Match.
7. در صورت PASS همه موارد، بررسی عکس اصلی و عکس مزار و سپس تصمیم‌گیری درباره Merge به main.
8. تا قبل از PASS کامل، هیچ Merge یا تغییر مستقیم روی main انجام نشود.

یادداشت اجرایی فردا: قبل از شروع هر تغییر، وضعیت Branch، Commit، PR #39 و Deploy/Preview بررسی شود؛ سپس از همین نقطه ادامه داده شود.


---

## 19. وضعیت مرجع پروژه و ممیزی نسخه — 2026-09-28

این بخش از این تاریخ **آخرین وضعیت مرجع پروژه** است و در صورت تعارض با بخش‌های قدیمی‌تر گزارش، مبنای ادامه کار محسوب می‌شود. بخش‌های قبلی برای حفظ تاریخچه حذف نشده‌اند.

### 19-1. وضعیت فعلی main

- Branch عملیاتی: `main`
- Commit فعلی main:
  `445ac7a818f4c180898b62b1c486ec2f77a48636`
- وضعیت Branch: پایدار و بدون تغییر جدید در این مرحله.
- Merge نهایی اخیر: **PR #40**
- عنوان PR: `fix: return one history step from all-martyrs search`
- Merge commit: `093cfb501371aefbe75c384c60582570650616b2`
- تغییر PR #40 فقط در فایل `frontend/all-martyrs/all-martyrs-search.html` انجام شد.
- هدف تغییر: دکمه «بازگشت» به‌جای رفتن مستقیم به `all-martyrs.html` یک مرحله به عقب History برگردد و فقط در نبود History به صفحه `all-martyrs.html` برود.

### 19-2. تست عملی PR #40

کاربر اصلاح Back را روی **آدرس قدیمی و اصلی عملیاتی** تست کرد.

نتیجه اعلام‌شده توسط کاربر:
- Back: **PASS**
- تست‌ها: **بدون مشکل**
- رفتار مورد انتظار: بازگشت یک مرحله‌ای به مسیر قبلی.

بنابراین PR #40 از نظر فنی/عملی در محدوده خود تثبیت‌شده محسوب می‌شود.

### 19-3. وضعیت Integration گلزارته

PR #39 با موفقیت Merge شده است:

- PR: `#39`
- عنوان: `feat: surface similar Golzarteh martyr matches`
- Merge commit:
  `6a40d1fc2a6ec98e1ee8f363c8d556e685212b8a`
- وضعیت PR: **Merged**
- قابلیت‌های ثبت‌شده:
  - Exact با تطبیق کنترل‌شده نام و موقعیت
  - Similar برای Candidateهای هویتی
  - نمایش عکس شهید و عکس مزار
  - عدم اتصال یا ذخیره خودکار Candidate
  - نرمال‌سازی ارقام موقعیت برای Query API
  - حفظ تفکیک Exact و Similar

در نتیجه، بخش قدیمی گزارش که PR #39 را Draft و Mergeنشده معرفی می‌کند، صرفاً تاریخچه مرحله قبل است و وضعیت جاری آن PR را نشان نمی‌دهد.

### 19-4. ممیزی کامل نسخه برنامه

برای تعیین محل واقعی شماره نسخه، در وضعیت فعلی مخزن `main` موارد زیر بررسی شد:

1. درخت کامل فایل‌های Repository از Commit فعلی بررسی شد.
2. جستجوی Repository برای `2.0.0`، `2.0.1`، `2.0.2` و `2.0.3` انجام شد.
3. جستجوی شناسه نسخه `APP_VERSION` انجام شد.
4. فایل‌های اصلی مرتبط با نسخه و نقطه ورود بررسی شدند:
   - `frontend/version-label.js`
   - `frontend/index.html`
   - `frontend/manifest.webmanifest`
   - `README.md`
   - `PROJECT_CHARTER.md`
   - `PROJECT_SAFETY_RULES.md`
   - `DEVELOPMENT_WORKFLOW.md`
   - `docs/PROJECT-ENVIRONMENT-AND-LINKS.md`
   - `docs/PROJECT-TECHNICAL-MASTER-REPORT.md`

### 19-5. نتیجه ممیزی نسخه

شماره نسخه‌ای که **واقعاً در UI برنامه نمایش داده می‌شود** در فایل زیر قرار دارد:

`frontend/version-label.js`

مقدار فعلی:

`const APP_VERSION = "۲.۰.۲";`

این فایل از `frontend/index.html` بارگذاری می‌شود و تابع `installVersionLabel()` نسخه را در Footer نمایش می‌دهد.

نتیجه:

**نسخه فعلی قابل مشاهده برنامه = ۲.۰.۲**

در بررسی انجام‌شده، محل مرکزی دیگری برای تعریف شماره نسخه اجرایی پیدا نشد. بنابراین برای ارتقای نسخه به **۲.۰.۳** در گام بعد، تغییر اصلی باید همین مقدار مرکزی باشد؛ سپس باید Load، نمایش Footer، Cache-busting و Regression مربوط به آن بررسی شود.

### 19-6. مواردی که نباید با شماره نسخه اشتباه شوند

پارامترهایی مانند:

`?v=20260927-07`

یا:

`?v=20260927-04`

شماره نسخه برنامه نیستند؛ این‌ها Cache-busting versionهای فایل‌های Frontend هستند و نباید صرفاً به‌دلیل ارتقای نسخه برنامه به `2.0.3` تغییر داده شوند، مگر اینکه فایل مربوطه واقعاً تغییر کند.

### 19-7. وضعیت داده و Supabase

در این ممیزی:
- هیچ Write روی Supabase انجام نشد.
- هیچ Schema / RLS / Policy / Function / Trigger تغییری داده نشد.
- هیچ رکورد عملیاتی تغییر نکرد.

### 19-8. وضعیت انتشار

- لینک عملیاتی:
  `https://forog1980-star.github.io/Shohada-app/`
- مرجع انتشار:
  `main`
- Commit فعلی:
  `445ac7a818f4c180898b62b1c486ec2f77a48636`

تطبیق Commit و Branch در GitHub انجام شد. این گزارش **ادعای تست مرورگر جدید برای نسخه 2.0.3 ندارد**؛ زیرا نسخه 2.0.3 هنوز ایجاد نشده است.

### 19-9. نقطه شروع بعدی

گام بعدی پروژه:

**ارتقای رسمی شماره نسخه از ۲.۰.۲ به ۲.۰.۳**

ترتیب اجرای پیشنهادی:

1. ساخت Branch مستقل از `main`.
2. ثبت Recovery Point.
3. تغییر فقط مقدار `APP_VERSION` به `۲.۰.۳`.
4. بررسی فایل و وابستگی‌های نسخه.
5. Commit و Push.
6. PR.
7. تست نمایش نسخه و Regression.
8. Merge به `main` فقط پس از PASS.
9. بررسی لینک عملیاتی و ثبت Commit نهایی در همین گزارش.

**هیچ تغییر دیگری نباید به بهانه ارتقای نسخه ۲.۰.۳ وارد شود، مگر با درخواست جداگانه.**


---

## 20. نقطه فریز نسخه ۲.۰.۳ — 2026-09-28

- نسخه رسمی برنامه: **۲.۰.۳**
- Commit Merge نسخه ۲.۰.۳:
  `2dea003461cc57f1590f1643420c9bfb445f518d`
- PR انتشار: **#43**
- تغییر اجرایی نسخه ۲.۰.۳ فقط در `frontend/version-label.js` و فقط برای تغییر `APP_VERSION` از ۲.۰.۲ به ۲.۰.۳ انجام شد.
- هیچ تغییر دیگری در منطق برنامه، Supabase، Schema، داده‌ها یا API در این Release انجام نشد.
- وضعیت: **FROZEN / فریز اجرایی**
- از این نقطه به بعد، تغییر کد اجرایی، رفع اشکال، تغییر UI، تغییر منطق، تغییر API یا تغییر داده‌های وابسته به برنامه بدون درخواست صریح کاربر انجام نمی‌شود.
- ادامه کار برنامه از اینجا وارد مرحله **یکسان‌سازی وضعیت GitHub و سیستم محلی با PowerShell** می‌شود.
- مرجع اصلی برای یکسان‌سازی: Commit `2dea003461cc57f1590f1643420c9bfb445f518d` روی `main`.


---

## 21. وضعیت جاری آمار زنده و تثبیت Realtime — 2026-10-06

این بخش **آخرین وضعیت مرجع پروژه در پایان مرحله آمار زنده** است. بخش‌های قبلی برای حفظ تاریخچه پروژه نگه داشته شده‌اند؛ در صورت تعارض، این بخش و وضعیت زنده GitHub مبنای ادامه کار هستند.

### 21-1. هدف و معماری نهایی

هدف این مرحله این بود که آمار **عملیات عمرانی** در صفحه گزارش‌های آماری مستقیماً از جدول زنده `public.martyrs` در Supabase محاسبه شود و تغییرات دیتابیس از طریق Supabase Realtime بدون Refresh به UI برسد.

معماری تأییدشده:

`Supabase public.martyrs → Realtime → statistics-live-bridge-v2.js → statistics-live-calculator.js → render() → statistics.html`

### 21-2. وضعیت نهایی GitHub

- مبنای اولیه Branch:
  `236f8c4d0ca7e925ae236b3a828528a973a9fe59`
- Branch:
  `fix/live-statistics-20261006`
- Commit کدی:
  `f5336a42e6df36fdc9f9b9f7465a2509f32ec4ff`
- Commit مستندسازی:
  `7f06a0e`
- PR:
  `#50`
- عنوان PR:
  `fix(statistics): use live Supabase data for operational stats`
- وضعیت PR:
  **MERGED**
- Merge commit:
  `68ab1061797e0548b3cf032910ef1e750865d47c`
- Branch عملیاتی جاری:
  `main`
- `main` و `origin/main` پس از Merge روی همین Commit قرار دارند.

تغییر اجرایی PR #50 فقط در فایل زیر بود:

`frontend/statistics-live-calculator.js`

### 21-3. منبع و اعداد زنده تأییدشده

منبع مستقیم: `Supabase public.martyrs`

پس از بازسازی اولیه:

- تعداد رکوردهای دریافتی: **2769**
- درخواست کار عمرانی: **2769**
- عملیات قابل اقدام در دو گروه تعویضی/ترمیمی: **2746**
- تفکیک‌نشده: **23**
- تعویضی: **1589**
  - انجام‌شده: **1259**
  - باقی‌مانده: **330**
- ترمیمی: **1157**
  - انجام‌شده: **572**
  - باقی‌مانده: **585**

مراحل تعویضی:

- ارسال طرح سنگ به واحد تعویض: **80**
- سنگ تعویضی آماده نصب است: **21**
- سنگ تعویضی نصب شد: **1259**

مراحل ترمیمی:

- ارسال طرح سنگ به واحد مرمت: **2**
- سنگ مرمتی آماده نصب است: **0**
- سنگ مرمت شده نصب شد: **572**

### 21-4. فعال‌سازی Supabase Realtime

در بررسی مشخص شد `public.martyrs` عضو publication مربوط به Realtime نبود و به همین دلیل تغییرات دیتابیس به Listener صفحه نمی‌رسید.

اصلاح انجام‌شده و تأییدشده در Supabase:

- افزودن `public.martyrs` به `supabase_realtime`
- تنظیم `REPLICA IDENTITY = FULL` برای `public.martyrs`

تأیید:

`supabase_realtime / public / martyrs` → **ثبت‌شده**

`public.martyrs replica identity` → **FULL**

### 21-5. تست عملی UPDATE — PASS

رکورد واقعی `id = 9791` با مقدار اولیه `stage = null` به صورت کنترل‌شده تغییر داده شد:

`null → سنگ تعویضی نصب شد`

بدون Refresh در UI:

- انجام‌شده تعویضی: **1259 → 1260**
- باقی‌مانده تعویضی: **330 → 329**
- مرحله سوم تعویضی: **1259 → 1260**

سپس رکورد به مقدار اولیه بازگردانده شد و UI نیز بدون Refresh به مقادیر **1259 / 330** برگشت.

### 21-6. تست عملی INSERT — PASS

رکورد موقت با شناسه:

`-999999001`

با وضعیت تأییدشده و نوع سنگ تعویضی ایجاد شد.

بدون Refresh در UI:

- درخواست‌ها: **2769 → 2770**
- عملیات قابل اقدام: **2746 → 2747**
- تعویضی: **1589 → 1590**

### 21-7. تست عملی DELETE — PASS

همان رکورد موقت حذف شد.

بدون Refresh، UI به مقادیر اولیه برگشت:

- **2769** درخواست
- **2746** عملیات قابل اقدام
- **1589** تعویضی
- **23** تفکیک‌نشده

رکورد موقت پس از تست در جدول باقی نماند.

### 21-8. پاک‌سازی داده‌های تست

- رکورد واقعی `9791` به `stage = null` بازگردانده شد.
- رکورد موقت `-999999001` حذف شد.
- هیچ داده آزمایشی از تست باقی نمانده است.

### 21-9. وضعیت نهایی بخش‌های صفحه

**زنده و تأییدشده:**

- درخواست‌های عمرانی
- تعویضی / ترمیمی
- انجام‌شده / باقی‌مانده
- مراحل سه‌گانه تعویضی
- مراحل سه‌گانه ترمیمی
- واکنش به INSERT / UPDATE / DELETE واقعی بدون Refresh

**عمداً ثابت:**

- `26200` مزار پایه در 8 قطعه

**فعلاً خارج از Live Calculator:**

- جدول جزئیات آمار قطعات
- نمودار میله‌ای قطعات
- مقادیر `pieces[]` موجود در `statistics.js`

این بخش‌ها در مرحله‌ای مستقل باید بررسی و طراحی شوند و در مرحله آمار زنده فعلی ادغام نشده‌اند.

### 21-10. Recovery Point و Backup نهایی

Recovery Point مخصوص Live Statistics:

`C:\مهدی\نرم افزار جستجوی شهدا\RECOVERY-Shohada-AI-LIVE-STATS-20261006-20261006-134436`

این Recovery شامل HEAD، Branch، status، log، فایل‌های حساس Frontend، patch و گزارش تست Realtime است.

پس از Merge نیز Backup نهایی محلی ایجاد شد و Manifest آن در تاریخ:

`2026-10-06 14:02:39 +03:30`

ثبت شده است.

Backup پس از Merge شامل موارد زیر است:

- وضعیت و log مربوط به AI-POC-02
- patch تغییرات کاری POC-02
- `statistics-live-calculator.js`
- `statistics-live-bridge-v2.js`
- `statistics.html`
- `statistics.js`
- `PROJECT-TECHNICAL-MASTER-REPORT.md`
- Manifest کامل Backup

### 21-11. وضعیت همگام‌سازی سیستم محلی

Worktree مستقل نسخه اصلی:

`C:\مهدی\نرم افزار جستجوی شهدا\Shohada-app-MAIN-SYNC-20261006`

وضعیت نهایی:

- Worktree مرجع main-sync پس از آخرین همگام‌سازی روی Commit همان زمان قرار گرفت و Clean بود.
- Commit تثبیت‌کننده کد Live Statistics: `68ab1061797e0548b3cf032910ef1e750865d47c`
- Mergeهای بعدی PRهای مستنداتی #51 و #52 فقط مستندات را تغییر دادند و منطق عملیاتی Live Statistics را تغییر ندادند.
- PR #52 با Merge commit `46e8dab40b36fa4eaf9f367e2b31ea2c8fbbea8a` فقط مستندات را نهایی کرد.

پوشه اصلی:

`C:\مهدی\نرم افزار جستجوی شهدا\Shohada-app`

عمداً روی Branch کاری:

`feature/all-martyrs-search-2026-09-03`

باقی مانده تا کارهای آن Branch تحت تأثیر قرار نگیرند.

POC-02 نیز در Worktree مستقل خود باقی مانده و وارد Merge آمار زنده نشده است.

### 21-12. نتیجه نهایی مرحله آمار زنده

**Supabase → Realtime → Bridge → Calculator → UI: PASS**

هر سه رویداد واقعی:

- INSERT: **PASS**
- UPDATE: **PASS**
- DELETE: **PASS**

وضعیت Merge:

- PR #50: **MERGED**
- Merge commit: `68ab1061797e0548b3cf032910ef1e750865d47c`

وضعیت نسخه اصلی:

- GitHub `main`: **68ab106**
- Local main-sync: **68ab106**
- Worktree اصلی Sync‌شده: **Clean**

وضعیت Backup:

- Recovery Point: **ثبت‌شده**
- Backup قبل از Merge: **ثبت‌شده**
- Backup پس از Merge: **ثبت‌شده**

### 21-13. محدودیت‌های آگاهانه فعلی

این مرحله به‌صورت عمدی موارد زیر را تغییر نداده است:

- عدد پایه `26200`
- منطق آمار قطعات و `pieces[]`
- منطق POC-01 / POC-02
- منطق «شهید گمنام»
- ساختار Schema اصلی `martyrs`
- داده‌های عملیاتی خارج از تست‌های کنترل‌شده Realtime

تنظیمات Realtime مورد نیاز، یعنی publication و replica identity، قبلاً به‌صورت مجاز و کنترل‌شده اعمال و تأیید شده‌اند.

### 21-14. نقطه ادامه جدید پروژه

مرحله **Live Statistics** بسته و تثبیت‌شده است.

نقطه ادامه بعدی پروژه باید از یک موضوع مستقل انتخاب شود و نباید برای شروع آن، `statistics-live-calculator.js`، POC-02 یا داده‌های تثبیت‌شده این مرحله تغییر کنند مگر با درخواست مشخص و Recovery جدید.

پروتکل ادامه همان است:

`Request → Recovery → Diagnose → Branch → Minimal Change → Technical Test → Deploy → Practical Test → Approval → main`

**وضعیت پایان این مرحله: CLOSED / STABLE**

---

## 22. لایه کنترل کیفیت داده‌های زنده — 2026-10-06

این بخش وضعیت مرحله فعلی **کنترل کیفیت داده‌ها / AI Data Quality** را ثبت می‌کند. این مرحله هنوز وارد `main` نشده و تا پایان تست انسانی باید مستقل از نسخه عملیاتی باقی بماند.

### 22-1. هدف معماری

هدف این مرحله حذف وابستگی اجرای روزمره QA به Snapshot و اتصال موتور کنترل کیفیت تأییدشده مستقیماً به جدول زنده:

`Supabase public.martyrs → Live Read-only Adapter → QA Data Quality Engine → QA Payload → QA Page`

Snapshot همچنان برای تست، آرشیو و اجرای آفلاین محفوظ است؛ اما منبع اجرای Live QA، خود `public.martyrs` است.

### 22-2. Recovery و محدوده تغییر

Recovery Point ایجادشده:

`C:\مهدی\نرم افزار جستجوی شهدا\RECOVERY-QA-LIVE-SUPABASE-20261006-144417`

در مرحله بعدی نیز Recovery مربوط به اتصال صفحه QA به Live API ثبت شده است:

`C:\مهدی\نرم افزار جستجوی شهدا\RECOVERY-QA-LIVE-BRIDGE-20261006-144755`

Branch کاری:

`ai/poc-02-data-intelligence-changes-20261005`

Commit هنگام شروع اتصال Live:

`255d8f35330cdb055266355fe67dc24bd69e9a9b`

در این مرحله:
- هیچ Write روی Supabase انجام نشد.
- هیچ Schema / RLS / Policy تغییر نکرد.
- `main` تغییر نکرد.
- تغییرات صرفاً در Worktree و محیط POC-02 باقی ماندند.

### 22-3. موتور QA موجود

قواعد اصلی QA در:

`ai/poc-02/qa_data_quality.py`

بدون بازنویسی منطق اصلی مجدداً استفاده شدند.

قواعد آزمایش‌شده شامل:
- مرحله خالی
- نام/هویت تکراری یا چندرکوردی
- ردیف مزار خالی
- شماره مزار خالی
- موقعیت مزار تکراری
- نوع سنگ خالی
- قطعه خالی
- نام خالی
- خارج از محدوده ۸ قطعه آماری
- محاسبه هم‌پوشانی واقعی مشکلات

### 22-4. Live Adapter

فایل افزوده‌شده در POC:

`ai/poc-02/qa_live_data_quality.py`

وظیفه:
- دریافت فقط Read-only از REST/Data API
- دریافت داده با pagination
- مرتب‌سازی بر اساس `id`
- کنترل وجود و یکتایی ID
- تحویل مستقیم رکوردها به `qa_data_quality.analyze()`

تست Syntax:

**PASS**

تست اجرای Live QA مستقل:

**PASS**

در آخرین اجرای موفق:
- تعداد رکوردهای زنده: **2769**
- حداقل ID: **9789**
- حداکثر ID: **12578**
- IDهای تکراری: **وجود ندارد**

### 22-5. نتیجه تحلیل Live QA

در آخرین اجرای موفق روی `public.martyrs`:

- کامل: **1787**
- مشکل‌دار: **982**
- متناقض/نامعتبر: **0**

انواع مشکل:

- مرحله خالی: **835**
- نام/هویت تکراری یا چندرکوردی: **152**
- ردیف مزار خالی: **61**
- شماره مزار خالی: **60**
- موقعیت مزار تکراری: **56**
- نوع سنگ خالی: **23**
- قطعه خالی: **3**
- نام خالی: **2**
- خارج از محدوده ۸ قطعه آماری: **1**

تعداد رکوردهای تحلیل‌شده: **2769**

### 22-6. Live QA HTTP Bridge

برای اتصال صفحه QA به موتور زنده، دو فایل POC افزوده شد:

- `ai/poc-02/qa_live_results.py`
- `ai/poc-02/qa_live_server.py`

Endpoint محلی:

`http://127.0.0.1:8766/qa-results`

این endpoint در آخرین تست واقعی:
- HTTP Status: **200**
- sourceType: `live_supabase`
- sourceFile: `public.martyrs`
- totalRecords: **2769**
- records در payload: **2769**
- clean + problem = total: **تأیید شد**
- ساختار رکورد مورد نیاز UI: **تأیید شد**

### 22-7. اصلاحات و یافته‌های QA

در جریان تست چند خطای محیطی/اجرایی شناسایی شد که منطق QA نبودند:

1. یک Snapshot اولیه به‌دلیل مسیر دارای فاصله اضافی صحیح ساخته نشد؛ Snapshot نهایی بعداً با موفقیت و با 2769 رکورد بازسازی شد.
2. Snapshot جدید با UTF-8 BOM ذخیره شده بود و برای `json.load(encoding="utf-8")` خطای BOM ایجاد کرد؛ این خطا مربوط به فرمت فایل بود، نه منطق QA.
3. پورت `8766` مدتی توسط یک `qa_live_server.py` قبلی اشغال بود؛ پردازش مشخص‌شده شناسایی و متوقف شد.
4. چند پیام PASS بعد از خطای `if/elseif/else` در PowerShell به دلیل ادامه اجرای دستی اسکریپت **معتبر تلقی نشدند**. در این گزارش فقط PASSهایی ثبت می‌شوند که واقعاً توسط آزمون متناظر تأیید شده‌اند.

### 22-8. وضعیت اتصال صفحه QA

`qa_page/app.js` در Worktree POC از منبع Snapshot به endpoint زنده منتقل شده است:

`http://127.0.0.1:8766/qa-results`

اما تا پایان ثبت این بخش، **تست انسانی کامل UI هنوز نهایی نشده است**.

بنابراین وضعیت رسمی این مرحله:

- Live Supabase read: **PASS**
- QA Engine on live data: **PASS**
- Live HTTP payload: **PASS**
- QA Page live rendering: **PENDING HUMAN TEST**
- Merge به main: **انجام نشده**
- انتشار عملیاتی: **انجام نشده**

### 22-9. نکته معماری و امنیتی

کلید Supabase نباید وارد JavaScript صفحه یا Repository شود. اتصال فعلی به‌صورت Backend/local-server برای محیط POC انجام شده و کلید در متغیر محیطی PowerShell قرار دارد.

برای نسخه تولیدی، معماری نهایی باید با مدل دسترسی امن و مناسب محیط عملیاتی تعیین شود؛ تا آن زمان این Live Bridge صرفاً یک لایه POC است.

### 22-10. نقطه توقف فعلی

این مرحله در وضعیت زیر متوقف شده است:

**Engine و اتصال Live فنی تأیید شده؛ تست انسانی صفحه QA باقی مانده است.**

ادامه کار باید از همین نقطه باشد:

`Start QA Local Server → Open QA Page → Verify Live Data → Test Filters → Test Record Details → Test Approval Workflow → Final Human Confirmation`

تا قبل از PASS انسانی، این مرحله نباید به `main` منتقل شود و نباید به‌عنوان قابلیت عملیاتی نهایی معرفی شود.


---

## 23. اتصال Index مشترک دو لایه AI به سامانه اصلی — 2026-10-07

### 23-1. هدف

برای جلوگیری از وابستگی به سرورهای موقت QA/POC در زمان تست نهایی، یک لایه داده‌ای مشترک برای AI به نقطه ورود اصلی سامانه اضافه شد.

زنجیره جدید:

`main frontend → AI Live Index Loader → Supabase public.martyrs`

و دو نمای مصرف‌کننده:

`AI Live Index → POC-01 Matching Index`

`AI Live Index → POC-02 Data Intelligence / Data Quality Index`

این اتصال جایگزین موتورهای Python POC نمی‌شود؛ موتورهای Python همچنان مرجع توسعه و تست منطقی هستند.

### 23-2. فایل‌های اجرایی این مرحله

فایل جدید:

`frontend/ai-live-index-loader.js`

این فایل:
- داده‌های `public.martyrs` را فقط به‌صورت Read-only می‌خواند.
- دریافت داده را با pagination انجام می‌دهد.
- Index بر اساس ID، هویت، موقعیت و کلید کامل می‌سازد.
- خلاصه کیفیت داده و شناسه موارد مشکل‌دار را می‌سازد.
- Indexهای مورد نیاز Matching و Data Intelligence را از همان مجموعه رکورد تولید می‌کند.
- تغییرات INSERT / UPDATE / DELETE را با Realtime روی همان Index اعمال می‌کند.
- در صورت خطای AI، اجرای سامانه اصلی را متوقف نمی‌کند.

فایل موجود که در این مرحله توسعه داده شد:

`frontend/ai-layer-bridge.js`

موارد expose‌شده:
- `getLiveIndex()`
- `getMatchingIndex()`
- `getDataQualityIndex()`
- `getDataIntelligenceIndex()`

### 23-3. نقطه اتصال به index.html

`frontend/index.html` اکنون بعد از Master Loader و قبل از AI Bridge، لودر زیر را بارگذاری می‌کند:

`ai-live-index-loader.js?v=20261007-ai-index-01`

ترتیب منطقی:

`master-loader → ai-live-index-loader → ai-layer-bridge`

لودر AI نباید Startup عملیاتی را مسدود کند.

### 23-4. قرارداد داده

منبع:

`Supabase public.martyrs`

مرجع داده:

- یک مجموعه Live مشترک برای هر دو مسیر AI
- عدم کپی‌سازی Snapshot برای اجرای عادی
- Snapshot فقط برای Offline/Regression/Archive

در تست‌های قبلی، داده زنده 2769 رکورد با بازه ID از 9789 تا 12578 مشاهده شد.

### 23-5. وضعیت تست فنی

تا این نقطه:
- ساخت لودر: **PASS**
- افزودن به نقطه ورود main frontend: **PASS**
- استفاده از همان Publishable Key موجود Frontend: **PASS**
- Supabase Write: **NONE**
- Schema/RLS/Policy change: **NONE**
- تغییر منطق عملیاتی اصلی: **NONE**
- تست رفتار Realtime این لودر روی داده زنده: **برای مرحله انسانی/کاربردی باقی است**
- تست انسانی از URL عملیاتی: **در انتظار کاربر**
- Merge به main: **انجام شد — PR #56**
- Merge commit: `cf6b9636aca67a23f8a719f9859c344ca2b4853c`

### 23-6. نکته درباره معماری قبلی

`frontend/statistics-live-bridge-v2.js` نیز از `public.martyrs` داده زنده دریافت می‌کند و `__GOLZAR_LIVE_ROWS__` را در مسیر Statistics می‌سازد.

لودر AI برای صفحه اصلی از همان منطق داده زنده استفاده می‌کند، ولی Indexهای مخصوص AI را جدا نگه می‌دارد تا با محاسبه آمار عملیاتی قاطی نشود.

### 23-7. نقطه ادامه

بعد از تست فنی شاخه:

`Open main URL → verify AI bridge → verify live row count → verify Matching index → verify Data Quality/Data Intelligence index`

بعد از Merge، مرحله جاری فقط **تست انسانی از نسخه عملیاتی main** است. در صورت بروز اشکال، اصلاح بعدی باید با Recovery و Branch مستقل انجام شود.


### 23-8. وضعیت Merge نهایی — 2026-10-07

PR:

`#56`

عنوان:

`feat(ai): connect matching and data intelligence to live martyrs index`

وضعیت:

**MERGED**

Merge commit:

`cf6b9636aca67a23f8a719f9859c344ca2b4853c`

تغییرات وارد `main`:
- `frontend/ai-live-index-loader.js`
- `frontend/ai-layer-bridge.js`
- `frontend/index.html`
- همین گزارش فنی

Vercel Checks روی Commit قبل از Merge:
- `Vercel – shohada-app`: **success**
- `Vercel – shohada-app-v2-pwa`: **success**

پس از Merge:
- Supabase Write: **NONE**
- Schema/RLS/Policy Change: **NONE**
- تغییر مستقیم در داده‌های `martyrs`: **NONE**

### 23-9. نقطه تست انسانی فعلی

نسخه مورد آزمون:

`main @ cf6b9636`

مرجع عملیاتی:

`https://forog1980-star.github.io/Shohada-app/`

هدف تست کوتاه:
1. ورود عادی به سامانه و اطمینان از اینکه Startup/جستجو/عملیات اصلی بدون تغییر کار می‌کند.
2. بررسی اینکه لایه AI در پس‌زمینه خطای مسدودکننده ایجاد نکرده است.
3. در Console مرورگر، در صورت دسترسی، وجود `window.GOLZAR_AI_INDEX` و وضعیت آماده‌شدن آن بررسی شود.
4. تعداد رکورد زنده Index باید با وضعیت فعلی `public.martyrs` قابل تطبیق باشد.
5. یک جستجوی واقعی با نام و محل قبر انجام شود؛ هدف این است که Index زنده در دسترس باشد و عملکرد اصلی سامانه مختل نشود.

**این مرحله هنوز از نظر انسانی نهایی نشده است.**


---

## 24. نهایی‌سازی کنترل کیفیت داده و انتشار لایه AI — 2026-10-07

این بخش آخرین وضعیت رسمی و قابل اتکای این مرحله است و در صورت تعارض با بخش‌های قدیمی‌تر گزارش، **مبنای فعلی ادامه کار** محسوب می‌شود.

### 24-1. نتیجه نهایی مرحله کنترل کیفیت داده

قابلیت «کنترل کیفیت داده» به‌عنوان یک ماژول مستقل به برنامه متصل شده و از همان **AI Live Index** مشترک تغذیه می‌شود.

زنجیره اجرایی فعلی:

`public.martyrs → AI Live Index → AI Layer Bridge → AI Quality Panel`

صفحه کنترل کیفیت داده:
- فقط خواندنی نسبت به داده اصلی است.
- داده‌های زنده `public.martyrs` را مصرف می‌کند.
- جستجو، فیلتر، صفحه‌بندی و مشاهده جزئیات دارد.
- ستون «جزئیات» در ابتدای جدول قرار دارد و در اسکرول کنترل شده است.
- گردش‌کار اصلاح/تأیید فعلی در `localStorage` مرورگر نگهداری می‌شود و به‌تنهایی هیچ تغییری در Supabase ایجاد نمی‌کند.
- نشان `AI` در ورودی کنترل کیفیت حفظ شده است.

### 24-2. «خلاصه هوشمندی داده»

این بخش **آمار عملیات بهسازی نیست**؛ بلکه شاخص‌های تحلیلی روابط، تکرارها، تعارض‌ها و نواقص بین رکوردهای `martyrs` را نشان می‌دهد.

شاخص‌ها:

| شاخص | تعریف |
|---|---|
| گروه‌های تکراری کامل | گروه‌هایی که ترکیب هویت و موقعیت مزار آن‌ها یکسان است. واحد شمارش «گروه» است، نه تعداد رکورد. |
| تعارض هویتی | یک هویت یکسان که در چند موقعیت کامل مزار مشاهده شده است. |
| تعارض محل | یک موقعیت کامل مزار که برای بیش از یک هویت متفاوت ثبت شده است. |
| رکورد ناقص | رکوردی که حداقل یکی از نام، نام خانوادگی، قطعه، ردیف یا شماره مزار را ندارد. |
| نیازمند یکسان‌سازی مرحله | رکوردی که مرحله ثبت‌شده آن قابل نگاشت به یک عنوان استاندارد است، بدون تغییر مقدار اصلی. |
| مراحل ناشناخته | رکوردهایی که مرحله آن‌ها در قواعد شناخت‌شده موتور قرار نمی‌گیرد. |

این شاخص‌ها **زنده‌اند** و با تغییر واقعی رکورد منبع و بازسازی/به‌روزرسانی Index می‌توانند تغییر کنند. اصلاحی که فقط در صف محلی مرورگر ثبت شود، این اعداد را تغییر نمی‌دهد.

### 24-3. اعداد مشاهده‌شده در تست انسانی

در تست انسانی Preview در 2026-10-07، کاربر این مقادیر را مشاهده کرد:

- گروه‌های تکراری کامل: **24**
- تعارض هویتی: **54**
- تعارض محل: **17**
- رکورد ناقص: **70**
- نیازمند یکسان‌سازی مرحله: **3**
- مراحل ناشناخته: **0**

این اعداد **نمونه وضعیت زمان تست** هستند و به‌عنوان مقدار ثابت یا Baseline آماری ثبت نمی‌شوند.

### 24-4. اصلاحات UI نهایی

در مرحله نهایی این موارد تکمیل شد:

- توضیح مستقیم زیر عنوان «خلاصه هوشمندی داده» برای رفع ابهام شاخص‌ها.
- افزایش فاصله افقی و عمودی کارت‌های شاخص‌ها و جلوگیری از فشردگی/هم‌پوشانی متن.
- اصلاح لایه‌بندی ستون «جزئیات» تا روی هدر پنجره قرار نگیرد.
- تثبیت هدر پنجره هنگام اسکرول و تنظیم `z-index` ستون جزئیات.
- جستجو با عبارت فارسی «شناسه، نام، نام خانوادگی، قطعه، ردیف یا شماره مزار…».
- دکمه «جزئیات» با رنگ متمایز آبی.
- راهنمای پایین صفحه فقط شامل «مرحله ثبت‌شده» و «مرحله استاندارد» است و زنجیره مرمت/تعویض در آن نمایش داده نمی‌شود.
- فونت پوسته اصلی و پنل AI روی زنجیره `B Nazanin → B Yekan → Tahoma → Arial` تنظیم شده است.

### 24-5. فایل‌های نهایی این مرحله

- `frontend/ai-quality-panel.js`
- `frontend/style.css`
- `frontend/index.html`
- مستندات فنی اصلی
- مستند فنی مستقل لایه AI: `docs/AI-LAYER/AI-TECHNICAL-REPORT-2026-10-07.md`

### 24-6. Merge رسمی

PR:
`#60 — تکمیل کنترل کیفیت داده با ظاهر نسخه جدید و گردش‌کار نسخه قدیمی`

وضعیت:
**MERGED**

Merge commit:
`9887a662049687ec525e62baf2529a56ea0550e0`

شاخه کاری:
`feature/ai-quality-legacy-ui-live-20261007`

آخرین Commit شاخه پیش از Merge:
`1aed1cbe5defa3d414693d4f6000c191c9bf6793`

### 24-7. آزمون‌ها و سطح اطمینان

تأیید فنی انجام‌شده:
- JavaScript Syntax: **PASS**
- بررسی وجود توضیح خلاصه هوشمندی: **PASS**
- بررسی فونت پنل و پوسته: **PASS**
- بررسی اصلاح `z-index` هدر/جزئیات: **PASS**
- بررسی نبود دستورات مستقیم SQL Write در پنل: **PASS / ZERO**
- تست انسانی Preview پس از اصلاحات UI: **PASS توسط کاربر**

وضعیت باقی‌مانده:
- **تست انسانی نهایی از نسخه عملیاتی `main` پس از Merge هنوز به‌صورت مستقل در این گزارش تأیید نشده است.**
- دسترسی اتصال فعلی به Vercel برای مشاهده مستقیم Deployment پروژه در این مرحله محدود به مجوز بود؛ بنابراین وضعیت Deployment از طریق API Vercel به‌صورت مستقل تأیید نشده است.

### 24-8. Recovery

Recovery Point پیش از این مجموعه مستندات:
`recovery/main-before-tech-reports-update-20261007`

Recovery مرحله بازسازی QA UI نیز جداگانه حفظ شده است:
`recovery/ai-quality-ui-before-reconstruction-20261007`

### 24-9. وضعیت نسخه اصلی

`main` اکنون شامل قابلیت کامل‌شده کنترل کیفیت داده و اصلاحات UI این مرحله است.

اصل معماری همچنان برقرار است:

`AI Live Index` و ماژول‌های AI **نباید داده اصلی Supabase را بدون مجوز تغییر دهند**.

### 24-10. نقطه پایان و شروع بعدی

**کنترل کیفیت داده و UI آن: CLOSED / STABLE از نظر کد و Merge**

تنها اقدام باقی‌مانده برای بسته‌شدن کامل عملیاتی این مرحله، **تست انسانی کوتاه روی نسخه نهایی main** است.

پس از آن، پروژه می‌تواند وارد موضوع بعدی شود؛ بدون دستکاری غیرضروری در موتور آمار زنده، AI Live Index یا POCهای قبلی.

## 2026-10-07 — اتصال کنترل کیفیت هوشمند به چرخه اصلاح و ثبت واقعی

در ادامه نهایی‌سازی پنل «کنترل کیفیت داده»، گردش‌کار اصلاح از حالت `localStorage` خارج و به یک صف دائمی در Supabase متصل شد. پیشنهاد اصلاح شامل تصویر رکورد اصلی، نسخه پیشنهادی، علت و زمان ثبت در `public.martyr_quality_corrections` نگهداری می‌شود. پس از بررسی ناظر، در صورت برگشت، اصلاح دوباره در همان صف ارسال می‌شود و در صورت تأیید نهایی، Edge Function مجاز اصلاح را به صورت اتمیک روی `public.martyrs` اعمال می‌کند.

برای جلوگیری از بازنویسی اطلاعات تازه، زمان `edited_at` منبع هنگام ثبت اصلاح ذخیره می‌شود و در زمان تأیید با مقدار فعلی مقایسه می‌گردد؛ در صورت تغییر رکورد اصلی، تأیید متوقف می‌شود.

### وضعیت فنی
- شاخه کاری: `feature/ai-quality-writeback-20261007`
- جدول جدید: `public.martyr_quality_corrections`
- تابع کنترل‌شده: `approve_martyr_quality_correction(uuid, uuid, text)`
- Edge Function: `approve-martyr-quality-correction`
- ثبت نهایی: فقط پس از احراز نقش `reviewer/admin`
- تست تراکنشی: PASS؛ با `ROLLBACK` و بدون تغییر ماندگار در داده عملیاتی
- Performance Advisor برای Policyهای صف اصلاحات: PASS
- Security Advisor: هشدار Anonymous Access مربوط به معماری موجود باقی است؛ هشدار حساس Security Definer برای RPC مستقیم برطرف شده است.
- تست واقعی مرورگر با یک حساب ناظر هنوز انجام نشده و پیش از Merge نهایی باید انجام شود.

این مرحله مرز مهم معماری AI را تثبیت می‌کند: AI تشخیص و پیشنهاد می‌دهد، ناظر تصمیم نهایی می‌گیرد، و ثبت در داده اصلی فقط از مسیر کنترل‌شده انجام می‌شود.
