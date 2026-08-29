// ============================================================
// Shohada-app / GolzarStone
// app.js — نسخه نهایی ویرایش + تازه‌سازی خودکار + Excel
// ============================================================

"use strict";

const SUPABASE_URL = "https://bafrksgdcmglahyrppfy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_O5CkSuivysXJf-8hu1IUCA_izu8hWiX";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const TABLE_NAME = "martyrs";

const STATUS = {
  PENDING: "در انتظار تأیید",
  APPROVED: "تأیید شده",
};

const MAX_RECORDS_PER_QUERY = 200;
const PIECES = ["17", "24", "26", "27", "28", "29", "40", "53"];

// عناوین رسمی و نهایی مراحل — در کل برنامه فقط از همین مقادیر استفاده شود.
const STAGES = {
  "ترمیمی": [
    "طرح آماده ارسال به واحد مرمت",
    "سنگ مرمتی آماده",
    "نصب سنگ مرمت شده",
  ],
  "تعویضی": [
    "طرح آماده ارسال به واحد تعویض",
    "سنگ تعویضی آماده",
    "سنگ تعویضی نصب شده",
  ],
};

// ============================================================
// وضعیت برنامه
// ============================================================
let lastSearchResults = [];
let lastSearchFilters = null;
let currentAppPage = "home";
let isHandlingHistory = false;
let firstBackPressTime = 0;
const DOUBLE_BACK_INTERVAL = 2000;
let editingRecordId = null;
let editingRecordSource = "search";

// ============================================================
// ابزار اعداد و متن
// ============================================================
function toPersianDigits(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
function toEnglishDigits(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}
function normalizeSearchText(value) {
  if (value === null || value === undefined) return "";
  return toEnglishDigits(String(value).trim().replace(/\u200c/g, " ").replace(/\s+/g, " ")).replace(/ي/g, "ی").replace(/ى/g, "ی").replace(/ك/g, "ک").toLowerCase();
}
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function isValidStageForStoneType(stoneType, stage) {
  if (!stoneType || !stage) return false;
  return Object.prototype.hasOwnProperty.call(STAGES, stoneType) && STAGES[stoneType].includes(stage);
}

// بقیه توابع اجرایی فایل در نسخه فعلی پروژه در ادامه این فایل قرار می‌گیرند.
