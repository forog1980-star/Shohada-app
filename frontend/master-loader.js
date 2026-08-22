// ============================================================
// GolzarStone — Master Excel Sync
// بانک اصلی سنگ‌های مزار از ExcelData/martyrs_master.xlsx
// ============================================================

"use strict";

const MASTER_SUPABASE_URL = "https://bafrksgdcmglahyrppfy.supabase.co";
const MASTER_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZnJrc2dkY21nbGFoeXJwcGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMTY4MjQsImV4cCI6MjEwMjY5MjgyNH0.DiWX7vECRUyio5vquCSLMlwhYPaYsummPk0908TYJw8";
const MASTER_TABLE = "martyrs";
const MASTER_EXCEL_URL = "https://raw.githubusercontent.com/forog1980-star/Shohada-app/main/ExcelData/martyrs_master.xlsx";

// 100 رکورد در هر درخواست عمداً انتخاب شده تا درخواست‌های مرورگر پایدارتر باشند.
const MASTER_BATCH_SIZE = 100;
const MASTER_MAX_RETRIES = 4;
const MASTER_STATUS_APPROVED = "تأیید شده";
const MASTER_VERSION = "20260822-12";

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

function masterKey(record) {
    return [record.name, record.lastname, record.piece, record.grave_row, record.grave_number]
        .map(masterCleanText)
        .join("|");
}

function masterShowMessage(title, detail = "") {
    document.body.innerHTML = `
        <div dir="rtl" style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f7f5;font-family:Tahoma,Arial,sans-serif;padding:24px;box-sizing:border-box;">
            <div style="width:min(620px,100%);background:#fff;border-radius:20px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.08);text-align:center;">
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
    script.src = `app.js?v=${MASTER_VERSION}`;
    script.onload = () => { window.__GOLZAR_MASTER_READY__ = true; };
    script.onerror = () => masterShowMessage("❌", "بارگذاری برنامه انجام نشد.\nفایل app.js در دسترس نیست.");
    document.body.appendChild(script);
}

async function masterGetExistingKeys(client) {
    const { data, error } = await client
        .from(MASTER_TABLE)
        .select("name,lastname,piece,grave_row,grave_number");

    if (error) {
        throw new Error(`خطا در خواندن بانک موجود:\n${error.message || error.details || error.code || JSON.stringify(error)}`);
    }

    const keys = new Set();
    for (const row of data || []) keys.add(masterKey(row));
    return keys;
}

const MASTER_ALIASES = {
    name: ["نام", "نامشهید", "نام شهید", "firstname", "first name", "name"],
    lastname: ["نامخانوادگی", "نام خانوادگی", "نامخانوادگی شهید", "نام خانوادگی شهید", "lastname", "last name", "family"],
    piece: ["قطعه", "قطعهشهید", "قطعه شهید", "piece"],
    grave_row: ["ردیف", "ردیفمزار", "ردیف مزار", "ردیفقبر", "ردیف قبر", "graverow", "grave row", "row"],
    grave_number: ["شماره", "شماره مزار", "شمارهقبر", "شماره قبر", "شمارهسنگ", "شماره سنگ", "gravenumber", "grave number", "number"]
};

function masterFindHeaderRow(rows) {
    let best = null;
    const limit = Math.min(rows.length, 30);

    for (let rowIndex = 0; rowIndex < limit; rowIndex++) {
        const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : [];
        const normalized = row.map(masterNormalizeHeader);
        const map = {};

        for (const [field, aliases] of Object.entries(MASTER_ALIASES)) {
            const aliasesNormalized = aliases.map(masterNormalizeHeader);
            const index = normalized.findIndex(h => aliasesNormalized.includes(h));
            if (index >= 0) map[field] = index;
        }

        const required = ["name", "lastname", "grave_row", "grave_number"];
        const requiredScore = required.filter(field => map[field] !== undefined).length;
        const score = Object.keys(map).length;

        if (!best || score > best.score) best = { rowIndex, map, score, requiredScore };
    }

    return best && best.requiredScore === 4 ? best : null;
}

function masterInferPieceFromSheetName(sheetName) {
    const text = masterToEnglishDigits(masterCleanText(sheetName));
    const match = text.match(/(?:قطعه\s*)?(17|24|26|27|28|29|40|53)(?:\D|$)/);
    return match ? match[1] : "";
}

function masterIsIgnoredSheet(sheetName) {
    const normalized = masterNormalizeHeader(sheetName);
    const ignored = ["آمار", "عکس", "عکسها", "تصاویر", "images", "photos", "statistics", "stat"];
    return ignored.map(masterNormalizeHeader).includes(normalized);
}

async function masterReadExcel() {
    if (!window.XLSX) throw new Error("کتابخانه Excel (SheetJS) بارگذاری نشده است.");

    masterUpdateMessage("در حال دریافت آخرین نسخه Excel از GitHub...\nلطفاً صفحه را نبندید.");

    const response = await fetch(`${MASTER_EXCEL_URL}?v=${MASTER_VERSION}`, {
        cache: "no-store",
        mode: "cors"
    });

    if (!response.ok) throw new Error(`دریافت فایل martyrs_master.xlsx ناموفق بود. HTTP ${response.status}`);

    const buffer = await response.arrayBuffer();
    masterUpdateMessage("فایل Excel دریافت شد.\nدر حال بررسی Sheetهای قطعات...");

    const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: false,
        raw: true,
        dense: true,
        cellNF: false,
        cellStyles: false
    });

    const records = [];
    const seen = new Set();
    const report = [];

    for (const sheetName of workbook.SheetNames) {
        if (masterIsIgnoredSheet(sheetName)) {
            report.push(`Sheet «${sheetName}» نادیده گرفته شد.`);
            continue;
        }

        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
            header: 1,
            defval: "",
            raw: true,
            blankrows: false
        });

        if (!rows.length) continue;

        const header = masterFindHeaderRow(rows);
        if (!header) {
            report.push(`Sheet «${sheetName}» ستون‌های لازم را نداشت و وارد بانک نشد.`);
            continue;
        }

        const inferredPiece = masterInferPieceFromSheetName(sheetName);
        let added = 0;
        let skipped = 0;

        for (let i = header.rowIndex + 1; i < rows.length; i++) {
            const row = rows[i] || [];
            const name = masterCleanText(row[header.map.name]);
            const lastname = masterCleanText(row[header.map.lastname]);
            const piece = header.map.piece !== undefined
                ? masterNormalizeLocation(row[header.map.piece])
                : inferredPiece;
            const grave_row = masterNormalizeLocation(row[header.map.grave_row]);
            const grave_number = masterNormalizeLocation(row[header.map.grave_number]);

            if (!name && !lastname && !piece && !grave_row && !grave_number) continue;

            if (!name || !lastname || !piece || !grave_row || !grave_number) {
                skipped++;
                continue;
            }

            const record = {
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
            };

            const key = masterKey(record);
            if (seen.has(key)) continue;
            seen.add(key);
            records.push(record);
            added++;
        }

        report.push(`Sheet «${sheetName}»: ${added.toLocaleString("fa-IR")} رکورد.` + (skipped ? ` ${skipped.toLocaleString("fa-IR")} ردیف ناقص کنار گذاشته شد.` : ""));
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    if (!records.length) throw new Error("هیچ رکورد قابل استفاده‌ای از Sheetهای قطعات پیدا نشد.\n\n" + report.join("\n"));

    console.info("GolzarStone Excel report:", report);
    return records;
}

function masterDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function masterInsertBatchWithRetry(client, batch, batchNo, start, end, totalBatches) {
    let lastError = null;

    for (let attempt = 1; attempt <= MASTER_MAX_RETRIES; attempt++) {
        masterUpdateMessage(
            `در حال اتصال بانک Excel به Supabase...\n\nBatch ${batchNo} از ${totalBatches}\nرکوردهای ${start + 1} تا ${end}\n\nتلاش ${attempt} از ${MASTER_MAX_RETRIES}\nرکوردهای موجود تغییر نمی‌کنند.`
        );

        try {
            const result = await client.from(MASTER_TABLE).insert(batch);
            if (!result.error) return;

            lastError = result.error;
            const message = result.error.message || result.error.details || result.error.code || "خطای نامشخص";

            // خطاهای واقعی دیتابیس معمولاً با پاسخ مشخص برمی‌گردند و retry بی‌فایده است.
            // Failed to fetch یک خطای شبکه/مرورگر است و ارزش retry دارد.
            if (!/failed to fetch|network|timeout|timed out|abort/i.test(String(message))) {
                throw new Error(`خطا هنگام ثبت Batch ${batchNo}:\n${message}`);
            }
        } catch (error) {
            lastError = error;
            const message = error?.message || String(error);
            if (!/failed to fetch|network|timeout|timed out|abort/i.test(message)) {
                throw new Error(`خطا هنگام ثبت Batch ${batchNo}:\n${message}`);
            }
        }

        if (attempt < MASTER_MAX_RETRIES) {
            await masterDelay(1000 * attempt);
        }
    }

    throw new Error(
        `خطا هنگام ثبت Batch ${batchNo} پس از ${MASTER_MAX_RETRIES} تلاش.\n` +
        `${lastError?.message || String(lastError)}`
    );
}

async function masterImportMissing(client, records) {
    const existingKeys = await masterGetExistingKeys(client);
    const missing = records.filter(record => !existingKeys.has(masterKey(record)));

    if (!missing.length) {
        return { imported: 0, existing: records.length };
    }

    let imported = 0;
    const totalBatches = Math.ceil(missing.length / MASTER_BATCH_SIZE);

    for (let start = 0, batchNo = 1; start < missing.length; start += MASTER_BATCH_SIZE, batchNo++) {
        const end = Math.min(start + MASTER_BATCH_SIZE, missing.length);
        const batch = missing.slice(start, end);

        await masterInsertBatchWithRetry(client, batch, batchNo, start, end, totalBatches);
        imported += batch.length;

        // مکث بسیار کوتاه برای پایدار ماندن اتصال مرورگر و API.
        await masterDelay(150);
    }

    return { imported, existing: records.length - missing.length };
}

async function startGolzarStone() {
    try {
        masterShowMessage("⏳", "در حال اتصال به بانک اصلی...\nلطفاً صفحه را نبندید.");

        if (!window.supabase || typeof window.supabase.createClient !== "function") {
            throw new Error("کتابخانه Supabase در صفحه بارگذاری نشده است.");
        }

        const client = window.supabase.createClient(MASTER_SUPABASE_URL, MASTER_SUPABASE_KEY);

        const records = await masterReadExcel();
        masterUpdateMessage(`Excel آماده شد.\nتعداد رکوردهای یکتا: ${records.length.toLocaleString("fa-IR")}\n\nدر حال تطبیق با بانک Supabase...`);

        const result = await masterImportMissing(client, records);

        masterShowMessage(
            "✅",
            `اتصال بانک اصلی با موفقیت انجام شد.\n\nرکوردهای موجود دست‌نخورده ماندند: ${result.existing.toLocaleString("fa-IR")}\nرکوردهای جدید از Excel اضافه شد: ${result.imported.toLocaleString("fa-IR")}\n\nدر حال ورود به برنامه...`
        );

        setTimeout(masterLoadApp, 900);
    } catch (error) {
        console.error("GolzarStone master sync error:", error);
        masterShowMessage("❌", "اتصال بانک اصلی انجام نشد.\n\n" + (error?.message || String(error)));
    }
}

document.addEventListener("DOMContentLoaded", startGolzarStone);
