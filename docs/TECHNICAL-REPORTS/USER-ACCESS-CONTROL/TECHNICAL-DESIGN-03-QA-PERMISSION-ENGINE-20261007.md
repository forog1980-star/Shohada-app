# گزارش فنی ۰۳ — پیاده‌سازی آزمایشی Permission Engine و Scope در QA

تاریخ: 2026-10-07

## هدف
اعتبارسنجی عملی طراحی مرکزی Users / Roles / Permissions / Data Scope / Separation of Duties بدون دستکاری داده عملیاتی.

## محدوده
- یک صفحه مستقل QA در `frontend/user-access-control-qa.html`
- موتور مجوز در `frontend/user-access-control-qa.js`
- نقش‌های نمونه
- Permissionهای ماژولار
- Scopeهای داده
- Multiple Roles
- Deny by Default
- Separation of Duties برای تأیید
- حذف عملیاتی عمداً Deny
- تست خودکار داخل صفحه
- ذخیره سناریو فقط در localStorage مرورگر

## نقش‌های نمونه
Viewer، Registration Operator، Rehabilitation Operator، Quality Reviewer، Quality Approver، Auditor، Manager، System Admin.

## Scope
global، assigned_unit، assigned_sections، own_records، assigned_records، read_only.

## تست‌های داخلی
۱۰ سناریوی منفی/مثبت اجرا می‌شود، از جمله:
- منع create برای viewer
- اجازه edit برای کارشناس بهسازی با scope مناسب
- رد scope ناکافی
- اجازه approve برای approver روی رکورد دیگر
- منع approve رکورد خود کاربر
- عدم اعطای خودکار دسترسی داده به system_admin
- منع delete
- رد unknown role
- ترکیب چند role
- رد کاربر بدون شناسه

## محدودیت عمدی
این مرحله به Supabase Auth، RLS، Policy، Function، Trigger، جدول کاربران/نقش‌ها یا داده `martyrs` متصل نشده است؛ زیرا آن بخش نیازمند طراحی و تصویب Schema/Authorization واقعی است. بنابراین این Preview را نباید سیستم احراز هویت Production تلقی کرد.

## نتیجه مورد انتظار
تمام ۱۰ تست داخلی باید PASS باشند و تغییر Role/Scope باید فوراً Effective Access را تغییر دهد.

## گام بعد
پس از تأیید QA انسانی، طراحی Backend واقعی شامل Auth، user/role/permission/scope tables، RLS، Audit Log و مدیریت امن نقش‌ها به‌صورت جداگانه و با Recovery Point انجام شود.


## تکمیل QA — ورود و بازیابی رمز

در بازبینی انسانی مشخص شد صفحه Permission Engine بدون Login نمایش داده می‌شود. این رفتار برای سیستم نهایی قابل قبول نیست.

### سیاست ورود نهایی
- هر کاربر داخلی حساب شخصی و قابل‌شناسایی دارد.
- ورود در ابتدای استفاده با نام کاربری + رمز عبور انجام می‌شود.
- نام کاربری می‌تواند روی همان دستگاه به خاطر سپرده شود تا کاربر فقط رمز را وارد کند.
- رمز عبور هرگز در localStorage، cookie عادی، دیتابیس قابل‌خواندن توسط Frontend یا فایل تنظیمات ذخیره نمی‌شود.
- در نسخه Production، نگهداری رمز فقط در زیرساخت احراز هویت انجام می‌شود و Frontend صرفاً credential را به Auth می‌دهد.
- در صورت درخواست کاربر، مرورگر/Password Manager می‌تواند رمز را به‌صورت امن برای autofill نگهداری کند؛ این موضوع با ذخیره رمز توسط برنامه متفاوت است.
- Session پایدار ناخواسته برای این سامانه داخلی نباید باعث حذف درخواست رمز در شروع ورود شود؛ سیاست Session/Timeout در طراحی Auth نهایی تعیین می‌شود.

### بازیابی رمز
دو مسیر پیش‌بینی شد:
1. مسیر خودکار: ارسال لینک/کد بازیابی از کانال احراز هویت فعال (ایمیل/پیام‌رسان/پیامک در صورت اتصال و تأیید زیرساخت).
2. مسیر اداری: اگر کانال بازیابی فعال نباشد، کاربر درخواست «فراموشی رمز» ثبت می‌کند و مدیر سیستم پس از احراز هویت فرد، فرآیند Reset را انجام می‌دهد.

رمز قبلی هیچ‌گاه برای کاربر یا مدیر نمایش داده نمی‌شود؛ مدیر باید Reset کند، نه اینکه رمز فعلی را مشاهده کند.

### QA
صفحه QA اکنون Login Gate و Forgot Password UX آزمایشی دارد. این بخش هنوز احراز هویت واقعی نیست و عمداً به Supabase Auth متصل نشده است.
