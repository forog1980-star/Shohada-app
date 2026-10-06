# AI Session Handoff — GolzarStone
آخرین به‌روزرسانی: 2026-10-06

## این جلسه چه کاری انجام شد؟
وضعیت لایه AI دوباره با GitHub و وضعیت محلی POC-02 تطبیق داده شد. چهار سند مرجع تداوم پروژه در شاخه مستندات ساخته شدند.

## نقطه مرجع GitHub
Main reference:
236f8c4d0ca7e925ae236b3a828528a973a9fe59

Branch مستندات:
docs/ai-continuity-20261006
PR:
#49

## وضعیت محلی POC-02
Path:
C:\مهدی\نرم افزار جستجوی شهدا\Shohada-app-AI-POC-01\ai\poc-02

Branch:
ai/poc-02-data-intelligence-changes-20261005

HEAD:
d6c2002

Origin tracking:
origin/ai/poc-02-data-intelligence-changes-20261005

### Local modifications که هنوز ثبت نشده‌اند
- ../../frontend/stage-definition.js
- ../../frontend/statistics-live-calculator.js
- ../../frontend/statistics.js

### Local-only AI/QA files
- statistics_engine.py
- test_statistics_engine.py
- build_qa_results.py
- qa_data_quality.py
- qa_page/
- qa_problem_records.csv
- qa_record_details_report.txt
- qa_results_2026-10-04.json
- Backupهای POC-02

## کارهای قبلی که باید حفظ شوند
POC-01: Matching Engine مستقل، بدون Database Write.
POC-02: Data Intelligence و تست‌های کنترل کیفیت داده.
Statistics Engine: Version 0.1.0؛ Unit Test برابر 11/11 PASS؛ اجرای روی QA واقعی انجام شده؛ مقایسه نظام‌مند با Reference QA هنوز باز است.
AI Bridge:
frontend/ai-layer-bridge.js
Commit:
236f8c4d0ca7e925ae236b3a828528a973a9fe59

## دو هدف اصلی که باید حفظ شوند
### هدف اول: آمار، خروجی و گزارش
AI باید در آینده بر اساس موتورهای قطعی بتواند وضعیت عملیات را بگوید، آمار قابل اتکا ارائه کند، گزارش مدیریتی بسازد، موارد مشکل‌دار را مشخص کند و روندها را توضیح دهد.

### هدف دوم: کنترل و تعامل هوشمند با نرم‌افزار
AI باید در آینده بتواند سؤال طبیعی کاربر را بفهمد، نام شهید و محل مزار را استخراج کند، بدون نیاز به تایپ کامل جست‌وجو انجام دهد، ورودی صوتی را به متن و سپس به Intent/Entity تبدیل کند و در مراحل بعد اقدامات مجاز را با کنترل و تأیید اجرا کند.

## قدم بعدی فنی
1. اول Recovery Point محلی برای POC-02 و سه فایل Frontend که تغییر کرده‌اند.
2. سپس بررسی دقیق diff همین سه فایل.
3. سپس حفاظت/ثبت Statistics Engine و تست آن.
4. بعد تکمیل مقایسه Statistics Engine با QA مرجع و تعیین Source of Truth.
5. بعد طراحی قرارداد Intent/Entity.
6. سپس طراحی Voice Input بر مبنای همان قرارداد.

## چیزهایی که فعلاً نباید انجام شوند
- تغییر داده یا Schema در Supabase.
- تغییر مستقیم main برای آزمایش.
- pull/rebase روی POC-02 قبل از حفاظت از کار محلی.
- ادغام کور POCها.
- مخلوط کردن Live Statistics سامانه با AI Statistics Engine.
- استفاده از 1270 به‌عنوان آمار زنده.
- حذف فایل‌های local-only یا Backupها.
- دادن اختیار مستقیم و بدون کنترل به AI برای تغییر داده.

## دستور شروع در چت جدید
ابتدا این چهار فایل را بخوانید:
AI-PROJECT-CONTEXT.md
AI-CURRENT-STATE.md
AI-DECISION-LOG.md
AI-SESSION-HANDOFF.md

سپس وضعیت زنده GitHub و مسیر فعال محلی را تطبیق دهید.
مرحله فعال فعلی:
Recovery Point → Frontend diff review → protect Statistics Engine → Statistics Reference Comparison

بعد از تثبیت مسیر A، مسیر Intent/Conversational/Voice فعال شود.