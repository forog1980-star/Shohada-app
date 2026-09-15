# گزارش فنی مرجع و نقطه ادامه پروژه Shohada-app / GolzarStone

> این فایل مرجع اصلی ادامه پروژه است. در هر گفت‌وگوی جدید ابتدا این فایل خوانده شود و سپس وضعیت زنده GitHub / GitHub Pages / Vercel / Supabase با آن تطبیق داده شود.

**آخرین به‌روزرسانی:** 2026-09-14 — پایان جلسه QA
**مخزن:** `forog1980-star/Shohada-app`
**شاخه QA:** `fix/exact-filters-match-20260907`
**نسخه عملیاتی:** `main` — فریز و محافظت‌شده
**QA مستقر:** `cf8a1c67efc4f29544a8086a00ade42f2ddc18a7`

---

## 1. پروتکل اجباری پروژه

**Recovery/Backup → Diagnose/Check → Minimal Change → Recheck → Technical Test → Deployment/Version Check → Practical User Test → Final Confirmation**

- `main` در زمان QA تغییر نکند.
- Force reset / force push برای انتقال QA به main ممنوع است.
- قبل از تغییر مهم Recovery Point ایجاد شود.
- Supabase در QA تا حد امکان read-only باشد.
- Secret و Service Role Key در مستندات ثبت نشود.
- کد، تست فنی، Deploy و تست عملی کاربر چهار وضعیت جدا هستند.

---

## 2. نقطه پایان 2026-09-14

### تست عملی کاربر — PASS

- Exact Search: PASS
- تفکیک `نتایج دقیق جستجو` و `نتایج مشابه`: PASS
- جستجوی قطعه/ردیف/شماره: PASS
- Detail → Back و حفظ فیلترها/نتایج: PASS
- Excel Export: PASS
- حذف `نام پدر` از Excel: PASS
- ستون‌های تاریخ آخرین ویرایش و توضیحات ویرایش حفظ شده‌اند.

نمونه‌های ثبت‌شده:
- نام/نام خانوادگی: ۹ دقیق + ۵ مشابه
- قطعه ۲۸: ۴۸۴ دقیق
- قطعه ۲۸ + ردیف ۱۰: ۴ دقیق + ۴۵ مشابه
- قطعه ۲۸ + ردیف ۱۰ + شماره ۱: صفر دقیق + ۲۰ مشابه
- قطعه ۲۸ + ردیف ۱۰ + شماره ۲۰: ۲ دقیق + ۱ مشابه
- ردیف ۱۰ از ردیف ۱۰۱ به‌درستی تفکیک شد.

خروجی Excel نمونه نیز صحیح بود و شامل شناسه، نام، نام خانوادگی، قطعه، ردیف، شماره، نوع عملیات، مرحله، وضعیت تأیید، توضیحات، تاریخ ثبت، تاریخ آخرین ویرایش و توضیحات ویرایش بود؛ `نام پدر` وجود نداشت.

---

## 3. GitHub Pages — PASS واقعی

URL QA:
`https://forog1980-star.github.io/Shohada-app/`

Workflow run: `34842871631`
Job: `103971699092`
Commit مستقر: `cf8a1c67efc4f29544a8086a00ade42f2ddc18a7`
نتیجه: `success`

مراحل checkout، validation `frontend/index.html`، configure Pages، upload artifact و deploy همگی موفق بودند.

Artifact:
- ID: `10346208600`
- name: `github-pages`
- digest: `sha256:05d4dae6f8d529dae36ea9a44fc27f8951508d52ff2a93cac09e0fb05257a4ef`

---

## 4. Git / شاخه‌ها و Recovery

Recoveryهای مهم:
- `recovery/qa-before-pages-fix-20260914`
- `recovery/qa-before-pages-environment-fix-20260914`
- `recovery/qa-final-practical-pass-20260914`
- `recovery/main-before-final-merge-20260914`

Recovery `recovery/main-before-final-merge-20260914` تا تعیین تکلیف انتشار نهایی دست‌نخورده بماند.

`main`:
`7bd5083a3ddaa7ded6f5d497837b1ea787222fc1`

QA:
`cf8a1c67efc4f29544a8086a00ade42f2ddc18a7`

مقایسه زنده ثبت‌شده:
- status: `diverged`
- QA جلوتر: ۱۸۷ commit
- QA عقب‌تر: ۴۱ commit
- merge base: `be97ea9b3fda59e809ee26cad541b9335949fc6e`

PR شماره ۲۲ برای ادغام مستقیم بسته شد و **merge نشده است**. دلیل: تاریخچه دو شاخه diverged است و merge/reset مستقیم می‌تواند تغییرات عملیاتی main را از بین ببرد.

**قاعده:** main نباید به QA reset شود.

---

## 5. معماری فعلی و نقطه اتصال

`frontend/index.html` نقطه اتصال مرکزی است و باید پایدار بماند.

مسیر اصلی:
`GitHub Pages → frontend/index.html → master-loader.js → app.js + modules → Supabase`

Loader/ماژول‌های اصلی شامل stage-definition، final-qa-fix، navigation، pagination، export، exact search، runtime، back/restore، exact-group و statistics هستند.

ماژول All Martyrs نیز مستقل در `frontend/all-martyrs/` و داده‌ها در `AllMartyrsData/` قرار دارند.

---

## 6. Exact Search و Excel

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

## 7. Stage Definition — منبع رسمی

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

## 8. Supabase

Project: `Shohada-app`
Ref: `bafrksgdcmglahyrppfy`
Status: `ACTIVE_HEALTHY`
Postgres: `17.6`

آخرین بررسی read-only ثبت‌شده:
- `martyrs`: 2762 rows، max id = 12558
- `new_martyr_registrations`: 0 rows
- RLS فعال است.

هشدارهای Security Advisor درباره public policyهای `martyrs` و فعال نبودن leaked password protection عمداً در QA تغییر داده نشده‌اند؛ اصلاح امنیتی باید پروژه‌ای جداگانه با Recovery و access model مشخص باشد.

**در QA اخیر هیچ Supabase write یا schema change انجام نشده است.**

---

## 9. Vercel

Checkهای Vercel مربوط به QA اخیر موفق بوده‌اند، اما check موفق به‌تنهایی runtime test کامل محسوب نمی‌شود.

Preview شناخته‌شده:
`https://shohada-app-v2-pwa-git-fix-exact-filters-f73028-forog1980-8339.vercel.app`

برای ادامه QA، GitHub Pages با commit `cf8a1c67...` مرجع مستقر و تأییدشده است.

---

## 10. All Martyrs

فایل‌های اصلی:
- `AllMartyrsData/golzar_martyrs.xlsx`
- `AllMartyrsData/outside_golzar_martyrs.xlsx`
- `AllMartyrsData/README.md`
- `frontend/all-martyrs/` modules

هدف‌های قبلی این بخش حفظ شده‌اند و در جلسه 2026-09-14 تغییر جدیدی در آن اعمال نشد.

---

## 11. نقطه شروع فردا — 2026-09-15

### عنوان
**Integration امن QA با main — بدون آسیب به نسخه عملیاتی**

### اولین کار
ابتدا وضعیت زنده این موارد دوباره بررسی شود:
1. QA branch و commit
2. main و commit
3. Recovery `recovery/main-before-final-merge-20260914`
4. آخرین GitHub Pages deployment
5. آخرین Vercel check
6. Supabase health/count به صورت read-only

### سپس
قبل از هر merge جدید، یک Recovery Point اختصاصی Integration از `main` ایجاد شود.

سپس اختلاف `main ↔ QA` به‌صورت ساختاری و فایل‌به‌فایل بررسی شود. یک Integration/Release branch از `main` ساخته شود و فقط تغییرات مورد تأیید QA به آن منتقل شوند.

**هدف حذف تاریخچه main نیست. هدف ترکیب کنترل‌شده قابلیت‌های تأییدشده QA با تغییرات عملیاتی main است.**

بعد از حل conflictها:
- تست فنی کامل
- Deploy مستقل
- تست عملی کاربر
- و فقط پس از PASS نهایی، تصمیم درباره merge به main

**Force push/reset روی main ممنوع.**

---

## 12. فایل‌های مرجع

- `PROJECT_SAFETY_RULES.md`
- `DEVELOPMENT_WORKFLOW.md`
- `PROJECT_CHARTER.md`
- `docs/PROJECT-TECHNICAL-MASTER-REPORT.md` ← مرجع اصلی
- `docs/QA-FINAL-PRACTICAL-PASS-20260914.md`
- `docs/RECOVERY-SEARCH-EXACT-GROUP-BEFORE-20260914.md`
- `docs/RECOVERY-SEARCH-EXACT-GROUP-AFTER-INTEGRATION-20260914.md`
- `docs/FINAL-FREEZE-2026-09-05.md`

---

## 13. وضعیت نهایی جلسه

**QA:** PASS عملی

**GitHub Pages:** PASS / Deploy واقعی

**Exact Search / Exact-Similar / Back / Excel:** PASS عملی

**Supabase:** بدون تغییر

**main:** سالم و محافظت‌شده

**Final Production Merge:** انجام نشده؛ نیازمند Integration امن و تست مجدد است.

**نقطه پایان امروز:** `cf8a1c67efc4f29544a8086a00ade42f2ddc18a7`

**نقطه شروع فردا:** Recovery جدید برای Integration → تحلیل اختلاف main و QA → Integration branch → حل کنترل‌شده conflictها → تست فنی → Deploy → تست عملی → تصمیم نهایی درباره main.
