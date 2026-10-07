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
