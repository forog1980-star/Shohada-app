# گزارش فنی جامع و مرجع لایه هوش مصنوعی سامانه بهسازی گلزار شهدا

> Project Marker: SHOHAda-AI-RESUME-20261005
> مرتبط با Marker پایه: SHOHAda-AI-RESUME-20260929
> تاریخ: 2026-10-05
> مخزن: forog1980-star/Shohada-app
> نسخه عملیاتی برنامه: 2.0.3
> وضعیت نسخه عملیاتی: فریز
> Branch این سند: docs/ai-layer-report-20261005

---

## 1. هدف سند

این سند مرجع فنی طراحی، معماری و مسیر توسعه Golzar AI Layer برای سامانه مدیریت و پایش بهسازی گلزار شهدا است.

هدف این لایه، اضافه‌کردن قابلیت‌های هوشمند برای کنترل کیفیت داده، تطبیق منابع مختلف، شناسایی Duplicate، کشف مغایرت، تحلیل آماری، توضیح اختلاف‌ها، اولویت‌بندی موارد مشکوک، تولید گزارش مدیریتی، پرسش و پاسخ به زبان طبیعی و ایجاد دستیار هوشمند برای سامانه بهسازی است.

این پروژه قرار نیست برنامه اصلی را بازنویسی کند؛ هدف، ساخت یک لایه مستقل و قابل‌کنترل در کنار آن است.

---

## 2. مرزبندی با برنامه اصلی

نسخه عملیاتی برنامه 2.0.3 فریز شده است.

AI Layer نباید:

- هسته برنامه را بازنویسی کند.
- بدون درخواست صریح Frontend عملیاتی را تغییر دهد.
- به‌صورت خودکار رکوردها را حذف یا ادغام کند.
- مستقیماً Supabase عملیاتی را Write کند.
- منطق تصمیم‌گیری قطعی برنامه را با LLM جایگزین کند.

AI Layer ابتدا به‌صورت مستقل توسعه و آزمایش می‌شود.

---

## 3. هدف واقعی AI

هدف پروژه «چت‌بات نمایشی» نیست.

هدف:

**تبدیل داده‌های عملیاتی گلزار به اطلاعات قابل‌کنترل، قابل‌تحلیل و قابل‌گزارش.**

نمونه سؤال‌ها:

- وضعیت سنگ‌ها چیست؟
- چند مورد در هر مرحله قرار دارند؟
- چه مواردی مغایرت دارند؟
- کدام رکوردها احتمالاً تکراری‌اند؟
- چه اسامی اختلاف نگارشی دارند؟
- چه رکوردهایی فقط در یک منبع وجود دارند؟
- مهم‌ترین مشکلات داده‌ای کدام‌اند؟
- وضعیت یک شهید یا یک قطعه چیست؟
- گزارش مدیریتی این ماه چیست؟

---

## 4. معماری کلان

```text
کاربر / مدیر
      ↓
Golzar AI Layer
      ↓
AI Gateway
      ↓
Intent / Extraction
      ↓
Business Logic
      ↓
Matching Engine + Statistics Engine
      ↓
Real Data / Snapshot / Excel
      ↓
Verified Result
      ↓
AI Response / Report
```

هسته تصمیم‌گیری نباید به یک مدل AI یا شرکت خاص وابسته شود.

---

## 5. تقسیم مسئولیت

### Python / منطق قطعی

مسئول Load، Validate، Normalize، تبدیل ارقام، Exact Match، Duplicate Detection، Fuzzy Match، Conflict Classification، محاسبه آمار و تولید خروجی ساختاریافته است.

### AI / LLM

مسئول تحلیل موارد پیچیده، توضیح مغایرت، خلاصه‌سازی، دسته‌بندی زبانی، پاسخ طبیعی به سؤال، تولید گزارش مدیریتی و کمک در اولویت‌بندی موارد برای بررسی است.

اصل:

**حقیقت عددی با کد قطعی؛ فهم و توضیح با AI.**

---

## 6. Local AI / Local LLM

Local LLM یعنی مدل زبانی روی رایانه داخلی اجرا شود.

معماری:

```text
PC داخلی
  ├── Python
  ├── Ollama
  └── Local LLM
```

هدف این است که پردازش حساس تا حد امکان در محل انجام شود.

بعد از دریافت Runtime و فایل مدل، اجرای مدل می‌تواند بدون اینترنت دائمی انجام شود.

---

## 7. Runtime و مدل اولیه

Runtime اولیه پیشنهادی: Ollama

مدل‌های اولیه برای Benchmark:

- Qwen3 4B
- Qwen3 8B

Qwen3 4B ابتدا آزمایش می‌شود و در صورت نیاز 8B بررسی می‌شود.

تصمیم نهایی مدل فقط بعد از تست واقعی فارسی و داده‌های پروژه گرفته می‌شود.

---

## 8. Offline-first

یکی از الزامات اصلی این است که AI در صورت قطع اینترنت نیز قابلیت پردازش محلی داشته باشد.

```text
Excel / Snapshot
      ↓
Python
      ↓
Matching
      ↓
Statistics
      ↓
Local LLM
      ↓
Report
```

بنابراین اینترنت برای اجرای خود مدل نباید شرط دائمی باشد.

---

## 9. GitHub Pages و Local AI

GitHub Pages و Local AI نقش یکسان ندارند.

GitHub Pages برای انتشار نسخه وب و دسترسی کاربران است.

Local AI برای تحلیل، محاسبه، اجرای مدل و تولید گزارش است.

معماری:

```text
GitHub Pages
      ↓
برنامه عملیاتی

PC داخلی
      ↓
AI Engine / Matching / Statistics / Local LLM
```

---

## 10. روشن‌بودن دائمی رایانه الزامی نیست

Local AI فقط وقتی تحلیل جدید تولید می‌کند که رایانه میزبان روشن باشد، اما رایانه لازم نیست 24/7 روشن بماند.

الگوی بهره‌برداری:

```text
درخواست یا زمان‌بندی
       ↓
روشن کردن PC
       ↓
اجرای Pipeline
       ↓
تولید گزارش
       ↓
ذخیره خروجی
       ↓
خاموش کردن PC
```

در زمان خاموش بودن PC، تحلیل جدید انجام نمی‌شود ولی برنامه وب می‌تواند فعال بماند و آخرین گزارش معتبر نیز حفظ شود.

---

## 11. Matching Engine

کلید منطقی اصلی:

```text
نام + قطعه + ردیف + شماره
```

نام به‌تنهایی برای تطبیق قطعی کافی نیست.

اطلاعات تکمیلی مانند نام پدر، تولد و شهادت می‌توانند برای تأیید بیشتر استفاده شوند.

---

## 12. Exact / Normalized / Probable / Review

طبقه‌بندی اصلی:

```text
MATCH_EXACT
MATCH_NORMALIZED
MATCH_PROBABLE
REVIEW_REQUIRED
```

Exact یعنی تطبیق قطعی، Normalized یعنی اختلاف صرفاً از نوع نرمال‌سازی مجاز، Probable یعنی احتمال بالا ولی غیرقطعی و Review Required یعنی تصمیم باید انسانی باشد.

---

## 13. Duplicate و Conflict

شناسه‌های پیشنهادی:

```text
CONFLICT_NAME
CONFLICT_PIECE
CONFLICT_ROW
CONFLICT_NUMBER
CONFLICT_MULTIPLE

DUPLICATE_EXACT
DUPLICATE_NORMALIZED

ONLY_SOURCE_A
ONLY_SOURCE_B
```

AI نباید Duplicate را حذف یا Merge کند.

---

## 14. اصل ایمنی Match

اصل پروژه:

**False Merge خطرناک‌تر از Missing Match است.**

```text
اطمینان بالا   → Match
اطمینان متوسط  → Probable / بررسی
اطمینان پایین  → REVIEW_REQUIRED
```

---

## 15. تشخیص اختلاف نگارشی

نمونه:

```text
محمد حسین حیدری
محمدحسین حیدری
```

Python می‌تواند تفاوت فاصله‌گذاری و دیگر اختلاف‌های نگارشی مجاز را نرمال کند و AI می‌تواند نتیجه را توضیح دهد.

---

## 16. AI Inspector

هدف مهم آینده، ایجاد «بازرس هوشمند اطلاعات» است.

```text
داده جدید
   ↓
کنترل
   ↓
Duplicate؟ Conflict؟ نام مشکوک؟ آدرس متناقض؟
وضعیت ناسازگار؟ رکورد ناقص؟ تغییر غیرعادی؟
   ↓
Finding
   ↓
اولویت‌بندی
   ↓
بررسی انسانی
```

AI Inspector تصمیم نهایی نمی‌گیرد.

---

## 17. Statistics Engine

Statistics Engine باید مرجع رسمی اعداد باشد.

```text
Data
  ↓
Deterministic Calculation
  ↓
Verified Statistics
  ↓
Dashboard / Reports / AI
```

LLM نباید خودش تعداد، درصد یا آمار عملیاتی تولید کند.

---

## 18. Natural-language Statistics

نمونه سؤال:

> وضعیت ساخت سنگ‌های تعویضی را گزارش کن.

فرآیند:

```text
سؤال
  ↓
Intent
  ↓
Query
  ↓
Statistics Engine
  ↓
عدد تأییدشده
  ↓
LLM
  ↓
گزارش فارسی
```

---

## 19. گزارش مدیریتی

AI می‌تواند گزارش فارسی مدیریتی تولید کند، اما گزارش باید Traceable باشد.

حداقل اطلاعات مطلوب:

- بازه زمانی
- منبع داده
- روش محاسبه
- اعداد
- وضعیت‌ها
- مغایرت‌ها
- موارد مشکوک
- موارد نیازمند بررسی

---

## 20. منابع داده

منابع احتمالی:

- Supabase
- Excel
- Snapshot
- خروجی واحد سنگ
- داده‌های گلزارته
- گزارش‌های تاریخی
- داده‌های کنترل کیفیت

هیچ منبع کمکی به‌صورت خودکار «منبع حقیقت مطلق» تلقی نمی‌شود.

---

## 21. ارتباط با گلزارته

قواعد موجود حفظ می‌شوند:

- Exact و Similar جدا بمانند.
- تطبیق محل برای Exact اهمیت دارد.
- Similar می‌تواند Candidate ارائه کند.
- Candidate نباید خودکار به رکورد اصلی تبدیل شود.
- عکس می‌تواند برای بررسی کاربر ارائه شود.

---

## 22. شش وضعیت رسمی سنگ

AI نباید نام رسمی مراحل را خودسرانه تغییر دهد.

1. ارسال طرح سنگ به واحد مرمت
2. سنگ مرمتی آماده نصب است
3. سنگ مرمت شده نصب شد
4. ارسال طرح سنگ به واحد تعویض
5. سنگ تعویضی آماده نصب است
6. سنگ تعویضی نصب شد

عبارت‌های قدیمی می‌توانند برای تحلیل نرمال شوند، اما نرمال‌سازی تحلیلی به معنی تغییر خودکار داده عملیاتی نیست.

---

## 23. POC-01 — Golzar Matching Engine v0.1

هدف: ایجاد موتور محلی تطبیق دو Excel بدون وابستگی اولیه به LLM.

مراحل:

1. بررسی ساختار
2. Validate
3. Normalize
4. Exact Match
5. Duplicate Detection
6. Fuzzy Match
7. Conflict Classification
8. Statistics
9. Excel Output
10. Test

---

## 24. POC-02 — Data Intelligence

پس از Matching، پروژه وارد Data Intelligence شده است.

شاخه مرتبط فعلی:

ai/poc-02-data-intelligence-changes-20261005

Commit ثبت‌شده:

d6c200259d472ea11c42fea909b7fdc5e542bf26

اجزای مستقل فعلی شامل:

ai/poc-02/data_intelligence.py
ai/poc-02/run_snapshot_analysis.py
ai/poc-02/test_data_intelligence.py
ai/poc-02/user_access.py
ai/poc-02/user_history.py
ai/poc-02/test_user_access.py
ai/poc-02/test_user_history.py

هدف این مرحله: کنترل داده، Identity Conflict، Location Conflict، Field Conflict، Incomplete Data، Stage Normalization، Stage Anomaly و کنترل‌های مفهومی دسترسی و تاریخچه.

---

## 25. Snapshot و تحلیل Read-only

Snapshot مورد استفاده:

martyrs_supabase_snapshot_20261001.json

تعداد رکورد Snapshot گزارش‌شده: 2767

در این مرحله Write روی داده عملیاتی انجام نمی‌شود.

---

## 26. نتایج ثبت‌شده A1.5

| شاخص | نتیجه |
|---|---:|
| کل رکوردها | 2767 |
| گروه‌های Duplicate | 24 |
| رکوردهای Duplicate | 48 |
| گروه‌های Identity Conflict | 54 |
| رکوردهای Identity Conflict | 178 |
| گروه‌های Location Conflict | 11 |
| رکوردهای Location Conflict | 22 |
| رکوردهای Incomplete | 70 |
| گروه‌های Field Conflict | 15 |
| رکوردهای Field Conflict | 30 |
| Stage Normalization | 1270 |
| Stage Anomaly | 0 |

این اعداد مربوط به Snapshot مورخ 2026-10-01 هستند و آمار زنده امروز محسوب نمی‌شوند.

---

## 27. Stage Normalization در برابر Stage Anomaly

Normalization یعنی تبدیل عبارت‌های قدیمی یا معادل به وضعیت رسمی برای تحلیل.

Anomaly یعنی مرحله ناشناخته یا ناسازگار.

در Snapshot ثبت‌شده:

Stage Normalization = 1270
Stage Anomaly = 0

نرمال‌سازی تحلیلی بدون مجوز نباید داده عملیاتی را تغییر دهد.

---

## 28. دسترسی کاربران و تاریخچه

در ادامه POC-02، مفاهیم نقش و تاریخچه نیز در AI Layer مستقل اضافه شده‌اند.

نقش‌های مدل‌شده:

- ثبت‌کننده
- ناظر
- مدیر
- مدیر سیستم

در عملیات آینده:

```text
AI
 ↓
Intent
 ↓
Permission Check
 ↓
Business Logic
 ↓
Validation
 ↓
Confirmation
 ↓
Action
```

---

## 29. AI Gateway

برای جلوگیری از وابستگی به یک مدل واحد، AI Gateway در معماری پیشنهادی قرار دارد.

```text
User
 ↓
AI Gateway
 ↓
Local / Internal / Cloud
 ↓
Intent
 ↓
Business Logic
```

این لایه باید امکان تعویض Provider و مدل را حفظ کند.

---

## 30. ورودی صوتی و پیام‌رسان‌ها

Voice Mode در آینده قابل طراحی است:

```text
Voice
 ↓
Speech-to-Text
 ↓
Intent / Extraction
 ↓
Validation
 ↓
Business Logic
 ↓
Confirmation
```

Eitaa و Bale نیز می‌توانند در آینده به‌صورت Adapter/Channel اضافه شوند؛ اما Token نباید در Frontend باشد و هر عملیات باید از Permission و Business Logic عبور کند.

---

## 31. موارد خارج از فاز اول

فعلاً نباید پروژه با موارد زیر سنگین شود:

- Chatbot عمومی
- اتصال همزمان سرویس‌های زیاد
- تحلیل تصویری سنگ
- اتصال گسترده پیام‌رسان‌ها
- عملیات خودکار روی داده
- بازنویسی Frontend
- جایگزینی Search فعلی
- تغییر Schema/RLS

---

## 32. امنیت و Supabase

اصل فعلی:

**AI Read-first / Read-only**

تا زمان تصویب مدل دسترسی و مجوز صریح، AI نباید INSERT، UPDATE، DELETE یا Schema Change انجام دهد.

همچنین Secretها نباید در Repository یا گزارش ثبت شوند و داده حساس بدون ضرورت به سرویس خارجی ارسال نشود.

---

## 33. معماری اجرایی دوره‌ای

الگوی واقعی بهره‌برداری:

```text
GitHub Pages → همیشه در دسترس

PC داخلی → روشن در زمان تحلیل
Python → پردازش
Local LLM → تحلیل
Report → ذخیره

PC → قابل خاموش شدن
```

آخرین گزارش معتبر می‌تواند پس از خاموش‌شدن رایانه باقی بماند.

---

## 34. معیارهای ارزیابی

موفقیت پروژه با «باهوش به‌نظر رسیدن» سنجیده نمی‌شود.

معیارها:

- دقت تطبیق
- کاهش False Match
- کاهش False Merge
- کشف مغایرت
- کیفیت اولویت‌بندی
- صحت آمار
- سرعت تولید گزارش
- کیفیت گزارش فارسی
- پایداری Offline

---

## 35. وضعیت پروژه در تاریخ 2026-10-05

- طراحی معماری AI: انجام شده
- تعریف Local AI و Offline-first: انجام شده
- تعریف رابطه GitHub Pages و Local AI: انجام شده
- Matching Engine: هسته اولیه ساخته شده و مبنای Data Intelligence است
- Data Intelligence: در حال توسعه/تثبیت
- Statistics Engine: مرحله بعدی اصلی
- Local LLM: هنوز نیازمند Benchmark واقعی قبل از انتخاب نهایی
- Supabase Write توسط AI: مجاز نیست مگر با درخواست صریح
- تغییر هسته برنامه عملیاتی: ممنوع مگر با درخواست مشخص

شاخه توسعه Data Intelligence فعلی:

ai/poc-02-data-intelligence-changes-20261005

Commit مهم ثبت‌شده:

d6c200259d472ea11c42fea909b7fdc5e542bf26

---

## 36. مسیر توسعه فعلی

```text
A1  Matching Engine
 ↓
A1.5 Data Intelligence
 ↓
A2  Statistics Engine
 ↓
A3  AI Intent Layer
 ↓
A4  Conversational Search
 ↓
A5  Voice Input
 ↓
A6  Natural-language Reports
 ↓
A7  AI Inspector
 ↓
A8  Controlled Actions
```

---

## 37. آخرین تصمیم کلیدی

> **GitHub Pages همیشه آنلاین + AI محلی که فقط هنگام نیاز یا طبق برنامه روشن و اجرا می‌شود.**

این معماری نیاز به روشن‌بودن دائمی PC را حذف می‌کند و برنامه وب را از موتور AI جدا نگه می‌دارد.

---

## 38. نقطه شروع ادامه کار

مرحله بعدی رسمی:

**A2 — Statistics Engine**

قبل از توسعه گسترده LLM باید شاخص‌های آماری رسمی، فرمول محاسبه، منبع هر شاخص و تست‌های مربوطه مشخص شوند.

اصل:

**ابتدا حقیقت داده و آمار با منطق قطعی؛ سپس هوش مصنوعی برای فهم، تحلیل، توضیح و تعامل.**

---

## 39. Marker ادامه

SHOHAda-AI-RESUME-20261005

این سند مرجع ادامه طراحی و توسعه Golzar AI Layer است.