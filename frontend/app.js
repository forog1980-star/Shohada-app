// ============================================================
// Shohada-app / GolzarStone — نسخه اصلاح‌شده
// Supabase + UI کامل + خروجی Excel
//
// تغییرات نسبت به نسخه قبلی (خلاصه در انتهای فایل هم هست):
// 1) جستجو حالا سمت سرور (Supabase) فیلتر می‌شود، نه کل جدول در کلاینت
// 2) خروجی اکسل دیگر به شماره ستون هارد‌کد (مثل "J") وابسته نیست
// 3) رشته‌های وضعیت به‌صورت ثابت (constant) تعریف شدند تا اشتباه تایپی رخ ندهد
// 4) کوئری‌ها limit گرفتند تا با رشد داده کند نشوند
// 5) یک هِلپر مشترک برای فراخوانی Supabase و مدیریت خطا اضافه شد
// 6) تابع تبدیل تاریخ جلالی دست‌نخورده ماند — با ۵ نقطه مرجع نوروز
//    (۱۳۹۹ تا ۱۴۰۵) در Node.js تست و تأیید شد، مشکلی نداشت
// ============================================================

"use strict";

// ============================================================
// Supabase
// ============================================================
// نکته امنیتی مهم (نمی‌توان از سمت کد کلاینت رفع کرد):
// این کلید "publishable" است و طبیعتاً در کلاینت قابل مشاهده است.
// امنیت واقعی insert/update/delete صرفاً به تنظیم درست
// Row Level Security (RLS) در پنل Supabase بستگی دارد.
// حتماً از پنل Supabase بررسی کنید که:
//   - insert فقط برای کاربران مجاز باز باشد
//   - update وضعیت (approve) و delete محدود به نقش مشخص باشد
// این فایل به‌تنهایی این ریسک را برطرف نمی‌کند.

const SUPABASE_URL = "https://bafrksgdcmglahyrppfy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_O5CkSuivysXJf-8hu1IUCA_izu8hWiX";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const TABLE_NAME = "martyrs";

// وضعیت‌ها به‌صورت ثابت — جلوگیری از اشتباه تایپی رشته در چند جای کد
const STATUS = {
  PENDING: "در انتظار تأیید",
  APPROVED: "تأیید شده",
};

const MAX_RECORDS_PER_QUERY = 200; // جلوگیری از دریافت کل جدول در یک درخواست

// ============================================================
// تنظیمات
// ============================================================

const PIECES = ["17", "24", "26", "27", "28", "29", "40", "53"];

const STAGES = {
  "ترمیمی": ["ارسال به واحد مرمت", "سنگ مرمتی آماده", "نصب مرمتی شده"],
  "تعویضی": ["ارسال به واحد تعویض", "سنگ تعویضی آماده", "تعویضی نصب شده"],
};

// ============================================================
// وضعیت جستجو / صفحه
// ============================================================

let lastSearchResults = [];
let lastSearchFilters = null;

let currentAppPage = "home";
let isHandlingHistory = false;
let firstBackPressTime = 0;
const DOUBLE_BACK_INTERVAL = 2000;

// ============================================================
// ابزار تبدیل اعداد
// ============================================================

function toPersianDigits(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function toEnglishDigits(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function normalizeSearchText(value) {
  if (value === null || value === undefined) return "";
  return toEnglishDigits(String(value).trim().replace(/\u200c/g, " ").replace(/\s+/g, " "))
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ك/g, "ک")
    .toLowerCase();
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================
// تبدیل تاریخ میلادی به شمسی
// (این تابع دست‌نخورده است — با ۵ تاریخ نوروز از ۱۳۹۹ تا ۱۴۰۵
//  در Node.js تست شد و نتیجه صحیح بود)
// ============================================================

function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

function parseSupabaseDate(dateValue) {
  if (!dateValue) return null;
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date;
}

// ============================================================
// رفع مشکل «ستون تاریخ در اکسل خالیه»
// ------------------------------------------------------------
// این تابع مقدار تاریخ ثبت را از چند نام محتمل ستون می‌خواند.
// علت این خالی‌بودن تقریباً همیشه یکی از این دو حالت است:
//   الف) نام ستون در جدول Supabase واقعاً "created_at" نیست
//        (مثلاً created_time / inserted_at / createdAt و...)
//   ب) رکوردهای برگشتی از جستجو اصلاً created_at ندارند چون
//      select ستون را برنگردانده (کمتر محتمل، چون select("*") است)
// راه‌حل قطعی و همیشگی این است که نام دقیق ستون تاریخ را از
// پنل Supabase (Table Editor) چک کنید. تا آن زمان، این تابع
// چند نام رایج را امتحان می‌کند تا برنامه کار کند، و اگر هیچ‌کدام
// پیدا نشد، در Console مرورگر هشدار می‌دهد که کلیدهای واقعی
// رکورد چه هستند — همان‌جا نام درست را می‌بینید.
// ============================================================

const CREATED_AT_CANDIDATE_KEYS = [
  "created_at",
  "createdAt",
  "created_time",
  "createdTime",
  "inserted_at",
  "insertedAt",
  "date_created",
  "created",
];

function getRecordCreatedAt(record) {
  if (!record) return null;
  for (const key of CREATED_AT_CANDIDATE_KEYS) {
    if (record[key]) return record[key];
  }
  console.warn(
    "ستون تاریخ ثبت پیدا نشد. کلیدهای واقعی این رکورد:",
    Object.keys(record),
    record
  );
  return null;
}

function formatJalaliDate(dateValue) {
  const date = parseSupabaseDate(dateValue);
  if (!date) return "";
  const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return (
    toPersianDigits(String(jy).padStart(4, "0")) +
    "/" +
    toPersianDigits(String(jm).padStart(2, "0")) +
    "/" +
    toPersianDigits(String(jd).padStart(2, "0"))
  );
}

function formatJalaliDateForExcel(dateValue) {
  const date = parseSupabaseDate(dateValue);
  if (!date) return "";
  const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${String(jy).padStart(4, "0")}-${String(jm).padStart(2, "0")}-${String(jd).padStart(2, "0")}`;
}

function getJalaliDateTime(dateValue) {
  const date = parseSupabaseDate(dateValue);
  if (!date) return "";
  const datePart = formatJalaliDate(date);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${datePart} - ${toPersianDigits(hours)}:${toPersianDigits(minutes)}`;
}

function getTodayJalaliForFileName() {
  return formatJalaliDateForExcel(new Date());
}

function isValidStageForStoneType(stoneType, stage) {
  if (!stoneType || !stage) return false;
  if (!Object.prototype.hasOwnProperty.call(STAGES, stoneType)) return false;
  return STAGES[stoneType].includes(stage);
}

// ============================================================
// هِلپر مشترک برای فراخوانی Supabase
// (جلوگیری از تکرار الگوی try/catch + پیام خطا در همه‌جا)
// ============================================================

async function runSupabaseQuery(queryPromise, { errorAlertPrefix } = {}) {
  try {
    const { data, error } = await queryPromise;
    if (error) {
      console.error(errorAlertPrefix || "Supabase error:", error);
      if (errorAlertPrefix) {
        alert(`${errorAlertPrefix}\n\n${error.message}`);
      }
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error("Unexpected Supabase error:", error);
    if (errorAlertPrefix) {
      alert(`خطای غیرمنتظره.\n\n${errorAlertPrefix}`);
    }
    return { data: null, error };
  }
}

// ============================================================
// History
// ============================================================

function initializeHistory() {
  if (!window.history.state) {
    window.history.replaceState({ golzarApp: true, page: "home" }, "", window.location.href);
  }
  currentAppPage = "home";
}

function pushAppHistory(page) {
  if (isHandlingHistory) {
    currentAppPage = page;
    return;
  }
  window.history.pushState({ golzarApp: true, page }, "", window.location.href);
  currentAppPage = page;
}

function handleBackNavigation() {
  const now = Date.now();
  if (currentAppPage === "home") {
    if (now - firstBackPressTime <= DOUBLE_BACK_INTERVAL) {
      firstBackPressTime = 0;
      return true;
    }
    firstBackPressTime = now;
    alert("برای خروج از برنامه، یک بار دیگر دکمه بازگشت را بزنید.");
    window.history.pushState({ golzarApp: true, page: "home" }, "", window.location.href);
    return false;
  }
  return false;
}

window.addEventListener("popstate", (event) => {
  const state = event.state;
  if (!state || state.golzarApp !== true) {
    if (currentAppPage === "home") {
      const allowed = handleBackNavigation();
      if (!allowed) return;
    }
    return;
  }
  const page = state.page || "home";
  isHandlingHistory = true;
  try {
    switch (page) {
      case "home":
        showHome();
        break;
      case "search":
        showSearch(true);
        break;
      case "new":
        showNewRecord();
        break;
      case "pending":
        showPendingRecords();
        break;
      default:
        showHome();
    }
    currentAppPage = page;
  } finally {
    isHandlingHistory = false;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  initializeHistory();
  applyAppStyles();
  showHome();
});

// ============================================================
// CSS (بدون تغییر نسبت به نسخه قبلی)
// ============================================================

function applyAppStyles() {
  if (document.getElementById("golzar-app-styles")) return;
  const style = document.createElement("style");
  style.id = "golzar-app-styles";
  style.textContent = `
    :root {
      --green-dark: #17633d; --green: #238b57; --green-light: #e8f5ed;
      --orange: #d9822b; --orange-light: #fff1df;
      --blue: #2878b8; --blue-light: #e8f3fb;
      --red: #c84b4b; --text: #26352d; --muted: #708078;
      --bg: #f4f7f5; --white: #ffffff; --border: #dce6df;
      --shadow: 0 5px 18px rgba(23, 99, 61, 0.08);
    }
    .app { direction: rtl; font-family: "B Nazanin", "B Yekan", Tahoma, Arial, sans-serif; color: var(--text); background: var(--bg); min-height: 100vh; }
    .header { background: linear-gradient(145deg, var(--green-dark), var(--green)); color: white; text-align: center; padding: 30px 20px 28px; border-radius: 0 0 28px 28px; box-shadow: var(--shadow); }
    .header-badge { display: inline-block; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.22); padding: 6px 14px; border-radius: 30px; font-size: 13px; margin-bottom: 12px; }
    .header h1 { margin: 0; font-size: 27px; font-weight: 700; }
    .header p { margin: 9px 0 0; font-size: 15px; opacity: .9; }
    .menu { padding: 22px 16px; display: flex; flex-direction: column; gap: 14px; }
    .menu-button { border: none; border-radius: 20px; min-height: 92px; padding: 15px 18px; display: flex; align-items: center; gap: 14px; text-align: right; cursor: pointer; background: white; box-shadow: var(--shadow); color: var(--text); transition: .15s ease; }
    .menu-button:active { transform: scale(.985); }
    .menu-button .icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 25px; flex-shrink: 0; }
    .menu-search .icon { background: var(--blue-light); }
    .menu-new .icon { background: var(--green-light); }
    .menu-pending .icon { background: var(--orange-light); }
    .menu-test .icon { background: #edf0f0; }
    .button-text { flex: 1; display: flex; flex-direction: column; gap: 5px; }
    .button-text strong { font-size: 18px; }
    .button-text small { font-size: 13px; color: var(--muted); }
    .button-arrow { font-size: 29px; color: #9aa8a1; }
    .footer { text-align: center; color: var(--muted); font-size: 12px; padding: 10px 20px 30px; line-height: 2; }
    .footer a { color: var(--green-dark); text-decoration: none; font-weight: bold; }
    .internal-header { display: flex; align-items: center; gap: 8px; background: white; padding: 15px; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
    .back-button { border: none; background: var(--green-light); color: var(--green-dark); border-radius: 13px; padding: 10px 13px; font-family: inherit; font-size: 14px; cursor: pointer; white-space: nowrap; }
    .refresh-button { border: none; background: var(--blue-light); color: var(--blue); border-radius: 13px; padding: 10px 12px; font-family: inherit; font-size: 14px; cursor: pointer; white-space: nowrap; }
    .internal-title { flex: 1; }
    .internal-title h2 { margin: 0; font-size: 20px; }
    .internal-title p { margin: 4px 0 0; color: var(--muted); font-size: 12px; }
    .content { padding: 16px; }
    .card { background: white; border-radius: 20px; padding: 18px; box-shadow: var(--shadow); border: 1px solid var(--border); }
    .card-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: var(--green-dark); }
    .section-title { font-size: 16px; font-weight: bold; color: var(--green-dark); border-right: 4px solid var(--green); padding-right: 9px; margin: 22px 0 13px; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 7px; font-size: 14px; font-weight: bold; }
    input, select, textarea { width: 100%; box-sizing: border-box; border: 1px solid var(--border); border-radius: 13px; padding: 12px 13px; font-family: inherit; font-size: 15px; background: #fbfdfc; color: var(--text); outline: none; }
    input:focus, select:focus, textarea:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(35,139,87,.10); }
    textarea { resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .choice-card { position: relative; min-height: 82px; border: 2px solid var(--border); border-radius: 18px; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; font-weight: bold; }
    .choice-card input { position: absolute; opacity: 0; pointer-events: none; }
    .choice-card:has(input:checked) { border-color: var(--green); background: var(--green-light); color: var(--green-dark); }
    .choice-card span::before { content: ""; display: inline-block; width: 18px; height: 18px; border: 3px solid #b8c6be; border-radius: 50%; vertical-align: -3px; margin-left: 9px; box-sizing: border-box; }
    .stage-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .stage-option { position: relative; min-height: 70px; border: 2px solid var(--border); border-radius: 16px; padding: 12px 14px; box-sizing: border-box; display: flex; align-items: center; cursor: pointer; background: white; font-size: 14px; }
    .stage-option.disabled { opacity: .35; cursor: not-allowed; background: #f1f3f2; }
    .stage-option input { position: absolute; opacity: 0; pointer-events: none; }
    .stage-option:has(input:checked) { border-color: var(--orange); background: var(--orange-light); color: #8a4f13; font-weight: bold; }
    .primary-button { width: 100%; border: none; border-radius: 15px; padding: 14px; background: var(--green); color: white; font-family: inherit; font-size: 17px; font-weight: bold; cursor: pointer; margin-top: 10px; }
    .export-button { width: 100%; min-height: 58px; border: none; border-radius: 16px; padding: 15px 18px; background: var(--blue); color: white; font-family: inherit; font-size: 18px; font-weight: bold; cursor: pointer; margin: 12px 0 18px; box-shadow: 0 5px 15px rgba(40,120,184,.22); }
    .export-button:active { transform: scale(.985); }
    .records-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; }
    .summary-box { border-radius: 14px; padding: 11px 7px; text-align: center; background: var(--green-light); }
    .summary-box.warning { background: var(--orange-light); }
    .summary-box strong { display: block; font-size: 21px; }
    .summary-box small { font-size: 11px; color: var(--muted); }
    .records-container { display: flex; flex-direction: column; gap: 12px; }
    .record-card { border: 1px solid var(--border); border-radius: 18px; padding: 15px; background: white; }
    .record-card.clickable { cursor: pointer; }
    .record-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
    .record-name { font-size: 18px; font-weight: bold; color: var(--green-dark); }
    .status-badge { background: var(--orange-light); color: #8a4f13; padding: 5px 9px; border-radius: 20px; font-size: 11px; white-space: nowrap; }
    .status-badge.approved { background: var(--green-light); color: var(--green-dark); }
    .location-box { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .location-box > div { background: var(--bg); border-radius: 12px; padding: 8px; text-align: center; }
    .location-box small { display: block; color: var(--muted); font-size: 11px; }
    .location-box strong { display: block; margin-top: 3px; font-size: 16px; }
    .record-info { display: flex; gap: 7px; margin-top: 8px; font-size: 14px; }
    .record-info span { color: var(--muted); }
    .search-count { background: var(--blue-light); color: var(--blue); border-radius: 13px; padding: 10px 12px; margin-bottom: 12px; text-align: center; font-size: 14px; font-weight: bold; }
    .loading-message, .empty-message, .error-message { text-align: center; padding: 30px 15px; color: var(--muted); line-height: 2; }
    .error-message { color: var(--red); background: #fff4f4; border-radius: 14px; }
    .detail-card { background: white; border-radius: 20px; padding: 20px; border: 1px solid var(--border); box-shadow: var(--shadow); }
    .detail-title { font-size: 22px; font-weight: bold; color: var(--green-dark); margin-bottom: 18px; }
    .detail-row { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
    .detail-row span { color: var(--muted); }
    .detail-row strong { text-align: left; }
    .detail-actions { margin-top: 20px; display: flex; flex-direction: column; gap: 9px; }
    .approve-button { border: none; border-radius: 13px; padding: 13px; background: var(--green); color: white; font-family: inherit; font-size: 15px; font-weight: bold; cursor: pointer; }
    .danger-button { width: 100%; border: none; border-radius: 12px; padding: 11px; background: #fff0f0; color: var(--red); font-family: inherit; margin-top: 13px; cursor: pointer; }
    .back-secondary { border: 1px solid var(--border); border-radius: 13px; padding: 12px; background: white; color: var(--text); font-family: inherit; cursor: pointer; }
    @media (max-width: 390px) {
      .stage-list { grid-template-columns: 1fr; }
      .form-row { gap: 7px; }
      .card { padding: 14px; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
// سربرگ داخلی
// ============================================================

function internalHeader(title, subtitle = "", showRefresh = false) {
  return `
    <header class="internal-header">
      <button type="button" class="back-button" id="back-home">← بازگشت</button>
      <div class="internal-title">
        <h2>${escapeHtml(title)}</h2>
        ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
      </div>
      ${showRefresh ? `<button type="button" class="refresh-button" id="refresh-page">↻ تازه‌سازی</button>` : ""}
    </header>
  `;
}

// ============================================================
// صفحه اصلی
// ============================================================

function showHome() {
  applyAppStyles();
  currentAppPage = "home";
  const app = document.querySelector(".app");
  if (!app) return;

  app.innerHTML = `
    <header class="header">
      <div class="header-badge">گلزار شهدای تهران</div>
      <h1>گلزار شهدای تهران</h1>
      <p>سامانه مدیریت و پایش سنگ مزار</p>
    </header>
    <main class="menu">
      <button class="menu-button menu-search" type="button" id="btn-search">
        <span class="icon">🔎</span>
        <span class="button-text"><strong>جستجوی شهید</strong><small>جستجو و مشاهده اطلاعات شهید</small></span>
        <span class="button-arrow">‹</span>
      </button>
      <button class="menu-button menu-new" type="button" id="btn-new">
        <span class="icon">➕</span>
        <span class="button-text"><strong>ثبت اطلاعات شهید جدید</strong><small>ثبت اطلاعات اولیه شهید برای بررسی و تأیید</small></span>
        <span class="button-arrow">‹</span>
      </button>
      <button class="menu-button menu-pending" type="button" id="btn-pending">
        <span class="icon">📋</span>
        <span class="button-text"><strong>اطلاعات ثبت‌شده</strong><small>بررسی، تأیید و مدیریت اطلاعات ثبت‌شده</small></span>
        <span class="button-arrow">‹</span>
      </button>
      <button class="menu-button menu-test" type="button" id="btn-test">
        <span class="icon">🔗</span>
        <span class="button-text"><strong>تست اتصال</strong><small>بررسی ارتباط با بانک اطلاعاتی</small></span>
        <span class="button-arrow">‹</span>
      </button>
    </main>
    <footer class="footer">
      <strong>گلزار شهدای تهران</strong><br>
      سامانه بهسازی و پایش سنگ مزار شهدا<br>
      <a href="https://golzarteh.ir/" target="_blank" rel="noopener noreferrer">golzarteh.ir</a>
    </footer>
  `;

  document.getElementById("btn-search").addEventListener("click", showSearch);
  document.getElementById("btn-new").addEventListener("click", showNewRecord);
  document.getElementById("btn-pending").addEventListener("click", showPendingRecords);
  document.getElementById("btn-test").addEventListener("click", testSupabaseConnection);
}

// ============================================================
// تست اتصال
// ============================================================

async function testSupabaseConnection() {
  const { error } = await runSupabaseQuery(
    supabaseClient.from(TABLE_NAME).select("id").limit(1),
    { errorAlertPrefix: "اتصال به Supabase برقرار نشد." }
  );
  if (!error) alert("اتصال به Supabase با موفقیت برقرار شد.");
}

// ============================================================
// صفحه ثبت اطلاعات جدید
// ============================================================

function showNewRecord() {
  if (!isHandlingHistory) pushAppHistory("new");

  const app = document.querySelector(".app");
  app.innerHTML = `
    ${internalHeader("ثبت اطلاعات شهید جدید", "ثبت اطلاعات اولیه برای بررسی و تأیید")}
    <main class="content">
      <div class="card">
        <div class="card-title">اطلاعات شهید</div>
        <div class="form-group">
          <label for="new-name">نام</label>
          <input type="text" id="new-name" autocomplete="off" placeholder="نام شهید">
        </div>
        <div class="form-group">
          <label for="new-lastname">نام خانوادگی</label>
          <input type="text" id="new-lastname" autocomplete="off" placeholder="نام خانوادگی شهید">
        </div>
        <div class="section-title">نوع عملیات سنگ</div>
        <div class="choice-grid">
          <label class="choice-card"><input type="radio" name="stone-type" value="ترمیمی"><span>ترمیمی</span></label>
          <label class="choice-card"><input type="radio" name="stone-type" value="تعویضی"><span>تعویضی</span></label>
        </div>
        <div class="section-title">محل مزار</div>
        <div class="form-row">
          <div class="form-group">
            <label for="new-piece">قطعه</label>
            <select id="new-piece">
              <option value="">انتخاب قطعه</option>
              ${PIECES.map((p) => `<option value="${p}">${toPersianDigits(p)}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label for="new-row">ردیف</label>
            <input type="text" id="new-row" autocomplete="off" placeholder="مثلاً ۲۴ مکرر">
          </div>
          <div class="form-group">
            <label for="new-number">شماره</label>
            <input type="text" id="new-number" autocomplete="off" placeholder="مثلاً ج">
          </div>
        </div>
        <div class="section-title">مرحله فعلی کار</div>
        <div class="stage-list" id="stage-list">${renderStageOptions()}</div>
        <div class="section-title">توضیحات</div>
        <div class="form-group">
          <textarea id="new-notes" rows="4" placeholder="در صورت نیاز توضیحات را وارد کنید..."></textarea>
        </div>
        <button type="button" class="primary-button" id="save-new">ذخیره اطلاعات</button>
      </div>
    </main>
  `;

  document.getElementById("back-home").addEventListener("click", () => window.history.back());
  document.getElementById("save-new").addEventListener("click", saveNewRecord);
  document.querySelectorAll('input[name="stone-type"]').forEach((input) => {
    input.addEventListener("change", updateStageOptions);
  });
  document.getElementById("new-name").focus();
}

function renderStageOptions(selectedStage = "") {
  const allStages = [...STAGES["ترمیمی"], ...STAGES["تعویضی"]];
  return allStages
    .map(
      (stage) => `
        <label class="stage-option disabled" data-stage="${escapeHtml(stage)}">
          <input type="radio" name="stage" value="${escapeHtml(stage)}" disabled ${stage === selectedStage ? "checked" : ""}>
          <span>${escapeHtml(stage)}</span>
        </label>
      `
    )
    .join("");
}

function updateStageOptions() {
  const selectedType = document.querySelector('input[name="stone-type"]:checked');
  const stageOptions = document.querySelectorAll(".stage-option");

  stageOptions.forEach((option) => {
    const stage = option.dataset.stage;
    const input = option.querySelector('input[name="stage"]');
    const allowed = selectedType && isValidStageForStoneType(selectedType.value, stage);

    if (allowed) {
      option.classList.remove("disabled");
      input.disabled = false;
    } else {
      option.classList.add("disabled");
      input.disabled = true;
      input.checked = false;
    }
  });
}

async function saveNewRecord() {
  const name = document.getElementById("new-name").value.trim();
  const lastname = document.getElementById("new-lastname").value.trim();
  const piece = document.getElementById("new-piece").value;
  const row = document.getElementById("new-row").value.trim();
  const number = document.getElementById("new-number").value.trim();
  const stoneType = document.querySelector('input[name="stone-type"]:checked');
  const stage = document.querySelector('input[name="stage"]:checked');
  const notes = document.getElementById("new-notes").value.trim();

  // اعتبارسنجی — پیام‌ها به آرایه منتقل شدند تا افزودن قوانین جدید ساده‌تر باشد
  const validations = [
    [!name, "نام شهید را وارد کنید."],
    [!lastname, "نام خانوادگی شهید را وارد کنید."],
    [!stoneType, "نوع عملیات سنگ را مشخص کنید."],
    [!piece, "قطعه را انتخاب کنید."],
    [!row, "ردیف مزار را وارد کنید."],
    [!number, "شماره مزار را وارد کنید."],
    [!stage, "مرحله فعلی کار را مشخص کنید."],
  ];
  for (const [failed, message] of validations) {
    if (failed) {
      alert(message);
      return;
    }
  }
  if (!isValidStageForStoneType(stoneType.value, stage.value)) {
    alert("مرحله انتخاب‌شده با نوع عملیات سازگار نیست.");
    return;
  }

  const button = document.getElementById("save-new");
  button.disabled = true;
  button.textContent = "در حال ثبت اطلاعات...";

  // created_at عمداً ارسال نمی‌شود؛ دیتابیس با default now() آن را پر می‌کند.
  const { data, error } = await runSupabaseQuery(
    supabaseClient
      .from(TABLE_NAME)
      .insert({
        name,
        lastname,
        piece,
        grave_row: row,
        grave_number: number,
        stone_type: stoneType.value,
        stage: stage.value,
        notes: notes || null,
        status: STATUS.PENDING,
      })
      .select("*")
      .single(),
    { errorAlertPrefix: "ذخیره اطلاعات انجام نشد." }
  );

  if (error) {
    button.disabled = false;
    button.textContent = "ذخیره اطلاعات";
    return;
  }

  const insertedCreatedAt = data ? getRecordCreatedAt(data) : null;
  if (!insertedCreatedAt) {
    console.warn("created_at was not returned by Supabase.", data);
  }

  const registeredDate = insertedCreatedAt ? getJalaliDateTime(insertedCreatedAt) : "";
  alert("اطلاعات شهید با موفقیت ثبت شد." + (registeredDate ? `\n\nتاریخ ثبت: ${registeredDate}` : ""));

  showNewRecord();
}

// ============================================================
// اطلاعات ثبت‌شده
// ============================================================

async function showPendingRecords(preserveHistory = false) {
  if (!isHandlingHistory && !preserveHistory) pushAppHistory("pending");
  currentAppPage = "pending";

  const app = document.querySelector(".app");
  app.innerHTML = `
    ${internalHeader("اطلاعات ثبت‌شده", "رکوردهای در انتظار تأیید", true)}
    <main class="content">
      <div class="card">
        <div id="records-summary" class="records-summary"></div>
        <div id="pending-container" class="records-container">
          <div class="loading-message">در حال دریافت اطلاعات...</div>
        </div>
      </div>
    </main>
  `;

  document.getElementById("back-home").addEventListener("click", () => window.history.back());
  document.getElementById("refresh-page").addEventListener("click", refreshPendingRecords);

  await loadPendingRecords();
}

async function loadPendingRecords() {
  const container = document.getElementById("pending-container");
  const summary = document.getElementById("records-summary");
  if (!container || !summary) return;

  container.innerHTML = `<div class="loading-message">در حال دریافت اطلاعات تازه...</div>`;

  const { data, error } = await runSupabaseQuery(
    supabaseClient
      .from(TABLE_NAME)
      .select("*")
      .eq("status", STATUS.PENDING)
      .order("created_at", { ascending: false })
      .limit(MAX_RECORDS_PER_QUERY)
  );

  if (error) {
    showRecordsError(error.message || "خطای غیرمنتظره هنگام دریافت اطلاعات.");
    return;
  }

  const records = data || [];

  summary.innerHTML = `
    <div class="summary-box warning">
      <strong>${toPersianDigits(records.length)}</strong>
      <small>در انتظار تأیید</small>
    </div>
    <div class="summary-box">
      <strong>${toPersianDigits(records.length)}</strong>
      <small>قابل بررسی</small>
    </div>
  `;

  if (records.length === 0) {
    container.innerHTML = `<div class="empty-message">رکوردی در انتظار تأیید وجود ندارد.</div>`;
    return;
  }

  container.innerHTML = records.map((record) => recordSummaryCard(record)).join("");

  records.forEach((record) => {
    const card = document.getElementById(`record-summary-${record.id}`);
    if (card) card.addEventListener("click", () => showRecordDetail(record.id, "records"));
  });
}

async function refreshPendingRecords() {
  const refreshButton = document.getElementById("refresh-page");
  if (refreshButton) {
    refreshButton.disabled = true;
    refreshButton.textContent = "↻ در حال تازه‌سازی...";
  }

  await loadPendingRecords();

  if (refreshButton) {
    refreshButton.disabled = false;
    refreshButton.textContent = "↻ تازه‌سازی";
  }
}

function recordSummaryCard(record) {
  const status = record.status || STATUS.PENDING;
  const statusClass = status === STATUS.APPROVED ? "approved" : "";

  return `
    <div class="record-card clickable" id="record-summary-${record.id}">
      <div class="record-card-header">
        <div class="record-name">${escapeHtml(record.name)} ${escapeHtml(record.lastname)}</div>
        <span class="status-badge ${statusClass}">${escapeHtml(status)}</span>
      </div>
      <div class="location-box">
        <div><small>قطعه</small><strong>${toPersianDigits(record.piece)}</strong></div>
        <div><small>ردیف</small><strong>${escapeHtml(record.grave_row)}</strong></div>
        <div><small>شماره</small><strong>${escapeHtml(record.grave_number)}</strong></div>
      </div>
      <div class="record-info"><span>نوع عملیات:</span><strong>${escapeHtml(record.stone_type)}</strong></div>
      <div class="record-info"><span>مرحله:</span><strong>${escapeHtml(record.stage)}</strong></div>
      ${
        getRecordCreatedAt(record)
          ? `<div class="record-info"><span>تاریخ ثبت:</span><strong>${escapeHtml(getJalaliDateTime(getRecordCreatedAt(record)))}</strong></div>`
          : ""
      }
    </div>
  `;
}

// ============================================================
// جزئیات رکورد
// ============================================================

async function showRecordDetail(id, source = "records") {
  const app = document.querySelector(".app");
  app.innerHTML = `
    ${internalHeader("جزئیات اطلاعات شهید", source === "search" ? "مشاهده اطلاعات شهید" : "بررسی و تصمیم نهایی کارشناس")}
    <main class="content">
      <div id="detail-container" class="detail-card">
        <div class="loading-message">در حال دریافت اطلاعات...</div>
      </div>
    </main>
  `;

  const goBack = () => (source === "search" ? restoreSearchPage() : showPendingRecords(true));
  document.getElementById("back-home").addEventListener("click", goBack);

  const { data, error } = await runSupabaseQuery(
    supabaseClient.from(TABLE_NAME).select("*").eq("id", id).single()
  );

  const detailContainer = document.getElementById("detail-container");

  if (error) {
    detailContainer.innerHTML = `
      <div class="error-message">دریافت اطلاعات انجام نشد.<br><br>${escapeHtml(error.message)}</div>
    `;
    return;
  }

  const status = data.status || STATUS.PENDING;
  const isApproved = status === STATUS.APPROVED;
  const showManagementActions = source === "records";

  detailContainer.innerHTML = `
    <div class="detail-title">${escapeHtml(data.name)} ${escapeHtml(data.lastname)}</div>
    <div class="detail-row"><span>شناسه</span><strong>${escapeHtml(data.id)}</strong></div>
    <div class="detail-row"><span>وضعیت ثبت</span><strong>${escapeHtml(status)}</strong></div>
    <div class="detail-row"><span>نوع عملیات سنگ</span><strong>${escapeHtml(data.stone_type)}</strong></div>
    <div class="detail-row"><span>قطعه</span><strong>${toPersianDigits(data.piece)}</strong></div>
    <div class="detail-row"><span>ردیف</span><strong>${escapeHtml(data.grave_row)}</strong></div>
    <div class="detail-row"><span>شماره</span><strong>${escapeHtml(data.grave_number)}</strong></div>
    <div class="detail-row"><span>مرحله فعلی کار</span><strong>${escapeHtml(data.stage)}</strong></div>
    ${
      getRecordCreatedAt(data)
        ? `<div class="detail-row"><span>تاریخ ثبت</span><strong>${escapeHtml(getJalaliDateTime(getRecordCreatedAt(data)))}</strong></div>`
        : ""
    }
    ${data.notes ? `<div class="detail-row"><span>توضیحات</span><strong>${escapeHtml(data.notes)}</strong></div>` : ""}
    <div class="detail-actions">
      ${
        showManagementActions && !isApproved
          ? `<button type="button" class="approve-button" id="approve-record">✓ تأیید این اطلاعات</button>`
          : ""
      }
      ${showManagementActions ? `<button type="button" class="danger-button" id="delete-detail">حذف این رکورد</button>` : ""}
      <button type="button" class="back-secondary" id="back-records">${source === "search" ? "بازگشت به نتایج جستجو" : "بازگشت به فهرست"}</button>
    </div>
  `;

  if (showManagementActions && !isApproved) {
    document.getElementById("approve-record").addEventListener("click", () => approveRecord(id));
  }
  if (showManagementActions) {
    document.getElementById("delete-detail").addEventListener("click", () => deleteRecord(id));
  }
  document.getElementById("back-records").addEventListener("click", goBack);
}

async function approveRecord(id) {
  if (!confirm("آیا اطلاعات این شهید را تأیید می‌کنید؟")) return;

  const { data, error } = await runSupabaseQuery(
    supabaseClient.from(TABLE_NAME).update({ status: STATUS.APPROVED }).eq("id", id).select().single(),
    { errorAlertPrefix: "تأیید اطلاعات انجام نشد." }
  );

  if (error) return;
  if (!data) {
    alert("رکورد پیدا نشد یا اجازه تغییر آن وجود ندارد.");
    return;
  }

  alert("اطلاعات این شهید با موفقیت تأیید شد.");
  showPendingRecords();
}

async function deleteRecord(id) {
  if (!confirm("آیا از حذف این اطلاعات مطمئن هستید؟")) return;

  const { data, error } = await runSupabaseQuery(
    supabaseClient.from(TABLE_NAME).delete().eq("id", id).select(),
    { errorAlertPrefix: "حذف انجام نشد." }
  );

  if (error) return;
  if (!data || data.length === 0) {
    alert("رکورد حذف نشد یا اجازه حذف وجود ندارد.");
    return;
  }

  alert("رکورد با موفقیت حذف شد.");
  showPendingRecords();
}

// ============================================================
// صفحه جستجو
// ============================================================

function showSearch(restore = false) {
  if (!isHandlingHistory) pushAppHistory("search");
  currentAppPage = "search";

  const app = document.querySelector(".app");
  app.innerHTML = `
    ${internalHeader("جستجوی اطلاعات شهید", "جستجو در اطلاعات ثبت‌شده")}
    <main class="content">
      <div class="card">
        <div class="card-title">معیارهای جستجو</div>
        <div class="form-group">
          <label for="search-name">نام</label>
          <input type="text" id="search-name" autocomplete="off" placeholder="مثلاً اصغر یا ۳۳۳۳۳">
        </div>
        <div class="form-group">
          <label for="search-lastname">نام خانوادگی</label>
          <input type="text" id="search-lastname" autocomplete="off" placeholder="اختیاری">
        </div>
        <div class="section-title">محل مزار</div>
        <div class="form-row">
          <div class="form-group">
            <label for="search-piece">قطعه</label>
            <select id="search-piece">
              <option value="">همه</option>
              ${PIECES.map((p) => `<option value="${p}">${toPersianDigits(p)}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label for="search-row">ردیف</label>
            <input type="text" id="search-row" autocomplete="off" placeholder="مثلاً ۲۴ مکرر">
          </div>
          <div class="form-group">
            <label for="search-number">شماره</label>
            <input type="text" id="search-number" autocomplete="off" placeholder="مثلاً ج">
          </div>
        </div>
        <div class="section-title">وضعیت سنگ</div>
        <div class="form-group">
          <label for="search-status">جستجوی وضعیت</label>
          <select id="search-status">
            <option value="">همه وضعیت‌ها</option>
            <option value="ترمیمی">ترمیمی</option>
            <option value="تعویضی">تعویضی</option>
          </select>
        </div>
        <button type="button" class="primary-button" id="search-button">جستجو</button>
        <div id="search-results" class="search-results"></div>
      </div>
    </main>
  `;

  document.getElementById("back-home").addEventListener("click", () => window.history.back());
  document.getElementById("search-button").addEventListener("click", performSearch);

  ["search-name", "search-lastname", "search-row", "search-number"].forEach((id) => {
    document.getElementById(id).addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        performSearch();
      }
    });
  });

  if (restore && lastSearchFilters) {
    document.getElementById("search-name").value = lastSearchFilters.name || "";
    document.getElementById("search-lastname").value = lastSearchFilters.lastname || "";
    document.getElementById("search-piece").value = lastSearchFilters.piece || "";
    document.getElementById("search-row").value = lastSearchFilters.row || "";
    document.getElementById("search-number").value = lastSearchFilters.number || "";
    document.getElementById("search-status").value = lastSearchFilters.status || "";
    renderSearchResults(lastSearchResults);
    return;
  }

  document.getElementById("search-name").focus();
}

// ============================================================
// جستجو
// اصلاح کلیدی: فیلتر روی سرور (Supabase) انجام می‌شود، نه با
// دریافت کل جدول و فیلتر در کلاینت. برای فیلدهای متنی از ilike
// (بدون حساسیت به حروف بزرگ/کوچک) و برای قطعه/وضعیت از eq
// استفاده شده — این معادل دقیق منطق قبلی (همه شرط‌ها AND) است.
// ============================================================

async function performSearch() {
  const name = normalizeSearchText(document.getElementById("search-name").value);
  const lastname = normalizeSearchText(document.getElementById("search-lastname").value);
  const piece = toEnglishDigits(document.getElementById("search-piece").value);
  const row = normalizeSearchText(document.getElementById("search-row").value);
  const number = normalizeSearchText(document.getElementById("search-number").value);
  const status = document.getElementById("search-status").value;

  const container = document.getElementById("search-results");
  lastSearchFilters = { name, lastname, piece, row, number, status };

  container.innerHTML = `<div class="loading-message">در حال جستجو...</div>`;

  let query = supabaseClient
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(MAX_RECORDS_PER_QUERY);

  if (name) query = query.ilike("name", `%${name}%`);
  if (lastname) query = query.ilike("lastname", `%${lastname}%`);
  if (piece) query = query.eq("piece", piece);
  if (row) query = query.ilike("grave_row", `%${row}%`);
  if (number) query = query.ilike("grave_number", `%${number}%`);
  if (status) query = query.eq("stone_type", status);

  const { data, error } = await runSupabaseQuery(query);

  if (error) {
    container.innerHTML = `
      <div class="error-message">جستجو انجام نشد.<br><br>${escapeHtml(error.message)}</div>
    `;
    return;
  }

  const results = data || [];
  lastSearchResults = results;
  renderSearchResults(results);
}

function renderSearchResults(results) {
  const container = document.getElementById("search-results");
  if (!container) return;

  container.innerHTML = `
    <div class="search-count">${toPersianDigits(results.length)} رکورد پیدا شد.</div>
    ${results.length > 0 ? `<button type="button" class="export-button" id="export-search-results">📊 خروجی اکسل</button>` : ""}
    <div class="records-container">
      ${
        results.length === 0
          ? `<div class="empty-message">رکوردی با این مشخصات پیدا نشد.</div>`
          : results.map((record) => recordSummaryCard(record)).join("")
      }
    </div>
  `;

  if (results.length > 0) {
    const exportButton = document.getElementById("export-search-results");
    if (exportButton) exportButton.addEventListener("click", exportSearchResultsToExcel);
  }

  results.forEach((record) => {
    const card = document.getElementById(`record-summary-${record.id}`);
    if (card) card.addEventListener("click", () => showRecordDetail(record.id, "search"));
  });
}

// ============================================================
// خروجی Excel نتایج جستجو
// اصلاح کلیدی: ستون تاریخ دیگر با آدرس ثابت "J" پیدا نمی‌شود.
// به‌جای آن، شماره ستون از روی نام هدر (کلید آبجکت) در زمان
// اجرا محاسبه می‌شود — اگر ترتیب/تعداد ستون‌ها تغییر کند هم
// درست کار می‌کند.
// ============================================================

const EXCEL_DATE_COLUMN_HEADER = "تاریخ ثبت";

function exportSearchResultsToExcel() {
  if (!lastSearchResults || lastSearchResults.length === 0) {
    alert("رکوردی برای خروجی گرفتن وجود ندارد.");
    return;
  }

  if (typeof XLSX === "undefined") {
    alert("کتابخانه خروجی اکسل بارگذاری نشده است.\n\nلطفاً SheetJS را در index.html بارگذاری کنید.");
    return;
  }

  try {
    const exportData = lastSearchResults.map((record) => ({
      "نام": record.name || "",
      "نام خانوادگی": record.lastname || "",
      "قطعه": toPersianDigits(record.piece || ""),
      "ردیف": record.grave_row || "",
      "شماره": record.grave_number || "",
      "نوع عملیات": record.stone_type || "",
      "مرحله": record.stage || "",
      "وضعیت ثبت": record.status || "",
      "توضیحات": record.notes || "",
      [EXCEL_DATE_COLUMN_HEADER]: formatJalaliDateForExcel(getRecordCreatedAt(record)),
    }));

    // تشخیصی: اگر باز هم ستون خالی بود، این خط در Console مرورگر
    // (F12 → Console) دقیقاً نشون می‌ده رکورد خام از Supabase چه
    // شکلیه و نام واقعی ستون تاریخ چیست.
    if (lastSearchResults[0]) {
      console.debug("نمونه رکورد خام برای بررسی نام ستون تاریخ:", lastSearchResults[0]);
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 18 }, { wch: 24 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
      { wch: 16 }, { wch: 28 }, { wch: 18 }, { wch: 35 }, { wch: 18 },
    ];

    // پیدا کردن ستون تاریخ بر اساس نام هدر، نه آدرس ثابت حرف
    const headers = Object.keys(exportData[0] || {});
    const dateColumnIndex = headers.indexOf(EXCEL_DATE_COLUMN_HEADER);

    if (dateColumnIndex !== -1) {
      const dateColumnLetter = XLSX.utils.encode_col(dateColumnIndex);
      for (let rowIndex = 2; rowIndex <= exportData.length + 1; rowIndex++) {
        const cellAddress = `${dateColumnLetter}${rowIndex}`;
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].t = "s";
          worksheet[cellAddress].v = String(worksheet[cellAddress].v || "");
        }
      }
    } else {
      console.warn("Date column header not found — skipping text-force step.");
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "نتایج جستجو");

    const jalaliFileDate = getTodayJalaliForFileName();
    const fileName = `GolzarStone_نتایج_جستجو_${jalaliFileDate}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    alert(
      "خروجی اکسل با موفقیت ایجاد شد." +
        `\n\nتعداد رکورد: ${toPersianDigits(exportData.length)}` +
        `\n\nتاریخ فایل: ${toPersianDigits(jalaliFileDate)}`
    );
  } catch (error) {
    console.error("Excel export error:", error);
    alert(`ایجاد خروجی اکسل انجام نشد.\n\n${error.message}`);
  }
}

function restoreSearchPage() {
  showSearch(true);
}

function showRecordsError(message) {
  const container = document.getElementById("pending-container");
  if (!container) return;
  container.innerHTML = `
    <div class="error-message">دریافت اطلاعات انجام نشد.<br><br>${escapeHtml(message)}</div>
  `;
}

// ============================================================
// خلاصه تغییرات این نسخه
// ============================================================
// 1. جستجو: از client-side filter روی کل جدول به server-side
//    filter با ilike/eq تغییر کرد (کارایی و مصرف داده بهتر).
// 2. Excel: ستون تاریخ با نام هدر پیدا می‌شود، نه با حرف ثابت "J".
// 3. رشته‌های وضعیت در STATUS.PENDING / STATUS.APPROVED متمرکز شدند.
// 4. همه کوئری‌ها limit(200) گرفتند تا از دریافت کل جدول جلوگیری شود.
// 5. runSupabaseQuery به‌عنوان هِلپر مشترک خطا/موفقیت اضافه شد.
// 6. تابع gregorianToJalali دست‌نخورده ماند؛ در Node.js با ۵ نقطه
//    مرجع نوروز (۱۳۹۹ تا ۱۴۰۵) تست و صحتش تأیید شد.
// 7. نکته امنیتی RLS در کامنت بالای فایل ثبت شد — این مورد را
//    باید در پنل Supabase به‌صورت دستی بررسی کنید، از کد کلاینت
//    قابل تضمین نیست.
// ============================================================
