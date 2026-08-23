"use strict";

// ============================================================
// GolzarStone — مبانی آمار
// این بخش مستقل از برنامه عملیاتی است و فقط خواندن انجام می‌دهد.
// ============================================================
const STATS_CONFIG = {
  totalGraves: 26097,
  pieces: [
    ["17", 103], ["24", 6100], ["26", 4514], ["27", 3177],
    ["28", 3523], ["29", 2743], ["40", 2948], ["53", 3092]
  ]
};

const SUPABASE_URL = "https://bafrksgdcmglahyrppfy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_O5CkSuivysXJf-8hu1IUCA_izu8hWiX";
const TABLE_NAME = "martyrs";

const STAGES = {
  "ترمیمی": [
    "طرح سنگ ارسال به واحد مرمت",
    "سنگ مرمتی آماده",
    "نصب سنگ مرمت شده"
  ],
  "تعویضی": [
    "طرح سنگ ارسال به واحد تعویض",
    "سنگ تعویضی آماده",
    "نصب سنگ تعویض شده"
  ]
};

const OLD_STAGE_ALIASES = {
  "ارسال به واحد مرمت": "طرح سنگ ارسال به واحد مرمت",
  "نصب مرمتی شده": "نصب سنگ مرمت شده",
  "ارسال به واحد تعویض": "طرح سنگ ارسال به واحد تعویض",
  "تعویضی نصب شده": "نصب سنگ تعویض شده"
};

function normalizeStage(value) {
  const valueText = String(value ?? "").trim();
  return OLD_STAGE_ALIASES[valueText] || valueText;
}

function normalizePiece(value) {
  return String(value ?? "")
    .trim()
    .replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\.0$/, "");
}

function fa(value) {
  return String(value).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[c]));
}

function percent(value, denominator) {
  return denominator ? (value / denominator) * 100 : 0;
}

async function fetchAllRows(client) {
  const rows = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await client
      .from(TABLE_NAME)
      .select("id,piece,stone_type,stage,status")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;

    const batch = data || [];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }

  const seen = new Set();
  return rows.filter(row => {
    const key = String(row.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function emptyType(type) {
  return {
    total: 0,
    completed: 0,
    stages: Object.fromEntries(STAGES[type].map(stage => [stage, 0]))
  };
}

function buildModel(rows) {
  const model = {
    repair: emptyType("ترمیمی"),
    replacement: emptyType("تعویضی"),
    pieces: {},
    tracked: 0,
    completed: 0,
    remaining: 0
  };

  for (const [piece, total] of STATS_CONFIG.pieces) {
    model.pieces[piece] = {
      total,
      repair: Object.fromEntries(STAGES["ترمیمی"].map(stage => [stage, 0])),
      replacement: Object.fromEntries(STAGES["تعویضی"].map(stage => [stage, 0]))
    };
  }

  for (const row of rows) {
    const type = row?.stone_type;
    if (type !== "ترمیمی" && type !== "تعویضی") continue;

    const stage = normalizeStage(row?.stage);
    const target = type === "ترمیمی" ? model.repair : model.replacement;

    target.total++;
    if (Object.prototype.hasOwnProperty.call(target.stages, stage)) {
      target.stages[stage]++;
    }
    if (stage === STAGES[type][2]) target.completed++;

    const piece = normalizePiece(row?.piece);
    if (!model.pieces[piece]) continue;

    const pieceTarget = type === "ترمیمی"
      ? model.pieces[piece].repair
      : model.pieces[piece].replacement;

    if (Object.prototype.hasOwnProperty.call(pieceTarget, stage)) {
      pieceTarget[stage]++;
    }
  }

  model.tracked = model.repair.total + model.replacement.total;
  model.completed = model.repair.completed + model.replacement.completed;
  model.remaining = Math.max(model.tracked - model.completed, 0);
  return model;
}

function overallBar(label, value) {
  const total = STATS_CONFIG.totalGraves;
  const p = Math.min(percent(value, total), 100);
  return `
    <div class="bar">
      <div class="bar-head">
        <span>${esc(label)}</span>
        <strong>${fa(value)} — ${fa(p.toFixed(1))}٪ از کل</strong>
      </div>
      <div class="track"><div class="fill" style="width:${p.toFixed(2)}%"></div></div>
      <small class="sub">${fa(value)} از ${fa(total)} مزار</small>
    </div>`;
}

function operationalBar(label, value, total) {
  const p = Math.min(percent(value, total), 100);
  return `
    <div class="bar">
      <div class="bar-head">
        <span>${esc(label)}</span>
        <strong>${fa(value)}</strong>
      </div>
      <div class="track"><div class="fill" style="width:${p.toFixed(2)}%"></div></div>
      <small class="sub">${fa(value)} از ${fa(total)}</small>
    </div>`;
}

function stageCards(type, data) {
  return STAGES[type].map(stage => `
    <div class="stage">
      <div class="stage-title">${esc(stage)}</div>
      <strong>${fa(data.stages[stage])}</strong>
    </div>`).join("");
}

function pieceTable(model) {
  return STATS_CONFIG.pieces.map(([piece, total]) => {
    const data = model.pieces[piece];
    const repairTotal = Object.values(data.repair).reduce((sum, value) => sum + value, 0);
    const replacementTotal = Object.values(data.replacement).reduce((sum, value) => sum + value, 0);

    return `
      <tr>
        <td><strong>قطعه ${fa(piece)}</strong></td>
        <td>${fa(total)}</td>
        <td>${fa(repairTotal)}</td>
        <td>${fa(replacementTotal)}</td>
        <td>${fa(repairTotal + replacementTotal)}</td>
      </tr>`;
  }).join("");
}

function render(model) {
  const app = document.getElementById("statistics-app");
  const total = STATS_CONFIG.totalGraves;
  const trackedPercent = percent(model.tracked, total);
  const operationalCompletedPercent = percent(model.completed, model.tracked);
  const operationalRemainingPercent = percent(model.remaining, model.tracked);

  app.innerHTML = `
    <div class="page">
      <header class="head">
        <div>
          <h1>گزارش‌های آماری</h1>
          <p>وضعیت لحظه‌ای عملیات بهسازی سنگ مزار</p>
        </div>
        <button type="button" onclick="location.reload()">↻ تازه‌سازی</button>
      </header>

      <div class="meta">
        مبنای کل مزارهای گلزار: <strong>${fa(total)}</strong>
        · ۸ قطعه
        · <span class="badge">فقط خواندنی</span>
      </div>

      <section class="card overall">
        <div class="card hero metric">
          <span>کل مزارهای مشمول آمار</span>
          <strong>${fa(total)}</strong>
          <small>مبنای درصدهای وضعیت کلی</small>
        </div>
        <div class="card metric">
          <span>کل موارد عملیاتی ثبت‌شده</span>
          <strong>${fa(model.tracked)}</strong>
          <small>${fa(trackedPercent.toFixed(1))}٪ از کل مزارها</small>
        </div>
        <div class="card metric">
          <span>تکمیل‌شده</span>
          <strong>${fa(model.completed)}</strong>
          <small>${fa(operationalCompletedPercent.toFixed(1))}٪ از عملیات ثبت‌شده</small>
        </div>
        <div class="card metric">
          <span>باقی‌مانده عملیاتی</span>
          <strong>${fa(model.remaining)}</strong>
          <small>${fa(operationalRemainingPercent.toFixed(1))}٪ از عملیات ثبت‌شده</small>
        </div>
      </section>

      <section class="card">
        <h2>وضعیت کلی نسبت به کل مزارها</h2>
        ${overallBar("ترمیم شده", model.repair.completed)}
        ${overallBar("تعویض شده", model.replacement.completed)}
        ${overallBar("تکمیل شده", model.completed)}
      </section>

      <section class="card">
        <h2>وضعیت کل عملیات ثبت‌شده</h2>
        ${operationalBar("ترمیمی‌های ثبت‌شده", model.repair.total, Math.max(model.tracked, 1))}
        ${operationalBar("تعویضی‌های ثبت‌شده", model.replacement.total, Math.max(model.tracked, 1))}
        ${operationalBar("تکمیل‌شده از عملیات ثبت‌شده", model.completed, Math.max(model.tracked, 1))}
        ${operationalBar("باقی‌مانده عملیاتی", model.remaining, Math.max(model.tracked, 1))}
      </section>

      <div class="grid">
        <section class="card">
          <h2>وضعیت ترمیمی</h2>
          <div class="stage-grid">${stageCards("ترمیمی", model.repair)}</div>
        </section>
        <section class="card">
          <h2>وضعیت تعویضی</h2>
          <div class="stage-grid">${stageCards("تعویضی", model.replacement)}</div>
        </section>
      </div>

      <section class="card">
        <div class="table-caption">
          <span>خلاصه آماری هر قطعه؛ درصد مرحله‌ای در این جدول نمایش داده نمی‌شود.</span>
          <strong>۸ قطعه</strong>
        </div>
        <h2>جدول آماری قطعات</h2>
        <div class="piece-table-wrap">
          <table class="piece-table">
            <thead>
              <tr>
                <th>قطعه</th>
                <th>کل مزار</th>
                <th>ترمیمی</th>
                <th>تعویضی</th>
                <th>جمع عملیاتی</th>
              </tr>
            </thead>
            <tbody>${pieceTable(model)}</tbody>
          </table>
        </div>
      </section>

      <div class="footer">
        عدد <strong>${fa(total)}</strong> در یک محل متمرکز شده است و مبنای آماری مستقل از تعداد رکوردهای جدول
        <strong>${TABLE_NAME}</strong> است. در صورت تغییر آمار کل مزارها، فقط مبنای آماری تغییر می‌کند و منطق داشبورد ثابت می‌ماند.
        این صفحه فقط داده‌ها را می‌خواند و هیچ ستون، رکورد یا وضعیت عملیاتی را ایجاد، ویرایش یا حذف نمی‌کند.
      </div>
    </div>`;
}

async function start() {
  const app = document.getElementById("statistics-app");
  try {
    if (!window.supabase?.createClient) throw new Error("کتابخانه اتصال به بانک بارگذاری نشده است.");
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const rows = await fetchAllRows(client);
    render(buildModel(rows));
  } catch (error) {
    console.error("Independent statistics error:", error);
    app.innerHTML = `<div class="error"><strong>گزارش‌های آماری بارگذاری نشد.</strong><br>${esc(error.message || String(error))}<br><br>این صفحه مستقل است و اطلاعات بانک را تغییر نمی‌دهد.</div>`;
  }
}

start();