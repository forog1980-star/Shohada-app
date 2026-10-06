# AI Current State — GolzarStone
آخرین به‌روزرسانی: 2026-10-06

## وضعیت کلی
لایه AI در مرحله «ساخت زیربنا و کنترل داده» است؛ هنوز وارد ساخت دستیار مکالمه‌ای کامل نشده‌ایم.

## مسیر A — Data Intelligence / Statistics
### POC-01 Matching
Branch: ai/poc-01-matching-v0.1
وضعیت: POC ساخته شده.
منطق: Exact / Similar / Conflict / None
تست‌های ثبت‌شده: PASS در سطح POC
No database write

### POC-02 Data Intelligence
Branch: ai/poc-02-data-intelligence-changes-20261005
وضعیت: ماژول و تست‌ها ساخته شده‌اند.
کنترل‌ها:
Duplicate, Identity Conflict, Location Conflict, Field Conflict, Incomplete Data, Stage Normalization, Stage Anomaly, User Access, User History

### Statistics Engine
Version: 0.1.0
Unit Test: 11/11 PASS
Real QA execution: انجام شده
وضعیت باز: مقایسه منظم خروجی موتور با مرجع QA و تعیین Source of Truth نهایی

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
Current main reference: 236f8c4d0ca7e925ae236b3a828528a973a9fe59

## مهم‌ترین کار باز
1. تکمیل مقایسه Statistics Engine با QA مرجع.
2. تعیین منبع رسمی زنجیره Snapshot/Data → Data Intelligence → Statistics → Verified Statistics.
3. نگه‌داشتن POCها به‌صورت مستقل و جلوگیری از ادغام اشتباه با Live Statistics.
4. بعد از تثبیت مسیر A، طراحی دقیق مسیر B برای Intent و Conversational Search.
5. Voice به‌عنوان ورودی: Audio → Speech-to-Text → Intent/Entity → Search/Tool → Result.
6. Controlled Action فقط بعد از احراز دسترسی، Validation و در صورت نیاز تأیید انسانی.

## ممنوعیت‌های فعلی
- تغییر مستقیم main برای آزمایش
- تغییر داده یا Schema در Supabase بدون اجازه
- استفاده از عدد 1270 به‌عنوان آمار زنده
- جایگزین کردن Statistics Engine AI با Live Statistics اصلی
- ادغام کور POC-01 و POC-02
- دادن اختیار آزاد برای تغییر داده به مدل زبانی