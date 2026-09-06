# Schema نهایی بانک مستقل ثبت شهدای جدید

**پروژه:** Shohada-app / GolzarStone  
**تاریخ:** 2026-09-06  
**وضعیت:** طراحی نهایی — بدون اعمال تغییر در Supabase

## اصل معماری

این جدول فقط برای ثبت رکوردهای جدید شهدا و چرخه بررسی/تأیید آنهاست و از `public.martyrs` و فایل Master Excel کاملاً مستقل می‌ماند.

- Master Excel مرجع اطلاعات موجود و جستجوی کل شهداست.
- `public.martyrs` مربوط به سامانه مدیریت و بهسازی سنگ مزار است.
- جدول جدید فقط محل ثبت و گردش کار رکوردهای جدید خواهد بود.
- تا زمان تأیید صریح ساختار، هیچ جدول، ستون، Policy یا داده‌ای در Supabase ایجاد یا تغییر داده نمی‌شود.

## 1. نام جدول

```text
public.new_martyr_registrations
```

نام انتخابی عمداً بیانگر «ثبت‌های جدید» است تا با بانک اصلی شهدا و بانک سنگ مزار اشتباه نشود.

## 2. نام دقیق ستون‌ها

| ستون | عنوان فارسی | نوع داده | وضعیت |
|---|---|---|---|
| `id` | شناسه رکورد | uuid | سیستمی، کلید اصلی |
| `name` | نام | text | اطلاعات اصلی |
| `name_readable` | نام خواندنی | text | اطلاعات اصلی |
| `family` | نام خانوادگی | text | اطلاعات اصلی |
| `father_name` | نام پدر | text | اطلاعات اصلی |
| `gender` | جنسیت | text | اطلاعات اصلی |
| `birth_day` | روز تولد | smallint | تاریخ تولد |
| `birth_month` | ماه تولد | smallint | تاریخ تولد |
| `birth_year` | سال تولد | smallint | تاریخ تولد |
| `death_day` | روز شهادت | smallint | تاریخ شهادت |
| `death_month` | ماه شهادت | smallint | تاریخ شهادت |
| `death_year` | سال شهادت | smallint | تاریخ شهادت |
| `age` | سن | smallint | محاسباتی/ثبت‌شده |
| `operation` | عملیات | text | اطلاعات شهادت |
| `martyrdom_area` | منطقه شهادت | text | اطلاعات شهادت |
| `piece` | قطعه مزار | text | مشخصات مزار |
| `grave_row` | ردیف مزار | text | مشخصات مزار |
| `grave_number` | شماره مزار | text | مشخصات مزار |
| `notes` | توضیحات | text | اطلاعات تکمیلی/روند کار |
| `status` | وضعیت رکورد | text | سیستمی/گردش کار |
| `created_at` | زمان ایجاد | timestamptz | سیستمی |
| `updated_at` | زمان آخرین ویرایش | timestamptz | سیستمی |

### نکته مهم درباره مشخصات مزار

سه فیلد `piece`، `grave_row` و `grave_number` جدا نگه داشته می‌شوند. نوع آنها `text` است تا شماره‌ها با صفر ابتدایی، مقادیر خاص یا قالب‌های آینده بدون تبدیل عددی از بین نروند.

### نکته درباره نام خواندنی

`name_readable` یک فیلد مستقل است و برای شکل خواندنی/نمایشی نام استفاده می‌شود؛ مقدار `name` دستکاری یا جایگزین نمی‌شود.

### نکته درباره توضیحات

`notes` بخشی از Master Excel نیست و برای این بانک ثبت‌های جدید به‌عنوان فیلد تکمیلی/گردش کار در نظر گرفته شده است.

## 3. وضعیت رکوردها

مقادیر استاندارد پیشنهادی:

```text
pending
approved
needs_correction
rejected
```

معادل فارسی در رابط کاربری:

| مقدار سیستمی | نمایش فارسی |
|---|---|
| `pending` | در انتظار بررسی |
| `approved` | تأیید شده |
| `needs_correction` | نیازمند اصلاح |
| `rejected` | رد شده |

### قاعده گردش کار

```text
ثبت اولیه
   ↓
pending / در انتظار بررسی
   ↓
بررسی کارشناس
   ├── approved / تأیید شده
   ├── needs_correction / نیازمند اصلاح
   └── rejected / رد شده
```

در صورت `needs_correction`، رکورد برای اصلاح و بررسی مجدد باقی می‌ماند و حذف نمی‌شود.

## 4. قواعد دسترسی و امنیت

جدول در schema `public` قرار می‌گیرد اما **RLS باید از ابتدا فعال باشد**.

### `anon`

- دسترسی مستقیم به جدول: **ندارد**.
- SELECT: ممنوع
- INSERT: ممنوع
- UPDATE: ممنوع
- DELETE: ممنوع

### `authenticated`

پس از اتصال سامانه به احراز هویت:

- ثبت رکورد جدید: مجاز، طبق Policy
- مشاهده: فقط رکوردهای مجاز همان کاربر/فرآیند
- ویرایش: فقط در محدوده مجاز و تا قبل از تأیید نهایی
- تغییر وضعیت به `approved` یا `rejected`: فقط کاربر دارای نقش بررسی/تأیید
- حذف: محدود و ترجیحاً فقط برای نقش مدیریتی

نقش بررسی/تأیید باید از منبع امن مانند `app_metadata` یا سازوکار نقش مستقل تعیین شود؛ اطلاعات قابل ویرایش توسط خود کاربر نباید مبنای مجوز دسترسی قرار گیرد.

### `service_role` / Secret Key

کلیدهای حساس هرگز در JavaScript سمت مرورگر یا کد عمومی GitHub قرار نمی‌گیرند. عملیات مدیریتی یا حساس، در صورت نیاز، از مسیر امن سمت سرور/Edge Function انجام خواهد شد.

## طرح SQL مرجع — فقط برای بازبینی، اجرا نشده

```sql
create table public.new_martyr_registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_readable text,
  family text not null,
  father_name text not null,
  gender text,
  birth_day smallint,
  birth_month smallint,
  birth_year smallint,
  death_day smallint,
  death_month smallint,
  death_year smallint,
  age smallint,
  operation text,
  martyrdom_area text,
  piece text not null,
  grave_row text not null,
  grave_number text not null,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'needs_correction', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**این SQL در تاریخ فوق اجرا نشده است و صرفاً سند طراحی است.**

## تصمیم نهایی این مرحله

این Schema برای مرحله طراحی نهایی در نظر گرفته شده است. مرحله بعد، پس از تأیید کاربر، شامل تبدیل همین طراحی به migration/DDL واقعی، فعال‌سازی RLS و Policyهای دقیق، سپس تست و اتصال دکمه «تأیید و ثبت نهایی» خواهد بود.
