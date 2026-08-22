// ============================================================
// GolzarStone — Master Excel Loader
// اتصال اولیه بانک اصلی از ExcelData/martyrs_master.xlsx به Supabase
// فقط وقتی جدول martyrs خالی باشد اجرا می‌شود.
// ============================================================

"use strict";

const MASTER_SUPABASE_URL = "https://bafrksgdcmglahyrppfy.supabase.co";
const MASTER_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZnJrc2dkY21nbGFoeXJwcGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMTY4MjQsImV4cCI6MjEwMjY5MjgyNH0.DiWX7vECRUyio5vquCSLMlwhYPaYsummPk0908TYJw8";
const MASTER_TABLE = "martyrs";
const MASTER_EXCEL_URL = "https://raw.githubusercontent.com/forog1980-star/Shohada-app/main/ExcelData/martyrs_master.xlsx";
const MASTER_BATCH_SIZE = 500;
const MASTER_STATUS_APPROVED = "تأیید شده";

function masterToEnglishDigits(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
        .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function masterCleanText(value) {
    if (value === null || value === undefined) return "";
    return String(value).replace(/\u200c/g, " ").replace(/\s+/g, " ").trim();
}

function masterNormalizeHeader(value) {
    return masterCleanText(value)
        .replace(/[يى]/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/[\s_\-–—()\[\]{}:؛;،,.]/g, "")
        .toLowerCase();
}

function masterNormalizeLocation(value) {
    let text = masterToEnglishDigits(masterCleanText(value));
    if (/^\d+\.0$/.test(text)) text = text.slice(0, -2);
    return text;
}

function masterShowMessage(title, detail = "") {
    document.body.innerHTML = `
        <div dir="rtl" style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f7f5;font-family:Tahoma,Arial,sans-serif;padding:24px;box-sizing:border-box;">
            <div style="width:min(560px,100%);background:#fff;border-radius:20px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.08);text-align:center;">
                <div style="font-size:38px;margin-bottom:12px;">${title}</div>
                <div id="master-message-detail" style="font-size:15px;line-height:2;color:#45534c;white-space:pre-line;">${detail}</div>
            </div>
        </div>`;
}

function masterUpdateMessage(detail) {
    const el = document.getElementById("master-message-detail");
    if (el) el.textContent = detail;
}

function masterLoadApp() {
    const script = document.createElement("script");
    script.src = "app.js?v=20260822-9";
    script.onload = () => { window.__GOLZAR_MASTER_READY__ = true; };
    script.onerror = () => masterShowMessage("❌", "بارگذاری برنامه انجام نشد.\nفایل app.js در دسترس نیست.");
    document.body.appendChild(script);
}

async function masterGetTableCount(client) {
    const { data, error, count } = await client
        .from(MASTER_TABLE)
        .select("id", { count: "exact", head: false })
        .limit(1);

    if (error) {
        const detail = error.message || error.details || error.hint || error.code || JSON.stringify(error);
        throw new Error(`خطا در بررسی جدول martyrs:\n${detail}`);
    }

    if (Number.isFinite(Number(count))) return Number(count);
    return Array.isArray(data) ? data.length : 0;
}

function masterFindHeaderRow(rows) {
    const aliases = {
        name: ["نام", "نامشهید", "firstname", "name"],
        lastname: ["نامخانوادگی", "نامخانوادگی شهید", "نامخانوادگی_شهید", "lastname", "family"],
        piece: ["قطعه", "قطعهشهید", "piece"],
        grave_row: ["ردیف", "ردیفمزار", "ردیفقبر", "graverow", "row"],
        grave_number: ["شماره", "شماره مزار", "شمارهقبر", "شمارهسنگ", "gravenumber", "number"]
    };

    let best = null;
    const limit = Math.min(rows.length, 25);

    for (let rowIndex = 0; rowIndex < limit; rowIndex++) {
        const normalized = rows[rowIndex].map(masterNormalizeHeader);
        const map = {};
        for (const [field, fieldAliases] of Object.entries(aliases)) {
            const index = normalized.findIndex(h => fieldAliases.includes(h));
            if (index >= 0) map[field] = index;
        }
        const score = Object.keys(map).length;
        if (!best || score > best.score) best = { rowIndex, map, score };
    }

    if (!best || !best.map.name || !best.map.lastname || !best.map.piece || !best.map.grave_row || !best.map.grave_number) {
        throw new Error("ستون‌های اصلی فایل Excel شناسایی نشدند.\nلازم است ستون‌های نام، نام خانوادگی، قطعه، ردیف و شماره مزار در فایل وجود داشته باشند.");
    }
    return best;
}

async function masterReadExcel() {
    if (!window.XLSX) throw new Error("کتابخانه Excel (SheetJS) بارگذاری نشده است.");

    masterUpdateMessage("در حال دریافت فایل آخرین نسخه Excel...\nلطفاً صفحه را نبندید.");

    const response = await fetch(`${MASTER_EXCEL_URL}?v=20260822-9`, {
        cache: "no-store",
        mode: "cors"
    });

    if (!response.ok) throw new Error(`دریافت فایل martyrs_master.xlsx ناموفق بود. HTTP ${response.status}`);

    const buffer = await response.arrayBuffer();
    masterUpdateMessage("فایل Excel دریافت شد.\nدر حال آماده‌سازی اطلاعات برای انتقال...\nلطفاً صفحه را نبندید.");

    // dense=true برای فایل‌های بزرگ سریع‌تر و کم‌حافظه‌تر است.
    const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: false,
        raw: true,
        dense: true,
        cellNF: false,
        cellStyles: false
    });

    if (!workbook.SheetNames.length) {
        throw new Error("فایل Excel هیچ Sheet قابل استفاده‌ای ندارد.");
    }

    // فایل master فعلی بر پایه Sheet «تجمیع» است. اگر این Sheet وجود داشت،
    // فقط همان را می‌خوانیم؛ خواندن تمام Sheetها باعث کندی شدید مرورگر می‌شد.
    const preferredNames = ["تجمیع", "تجمیع ", "master", "Master", "Sheet1"];
    let sheetName = preferredNames.find(name => workbook.SheetNames.includes(name));
    if (!sheetName) sheetName = workbook.SheetNames[0];

    masterUpdateMessage(`Sheet «${sheetName}» انتخاب شد.\nدر حال خواندن رکوردها...\nلطفاً صفحه را نبندید.`);

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
        raw: true,
        blankrows: false
    });

    const header = masterFindHeaderRow(rows);
    const records = [];
    const totalRows = rows.length;

    for (let i = header.rowIndex + 1; i < rows.length; i++) {
        const row = rows[i] || [];
        const name = masterCleanText(row[header.map.name]);
        const lastname = masterCleanText(row[header.map.lastname]);
        const piece = masterNormalizeLocation(row[header.map.piece]);
        const grave_row = masterNormalizeLocation(row[header.map.grave_row]);
        const grave_number = masterNormalizeLocation(row[header.map.grave_number]);

        if (!name && !lastname && !piece && !grave_row && !grave_number) continue;
        if (!name || !lastname || !piece || !grave_row || !grave_number) continue;

        records.push({
            name,
            lastname,
            piece,
            grave_row,
            grave_number,
            stone_type: null,
            stage: null,
            notes: null,
            status: MASTER_STATUS_APPROVED,
            created_at: new Date().toISOString(),
            edited_at: null,
            edit_notes: null
        });

        if (i % 1000 === 0) {
            masterUpdateMessage(`در حال آماده‌سازی رکوردها...\n${i.toLocaleString("fa-IR")} از ${totalRows.toLocaleString("fa-IR")} ردیف بررسی شد.`);
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    if (!records.length) throw new Error("از فایل Excel هیچ رکورد معتبر قابل انتقالی پیدا نشد.");

    return { sheetName, records };
}

async function masterImportToSupabase(client, records) {
    let imported = 0;
    const totalBatches = Math.ceil(records.length / MASTER_BATCH_SIZE);

    for (let start = 0, batchNo = 1; start < records.length; start += MASTER_BATCH_SIZE, batchNo++) {
        const end = Math.min(start + MASTER_BATCH_SIZE, records.length);
        const batch = records.slice(start, end);

        masterUpdateMessage(
            `در حال انتقال بانک اصلی به Supabase...\n\nBatch ${batchNo} از ${totalBatches}\nرکوردهای ${start + 1} تا ${end}\n\nلطفاً صفحه را نبندید.`
        );

        const { error } = await client.from(MASTER_TABLE).insert(batch);

        if (error) {
            const detail = error.message || error.details || error.hint || error.code || JSON.stringify(error);
            throw new Error(`خطا هنگام انتقال اطلاعات به Supabase (رکورد ${start + 1} تا ${end}):\n${detail}`);
        }

        imported += batch.length;
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    return imported;
}

async function startGolzarStone() {
    try {
        masterShowMessage("⏳", "در حال بررسی بانک اطلاعاتی...\nلطفاً صفحه را نبندید.");

        if (!window.supabase || typeof window.supabase.createClient !== "function") {
            throw new Error("کتابخانه Supabase در صفحه بارگذاری نشده است.");
        }

        const client = window.supabase.createClient(MASTER_SUPABASE_URL, MASTER_SUPABASE_KEY);
        const count = await masterGetTableCount(client);

        if (count > 0) {
            masterLoadApp();
            return;
        }

        masterShowMessage("⏳", "بانک اطلاعاتی خالی است.\nدر حال انتقال آخرین نسخه Excel به سامانه...\nاین مرحله فقط یک بار انجام می‌شود.");

        const { sheetName, records } = await masterReadExcel();
        const imported = await masterImportToSupabase(client, records);
        const finalCount = await masterGetTableCount(client);

        if (finalCount !== imported) {
            throw new Error(`کنترل نهایی انتقال ناموفق بود. تعداد رکوردهای واردشده: ${imported} — تعداد رکوردهای جدول martyrs: ${finalCount}`);
        }

        console.info(`GolzarStone master import completed: ${imported} records from sheet "${sheetName}".`);
        masterShowMessage("✅", `انتقال بانک اصلی با موفقیت انجام شد.\n\nتعداد رکوردهای منتقل‌شده: ${imported.toLocaleString("fa-IR")}\n\nدر حال ورود به برنامه...`);
        setTimeout(masterLoadApp, 700);
    } catch (error) {
        console.error("GolzarStone master import error:", error);
        masterShowMessage("❌", "اتصال بانک اصلی انجام نشد.\n\n" + (error?.message || String(error)) + "\n\nهیچ Batch ناموفقی به‌عنوان موفق ثبت نمی‌شود.");
    }
}

document.addEventListener("DOMContentLoaded", startGolzarStone);
