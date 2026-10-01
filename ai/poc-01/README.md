# POC-01 — Matching Engine v0.1

این پوشه یک POC مستقل برای لایه هوش مصنوعی Shohada-app است.

## هدف
- نرمال‌سازی پایدار متن فارسی و ارقام
- Exact Match بر اساس هویت + محل مزار
- تشخیص Duplicate و Conflict بدون هیچ تغییر در داده واقعی
- Similar Match به‌صورت deterministic و قابل توضیح

## محدوده
این POC:
- به Supabase متصل نمی‌شود.
- هیچ INSERT/UPDATE/DELETE انجام نمی‌دهد.
- به Frontend و کد هسته متصل نشده است.
- تصمیم نهایی عملیاتی نمی‌گیرد.

## مدل تطبیق
کلید Exact:
`name + lastname + piece + grave_row + grave_number`

نام پدر در v0.1 فیلد تکمیلی است:
- اگر در هر دو رکورد وجود داشته باشد و متفاوت باشد، Exact رد می‌شود و Conflict گزارش می‌شود.
- اگر فقط در یکی وجود داشته باشد، مانع Exact نیست.

Duplicate:
- چند رکورد با Full Key یکسان.

Location Conflict:
- نام و نام خانوادگی یکسان ولی محل مزار متفاوت.

Similar:
- بر پایه Levenshtein و امتیاز محل، با آستانه‌های صریح و قابل آزمون.
- خروجی شامل دلیل تطبیق است.

## تست
بدون dependency خارجی:
`python -m unittest discover -s ai/poc-01 -p "test_*.py" -v`

این POC تا زمان Review و تأیید جدا از سامانه عملیاتی باقی می‌ماند.
