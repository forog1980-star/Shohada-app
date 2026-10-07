"use strict";

(function () {
  /*
   * GolzarStone AI Quality Panel
   * ----------------------------
   * مستقل از هسته عملیاتی؛ فقط UI را به منوی «مدیریت و بهسازی سنگ مزار» اضافه می‌کند.
   *
   * قواعد:
   * - هیچ تابع موجودی جایگزین نمی‌شود.
   * - هیچ داده‌ای در Supabase نوشته نمی‌شود.
   * - اعداد فقط از AI Live Index خوانده می‌شوند.
   * - در صورت آماده نبودن AI، برنامه اصلی همچنان عادی کار می‌کند.
   */

  const ENTRY_ID = "golzar-ai-quality-entry";
  const MODAL_ID = "golzar-ai-quality-modal";
  const STYLE_ID = "golzar-ai-quality-panel-style";
  const READY_EVENTS = [
    "golzar:ai-index-ready",
    "golzar:ai-data-changed"
  ];

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .golzar-ai-quality-divider{
        display:flex;
        align-items:center;
        gap:10px;
        margin:16px 2px 8px;
        color:#6c5a1f;
        font-size:11px;
        font-weight:800;
        letter-spacing:.2px;
      }
      .golzar-ai-quality-divider::before,
      .golzar-ai-quality-divider::after{
        content:"";
        height:1px;
        flex:1;
        background:linear-gradient(90deg,transparent,#d9c98d);
      }
      .golzar-ai-quality-entry{
        position:relative;
        width:100%;
      }
      .golzar-ai-quality-button{
        display:flex;
        align-items:center;
        gap:12px;
        width:100%;
        min-height:78px;
        padding:12px 14px;
        border:1px solid #d7c47d;
        border-radius:15px;
        background:
          radial-gradient(circle at 90% 15%,rgba(232,210,129,.28),transparent 34%),
          linear-gradient(180deg,#fffdf4,#fff9df);
        color:#4b421f;
        text-align:right;
        font:inherit;
        cursor:pointer;
        box-shadow:0 5px 16px rgba(120,96,20,.08);
        transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease;
      }
      .golzar-ai-quality-button:hover{
        transform:translateY(-1px);
        border-color:#b9a14a;
        box-shadow:0 8px 20px rgba(120,96,20,.13);
      }
      .golzar-ai-quality-icon{
        display:grid;
        place-items:center;
        width:42px;
        height:42px;
        flex:0 0 42px;
        border-radius:12px;
        background:#efe3ac;
        font-size:21px;
      }
      .golzar-ai-quality-copy{
        min-width:0;
        flex:1;
      }
      .golzar-ai-quality-copy strong{
        display:flex;
        align-items:center;
        gap:7px;
        font-size:14px;
      }
      .golzar-ai-quality-copy small{
        display:block;
        margin-top:4px;
        color:#756b46;
        font-size:11px;
        line-height:1.6;
      }
      .golzar-ai-quality-badge{
        display:inline-flex;
        align-items:center;
        border-radius:999px;
        padding:2px 7px;
        background:#6d5a18;
        color:#fffdf4;
        font-size:9px;
        font-weight:700;
      }
      .golzar-ai-quality-arrow{
        font-size:24px;
        color:#8a7424;
      }

      .golzar-ai-quality-modal{
        position:fixed;
        inset:0;
        z-index:2147483000;
        display:grid;
        place-items:center;
        padding:18px;
        background:rgba(18,30,24,.48);
        backdrop-filter:blur(3px);
      }
      .golzar-ai-quality-dialog{
        width:min(920px,100%);
        max-height:min(90vh,900px);
        overflow:auto;
        border:1px solid #d9c98d;
        border-radius:22px;
        background:#fffef8;
        box-shadow:0 24px 70px rgba(0,0,0,.24);
        direction:rtl;
      }
      .golzar-ai-quality-head{
        position:sticky;
        top:0;
        z-index:2;
        display:flex;
        align-items:flex-start;
        gap:14px;
        padding:18px 20px 14px;
        background:linear-gradient(180deg,#fffef8 80%,rgba(255,254,248,.94));
        border-bottom:1px solid #eee5c9;
      }
      .golzar-ai-quality-head-icon{
        display:grid;
        place-items:center;
        width:48px;
        height:48px;
        flex:0 0 48px;
        border-radius:14px;
        background:#efe3ac;
        font-size:23px;
      }
      .golzar-ai-quality-head h2{
        margin:0;
        color:#403715;
        font-size:20px;
      }
      .golzar-ai-quality-head p{
        margin:5px 0 0;
        color:#746b49;
        font-size:11px;
        line-height:1.7;
      }
      .golzar-ai-quality-close{
        margin-right:auto;
        border:1px solid #ddd3ae;
        border-radius:10px;
        background:#fff;
        color:#5e5537;
        min-width:36px;
        min-height:36px;
        font:inherit;
        font-size:18px;
        cursor:pointer;
      }
      .golzar-ai-quality-body{
        padding:18px 20px 20px;
      }
      .golzar-ai-quality-status{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-bottom:14px;
      }
      .golzar-ai-quality-pill{
        display:inline-flex;
        align-items:center;
        gap:6px;
        padding:6px 9px;
        border-radius:999px;
        background:#f5f3e8;
        color:#5d5539;
        font-size:10px;
      }
      .golzar-ai-quality-pills-ok{
        background:#edf6ef;
        color:#2f6940;
      }
      .golzar-ai-quality-pills-warn{
        background:#fff5de;
        color:#795d13;
      }
      .golzar-ai-quality-kpis{
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:10px;
      }
      .golzar-ai-quality-kpi{
        padding:14px;
        border:1px solid #e9e2cc;
        border-radius:15px;
        background:#ffffff;
      }
      .golzar-ai-quality-kpi span{
        display:block;
        color:#7a735d;
        font-size:10px;
      }
      .golzar-ai-quality-kpi strong{
        display:block;
        margin-top:7px;
        color:#3f3b2d;
        font-size:23px;
      }
      .golzar-ai-quality-section{
        margin-top:16px;
        padding:14px;
        border:1px solid #ece5d0;
        border-radius:16px;
        background:#fff;
      }
      .golzar-ai-quality-section h3{
        margin:0 0 10px;
        color:#4b452f;
        font-size:14px;
      }
      .golzar-ai-quality-issues{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:8px;
      }
      .golzar-ai-quality-issue{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:9px 10px;
        border-radius:11px;
        background:#faf9f3;
        border:1px solid #eee9d8;
      }
      .golzar-ai-quality-issue span{
        color:#5f5946;
        font-size:11px;
      }
      .golzar-ai-quality-issue strong{
        min-width:28px;
        text-align:center;
        border-radius:8px;
        padding:3px 6px;
        background:#eee7ca;
        color:#5c4f17;
        font-size:11px;
      }
      .golzar-ai-quality-footer{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        flex-wrap:wrap;
        margin-top:16px;
        padding-top:13px;
        border-top:1px dashed #ddd5bb;
      }
      .golzar-ai-quality-source{
        color:#80785f;
        font-size:10px;
      }
      .golzar-ai-quality-actions{
        display:flex;
        gap:8px;
      }
      .golzar-ai-quality-action{
        border:1px solid #d7ceb1;
        border-radius:10px;
        padding:8px 12px;
        background:#fff;
        color:#514a34;
        font:inherit;
        font-size:11px;
        cursor:pointer;
      }
      .golzar-ai-quality-action.primary{
        border-color:#6f5d1e;
        background:#6f5d1e;
        color:#fff;
      }
      .golzar-ai-quality-empty,
      .golzar-ai-quality-loading{
        padding:24px;
        text-align:center;
        border:1px dashed #d9cfaa;
        border-radius:14px;
        color:#776e51;
        background:#fcfbf4;
        line-height:1.9;
        font-size:12px;
      }
      @media(max-width:760px){
        .golzar-ai-quality-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
        .golzar-ai-quality-issues{grid-template-columns:1fr}
        .golzar-ai-quality-head{padding:14px}
        .golzar-ai-quality-body{padding:14px}
      }
    `;
    document.head.appendChild(style);
  }

  function getIndex() {
    try {
      return window.GOLZAR_AI_LAYER &&
        typeof window.GOLZAR_AI_LAYER.getDataQualityIndex === "function"
        ? window.GOLZAR_AI_LAYER
        : window.GOLZAR_AI_INDEX;
    } catch (error) {
      return null;
    }
  }

  function getSummary() {
    const index = getIndex();
    try {
      if (!index) return null;

      const dataQuality =
        typeof index.getDataQualityIndex === "function"
          ? index.getDataQualityIndex()
          : index.dataQuality;

      const dataIntelligence =
        typeof index.getDataIntelligenceIndex === "function"
          ? index.getDataIntelligenceIndex()
          : index.dataIntelligence;

      const quality =
        dataQuality && typeof dataQuality.getSummary === "function"
          ? dataQuality.getSummary()
          : null;

      const intelligence =
        dataIntelligence && typeof dataIntelligence.getSummary === "function"
          ? dataIntelligence.getSummary()
          : null;

      const snapshot =
        typeof index.getSnapshot === "function"
          ? index.getSnapshot()
          : null;

      return {
        quality,
        intelligence,
        snapshot
      };
    } catch (error) {
      console.error("[Golzar AI Quality] summary failed:", error);
      return null;
    }
  }

  function formatPercent(value, total) {
    if (!total) return "۰٪";
    return ((value / total) * 100).toLocaleString("fa-IR", {
      maximumFractionDigits: 2
    }) + "٪";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderModalContent() {
    const body = document.querySelector("#golzar-ai-quality-body");
    if (!body) return;

    const data = getSummary();

    if (!data || !data.quality) {
      body.innerHTML = `
        <div class="golzar-ai-quality-loading">
          اطلاعات کنترل کیفیت هنوز آماده نشده است.<br>
          در حال انتظار برای شاخص زنده هوش مصنوعی…
        </div>
        <div class="golzar-ai-quality-footer">
          <span class="golzar-ai-quality-source">منبع: AI Live Index · فقط خواندنی</span>
          <div class="golzar-ai-quality-actions">
            <button class="golzar-ai-quality-action primary" type="button" id="golzar-ai-quality-refresh">تلاش مجدد</button>
            <button class="golzar-ai-quality-action" type="button" id="golzar-ai-quality-close-2">بستن</button>
          </div>
        </div>
      `;
      bindModalButtons();
      return;
    }

    const quality = data.quality;
    const intelligence = data.intelligence || {};
    const total = Number(quality.totalRecords || 0);
    const clean = Number(quality.clean || 0);
    const problem = Number(quality.problem || 0);
    const issueCounts = quality.issueCounts || {};
    const issues = Object.entries(issueCounts)
      .map(([label, count]) => [label, Number(count) || 0])
      .filter((item) => item[1] > 0)
      .sort((a, b) => b[1] - a[1]);

    const snapshot = data.snapshot || {};
    const snapshotStatus = snapshot.status || "unknown";
    const updatedAt = snapshot.updatedAt
      ? new Date(snapshot.updatedAt).toLocaleString("fa-IR")
      : "نامشخص";

    body.innerHTML = `
      <div class="golzar-ai-quality-status">
        <span class="golzar-ai-quality-pill ${snapshotStatus === "ready" ? "golzar-ai-quality-pills-ok" : "golzar-ai-quality-pills-warn"}">
          ● وضعیت شاخص: ${escapeHtml(snapshotStatus === "ready" ? "آماده" : snapshotStatus)}
        </span>
        <span class="golzar-ai-quality-pill">منبع: Supabase public.martyrs</span>
        <span class="golzar-ai-quality-pill">آخرین به‌روزرسانی: ${escapeHtml(updatedAt)}</span>
      </div>

      <div class="golzar-ai-quality-kpis">
        <div class="golzar-ai-quality-kpi">
          <span>کل رکوردها</span>
          <strong>${total.toLocaleString("fa-IR")}</strong>
        </div>
        <div class="golzar-ai-quality-kpi">
          <span>رکورد سالم</span>
          <strong>${clean.toLocaleString("fa-IR")}</strong>
        </div>
        <div class="golzar-ai-quality-kpi">
          <span>نیازمند بررسی</span>
          <strong>${problem.toLocaleString("fa-IR")}</strong>
        </div>
        <div class="golzar-ai-quality-kpi">
          <span>درصد رکورد سالم</span>
          <strong>${formatPercent(clean,total)}</strong>
        </div>
      </div>

      <section class="golzar-ai-quality-section">
        <h3>موارد قابل بررسی</h3>
        ${issues.length
          ? `<div class="golzar-ai-quality-issues">${issues
              .map(([label, count]) => `
                <div class="golzar-ai-quality-issue">
                  <span>${escapeHtml(label)}</span>
                  <strong>${count.toLocaleString("fa-IR")}</strong>
                </div>`).join("")}</div>`
          : `<div class="golzar-ai-quality-empty">در شاخص فعلی مورد مسئله‌دار ثبت نشده است.</div>`
        }
      </section>

      <section class="golzar-ai-quality-section">
        <h3>خلاصه Data Intelligence</h3>
        <div class="golzar-ai-quality-issues">
          <div class="golzar-ai-quality-issue"><span>گروه‌های تکراری کامل</span><strong>${Number(intelligence.duplicateGroups || 0).toLocaleString("fa-IR")}</strong></div>
          <div class="golzar-ai-quality-issue"><span>تعارض هویتی</span><strong>${Number(intelligence.identityConflicts || 0).toLocaleString("fa-IR")}</strong></div>
          <div class="golzar-ai-quality-issue"><span>تعارض محل</span><strong>${Number(intelligence.locationConflicts || 0).toLocaleString("fa-IR")}</strong></div>
          <div class="golzar-ai-quality-issue"><span>رکورد ناقص</span><strong>${Number(intelligence.incompleteRecords || 0).toLocaleString("fa-IR")}</strong></div>
          <div class="golzar-ai-quality-issue"><span>موارد نیازمند نرمال‌سازی مرحله</span><strong>${Number(intelligence.stageNormalizations || 0).toLocaleString("fa-IR")}</strong></div>
          <div class="golzar-ai-quality-issue"><span>مراحل ناشناخته</span><strong>${Number(intelligence.stageAnomalies || 0).toLocaleString("fa-IR")}</strong></div>
        </div>
      </section>

      <div class="golzar-ai-quality-footer">
        <span class="golzar-ai-quality-source">این بخش فقط خواندنی است و هیچ تغییری در داده‌های عملیاتی انجام نمی‌دهد.</span>
        <div class="golzar-ai-quality-actions">
          <button class="golzar-ai-quality-action primary" type="button" id="golzar-ai-quality-refresh">به‌روزرسانی</button>
          <button class="golzar-ai-quality-action" type="button" id="golzar-ai-quality-close-2">بستن</button>
        </div>
      </div>
    `;

    bindModalButtons();
  }

  function bindModalButtons() {
    const refresh = document.getElementById("golzar-ai-quality-refresh");
    const close = document.getElementById("golzar-ai-quality-close-2");

    if (refresh) {
      refresh.addEventListener("click", async function () {
        try {
          const index = getIndex();
          if (index && typeof index.refresh === "function") {
            refresh.disabled = true;
            refresh.textContent = "در حال به‌روزرسانی…";
            await index.refresh();
            renderModalContent();
          }
        } catch (error) {
          console.error("[Golzar AI Quality] refresh failed:", error);
        } finally {
          if (refresh && document.body.contains(refresh)) {
            refresh.disabled = false;
            refresh.textContent = "به‌روزرسانی";
          }
        }
      });
    }

    if (close) {
      close.addEventListener("click", closeModal);
    }
  }

  function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) modal.remove();
  }

  function openModal() {
    injectStyles();
    closeModal();

    const modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "golzar-ai-quality-modal";
    modal.innerHTML = `
      <div class="golzar-ai-quality-dialog" role="dialog" aria-modal="true" aria-labelledby="golzar-ai-quality-title">
        <div class="golzar-ai-quality-head">
          <div class="golzar-ai-quality-head-icon" aria-hidden="true">🧭</div>
          <div>
            <h2 id="golzar-ai-quality-title">کنترل کیفیت داده</h2>
            <p>نمایش مستقل وضعیت کیفیت اطلاعات و موارد نیازمند بررسی در لایه هوش مصنوعی</p>
          </div>
          <button class="golzar-ai-quality-close" type="button" aria-label="بستن">×</button>
        </div>
        <div class="golzar-ai-quality-body" id="golzar-ai-quality-body"></div>
      </div>
    `;

    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });

    document.body.appendChild(modal);
    modal.querySelector(".golzar-ai-quality-close").addEventListener("click", closeModal);
    renderModalContent();
  }

  function insertEntry() {
    injectStyles();

    const actions = document.querySelector(".modular-home-sub-actions");
    if (!actions || document.getElementById(ENTRY_ID)) return;

    const wrapper = document.createElement("div");
    wrapper.id = ENTRY_ID;
    wrapper.className = "golzar-ai-quality-entry";
    wrapper.innerHTML = `
      <div class="golzar-ai-quality-divider">
        <span>کنترل هوشمند داده</span>
      </div>
      <button type="button" class="golzar-ai-quality-button" aria-label="باز کردن کنترل کیفیت داده">
        <span class="golzar-ai-quality-icon" aria-hidden="true">🧭</span>
        <span class="golzar-ai-quality-copy">
          <strong>کنترل کیفیت داده <span class="golzar-ai-quality-badge">AI</span></strong>
          <small>بررسی مستقلِ رکوردهای سالم، مسئله‌دار و تعارض‌های داده‌ای</small>
        </span>
        <span class="golzar-ai-quality-arrow" aria-hidden="true">‹</span>
      </button>
    `;

    wrapper.querySelector("button").addEventListener("click", openModal);
    actions.parentElement.appendChild(wrapper);
  }

  function observeMenu() {
    insertEntry();

    const observer = new MutationObserver(function () {
      insertEntry();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  READY_EVENTS.forEach(function (eventName) {
    window.addEventListener(eventName, function () {
      const modal = document.getElementById(MODAL_ID);
      if (modal) renderModalContent();
    });
  });

  document.addEventListener("DOMContentLoaded", observeMenu, { once: true });

  window.GOLZAR_AI_QUALITY_PANEL = {
    version: "0.1.0",
    open: openModal,
    close: closeModal,
    refresh: function () {
      renderModalContent();
    }
  };
})();
