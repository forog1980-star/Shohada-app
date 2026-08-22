// ============================================================
// GolzarStone — Master Excel Loader
// اتصال اولیه بانک اصلی از ExcelData/martyrs_master.xlsx به Supabase
// فقط وقتی جدول martyrs کاملاً خالی باشد اجرا می‌شود.
// ============================================================

"use strict";

const MASTER_SUPABASE_URL =
    "https://bafrksgdcmglahyrppfy.supabase.co";

const MASTER_SUPABASE_KEY =
    "sb_publishable_O5CkSuivysXJ-8hu1IUCA_izu8hWiX";

const MASTER_TABLE = "martyrs";
const MASTER_EXCEL_URL = "../ExcelData/martyrs_master.xlsx";
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

    return String(value)
        .replace(/\u200c/g, " ")
        .replace(/\s+/g, " ")
        .trim();
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

    if (/^\d+\.0$/.test(text)) {
        text = text.slice(0, -2);
    }

    return text;
}

function masterNormalizeId(value) {
    const text = masterNormalizeLocation(value);
    if (!text) return null;

    const number = Number(text);
    return Number.isSafeInteger(number) && number > 0
        ? number
        : null;
}

function masterShowMessage(title, detail = "") {
    document.body.innerHTML = `
        <div dir="rtl" style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f7f5;font-family:Tahoma,Arial,sans-serif;padding:24px;box-sizing:border-box;">
            <div style="width:min(560px,100%);background:#fff;border-radius:20px;padding:28px;box-shadow:0 8px 30px rgba(0,0,0,.08);text-align:center;">
                <div style="font-size:38px;margin-bottom:12px;">${title}</div>
                <div style="font-size:15px;line-height:2;color:#45534c;white-space:pre-line;">${detail}</div>
            </div>
        </div>
    `;
}

function masterLoadApp() {
    const script = document.createElement("script");
    script.src = "app.js?v=20260822-4";
    script.onload = () => {
        window.__GOLZAR_MASTER_READY__ = true;
    };
    script.onerror = () => {
        masterShowMessage("❌", "بارگذاری برنامه انجام نشد.\nفایل app.js در دسترس نیست.");
    };
    document.body.appendChild(script);
}

async function masterGetTableCount(client) {
    const { count, error } = await client
        .from(MASTER_TABLE)
        .select("id", { count: "exact", head: true });

    if (error) throw new Error(`خطا در بررسی جدول martyrs:\n${error.message}`);
    return Number(count || 0);
}

function masterFindHeaderRow(rows) {
    const aliases = {
        id: ["شناسهبانک", "شناسه", "کدشهید", "id", "bankid", "شناسهشهید"],
        name: ["نام", "نامشهید", "firstname", "name"],
        lastname: ["نامخانوادگی", "نامخانوادگی شهید", "نامخانوادگی_شهید", "lastname", "family"],
        father_name: ["نامپدر", "نامپدرشهید", "fathername", "father"],
        piece: ["قطعه", "قطعهشهید", "piece"],
        grave_row: ["ردیف", "ردیفمزار", "ردیفقبر", "graverow", "row"],
        grave_number: ["شماره", "شماره مزار", "شمارهقبر", "شمارهسنگ", "gravenumber", "number"],
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

        if (!best || score > best.score) {
            best = { rowIndex, map, score };
        }
    }

    if (!best || !best.map.name || !best.map.lastname || !best.map.piece || !best.map.grave_row || !best.map.grave_number) {
        throw new Error(
            "ستون‌های اصلی فایل Excel شناسایی نشدند.\n" +
            "لازم است ستون‌های نام، نام خانوادگی، قطعه، ردیف و شماره مزار در فایل وجود داشته باشند."
        );
    }

    return best;
}

async function masterReadExcel() {
    if (!window.XLSX) {
        throw new Error("کتابخانه Excel (SheetJS) بارگذاری نشده است.");
    }

    const response = await fetch(`${MASTER_EXCEL_URL}?v=20260822`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`دریافت فایل martyrs_master.xlsx ناموفق بود. HTTP ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: false,
        raw: true
    });

    let bestSheet = null;

    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: "",
            raw: true
        });

        try {
            const header = masterFindHeaderRow(rows);
            if (!bestSheet || header.score > bestSheet.header.score) {
                bestSheet = { sheetName, rows, header };
            }
        } catch (_) {
            // این Sheet ساختار بانک اصلی را ندارد؛ Sheet بعدی بررسی می‌شود.
        }
    }

    if (!bestSheet) {
        throw new Error("هیچ Sheet قابل استفاده‌ای در martyrs_master.xlsx پیدا نشد.");
    }

    const { rows, header } = bestSheet;
    const recordsById = new Map();
    const records = [];

    for (let i = header.rowIndex + 1; i < rows.length; i++) {
        const row = rows[i] || [];

        const name = masterCleanText(row[header.map.name]);
        const lastname = masterCleanText(row[header.map.lastname]);
        const father_name = header.map.father_name !== undefined
            ? masterCleanText(row[header.map.father_name])
            : "";
        const piece = masterNormalizeLocation(row[header.map.piece]);
        const grave_row = masterNormalizeLocation(row[header.map.grave_row]);
        const grave_number = masterNormalizeLocation(row[header.map.grave_number]);
        const excelId = header.map.id !== undefined
            ? masterNormalizeId(row[header.map.id])
            : null;

        if (!name && !lastname && !piece && !grave_row && !grave_number) continue;

        if (!name || !lastname || !piece || !grave_row || !grave_number) {
            continue;
        }

        // مهم: id در جدول Supabase از نوع int8 و Identity است.
        // بنابراین شناسه Excel را به ستون id ارسال نمی‌کنیم و اجازه می‌دهیم
        // PostgreSQL برای هر رکورد id را خودکار تولید کند.
        const record = {
            name,
            lastname,
            father_name: father_name || null,
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

        if (excelId !== null) {
            record._excel_source_id = excelId;
        }

        records.push(record);
    }

    if (!records.length) {
        throw new Error("از فایل Excel هیچ رکورد معتبر قابل انتقالی پیدا نشد.");
    }

    return {
        sheetName: bestSheet.sheetName,
        records
    };
}

function masterPrepareBatch(batch) {
    return batch.map(record => {
        const payload = { ...record };
        // این فیلد فقط برای ردیابی داخلی است و در جدول martyrs ذخیره نمی‌شود.
        delete payload._excel_source_id;
        return payload;
    });
}

async function masterImportToSupabase(client, records) {
    let imported = 0;

    for (let start = 0; start < records.length; start += MASTER_BATCH_SIZE) {
        const batch = masterPrepareBatch(
            records.slice(start, start + MASTER_BATCH_SIZE)
        );

        const { error } = await client
            .from(MASTER_TABLE)
            .insert(batch);

        if (error) {
            throw new Error(
                `خطا هنگام انتقال اطلاعات به Supabase (رکورد ${start + 1} تا ${Math.min(start + MASTER_BATCH_SIZE, records.length)}):\n${error.message}`
            );
        }

        imported += batch.length;
    }

    return imported;
}

async function startGolzarStone() {
    try {
        masterShowMessage("⏳", "در حال بررسی بانک اطلاعاتی...\nلطفاً صفحه را نبندید.");

        const client = window.supabase.createClient(
            MASTER_SUPABASE_URL,
            MASTER_SUPABASE_KEY
        );

        const count = await masterGetTableCount(client);

        // اگر بانک قبلاً اطلاعات دارد، هیچ Excel Import انجام نمی‌شود.
        if (count > 0) {
            masterLoadApp();
            return;
        }

        masterShowMessage("⏳", "بانک اطلاعاتی خالی است.\nدر حال انتقال آخرین نسخه Excel به سامانه...\nاین مرحله فقط یک بار انجام می‌شود.");

        const { sheetName, records } = await masterReadExcel();
        const imported = await masterImportToSupabase(client, records);

        const finalCount = await masterGetTableCount(client);

        if (finalCount !== imported) {
            throw new Error(
                `کنترل نهایی انتقال ناموفق بود. تعداد رکوردهای واردشده: ${imported} — تعداد رکوردهای جدول martyrs: ${finalCount}`
            );
        }

        console.info(
            `GolzarStone master import completed: ${imported} records from sheet "${sheetName}".`
        );

        masterLoadApp();
    } catch (error) {
        console.error("GolzarStone master import error:", error);
        masterShowMessage(
            "❌",
            "اتصال بانک اصلی انجام نشد.\n\n" +
            (error?.message || String(error)) +
            "\n\nبانک اصلی فقط در صورت موفقیت هر Batch تغییر می‌کند."
        );
    }
}

document.addEventListener("DOMContentLoaded", startGolzarStone);
