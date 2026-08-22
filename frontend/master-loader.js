"use strict";

const U = "https://bafrksgdcmglahyrppfy.supabase.co";
const K = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZnJrc2dkY21nbGFoeXJwcGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMTY4MjQsImV4cCI6MjEwMjY5MjgyNH0.DiWX7vECRUyio5vquCSLMlwhYPaYsummPk0908TYJw8";
const T = "martyrs";
const E = "https://raw.githubusercontent.com/forog1980-star/Shohada-app/main/ExcelData/martyrs_master.xlsx";

const BATCH_SIZE = 100;
const PAGE_SIZE = 1000;
const DONE_KEY = "golzarstone_master_excel_import_done_v3";
const LOCK_KEY = "golzarstone_master_excel_import_lock_v3";
const LOCK_MS = 10 * 60 * 1000;

const clean = (v) => v == null ? "" : String(v).replace(/\u200c/g, " ").replace(/\s+/g, " ").trim();
const dig = (v) => clean(v).replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
const norm = (v) => clean(v).replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[\s_\-–—()\[\]{}:؛;،,.]/g, "").toLowerCase();
const loc = (v) => { let s = dig(v); if (/^\d+\.0$/.test(s)) s = s.slice(0, -2); return s; };
const key = r => [r.name, r.lastname, r.piece, r.grave_row, r.grave_number].map(clean).join("|");

function show(title, message) {
  document.body.innerHTML = `<div dir="rtl" style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f7f5;font-family:Tahoma,Arial,sans-serif;padding:24px"><div style="width:min(620px,100%);background:white;border-radius:20px;padding:28px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.08)"><div style="font-size:38px">${title}</div><div id="mm" style="white-space:pre-line;line-height:2;color:#45534c">${message}</div></div></div>`;
}

function updateMessage(message) {
  const el = document.getElementById("mm");
  if (el) el.textContent = message;
}

function loadApp() {
  const script = document.createElement("script");
  script.src = "app.js?v=20260822-16";
  script.onload = () => { window.__GOLZAR_MASTER_READY__ = true; };
  script.onerror = () => show("❌", "بارگذاری app.js انجام نشد.");
  document.body.appendChild(script);
}

function isDone() { try { return localStorage.getItem(DONE_KEY) === "1"; } catch (_) { return false; } }
function markDone() { try { localStorage.setItem(DONE_KEY, "1"); } catch (_) {} }

function acquireLock() {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(LOCK_KEY);
    if (raw) {
      const lockTime = Number(raw);
      if (Number.isFinite(lockTime) && now - lockTime < LOCK_MS) return false;
    }
    localStorage.setItem(LOCK_KEY, String(now));
    return localStorage.getItem(LOCK_KEY) === String(now);
  } catch (_) { return true; }
}

function releaseLock() { try { localStorage.removeItem(LOCK_KEY); } catch (_) {} }

async function readExistingKeys(client) {
  const keys = new Set();
  let from = 0;
  while (true) {
    const { data, error } = await client.from(T).select("name,lastname,piece,grave_row,grave_number").range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error("خطا در خواندن بانک موجود:\n" + (error.message || error.details || error.code || "خطای نامشخص"));
    const rows = data || [];
    rows.forEach(row => keys.add(key(row)));
    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return keys;
}

const HEADER_ALIASES = {
  name: ["نام", "نام شهید", "نامشهید", "name"],
  lastname: ["نام خانوادگی", "نامخانوادگی", "نام خانوادگی شهید", "نامخانوادگی شهید", "lastname", "family"],
  piece: ["قطعه", "قطعه شهید", "قطعهشهید", "piece"],
  grave_row: ["ردیف مزار", "ردیفمزار", "ردیف قبر", "ردیفقبر", "ردیف", "graverow", "row"],
  grave_number: ["شماره مزار", "شماره‌ مزار", "شماره مزار شهید", "شماره قبر", "شماره سنگ", "شماره مزار سنگ", "gravenumber", "number", "شماره"],
  stone_type: ["نوع عملیات", "نوع عملیات سنگ", "نوع عملیات مزار", "نوع سنگ", "عملیات", "وضعیت سنگ", "stonetype"],
  stage: ["مرحله عملیات", "مرحله عملیات سنگ", "مرحله فعلی کار", "مرحله فعلی", "مرحله", "وضعیت عملیات", "stage"],
  notes: ["توضیحات", "یادداشت", "notes"]
};

function findHeader(rows) {
  let best = null;
  for (let rowIndex = 0; rowIndex < Math.min(30, rows.length); rowIndex++) {
    const normalized = (rows[rowIndex] || []).map(norm);
    const map = {};
    for (const field of Object.keys(HEADER_ALIASES)) {
      const aliases = HEADER_ALIASES[field].map(norm);
      let found = -1;
      for (const alias of aliases) {
        const index = normalized.indexOf(alias);
        if (index >= 0) { found = index; break; }
      }
      if (found >= 0) map[field] = found;
    }
    const required = map.name !== undefined && map.lastname !== undefined && map.grave_row !== undefined && map.grave_number !== undefined;
    if (!required) continue;
    const score = 10 + Object.keys(map).length;
    if (!best || score > best.score) best = { rowIndex, map, score };
  }
  return best;
}

function ignoredSheet(sheetName) {
  return ["آمار", "عکس", "عکسها", "تصاویر", "images", "photos", "statistics", "stat"].map(norm).includes(norm(sheetName));
}

function pieceFromSheet(sheetName) {
  const text = dig(sheetName);
  const match = text.match(/(?:قطعه\s*)?(\d+)(?:\D|$)/);
  return match ? match[1] : "";
}

function normalizeStoneType(value) {
  const text = clean(value);
  if (!text) return null;
  if (text.includes("ترمیم")) return "ترمیمی";
  if (text.includes("تعویض")) return "تعویضی";
  return text;
}

function normalizeStage(value) {
  const text = clean(value);
  if (!text) return null;
  const stageMap = {
    "ارسال به واحد مرمت": "ارسال به واحد مرمت",
    "سنگ مرمتی آماده": "سنگ مرمتی آماده",
    "نصب مرمتی شده": "نصب مرمتی شده",
    "ارسال به واحد تعویض": "ارسال به واحد تعویض",
    "سنگ تعویضی آماده": "سنگ تعویضی آماده",
    "تعویضی نصب شده": "تعویضی نصب شده"
  };
  return stageMap[text] || text;
}

async function readExcel() {
  if (!window.XLSX) throw new Error("کتابخانه Excel بارگذاری نشده است.");
  updateMessage("در حال دریافت Excel از GitHub...");
  const response = await fetch(`${E}?v=20260822-16`, { cache: "no-store" });
  if (!response.ok) throw new Error(`دریافت Excel ناموفق بود. HTTP ${response.status}`);

  const workbook = XLSX.read(await response.arrayBuffer(), { type: "array", raw: true, dense: true });
  const output = [];
  const seen = new Set();

  for (const sheetName of workbook.SheetNames) {
    if (ignoredSheet(sheetName)) continue;
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "", raw: true, blankrows: false });
    const header = findHeader(rows);
    if (!header) continue;

    // در این پروژه، هر Sheet نماینده یک قطعه است؛ بنابراین نام Sheet مرجع قطعه است.
    const sheetPiece = pieceFromSheet(sheetName);

    for (let i = header.rowIndex + 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const name = clean(row[header.map.name]);
      const lastname = clean(row[header.map.lastname]);
      const piece = sheetPiece || (header.map.piece !== undefined ? loc(row[header.map.piece]) : "");
      const graveRow = loc(row[header.map.grave_row]);
      const graveNumber = loc(row[header.map.grave_number]);
      if (!name || !lastname || !piece || !graveRow || !graveNumber) continue;

      const stoneType = header.map.stone_type !== undefined ? normalizeStoneType(row[header.map.stone_type]) : null;
      const stage = header.map.stage !== undefined ? normalizeStage(row[header.map.stage]) : null;
      const notes = header.map.notes !== undefined ? clean(row[header.map.notes]) || null : null;

      const record = {
        name,
        lastname,
        piece,
        grave_row: graveRow,
        grave_number: graveNumber,
        stone_type: stoneType,
        stage,
        notes,
        status: "تأیید شده",
        created_at: new Date().toISOString(),
        edited_at: null,
        edit_notes: null
      };

      const recordKey = key(record);
      if (!seen.has(recordKey)) {
        seen.add(recordKey);
        output.push(record);
      }
    }
  }

  if (!output.length) throw new Error("هیچ رکورد قابل استفاده‌ای از Sheetهای قطعات پیدا نشد.");
  return output;
}

async function insertBatch(client, batch, batchNumber, totalBatches, start, end) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    updateMessage(`در حال انتقال اولیه...\nBatch ${batchNumber} از ${totalBatches}\nرکوردهای ${start + 1} تا ${end}\nتلاش ${attempt} از 4`);
    try {
      const { error } = await client.from(T).insert(batch);
      if (!error) return;
      const message = error.message || error.details || error.code || "خطای نامشخص";
      if (!/failed to fetch|network|timeout|abort/i.test(String(message))) throw new Error(message);
    } catch (error) {
      const message = error?.message || String(error);
      if (!/failed to fetch|network|timeout|abort/i.test(String(message))) throw new Error(message);
    }
    if (attempt < 4) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
  }
  throw new Error(`ثبت Batch ${batchNumber} پس از 4 تلاش ناموفق بود.`);
}

async function syncExcelToDatabase(client, records) {
  updateMessage("در حال خواندن تمام رکوردهای بانک...\nصفحه‌بندی فعال است.");
  const existing = await readExistingKeys(client);
  const missing = records.filter(record => !existing.has(key(record)));
  if (!missing.length) return { existing: records.length, imported: 0 };

  const totalBatches = Math.ceil(missing.length / BATCH_SIZE);
  for (let start = 0, batchNumber = 1; start < missing.length; start += BATCH_SIZE, batchNumber++) {
    const end = Math.min(start + BATCH_SIZE, missing.length);
    await insertBatch(client, missing.slice(start, end), batchNumber, totalBatches, start, end);
  }
  return { existing: records.length - missing.length, imported: missing.length };
}

async function start() {
  let locked = false;
  try {
    if (isDone()) { loadApp(); return; }
    locked = acquireLock();
    if (!locked) {
      show("⏳", "انتقال اولیه در همین مرورگر در حال انجام است.\n\nلطفاً صفحه را نبندید؛ برنامه پس از پایان انتقال باز می‌شود.");
      return;
    }

    show("⏳", "در حال اتصال اولیه بانک اصلی...\nاین انتقال فقط یک بار انجام می‌شود.");
    if (!window.supabase || typeof window.supabase.createClient !== "function") throw new Error("کتابخانه Supabase بارگذاری نشده است.");

    const client = window.supabase.createClient(U, K);
    const records = await readExcel();
    updateMessage(`Excel آماده شد.\n${records.length.toLocaleString("fa-IR")} رکورد یکتا پیدا شد.\n\nدر حال تطبیق با بانک...`);

    const result = await syncExcelToDatabase(client, records);
    markDone();

    show("✅", "اتصال اولیه بانک اصلی با موفقیت انجام شد.\n\n" +
      `رکوردهای موجود دست‌نخورده ماندند: ${result.existing.toLocaleString("fa-IR")}\n` +
      `رکوردهای جدید از Excel اضافه شد: ${result.imported.toLocaleString("fa-IR")}\n\n` +
      "این انتقال دیگر در ورودهای بعدی اجرا نمی‌شود.\nدر حال ورود به برنامه...");

    setTimeout(loadApp, 900);
  } catch (error) {
    console.error("GolzarStone master import error:", error);
    show("❌", "اتصال اولیه بانک اصلی انجام نشد.\n\n" + (error?.message || String(error)) + "\n\nهیچ Batch ناموفقی موفق تلقی نمی‌شود.");
  } finally {
    if (locked) releaseLock();
  }
}

document.addEventListener("DOMContentLoaded", start);
