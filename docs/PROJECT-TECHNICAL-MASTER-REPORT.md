# گزارش فنی مرجع و نقطه ادامه پروژه Shohada-app / GolzarStone

> **این فایل مرجع اصلی ادامه پروژه است.** اگر ادامه کار در یک گفت‌وگوی جدید انجام شد، ابتدا همین فایل را بخوانید و سپس وضعیت GitHub / QA / Supabase را با وضعیت زنده تطبیق دهید.

**آخرین به‌روزرسانی:** 2026-09-14
**شاخه فعلی گزارش:** `fix/exact-filters-match-20260907`
**مخزن:** `forog1980-star/Shohada-app`
**نسخه عملیاتی:** `main` — فریز و محافظت‌شده
**نسخه مرجع نهایی قبلی:** `final/shohada-entry-2026-09-05`
**Commit مرجع نهایی قبلی:** `2f59fc0e879c1bbe9164de0823a51b7e55f618a4`

---

## 1. قانون ادامه پروژه

این فایل برای جلوگیری از از دست رفتن دانش پروژه در پایان هر گفت‌وگو تهیه شده است.

ترتیب ادامه کار:

1. خواندن این فایل.
2. بررسی شاخه، Commit و Recovery Point فعلی در GitHub.
3. بررسی آخرین وضعیت GitHub Actions / GitHub Pages / Vercel.
4. بررسی وضعیت Supabase به صورت read-only مگر اینکه تغییر داده یا schema صراحتاً لازم و ایمن باشد.
5. اجرای تغییر حداقلی.
6. تست فنی.
7. بررسی استقرار.
8. تست عملی توسط کاربر.
9. ثبت نتیجه در همین فایل.

**اصل مهم:** هیچ‌گاه صرفاً بر اساس متن قدیمی این فایل ادعا نشود که نسخه مستقر یا تست عملی موفق است؛ وضعیت زنده باید دوباره بررسی شود.

---

## 2. پروتکل ایمنی پروژه

الگوی اجباری:

**Recovery/Backup → Diagnose/Check → Minimal Change → Recheck → Technical Test → Deployment/Version Check → Practical User Test → Final Confirmation**

قواعد:

- `main` در زمان QA نباید تغییر کند.
- نسخه سالم عملیاتی نباید مستقیماً دستکاری شود.
- قبل از تغییر مهم، Recovery Point یا شاخه بازگشت ایجاد شود.
- تغییرات Supabase تا حد امکان read-only باشند.
- هیچ Service Role Key یا Secret در گزارش ثبت نشود.
- هر شکست باید با مسیر برگشت مشخص ثبت شود.
- «کد اصلاح شد»، «تست فنی موفق شد»، «استقرار موفق شد» و «تست عملی کاربر موفق شد» چهار وضعیت جداگانه‌اند.

---

## 3. وضعیت Git / شاخه‌ها

### شاخه QA فعلی

`fix/exact-filters-match-20260907`

### Recovery Point مهم قبل از اصلاح اخیر GitHub Pages

`recovery/qa-before-pages-fix-20260914`

مبنای این Recovery Point:

`a553a7ce3fa6dbbebd669b78c33e3da6db33fefc`

این شاخه باید تا تأیید نهایی QA حفظ شود.

### آخرین Commit QA ثبت‌شده در این گزارش

`29754080ea84f535f64e8500872b7ca54a2fcc6e`

موضوع: ساده‌سازی workflow استقرار GitHub Pages از دو job به یک job.

### Commitهای مهم اخیر

- `74e35b64dca5ff7ed1ff6501d688a4da183d04b1` — شروع exact-group search
- `3b282d4c4183fe38163b335cb298b7ff5a9b1b5c` — اصلاح integration و back/restore
- `7fcdf222010ad329817730d04f2818152414281b` — Recovery بعد از integration
- `c15718490b00ca06a68ebab126b5e95e5b111790` — اصلاح workflow/QA
- `b440101102c38c624e5f1366727580eaa608fab2` — اصلاح تاریخی Excel export
- `35ac4fe1ac48e9285f5645df1850cf6d11fd6d80` — cache-busting و اصلاح export
- `a553a7ce3fa6dbbebd669b78c33e3da6db33fefc` — آخرین workflow قبلی
- `29754080ea84f535f64e8500872b7ca54a2fcc6e` — workflow فعلی QA Pages

---

## 4. معماری فعلی

لودر اصلی:

1. `app.js`
2. `frontend/master-loader.js`
3. `stage-definition.js`
4. `final-qa-fix-2026-09-06.js`
5. `navigation-fix.js`
6. `search-pagination-fix.js`
7. `search-export-fix.js?v=20260914-02`
8. `search-exact.js`
9. `runtime-fix.js`
10. `search-back-restore-fix.js`
11. `search-exact-group-fix.js?v=20260914-01`
12. `stats-label.js`

در پایان loader مقدار `window.__GOLZAR_MASTER_READY__ = true` را تنظیم می‌کند.

### اجزای مهم

- `app.js`
- `frontend/master-loader.js`
- `stage-definition.js`
- `frontend/search-exact-group-fix.js`
- `frontend/search-back-restore-fix.js`
- `frontend/search-export-fix.js`
- `frontend/search-pagination-fix.js`
- `frontend/navigation-fix.js`
- `frontend/runtime-fix.js`
- `frontend/all-martyrs/`
- `AllMartyrsData/`
- ماژول‌های statistics

---

## 5. اصلاح Exact Search

هدف:

**Search → Exact/Similar Grouping → Detail → Back → Exact/Similar Grouping**

ماژول `frontend/search-exact-group-fix.js`:

- متن جستجو را normalize می‌کند.
- تطبیق دقیق برای `name`، `lastname`، `piece`، `grave_row`، `grave_number` و `stone_type` دارد.
- داده Supabase را در صفحات 1000تایی می‌خواند.
- حداکثر 100 page را بررسی می‌کند.
- نتایج را بر اساس `id` de-duplicate می‌کند.
- نتایج را به دو گروه `نتایج دقیق جستجو` و `نتایج مشابه` تقسیم می‌کند.
- نتایج دقیق همیشه ابتدا نمایش داده می‌شوند.
- خروجی Excel حفظ می‌شود.
- هیچ schema/data write در Supabase انجام نمی‌دهد.

Integration fix در Commit `3b282d4...`:

- `readCurrentFilters()`
- `window.__GOLZAR_SEARCH_FILTERS__`
- `window.__GOLZAR_SEARCH_RESULTS_DATA__`
- `window.__GOLZAR_SEARCH_RESULTS_HTML__`
- `window.__GOLZAR_SEARCH_RESULT_COUNT__`
- cache نتایج exact search
- restore توسط `window.restoreSearchPage`
- بازسازی گروه exact/similar هنگام برگشت از detail

Recovery مربوطه:

`docs/RECOVERY-SEARCH-EXACT-GROUP-AFTER-INTEGRATION-20260914.md`

---

## 6. Excel Export — وضعیت فعلی

مشکل QA:

کاربر گزارش کرد که در خروجی Excel، ستون `نام پدر` هنوز وجود دارد؛ در حالی که در فرم فعلی جستجو فیلد نام پدر وجود ندارد.

اقدامات انجام‌شده:

1. `search-export-fix.js` اصلاح شد تا فقط فیلدهای موجود در فرم/صفحه جستجو خروجی داده شوند.
2. `نام پدر` عمداً حذف شد.
3. cache-busting loader به `search-export-fix.js?v=20260914-02` تغییر کرد.
4. فایل روی Commit فعلی بررسی شد.
5. blob SHA فعلی فایل:
   `17140aad8627172aa52146c4176ab3f7e071cc86`
6. مشخص شد که بخشی از مشکل قبلی به عدم اجرای صحیح GitHub Pages deployment مربوط بوده است.

**وضعیت:** کد اصلاح شده است، اما پس از آخرین deployment باید تست عملی Excel توسط کاربر دوباره انجام شود. تا قبل از آن، موفقیت نهایی Excel اعلام نشود.

---

## 7. GitHub Pages QA

URL مورد استفاده QA:

`https://forog1980-star.github.io/Shohada-app/`

### Workflow فعلی

فایل workflow در:

`.github/workflows/`

ساختار فعلی به یک job ساده تبدیل شده است:

- checkout
- configure GitHub Pages
- upload Pages artifact
- deploy Pages

Commit مربوط:

`29754080ea84f535f64e8500872b7ca54a2fcc6e`

blob SHA workflow:

`262fb45a959d6ebe1629c773f9f44bac4f751818`

**نکته:** در زمان ایجاد این گزارش هنوز باید run جدید GitHub Actions به صورت زنده بررسی شود و موفقیت deployment تأیید شود.

---

## 8. GitHub Actions / Pages مشکل تاریخی

در workflow قبلی، build job موفق ولی deploy job شکست خورده بود.

Run قبلی:

`34835482890`

Jobها:

- build: `103948214859` — success
- deploy: `103948249586` — failure
- retry deploy: `103949899878` — failure

به دلیل نبود جزئیات کافی در لاگ deploy، workflow به single-job ساده تبدیل شد.

این تصمیم مطابق الگوی رسمی GitHub برای workflowهای Pages است.

---

## 9. Vercel

GitHub checkهای مرتبط با Commitهای QA اخیر موفق گزارش شده‌اند، از جمله:

- `Vercel – shohada-app-v2-pwa` — success
- `Vercel – shohada-app` — success
- `Vercel Preview Comments` — success

Preview شناخته‌شده:

`https://shohada-app-git-fix-exact-filters-match-20260907-forog1980-8339.vercel.app`

**محدودیت:** موفقیت check در GitHub به معنی تست بصری/runtime کامل نیست. برای ادعای runtime باید واقعاً صفحه و رفتارها بررسی شوند.

---

## 10. Supabase

Project:

`Shohada-app`

Project ref:

`bafrksgdcmglahyrppfy`

Organization:

`fayfzsjuknizgmumjbdb`

Region:

`ap-southeast-2`

Status:

`ACTIVE_HEALTHY`

Postgres:

`17.6`

### جداول عمومی فعلی

- `martyrs`
- `new_martyr_registrations`

### آخرین شمارش read-only ثبت‌شده

- `martyrs`: **2762 rows**
- بیشترین `id`: **12558**
- `new_martyr_registrations`: **0 rows**

### RLS

هر دو جدول RLS فعال دارند.

### هشدارهای Security Advisor

برای `martyrs` سیاست‌های public مربوط به SELECT/DELETE/INSERT/UPDATE وجود دارد.

برای `new_martyr_registrations` برخی سیاست‌های reviewer بر اساس authenticated role هستند.

Leaked password protection نیز فعال نشده است.

**تصمیم فعلی:** در QA این موارد دستکاری نشوند، چون تغییر RLS/public access بدون طراحی access model می‌تواند نسخه عملیاتی را بشکند. هر اصلاح امنیتی باید پروژه جداگانه و با Recovery انجام شود.

**تا اینجا هیچ Supabase write انجام نشده است.**

---

## 11. All Martyrs

مسیر داده:

`AllMartyrsData/`

فایل‌ها:

- `golzar_martyrs.xlsx`
- `outside_golzar_martyrs.xlsx`
- `README.md`

ماژول:

`frontend/all-martyrs/`

شامل:

- `all-martyrs.html`
- `all-martyrs.css`
- `data.js`
- `normalizer.js`
- `search.js`
- `ui.js`

داده UI/README حدود **28,368 رکورد / 2 منبع** گزارش می‌کند.

مسیرهای UI:

- جستجوی کل شهدا
- افزودن نام تکی
- افزودن نام گروهی
- بررسی
- گزارش آماری

All Martyrs از dataset عملیاتی سنگ مزار جدا نگه داشته می‌شود.

---

## 12. مسیرهای اصلی UI

صفحه اصلی دو مسیر اصلی دارد:

1. `جستجوی شهدا در کل بهشت زهرا`
2. `مدیریت و بهسازی سنگ مزار`

### All Martyrs

- `جستجوی کل شهدا`
- `افزودن نام تکی`
- `افزودن نام گروهی`

### Stone Management

- `جستجوی شهید`
- `ثبت اطلاعات`
- `تأیید ثبت اطلاعات`
- `گزارش‌های آماری`

بازگشت‌ها باید پایدار باشند و دکمه‌های بازگشت در سمت راست بالا قرار گیرند. فلش بازگشت به بالای صفحه در پایین صفحه وسط قرار می‌گیرد.

---

## 13. Stage / وضعیت سنگ

دو مسیر عملیاتی:

### ترمیمی

- `ارسال به واحد مرمت`
- `سنگ مرمتی آماده`
- `نصب مرمتی شده`

### تعویضی

- `ارسال به واحد تعویض`
- `سنگ تعویضی آماده`
- `تعویضی نصب شده`

انتخاب مرحله اجباری است.

با تغییر نوع عملیات، مرحله قبلی باید پاک شود و فقط مراحل نوع جدید فعال باشند.

تعریف مراحل در `stage-definition.js` متمرکز شده است.

---

## 14. قواعد اعتبارسنجی مهم

- آدرس قطعه/ردیف/شماره باید قابل ثبت باشد.
- نام/نام خانوادگی در ثبت باید به شکل قابل قبول ثبت شود؛ در صورت فقدان واقعی اطلاعات، منطق پروژه باید با مقدار خالی/اموات سازگار باشد و نباید داده جعلی ساخته شود.
- روز تولد باید در بازه معتبر 1 تا 31 باشد.
- ماه تولد باید 1 تا 12 باشد.
- سال تولد می‌تواند طبق قواعد فرم مقدار معتبر سالانه داشته باشد.
- ردیف و شماره صفر نباید به عنوان نتیجه عادی مکان تلقی شوند.

---

## 15. آمار و داده مرجع

`martyrs_master_v2.xlsx` پس از بررسی، تعداد مرجع اصلاح‌شده **2,975** را نشان می‌دهد؛ عدد قدیمی 2,095 اشتباه بوده است.

در آمار live calculator مقدار:

`BASELINE_MAX_ID = 12524`

استفاده شده و این موضوع باید در صورت تغییر scope داده عملیاتی دوباره بررسی شود.

---

## 16. نتایج QA تاریخی ثبت‌شده

نمونه تست‌های قبلی:

- نام محمد → 6604
- نام علی → 8037
- نام خانوادگی اکبری → 128 در general search
- exact piece 28 → 3523
- general one-field 28 → 3528
- row 10 → 2049
- number 10 → 993
- surname رضایی → 70
- محمد + اکبری → 5
- piece 28 + row 10 → 288
- piece 28 + row 10 + number 1 → 181
- عبارت محمد اکبری → 30

تست عملی exact surname قبلی:

- اکبری → 14
- عباسی → 21

**این دو نام صرفاً نمونه QA هستند و معیار انحصاری نیستند.**

---

## 17. تست‌های موفق قبلی

- حذف تأخیر طولانی نمایش آمار و نمایش snapshot اولیه.
- وجود دو مسیر اصلی در Home.
- ثبت شهید جدید و برگشت به Stone Management.
- انتخاب مرحله اجباری.
- پاک شدن مرحله هنگام تغییر نوع عملیات.
- عدم نمایش Delete در UI.
- جستجوی عمومی چندکلمه‌ای و partial.
- جدا شدن نتایج exact و similar.
- نمایش exact قبل از similar.
- back/restore برای exact search در سطح کد integration بررسی شده است.

---

## 18. موارد باز برای QA فعلی

### اولویت 1 — GitHub Pages

- بررسی آخرین workflow run مربوط به Commit `29754080...`
- اطمینان از success بودن deploy job
- اطمینان از اینکه Pages نسخه همین Commit را سرو می‌کند

### اولویت 2 — Excel

پس از deployment واقعی:

1. جستجو انجام شود.
2. Excel export اجرا شود.
3. ستون‌ها بررسی شوند.
4. تأیید شود `نام پدر` دیگر وجود ندارد.
5. تاریخ خروجی و edited date طبق نیاز پروژه بررسی شود.

### اولویت 3 — Exact Search

- exact name
- exact surname
- exact piece
- exact row
- exact number
- ترکیب فیلترها
- exact/similar separation
- ورود به detail و Back

### اولویت 4 — All Martyrs

- search
- filters
- back
- detail
- Excel export

### اولویت 5 — ثبت/تأیید

- validation
- stages
- save
- return navigation

---

## 19. چیزی که نباید انجام شود

- دستکاری `main` برای QA
- تغییر مستقیم داده عملیاتی Supabase برای حل مشکل UI
- حذف Recovery branch قبل از تأیید نهایی
- ادعای موفقیت deployment بدون بررسی run
- ادعای تست عملی بدون انجام تست
- تغییر هم‌زمان چند subsystem بدون نیاز
- ساخت داده demo در محیط عملیاتی

---

## 20. Recovery Points

### قبل از اصلاح workflow فعلی Pages

`recovery/qa-before-pages-fix-20260914`

### قبل/بعد integration exact-group

`docs/RECOVERY-SEARCH-EXACT-GROUP-BEFORE-20260914.md`

`docs/RECOVERY-SEARCH-EXACT-GROUP-AFTER-INTEGRATION-20260914.md`

Recovery بعد از integration:

`7fcdf222010ad329817730d04f2818152414281b`

---

## 21. راهنمای ادامه از گفت‌وگوی جدید

اگر گفت‌وگو قطع شد، به جای پرسیدن دوباره تاریخچه پروژه:

1. همین فایل را بخوان.
2. `README.md` را بخوان.
3. آخرین Commit QA را fetch کن.
4. آخرین GitHub Actions run را بررسی کن.
5. Recovery branch را بررسی کن.
6. وضعیت Supabase را read-only بررسی کن.
7. سپس فقط موارد باز بخش 18 را ادامه بده.

**نقطه فعلی ادامه:**

> بررسی live آخرین GitHub Pages workflow برای Commit `29754080ea84f535f64e8500872b7ca54a2fcc6e` و سپس آماده‌سازی نسخه QA برای تست عملی کاربر.

---

## 22. سیاست ثبت روزانه

در پایان هر جلسه کاری، این فایل باید با این موارد به‌روزرسانی شود:

- تاریخ و ساعت آخرین به‌روزرسانی
- branch و commit
- تغییرات انجام‌شده
- Recovery Point جدید
- تست‌های انجام‌شده و نتیجه واقعی
- وضعیت GitHub Actions
- وضعیت Vercel
- وضعیت Supabase
- موارد باز
- **نقطه دقیق ادامه برای جلسه بعد**

در صورت تغییر مهم، علاوه بر به‌روزرسانی این فایل، یک Recovery Markdown مستقل نیز ساخته شود تا تاریخچه برگشت از بین نرود.

---

## 23. وضعیت در زمان ثبت این گزارش

**کد QA:** در حال آماده‌سازی برای تست نهایی

**GitHub Pages:** نیازمند بررسی live run پس از Commit `29754080...`

**Vercel checks:** موفق در آخرین بررسی ثبت‌شده

**Supabase:** ACTIVE_HEALTHY؛ فقط read-only بررسی شده

**Supabase write:** انجام نشده

**main:** فریز و دست‌نخورده

**Recovery:** موجود

**Excel fix:** در کد موجود، تست عملی مجدد لازم

**Production-ready:** هنوز اعلام نشده
