"use strict";

// ============================================================
// GolzarStone — صفحه مستقل گزارش‌های آماری
// این فایل فقط SELECT می‌کند و هیچ داده/ستونی را تغییر نمی‌دهد.
// ============================================================

const SUPABASE_URL = "https://bafrksgdcmglahyrppfy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_O5CkSuivysXJf-8hu1IUCA_izu8hWiX";
const TABLE_NAME = "martyrs";

const TOTAL_GRAVES = 26097;
const PIECES = [
  ["17", 103], ["24", 6100], ["26", 4514], ["27", 3177],
  ["28", 3523], ["29", 2743], ["40", 2948], ["53", 3092]
];

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
  const v = String(value ?? "").trim();
  return OLD_STAGE_ALIASES[v] || v;
}

function normalizePiece(value) {
  return String(value ?? "").trim().replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/\.0$/, "");
}

function fa(value) {
  return String(value).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}

function pct(value, denominator = TOTAL_GRAVES) {
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

  for (const [piece, total] of PIECES) {
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
    const pieceTarget = type === "ترمیمی" ? model.pieces[piece].repair : model.pieces[piece].replacement;
    if (Object.prototype.hasOwnProperty.call(pieceTarget, stage)) pieceTarget[stage]++;
  }

  model.tracked = model.repair.total + model.replacement.total;
  model.completed = model.repair.completed + model.replacement.completed;
  model.remaining = Math.max(model.tracked - model.completed, 0);
  return model;
}

function bar(label, value, denominator) {
  const percent = Math.min(pct(value, denominator), 100);
  return `<div class="bar"><div class="bar-head"><span>${esc(label)}</span><strong>${fa(value)} — ${fa(percent.toFixed(1))}٪</strong></div><div class="track"><div class="fill" style="width:${percent.toFixed(2)}%"></div></div><small class="sub">${fa(value)} از ${fa(denominator)}</small></div>`;
}

function render(model) {
  const app = document.getElementById("statistics-app");
  const overallPercent = pct(model.completed);
  const trackedPercent = pct(model.tracked);
  const remainingPercentOfTracked = model.tracked ? pct(model.remaining, model.tracked) : 0;

  app.innerHTML = `
    <div class="page">
      <header class="head">
        <div><h1>گزارش‌های آماری</h1><p>وضعیت لحظه‌ای عملیات بهسازی سنگ مزار</p></div>
        <button type="button" onclick="location.reload()">↻ تازه‌سازی</button>
      </header>

      <div class="meta">مبنای درصد از کل: <strong>${fa(TOTAL_GRAVES)}</strong> مزار در ۸ قطعه · <span class="badge">فقط خواندنی</span></div>

      <section class="card overall">
        <div class="card hero metric"><span>کل مزارهای ۸ قطعه</span><strong>${fa(TOTAL_GRAVES)}</strong><small>مبنای درصد کل</small></div>
        <div class="card metric"><span>کل موارد عملیاتی ثبت‌شده</span><strong>${fa(model.tracked)}</strong><small>${fa(trackedPercent.toFixed(1))}٪ از کل</small></div>
        <div class="card metric"><span>تکمیل‌شده</span><strong>${fa(model.completed)}</strong><small>${fa(overallPercent.toFixed(1))}٪ از کل</small></div>
        <div class="card metric"><span>باقی‌مانده عملیاتی</span><strong>${fa(model.remaining)}</strong><small>${fa(remainingPercentOfTracked.toFixed(1))}٪ از موارد عملیاتی</small></div>
      </section>

      <section class="card">
        <h2>وضعیت کلی</h2>
        ${bar("ترمیم شده", model.repair.completed, TOTAL_GRAVES)}
        ${bar("تعویض شده", model.replacement.completed, TOTAL_GRAVES)}
        ${bar("تکمیل‌شده از کل", model.completed, TOTAL_GRAVES)}
      </section>

      <div class="grid">
        <section class="card">
          <h2>وضعیت ترمیمی</h2>
          <div class="stage-grid">${STAGES["ترمیمی"].map(stage => `<div class="stage"><div class="stage-title">${esc(stage)}</div><strong>${fa(model.repair.stages[stage])}</strong>${bar("از کل ترمیمی", model.repair.stages[stage], Math.max(model.repair.total, 1))}</div>`).join("")}</div>
        </section>
        <section class="card">
          <h2>وضعیت تعویضی</h2>
          <div class="stage-grid">${STAGES["تعویضی"].map(stage => `<div class="stage"><div class="stage-title">${esc(stage)}</div><strong>${fa(model.replacement.stages[stage])}</strong>${bar("از کل تعویضی", model.replacement.stages[stage], Math.max(model.replacement.total, 1))}</div>`).join("")}</div>
        </section>
      </div>

      <section class="card">
        <h2>وضعیت عملیات به تفکیک قطعه</h2>
        <div class="pieces">
          ${PIECES.map(([piece, total]) => {
            const x = model.pieces[piece];
            return `<article class="card piece"><h3>قطعه ${fa(piece)} — ${fa(total)} مزار</h3><h4>ترمیمی</h4>${STAGES["ترمیمی"].map(stage => bar(stage, x.repair[stage], total)).join("")}<h4>تعویضی</h4>${STAGES["تعویضی"].map(stage => bar(stage, x.replacement[stage], total)).join("")}</article>`;
          }).join("")}
        </div>
      </section>

      <div class="footer">این صفحه مستقل است و فقط داده‌های موجود در جدول <strong>martyrs</strong> را می‌خواند. هیچ ستون، رکورد یا وضعیت عملیاتی ایجاد، ویرایش یا حذف نمی‌شود. عناوین رسمی مراحل طبق نسخه نهایی تعیین‌شده استفاده می‌شوند.</div>
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
    app.innerHTML = `<div class="error"><strong>گزارش‌های آماری بارگذاری نشد.</strong><br>${esc(error.message || String(error))}<br><br>اتصال برنامه اصلی به این صفحه مستقل نیست و اطلاعات بانک تغییری نکرده است.</div>`;
  }
}

start();
