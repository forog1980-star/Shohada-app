"use strict";

// ============================================================
// GolzarStone — آمار زنده
// فقط از ستون‌های موجود martyrs استفاده می‌کند؛ هیچ ستونی اضافه نمی‌شود.
// مخرج درصد کلی: 26097 مزار در 8 قطعه.
// ============================================================

const GOLZAR_STATS_TOTAL = 26097;
const GOLZAR_STATS_PIECES = [
  ["17", 103], ["24", 6100], ["26", 4514], ["27", 3177],
  ["28", 3523], ["29", 2743], ["40", 2948], ["53", 3092]
];

const GOLZAR_STATS_STAGES = {
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

const GOLZAR_STATS_STAGE_ALIASES = {
  "ارسال به واحد مرمت": "طرح سنگ ارسال به واحد مرمت",
  "نصب مرمتی شده": "نصب سنگ مرمت شده",
  "ارسال به واحد تعویض": "طرح سنگ ارسال به واحد تعویض",
  "تعویضی نصب شده": "نصب سنگ تعویض شده"
};

function statsStage(value) {
  const v = String(value || "").trim();
  return GOLZAR_STATS_STAGE_ALIASES[v] || v;
}
function statsNum(v) { return typeof toPersianDigits === "function" ? toPersianDigits(v) : String(v); }
function statsEsc(v) { return typeof escapeHtml === "function" ? escapeHtml(v) : String(v ?? ""); }
function statsPct(v) { return (v / GOLZAR_STATS_TOTAL) * 100; }

async function statsFetchAll() {
  const out = [];
  const size = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .select("id,piece,stone_type,stage,status")
      .order("id", { ascending: true })
      .range(from, from + size - 1);
    if (error) throw error;
    const batch = data || [];
    out.push(...batch);
    if (batch.length < size) break;
    from += size;
  }
  const seen = new Set();
  return out.filter(r => {
    const k = String(r.id);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function statsModel(rows) {
  const empty = type => ({
    total: 0,
    completed: 0,
    stages: Object.fromEntries(GOLZAR_STATS_STAGES[type].map(s => [s, 0]))
  });

  const m = {
    repair: empty("ترمیمی"),
    replacement: empty("تعویضی"),
    pieces: {}
  };

  for (const [piece, total] of GOLZAR_STATS_PIECES) {
    m.pieces[piece] = {
      total,
      repair: Object.fromEntries(GOLZAR_STATS_STAGES["ترمیمی"].map(s => [s, 0])),
      replacement: Object.fromEntries(GOLZAR_STATS_STAGES["تعویضی"].map(s => [s, 0]))
    };
  }

  for (const r of rows) {
    const type = r?.stone_type;
    if (type !== "ترمیمی" && type !== "تعویضی") continue;

    const stage = statsStage(r?.stage);
    const target = type === "ترمیمی" ? m.repair : m.replacement;
    target.total++;

    if (Object.prototype.hasOwnProperty.call(target.stages, stage)) {
      target.stages[stage]++;
    }

    if (stage === GOLZAR_STATS_STAGES[type][2]) {
      target.completed++;
    }

    const p = String(r?.piece ?? "").trim().replace(/\.0$/, "");
    if (!m.pieces[p]) continue;

    const pt = type === "ترمیمی" ? m.pieces[p].repair : m.pieces[p].replacement;
    if (Object.prototype.hasOwnProperty.call(pt, stage)) {
      pt[stage]++;
    }
  }

  m.completed = m.repair.completed + m.replacement.completed;
  m.remaining = Math.max(GOLZAR_STATS_TOTAL - m.completed, 0);
  m.tracked = m.repair.total + m.replacement.total;
  return m;
}

function statsBar(title, value, total = GOLZAR_STATS_TOTAL) {
  const width = Math.min((value / total) * 100, 100);
  return `<div class="gs-stage"><div><span>${statsEsc(title)}</span><b>${statsNum(value)}</b></div><i><em style="width:${width.toFixed(2)}%"></em></i><small>${statsNum(value)} از ${statsNum(total)} (${((value / GOLZAR_STATS_TOTAL) * 100).toFixed(1)}٪ از کل)</small></div>`;
}

function statsInjectStyles() {
  if (document.getElementById("golzar-statistics-styles")) return;
  const s = document.createElement("style");
  s.id = "golzar-statistics-styles";
  s.textContent = `
.gs-head{display:flex;align-items:center;gap:10px;background:linear-gradient(145deg,#17633d,#238b57);color:#fff;padding:15px}.gs-head h1{margin:0;font-size:24px}.gs-head p{margin:3px 0 0;font-size:13px;opacity:.9}.gs-back{border:0;background:rgba(255,255,255,.16);color:#fff;padding:9px 12px;border-radius:9px;font-family:inherit}.gs-page{max-width:1100px;margin:auto;padding:12px;background:#f4f7f5}.gs-note{font-size:11px;color:#708078;margin:0 0 10px}.gs-card{background:#fff;border:1px solid #dce6df;border-radius:14px;padding:14px;margin-bottom:12px;box-shadow:0 5px 18px rgba(23,99,61,.06)}.gs-overall{display:flex;justify-content:space-between;gap:12px;align-items:center}.gs-overall strong{font-size:25px;display:block}.gs-total{background:#e8f5ed;border-radius:11px;padding:8px 14px;text-align:center}.gs-total strong{color:#17633d}.gs-total small{display:block;color:#708078;font-size:10px}.gs-lines{display:grid;gap:10px;margin-top:15px}.gs-line{display:grid;grid-template-columns:120px 1fr;gap:5px 10px;font-size:12px}.gs-line strong{text-align:left}.gs-line i{grid-column:1/-1;height:9px;background:#edf2ef;border-radius:99px;overflow:hidden}.gs-line em,.gs-stage em{display:block;height:100%;background:#238b57;border-radius:99px}.gs-line:nth-child(2) em{background:#2878b8}.gs-line:nth-child(3) em{background:#d9822b}.gs-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.gs-summary .gs-card{margin:0}.gs-summary span{font-size:12px;color:#708078}.gs-summary strong{display:block;font-size:27px;margin:4px 0}.gs-summary small{color:#708078;font-size:10px}.gs-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.gs-title h2{font-size:18px;margin:0}.gs-title span{font-size:11px;color:#708078}.gs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.gs-stage{border:1px solid #e4ebe6;border-radius:11px;padding:9px;background:#fbfdfc}.gs-stage>div{display:flex;justify-content:space-between;gap:8px;font-size:12px;line-height:1.7}.gs-stage b{font-size:18px}.gs-stage i{display:block;height:7px;background:#edf2ef;border-radius:99px;overflow:hidden;margin:7px 0 4px}.gs-stage small{font-size:9px;color:#708078}.gs-pieces{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.gs-piece h3{margin:0 0 9px;font-size:16px}.gs-piece h4{font-size:12px;margin:8px 0 5px}.gs-piece .gs-stage{margin-bottom:5px}.gs-piece .gs-stage small{display:none}.gs-piece .gs-stage{padding:7px}.gs-piece .gs-stage b{font-size:15px}.gs-piece .gs-stage i{height:5px}.gs-footer-note{font-size:11px;color:#708078;line-height:1.8;padding-bottom:20px}@media(max-width:700px){.gs-summary,.gs-grid,.gs-pieces{grid-template-columns:1fr}.gs-line{grid-template-columns:1fr auto}.gs-page{padding:9px}}
`;
  document.head.appendChild(s);
}

function statsRender(m) {
  const app = document.querySelector(".app");
  if (!app) return;

  app.innerHTML = `
<header class="gs-head"><button class="gs-back" id="gs-back">بازگشت</button><div><h1>گزارش‌های آماری</h1><p>وضعیت لحظه‌ای عملیات بهسازی سنگ مزار</p></div></header>
<main class="gs-page">
<div class="gs-note">مبنای درصد کلی: ${statsNum(GOLZAR_STATS_TOTAL)} مزار در ۸ قطعه</div>
<section class="gs-card"><div class="gs-overall"><div><span>وضعیت کلی</span><strong>${statsNum(m.completed)} تکمیل‌شده</strong></div><div class="gs-total"><strong>${statsNum(GOLZAR_STATS_TOTAL)}</strong><small>کل مزارها</small></div></div><div class="gs-lines"><div class="gs-line"><span>ترمیم شده</span><strong>${statsNum(m.repair.completed)} — ${statsPct(m.repair.completed).toFixed(1)}٪</strong><i><em style="width:${Math.min(statsPct(m.repair.completed),100)}%"></em></i></div><div class="gs-line"><span>تعویض شده</span><strong>${statsNum(m.replacement.completed)} — ${statsPct(m.replacement.completed).toFixed(1)}٪</strong><i><em style="width:${Math.min(statsPct(m.replacement.completed),100)}%"></em></i></div><div class="gs-line"><span>باقی‌مانده از کل</span><strong>${statsNum(m.remaining)} — ${statsPct(m.remaining).toFixed(1)}٪</strong><i><em style="width:${Math.min(statsPct(m.remaining),100)}%"></em></i></div></div></section>
<div class="gs-summary"><section class="gs-card"><span>کل ترمیمی‌های ثبت‌شده</span><strong>${statsNum(m.repair.total)}</strong><small>تکمیل‌شده: ${statsNum(m.repair.completed)}</small></section><section class="gs-card"><span>کل تعویضی‌های ثبت‌شده</span><strong>${statsNum(m.replacement.total)}</strong><small>تکمیل‌شده: ${statsNum(m.replacement.completed)}</small></section><section class="gs-card"><span>رکوردهای عملیاتی</span><strong>${statsNum(m.tracked)}</strong><small>ترمیمی + تعویضی</small></section></div>
<section class="gs-card"><div class="gs-title"><h2>وضعیت ترمیمی</h2><span>${statsNum(m.repair.total)} رکورد</span></div><div class="gs-grid">${GOLZAR_STATS_STAGES["ترمیمی"].map(s=>statsBar(s,m.repair.stages[s])).join("")}</div></section>
<section class="gs-card"><div class="gs-title"><h2>وضعیت تعویضی</h2><span>${statsNum(m.replacement.total)} رکورد</span></div><div class="gs-grid">${GOLZAR_STATS_STAGES["تعویضی"].map(s=>statsBar(s,m.replacement.stages[s])).join("")}</div></section>
<section class="gs-card"><div class="gs-title"><h2>وضعیت عملیات به تفکیک قطعه</h2><span>۸ قطعه</span></div><div class="gs-pieces">${GOLZAR_STATS_PIECES.map(([p,total])=>{const x=m.pieces[p];return `<article class="gs-piece"><h3>قطعه ${statsNum(p)} — ${statsNum(total)} مزار</h3><h4>ترمیمی</h4>${GOLZAR_STATS_STAGES["ترمیمی"].map(s=>statsBar(s,x.repair[s],total)).join("")}<h4>تعویضی</h4>${GOLZAR_STATS_STAGES["تعویضی"].map(s=>statsBar(s,x.replacement[s],total)).join("")}</article>`}).join("")}</div></section>
<div class="gs-footer-note">این داشبورد فقط داده‌های موجود در بانک را می‌خواند و هیچ ستون یا رکوردی ایجاد یا تغییر نمی‌دهد. عناوین رسمی مراحل در لایه نمایش یکسان شده‌اند.</div>
</main>`;

  document.getElementById("gs-back")?.addEventListener("click", () => {
    if (window.history.state?.page === "statistics") window.history.back();
    else if (typeof window.showHome === "function") window.showHome();
  });
}

async function showStatistics() {
  statsInjectStyles();
  const app = document.querySelector(".app");
  if (!app) return;
  app.innerHTML = '<main class="gs-page"><div class="loading-message">در حال محاسبه آمار لحظه‌ای...</div></main>';

  try {
    const rows = await statsFetchAll();
    statsRender(statsModel(rows));
  } catch (e) {
    console.error("GolzarStone statistics error:", e);
    app.innerHTML = `<main class="gs-page"><div class="error-message">دریافت آمار انجام نشد.<br><br>${statsEsc(e.message || String(e))}</div></main>`;
  }
}

function isStatisticsButton(el) {
  if (!el) return false;
  const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  return text === "📊 گزارش‌های آماری گزارش‌ها و آمار سامانه" ||
         text === "گزارش‌های آماری گزارش‌ها و آمار سامانه" ||
         text === "گزارش‌های آماری";
}

function installStatsLabel() {
  statsInjectStyles();

  const markExistingButton = () => {
    const candidates = Array.from(document.querySelectorAll("button,a,[role='button'],div"));
    for (const el of candidates) {
      const strong = el.querySelector?.(".button-text strong");
      if (!strong) continue;
      const text = strong.textContent.trim();
      if (text !== "تست اتصال" && text !== "گزارش‌های آماری") continue;

      if (text === "تست اتصال") {
        const button = el.cloneNode(true);
        button.removeAttribute("id");
        button.removeAttribute("href");
        button.removeAttribute("onclick");
        button.removeAttribute("role");
        button.removeAttribute("tabindex");
        button.dataset.golzarStatsButton = "1";
        button.style.cursor = "pointer";
        button.querySelector(".icon")?.replaceChildren(document.createTextNode("📊"));
        const t = button.querySelector(".button-text strong");
        const sub = button.querySelector(".button-text small");
        if (t) t.textContent = "گزارش‌های آماری";
        if (sub) sub.textContent = "گزارش‌ها و آمار سامانه";
        button.querySelector(".button-arrow")?.remove();
        el.replaceWith(button);
      } else {
        el.dataset.golzarStatsButton = "1";
        el.style.cursor = "pointer";
      }
      return true;
    }
    return false;
  };

  markExistingButton();

  if (!window.__GOLZAR_STATS_CLICK_HANDLER__) {
    document.addEventListener("click", async event => {
      const origin = event.target?.closest?.("button,a,[role='button'],div");
      if (!origin) return;

      const button = origin.closest?.("button,a,[role='button']") || origin;
      const text = (button.innerText || button.textContent || "").replace(/\s+/g, " ").trim();
      const isStats = text.includes("گزارش‌های آماری") && text.includes("گزارش‌ها و آمار سامانه") || text === "گزارش‌های آماری";
      if (!isStats) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      window.history.pushState({ golzarApp: true, page: "statistics" }, "", window.location.href);
      await window.showStatistics();
    }, true);
    window.__GOLZAR_STATS_CLICK_HANDLER__ = true;
  }

  if (!window.__GOLZAR_STATS_OBSERVER__) {
    const observer = new MutationObserver(() => markExistingButton());
    observer.observe(document.querySelector(".app") || document.body, { childList: true, subtree: true });
    window.__GOLZAR_STATS_OBSERVER__ = observer;
  }
}

// خروجی‌های عمومی؛ برای تست و برای سایر لایه‌های برنامه.
window.showStatistics = showStatistics;
window.installStatsLabel = installStatsLabel;
window.GOLZAR_STATS_TOTAL = GOLZAR_STATS_TOTAL;

window.addEventListener("popstate", event => {
  if (event.state?.golzarApp && event.state.page === "statistics") {
    window.showStatistics();
  }
});
