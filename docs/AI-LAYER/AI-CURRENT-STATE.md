# AI Current State — GolzarStone
آخرین به‌روزرسانی: 2026-10-06

## وضعیت کلی
لایه AI در مرحله «ساخت زیربنا و کنترل داده» است؛ هنوز وارد ساخت دستیار مکالمه‌ای کامل نشده‌ایم.

## مسیر A — Data Intelligence / Statistics
### POC-01 Matching
Branch: ai/poc-01-matching-v0.1
وضعیت: POC ساخته شده.
منطق: Exact / Similar / Conflict / None
No database write

### POC-02 Data Intelligence
Branch: ai/poc-02-data-intelligence-changes-20261005
HEAD محلی: d6c2002
وضعیت: ماژول و تست‌های Data Intelligence روی GitHub ثبت شده‌اند.
کنترل‌ها:
Duplicate, Identity Conflict, Location Conflict, Field Conflict, Incomplete Data, Stage Normalization, Stage Anomaly, User Access, User History

### Statistics Engine — وضعیت ویژه
فایل:
statistics_engine.py

فایل تست:
test_statistics_engine.py

هر دو فعلاً **local-only** هستند؛ در شاخه GitHub POC-02 وجود ندارند.

Version: 0.1.0
Unit Test: 11/11 PASS
Real QA execution: انجام شده
وضعیت باز: مقایسه منظم خروجی موتور با مرجع QA و تعیین Source of Truth نهایی.

### سایر کارهای محلی POC-02
فایل‌ها/خروجی‌های زیر نیز فعلاً local-only هستند یا Untracked:
- build_qa_results.py
- qa_data_quality.py
- qa_page/
- qa_problem_records.csv
- qa_record_details_report.txt
- qa_results_2026-10-04.json
- فایل‌های Backup مربوط به QA و Data Intelligence

این فایل‌ها نباید حذف یا پاک‌سازی شوند تا Recovery Point تهیه و تکلیف انتشارشان مشخص شود.

## مسیر B — AI Cognitive / Software Control
وضعیت فعلی: معماری/هدف مشخص است و Bridge ایمن در سامانه قرار گرفته، اما Intent/Conversational/Voice هنوز به محصول عملیاتی کامل تبدیل نشده‌اند.

زنجیره هدف:
Intent → Conversational Search → Voice → Reports → Inspector → Controlled Actions

## آخرین خروجی عددی ثبت‌شده
Source: martyrs_supabase_snapshot_20261001.json
Records: 2767
Official: 2763
Out of scope: 4
تعویضی: 1589
ترمیمی: 1155
نامشخص: 23
پاک: 1784
مسئله‌دار: 983

این اعداد خروجی تحلیل Snapshot/QA هستند، نه آمار زنده امروز.

## Live Statistics اصلی
Live Statistics سامانه عملیاتی مسیر جداگانه دارد.
آن را با Statistics Engine AI ادغام مفهومی نکنیم.

## Bridge فعلی
File: frontend/ai-layer-bridge.js
Global: window.GOLZAR_AI_LAYER
Version: 0.1.0-safe
اصل Bridge: بدون Supabase Write، بدون جایگزینی توابع موجود، بدون مسدود کردن Startup و Fail-safe

## وضعیت محلی مهم
git status محلی نشان می‌دهد:
- Branch: ai/poc-02-data-intelligence-changes-20261005
- Tracking: origin/ai/poc-02-data-intelligence-changes-20261005
- HEAD: d6c2002
- سه فایل هسته Frontend محلی تغییر کرده‌اند:
  - ../../frontend/stage-definition.js
  - ../../frontend/statistics-live-calculator.js
  - ../../frontend/statistics.js
- این سه تغییر هنوز در origin این شاخه ثبت نشده‌اند و باید قبل از هر sync یا rebase بررسی و حفاظت شوند.

## مهم‌ترین کار باز
1. حفاظت از کار محلی POC-02 و تهیه Recovery Point.
2. بررسی دقیق سه تغییر Frontend و علت وجودشان.
3. بررسی و حفاظت از local-only Statistics Engine و QA artifacts.
4. تکمیل مقایسه Statistics Engine با QA مرجع.
5. تعیین منبع رسمی زنجیره Snapshot/Data → Data Intelligence → Statistics → Verified Statistics.
6. بعد از تثبیت مسیر A، طراحی قرارداد Intent/Entity برای مسیر B.
7. سپس Voice Input بر مبنای همان قرارداد.
8. Controlled Action فقط بعد از احراز دسترسی، Validation و در صورت نیاز تأیید انسانی.

## ممنوعیت‌های فعلی
- تغییر مستقیم main برای آزمایش
- تغییر داده یا Schema در Supabase بدون اجازه
- استفاده از عدد 1270 به‌عنوان آمار زنده
- جایگزین کردن Statistics Engine AI با Live Statistics اصلی
- ادغام کور POC-01 و POC-02
- حذف local-only files یا Backupها
- دادن اختیار آزاد برای تغییر داده به مدل زبانی