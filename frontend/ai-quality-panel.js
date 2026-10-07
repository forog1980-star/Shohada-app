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
        font-family:"B Nazanin","B Yekan",Tahoma,Arial,sans-serif;
      }
      .golzar-ai-quality-modal *{font-family:inherit}
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

      .golzar-ai-quality-dialog{width:min(1180px,100%);max-height:min(94vh,980px)}
      .golzar-ai-quality-meta{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 14px}
      .golzar-ai-quality-engine{padding:7px 10px;border-radius:999px;background:#f6f0d8;color:#6b5b1c;font-size:10px}
      .golzar-ai-quality-filters{display:grid;grid-template-columns:1fr 1fr auto;gap:9px;margin-top:10px}
      .golzar-ai-quality-filter{display:flex;align-items:center;gap:7px;padding:9px 10px;border:1px solid #e5dfc9;border-radius:11px;background:#fff}
      .golzar-ai-quality-filter label{font-size:10px;color:#756d57;white-space:nowrap}
      .golzar-ai-quality-filter select{width:100%;border:0;outline:0;background:transparent;color:#403a2a;font:inherit;font-size:11px}
      .golzar-ai-quality-table-wrap{overflow:auto;border:1px solid #e7e0ca;border-radius:13px}
      .golzar-ai-quality-table{width:100%;min-width:980px;border-collapse:collapse;background:#fff;font-size:10px}
      .golzar-ai-quality-table th{position:sticky;top:0;z-index:1;background:#f7f3e5;color:#655c42;padding:9px 8px;text-align:right;border-bottom:1px solid #e4dcc2;white-space:nowrap}
      .golzar-ai-quality-table td{padding:9px 8px;border-bottom:1px solid #f0ecdd;vertical-align:top;color:#4e493a}
      .golzar-ai-quality-table tr:hover td{background:#fffdf4}
      .golzar-ai-quality-id{font-weight:800;color:#65551a}
      .golzar-ai-quality-status-badge{display:inline-flex;align-items:center;border-radius:999px;padding:4px 7px;font-size:9px;font-weight:800;white-space:nowrap}
      .golzar-ai-quality-status-badge.clean{background:#eaf5ed;color:#2f6940}
      .golzar-ai-quality-status-badge.problem{background:#fff1d6;color:#7c5c13}
      .golzar-ai-quality-status-badge.duplicate{background:#f7e9d8;color:#8a4e18}
      .golzar-ai-quality-status-badge.invalid{background:#f6dddd;color:#8a3333}
      .golzar-ai-quality-issues-cell{line-height:1.8;min-width:250px}
      .golzar-ai-quality-detail{border:1px solid #1f4e79;border-radius:9px;padding:6px 9px;background:#1f4e79;color:#fff;font:inherit;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:0 2px 6px rgba(31,78,121,.16)}
      .golzar-ai-quality-detail:hover{background:#163a5c;border-color:#163a5c}
      .golzar-ai-quality-records-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px}
      .golzar-ai-quality-records-count{font-size:11px;color:#726b56}
      .golzar-ai-quality-pagination{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:11px}
      .golzar-ai-quality-page-btn{border:1px solid #ddd4b8;border-radius:9px;padding:7px 10px;background:#fff;color:#5a5138;font:inherit;font-size:10px;cursor:pointer}
      .golzar-ai-quality-page-btn:disabled{opacity:.45;cursor:default}
      .golzar-ai-quality-page-info{font-size:10px;color:#756d57}
      .golzar-ai-quality-two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .golzar-ai-quality-guide{display:grid;gap:7px}
      .golzar-ai-quality-guide-row{display:flex;align-items:flex-start;gap:8px;padding:8px 9px;border:1px solid #eee8d9;border-radius:10px;background:#fcfbf6}
      .golzar-ai-quality-guide-row b{color:#61531d;font-size:10px;white-space:nowrap}
      .golzar-ai-quality-guide-row span{color:#706853;font-size:10px;line-height:1.7}
      @media(max-width:760px){.golzar-ai-quality-filters{grid-template-columns:1fr}.golzar-ai-quality-two-col{grid-template-columns:1fr}}

      @media(max-width:760px){
        .golzar-ai-quality-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
        .golzar-ai-quality-issues{grid-template-columns:1fr}
        .golzar-ai-quality-head{padding:14px}
        .golzar-ai-quality-body{padding:14px}
      }
    `;
    style.textContent += "      .golzar-ai-quality-filters{grid-template-columns:minmax(260px,1.6fr) minmax(170px,.8fr) minmax(170px,.8fr) auto;align-items:stretch}\n      .golzar-ai-quality-filter-search{display:flex}\n      .golzar-ai-quality-filter-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#403a2a;font:inherit;font-size:11px}\n      .golzar-ai-quality-filter-action{justify-content:center}\n      .golzar-ai-quality-filter-action .golzar-ai-quality-action{white-space:nowrap}\n      .golzar-ai-quality-active-filter{margin-top:8px;padding:7px 10px;border-radius:10px;background:#f6f0d8;border:1px solid #e2d5a5;color:#6b5b1c;font-size:10px}\n      .golzar-ai-quality-issue{width:100%;border:1px solid #eee9d8;color:#5f5946;font:inherit;text-align:right;cursor:pointer;transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease}\n      .golzar-ai-quality-issue:hover{transform:translateY(-1px);border-color:#c9b979;box-shadow:0 4px 12px rgba(120,96,20,.09)}\n      .golzar-ai-quality-issue.static{cursor:default}\n      .golzar-ai-quality-issue.static:hover{transform:none;border-color:#eee9d8;box-shadow:none}\n      .golzar-ai-quality-table th:first-child,.golzar-ai-quality-table td:first-child{position:sticky;right:0;z-index:4;background:#fffef8;min-width:78px;width:78px;text-align:center;box-shadow:-3px 0 6px rgba(0,0,0,.07)}\n      .golzar-ai-quality-table thead th:first-child{z-index:6;background:#f7f3e5}\n      .golzar-ai-quality-related-list{display:grid;gap:8px}\n      .golzar-ai-quality-related-item{padding:10px;border:1px solid #eee8d9;border-radius:11px;background:#fcfbf6}\n      .golzar-ai-quality-related-item>div:first-child{color:#4e493a;font-size:11px;line-height:1.8}\n      .golzar-ai-quality-related-meta{margin-top:4px;color:#7a735d;font-size:10px;line-height:1.8}\n      .golzar-ai-quality-work-list{display:grid;gap:8px;margin-top:10px}\n      .golzar-ai-quality-work-item{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:8px;padding:10px;border:1px solid #eee8d9;border-radius:11px;background:#fcfbf6;font-size:11px;line-height:1.7}\n      .golzar-ai-quality-work-description{margin:0 0 10px;color:#746d59;font-size:11px;line-height:1.8}\n      .golzar-ai-quality-return-box{background:#fffaf2;border-color:#e4d5b8}\n      .golzar-ai-quality-action.correction{border-color:#a67c2e;background:#a67c2e;color:#fff}\n      .golzar-ai-quality-correction-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n      .golzar-ai-quality-correction-grid label{display:flex;flex-direction:column;gap:6px;color:#5f5946;font-size:11px;font-weight:700}\n      .golzar-ai-quality-correction-grid label.full{grid-column:1/-1}\n      .golzar-ai-quality-correction-grid input,.golzar-ai-quality-correction-grid textarea{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #d7ceb1;border-radius:8px;background:#fff;color:#403a2a;font:inherit;font-size:12px}\n      .golzar-ai-quality-correction-grid textarea{min-height:110px;resize:vertical}\n      .golzar-ai-quality-compare-header,.golzar-ai-quality-compare-row{display:grid;grid-template-columns:180px 1fr 1fr;gap:8px;align-items:center}\n      .golzar-ai-quality-compare-header{margin-bottom:6px;padding:8px 10px;border-radius:9px;background:#f6f0d8;color:#6b5b1c;font-size:10px;font-weight:800}\n      .golzar-ai-quality-compare-row{padding:8px 10px;border-bottom:1px solid #f0ecdd;font-size:11px}\n      .golzar-ai-quality-compare-row span{padding:7px 9px;border-radius:8px;background:#fcfbf6}\n      @media(max-width:900px){.golzar-ai-quality-filters{grid-template-columns:1fr 1fr}.golzar-ai-quality-filter-search{grid-column:1/-1}}\n      @media(max-width:700px){.golzar-ai-quality-filters{grid-template-columns:1fr}.golzar-ai-quality-filter-search{grid-column:auto}.golzar-ai-quality-work-item{grid-template-columns:1fr}.golzar-ai-quality-correction-grid{grid-template-columns:1fr}.golzar-ai-quality-correction-grid label.full{grid-column:auto}.golzar-ai-quality-compare-header,.golzar-ai-quality-compare-row{grid-template-columns:1fr}}\n      .golzar-ai-quality-modal,.golzar-ai-quality-modal *,.golzar-ai-quality-entry,.golzar-ai-quality-entry *{font-family:\"B Nazanin\",\"B Yekan\",Tahoma,Arial,sans-serif !important}\n      .golzar-ai-quality-issues{column-gap:14px;row-gap:12px}\n      .golzar-ai-quality-issue{min-width:0;box-sizing:border-box;overflow:hidden}\n      .golzar-ai-quality-issue span{min-width:0;overflow-wrap:anywhere;line-height:1.8}\n      .golzar-ai-quality-dialog{overflow-x:hidden;overflow-y:auto}\n      .golzar-ai-quality-head{z-index:20}\n      .golzar-ai-quality-table th:first-child{z-index:7}\n      .golzar-ai-quality-table td:first-child{z-index:1}";
    document.head.appendChild(style);
  }

  function getIndex() {
    try {
      if (
        window.GOLZAR_AI_INDEX &&
        typeof window.GOLZAR_AI_INDEX === "object"
      ) {
        return window.GOLZAR_AI_INDEX;
      }

      if (
        window.GOLZAR_AI_LAYER &&
        typeof window.GOLZAR_AI_LAYER.getDataQualityIndex === "function"
      ) {
        return window.GOLZAR_AI_LAYER;
      }

      return null;
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

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("fa-IR");
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


  const QA_QUEUE_STORAGE_KEY = "golzar_quality_local_workflow_20261007";
  const qaState = {
    status: "all",
    piece: "all",
    search: "",
    issue: null,
    page: 1,
    pageSize: 25
  };

  function loadQaQueue() {
    try {
      const raw = localStorage.getItem(QA_QUEUE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.error("[Golzar AI Quality] queue read failed:", error);
      return {};
    }
  }

  function saveQaQueue(store) {
    try {
      localStorage.setItem(QA_QUEUE_STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
      console.error("[Golzar AI Quality] queue save failed:", error);
    }
  }

  function rowValue(row, name) {
    if (!row) return "";
    const aliases = {
      lastname: ["lastname", "family", "last_name"],
      father_name: ["father_name", "fatherName"],
      grave_row: ["grave_row", "graveRow"],
      grave_number: ["grave_number", "graveNumber"],
      stone_type: ["stone_type", "stoneType"],
      piece: ["piece", "grave_piece"],
      stage: ["stage", "operation_stage", "stage_raw"]
    };
    if (Object.prototype.hasOwnProperty.call(row, name)) return row[name];
    for (const alias of aliases[name] || []) {
      if (Object.prototype.hasOwnProperty.call(row, alias)) return row[alias];
    }
    return "";
  }

  function getQaData() {
    const index = getIndex();
    if (!index || typeof index.getLiveRows !== "function") return null;

    const rows = index.getLiveRows().slice().sort(function(a, b) {
      return Number(rowValue(a, "id")) - Number(rowValue(b, "id"));
    });

    const quality = typeof index.getDataQualityIndex === "function"
      ? index.getDataQualityIndex()
      : index.dataQuality;

    const intelligence = typeof index.getDataIntelligenceIndex === "function"
      ? index.getDataIntelligenceIndex()
      : index.dataIntelligence;

    const issueNames = [
      "ردیف مزار خالی",
      "شماره مزار خالی",
      "مرحله خالی",
      "نام/هویت تکراری یا چندرکوردی",
      "قطعه خالی",
      "خارج از محدوده ۸ قطعه آماری",
      "موقعیت مزار تکراری",
      "نوع سنگ خالی",
      "نام خالی"
    ];

    const issuesById = new Map();

    issueNames.forEach(function(issue) {
      const ids = quality && typeof quality.getIssueIds === "function"
        ? quality.getIssueIds(issue)
        : [];

      ids.forEach(function(id) {
        const numericId = Number(id);
        if (!issuesById.has(numericId)) {
          issuesById.set(numericId, []);
        }
        issuesById.get(numericId).push(issue);
      });
    });

    const snapshot = typeof index.getSnapshot === "function"
      ? index.getSnapshot()
      : null;

    return {
      index: index,
      rows: rows,
      quality: quality && typeof quality.getSummary === "function"
        ? quality.getSummary()
        : null,
      intelligence: intelligence && typeof intelligence.getSummary === "function"
        ? intelligence.getSummary()
        : null,
      issuesById: issuesById,
      snapshot: snapshot
    };
  }

  function qaStatusForIssues(issues) {
    if (!issues.length) return "clean";
    if (issues.includes("نام/هویت تکراری یا چندرکوردی")) return "duplicate";
    if (
      issues.includes("موقعیت مزار تکراری") ||
      issues.includes("خارج از محدوده ۸ قطعه آماری")
    ) return "invalid";
    return "problem";
  }

  function qaStatusText(status) {
    return {
      clean: "کامل",
      problem: "ناقص",
      duplicate: "تکراری/چندرکوردی",
      invalid: "متناقض/نامعتبر"
    }[status] || "نیازمند بررسی";
  }

  function qaIssueLabel(issue) {
    return {
      "ردیف مزار خالی": "ردیف مزار خالی",
      "شماره مزار خالی": "شماره مزار خالی",
      "مرحله خالی": "مرحله خالی",
      "نام/هویت تکراری یا چندرکوردی": "نام/هویت تکراری",
      "قطعه خالی": "قطعه خالی",
      "خارج از محدوده ۸ قطعه آماری": "خارج از محدوده ۸ قطعه آماری",
      "موقعیت مزار تکراری": "موقعیت مزار تکراری",
      "نوع سنگ خالی": "نوع سنگ خالی",
      "نام خالی": "نام خالی"
    }[issue] || issue;
  }

  function qaFiltered(data) {
    const normalizedSearch = String(qaState.search || "")
      .trim()
      .toLocaleLowerCase("fa-IR");

    const rows = data.rows.filter(function(row) {
      const id = Number(rowValue(row, "id"));
      const issues = data.issuesById.get(id) || [];
      const status = qaStatusForIssues(issues);
      const piece = String(rowValue(row, "piece") || "").trim();

      const searchable = [
        rowValue(row, "id"),
        rowValue(row, "name"),
        rowValue(row, "lastname"),
        rowValue(row, "father_name"),
        rowValue(row, "piece"),
        rowValue(row, "grave_row"),
        rowValue(row, "grave_number")
      ]
        .filter(function(value) {
          return value !== null && value !== undefined && value !== "";
        })
        .join(" ")
        .toLocaleLowerCase("fa-IR");

      if (normalizedSearch && !searchable.includes(normalizedSearch)) {
        return false;
      }

      if (qaState.status === "clean" && status !== "clean") return false;
      if (qaState.status === "problem" && status !== "problem") return false;
      if (qaState.status === "duplicate" && status !== "duplicate") return false;
      if (qaState.status === "invalid" && status !== "invalid") return false;

      if (qaState.status === "incomplete") {
        const incompleteIssues = [
          "مرحله خالی",
          "ردیف مزار خالی",
          "شماره مزار خالی",
          "نوع سنگ خالی",
          "قطعه خالی",
          "نام خالی"
        ];
        if (!issues.some(function(issue) {
          return incompleteIssues.includes(issue);
        })) return false;
      }

      if (qaState.status === "needs-review" && !issues.length) {
        return false;
      }

      if (qaState.piece === "outside") {
        const official = new Set(["17", "21", "24", "26", "27", "28", "29", "40", "53"]);
        if (!piece || official.has(piece)) return false;
      } else if (qaState.piece !== "all" && piece !== qaState.piece) {
        return false;
      }

      if (
        qaState.issue &&
        !issues.includes(qaState.issue)
      ) {
        return false;
      }

      return true;
    });

    const pages = Math.max(
      1,
      Math.ceil(rows.length / qaState.pageSize)
    );

    if (qaState.page > pages) {
      qaState.page = pages;
    }

    return {
      rows: rows,
      pages: pages
    };
  }

  function renderQaRecords(data) {
    const filtered = qaFiltered(data);
    const tbody = document.getElementById("golzar-ai-quality-records-body");
    const countEl = document.getElementById("golzar-ai-quality-records-count");
    const pageInfo = document.getElementById("golzar-ai-quality-page-info");
    const prev = document.getElementById("golzar-ai-quality-page-prev");
    const next = document.getElementById("golzar-ai-quality-page-next");

    if (!tbody) return;

    const startIndex = (qaState.page - 1) * qaState.pageSize;
    const pageRows = filtered.rows.slice(startIndex, startIndex + qaState.pageSize);

    if (countEl) countEl.textContent = formatNumber(filtered.rows.length) + " رکورد";
    if (pageInfo) {
      pageInfo.textContent =
        "صفحه " + formatNumber(qaState.page) +
        " از " + formatNumber(filtered.pages);
    }
    if (prev) prev.disabled = qaState.page <= 1;
    if (next) next.disabled = qaState.page >= filtered.pages;

    if (!pageRows.length) {
      tbody.innerHTML =
        '<tr><td colspan="11"><div class="golzar-ai-quality-empty">رکوردی با فیلتر انتخاب‌شده یافت نشد.</div></td></tr>';
      return;
    }

    tbody.innerHTML = pageRows.map(function(row) {
      const id = Number(rowValue(row, "id"));
      const issues = data.issuesById.get(id) || [];
      const status = qaStatusForIssues(issues);
      const issueHtml = issues.length
        ? issues.map(qaIssueLabel)
            .map(escapeHtml)
            .map(function(item) { return "• " + item; })
            .join("<br>")
        : "بدون مشکل";

      const stage =
        rowValue(row, "stage") ||
        rowValue(row, "operation_stage") ||
        "—";

      return (
        '<tr>' +
          '<td class="golzar-ai-quality-detail-sticky">' +
            '<button type="button" class="golzar-ai-quality-detail" data-quality-detail="' +
              escapeHtml(id) + '">جزئیات</button>' +
          '</td>' +
          '<td class="golzar-ai-quality-id">' + formatNumber(id) + '</td>' +
          '<td>' + escapeHtml(rowValue(row, "name") || "—") + '</td>' +
          '<td>' + escapeHtml(rowValue(row, "lastname") || "—") + '</td>' +
          '<td>' + escapeHtml(rowValue(row, "piece") || "—") + '</td>' +
          '<td>' + escapeHtml(rowValue(row, "grave_row") || "—") + '</td>' +
          '<td>' + escapeHtml(rowValue(row, "grave_number") || "—") + '</td>' +
          '<td>' + escapeHtml(rowValue(row, "stone_type") || "—") + '</td>' +
          '<td>' + escapeHtml(stage) + '</td>' +
          '<td><span class="golzar-ai-quality-status-badge ' + status + '">' +
            qaStatusText(status) + '</span></td>' +
          '<td class="golzar-ai-quality-issues-cell">' + issueHtml + '</td>' +
        '</tr>'
      );
    }).join("");

    tbody.querySelectorAll("[data-quality-detail]").forEach(function(button) {
      button.onclick = function() {
        const id = Number(button.getAttribute("data-quality-detail"));
        const row = data.rows.find(function(item) {
          return Number(rowValue(item, "id")) === id;
        });
        if (row) qaShowDetail(row, data.issuesById.get(id) || [], data);
      };
    });
  }

  function relatedIdentityRecords(data, row) {
    const index = data.index;
    if (
      index &&
      index.matching &&
      typeof index.matching.findByIdentity === "function"
    ) {
      return index.matching.findByIdentity(row)
        .filter(function(item) {
          return Number(rowValue(item, "id")) !== Number(rowValue(row, "id"));
        })
        .sort(function(a, b) {
          return Number(rowValue(a, "id")) - Number(rowValue(b, "id"));
        });
    }
    return [];
  }

  function qaShowDetail(row, issues, data) {
    const id = Number(rowValue(row, "id"));
    const related = relatedIdentityRecords(data, row);
    const status = qaStatusForIssues(issues);

    const issueHtml = issues.length
      ? issues.map(qaIssueLabel)
          .map(escapeHtml)
          .map(function(item) {
            return '<div class="golzar-ai-quality-guide-row"><b>مشکل</b><span>' + item + '</span></div>';
          })
          .join("")
      : '<div class="golzar-ai-quality-guide-row"><b>وضعیت</b><span>این رکورد در شاخص فعلی بدون مشکل شناسایی شده است.</span></div>';

    const relatedHtml = related.length
      ? related.map(function(item) {
          const relatedId = Number(rowValue(item, "id"));
          return (
            '<div class="golzar-ai-quality-related-item">' +
              '<div><strong>شناسه ' + formatNumber(relatedId) + '</strong> — ' +
                escapeHtml(rowValue(item, "name") || "—") + ' ' +
                escapeHtml(rowValue(item, "lastname") || "") +
              '</div>' +
              '<div class="golzar-ai-quality-related-meta">' +
                'قطعه ' + escapeHtml(rowValue(item, "piece") || "—") +
                ' · ردیف ' + escapeHtml(rowValue(item, "grave_row") || "—") +
                ' · شماره ' + escapeHtml(rowValue(item, "grave_number") || "—") +
              '</div>' +
              '<button type="button" class="golzar-ai-quality-detail" data-related-detail="' +
                escapeHtml(relatedId) + '">مشاهده رکورد</button>' +
            '</div>'
          );
        }).join("")
      : '<div class="golzar-ai-quality-empty">رکورد مرتبطی با همین هویت در شاخص فعلی یافت نشد.</div>';

    const official = new Set(["17","21","24","26","27","28","29","40","53"]);
    const piece = String(rowValue(row, "piece") || "").trim();

    const modal = document.createElement("div");
    modal.className = "golzar-ai-quality-modal";
    modal.style.zIndex = "2147483600";

    modal.innerHTML =
      '<div class="golzar-ai-quality-dialog">' +
        '<div class="golzar-ai-quality-head">' +
          '<div class="golzar-ai-quality-head-icon" aria-hidden="true">🔎</div>' +
          '<div><h2>جزئیات رکورد ' + formatNumber(id) + '</h2>' +
            '<p>مشاهده اطلاعات و نتیجه کنترل کیفیت</p></div>' +
          '<button class="golzar-ai-quality-close" type="button">×</button>' +
        '</div>' +
        '<div class="golzar-ai-quality-body">' +

          '<section class="golzar-ai-quality-section"><h3>اطلاعات هویتی</h3>' +
            '<div class="golzar-ai-quality-two-col">' +
              '<div class="golzar-ai-quality-guide-row"><b>شناسه</b><span>' + formatNumber(id) + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>نام</b><span>' + escapeHtml(rowValue(row, "name") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>نام خانوادگی</b><span>' + escapeHtml(rowValue(row, "lastname") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>نام پدر</b><span>' + escapeHtml(rowValue(row, "father_name") || "—") + '</span></div>' +
            '</div>' +
          '</section>' +

          '<section class="golzar-ai-quality-section"><h3>موقعیت مزار</h3>' +
            '<div class="golzar-ai-quality-two-col">' +
              '<div class="golzar-ai-quality-guide-row"><b>قطعه</b><span>' + escapeHtml(piece || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>ردیف</b><span>' + escapeHtml(rowValue(row, "grave_row") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>شماره مزار</b><span>' + escapeHtml(rowValue(row, "grave_number") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>محدوده آماری</b><span>' +
                (official.has(piece) ? "داخل محدوده" : "خارج از محدوده") +
              '</span></div>' +
            '</div>' +
          '</section>' +

          '<section class="golzar-ai-quality-section"><h3>اطلاعات عملیات</h3>' +
            '<div class="golzar-ai-quality-two-col">' +
              '<div class="golzar-ai-quality-guide-row"><b>نوع سنگ</b><span>' + escapeHtml(rowValue(row, "stone_type") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>مرحله عملیات</b><span>' + escapeHtml(rowValue(row, "stage") || rowValue(row, "operation_stage") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>وضعیت ثبت</b><span>' + escapeHtml(rowValue(row, "status") || "—") + '</span></div>' +
            '</div>' +
          '</section>' +

          '<section class="golzar-ai-quality-section"><h3>نتیجه کنترل کیفیت</h3>' +
            '<div class="golzar-ai-quality-status"><span class="golzar-ai-quality-status-badge ' + status + '">' +
              qaStatusText(status) + '</span></div>' +
            '<div class="golzar-ai-quality-guide">' + issueHtml + '</div>' +
          '</section>' +

          '<section class="golzar-ai-quality-section"><h3>رکوردهای مرتبط از نظر هویت</h3>' +
            '<div class="golzar-ai-quality-related-list">' + relatedHtml + '</div>' +
          '</section>' +

          '<section class="golzar-ai-quality-section golzar-ai-quality-return-box">' +
            '<h3>ارجاع برای اصلاح</h3>' +
            '<p>این ارجاع فقط در صف کاری همین مرورگر ثبت می‌شود و هیچ تغییری در اطلاعات اصلی ایجاد نمی‌کند.</p>' +
            '<div class="golzar-ai-quality-actions">' +
              '<button type="button" class="golzar-ai-quality-action correction" id="golzar-ai-quality-send-correction">ارسال به رکوردهای برگشتی برای اصلاح</button>' +
            '</div>' +
          '</section>' +

          '<div class="golzar-ai-quality-footer">' +
            '<span class="golzar-ai-quality-source">منبع: اطلاعات زنده سامانه · بدون تغییر در اطلاعات اصلی</span>' +
            '<div class="golzar-ai-quality-actions"><button class="golzar-ai-quality-action primary" type="button">بستن</button></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    function close() { modal.remove(); }

    modal.addEventListener("click", function(event) {
      if (event.target === modal) close();
    });
    modal.querySelector(".golzar-ai-quality-close").onclick = close;
    modal.querySelector(".golzar-ai-quality-action.primary").onclick = close;

    modal.querySelectorAll("[data-related-detail]").forEach(function(button) {
      button.onclick = function() {
        const relatedId = Number(button.getAttribute("data-related-detail"));
        const relatedRow = data.rows.find(function(item) {
          return Number(rowValue(item, "id")) === relatedId;
        });
        if (relatedRow) {
          close();
          qaShowDetail(relatedRow, data.issuesById.get(relatedId) || [], data);
        }
      };
    });

    const sendButton = modal.querySelector("#golzar-ai-quality-send-correction");
    if (sendButton) {
      sendButton.onclick = function() {
        const store = loadQaQueue();
        const key = String(id);
        const existing = store[key];

        if (
          existing &&
          (
            existing.status === "برگشت برای اصلاح" ||
            existing.status === "در انتظار تأیید نهایی"
          )
        ) {
          alert("این رکورد قبلاً در گردش اصلاح اطلاعات قرار گرفته است.");
          return;
        }

        store[key] = {
          recordId: id,
          status: "برگشت برای اصلاح",
          originalRecord: row,
          proposedRecord: row,
          returnReview: {
            reasons: ["نیازمند بررسی"],
            note: "ارجاع برای اصلاح از بخش کنترل کیفیت داده",
            priority: "عادی",
            submittedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          correctionHistory: []
        };

        saveQaQueue(store);
        renderWorkflowSections();
        alert("رکورد به صف برگشتی برای اصلاح اضافه شد.");
        close();
      };
    }

    document.body.appendChild(modal);
  }

  function openCorrectionForm(recordId) {
    const store = loadQaQueue();
    const item = store[String(recordId)];

    if (!item || item.status !== "برگشت برای اصلاح") {
      alert("رکورد برگشتی برای اصلاح پیدا نشد.");
      return;
    }

    const record = item.proposedRecord || item.originalRecord || {};
    const modal = document.createElement("div");
    modal.className = "golzar-ai-quality-modal";
    modal.style.zIndex = "2147483700";

    modal.innerHTML =
      '<div class="golzar-ai-quality-dialog" style="max-width:920px">' +
        '<div class="golzar-ai-quality-head">' +
          '<div class="golzar-ai-quality-head-icon" aria-hidden="true">✏️</div>' +
          '<div><h2>اصلاح اطلاعات رکورد ' + formatNumber(Number(recordId)) + '</h2>' +
            '<p>اطلاعات اصلاح‌شده پس از ارسال برای تأیید نهایی ناظر قرار می‌گیرد.</p></div>' +
          '<button class="golzar-ai-quality-close" type="button">×</button>' +
        '</div>' +
        '<div class="golzar-ai-quality-body">' +
          '<section class="golzar-ai-quality-section"><h3>نظر ناظر</h3>' +
            '<div class="golzar-ai-quality-guide-row"><b>علت</b><span>' +
              escapeHtml((item.returnReview?.reasons || []).join("، ") || "—") +
            '</span></div>' +
            '<div class="golzar-ai-quality-guide-row"><b>توضیح</b><span>' +
              escapeHtml(item.returnReview?.note || "—") +
            '</span></div>' +
          '</section>' +
          '<section class="golzar-ai-quality-section"><h3>اطلاعات قابل اصلاح</h3>' +
            '<div class="golzar-ai-quality-correction-grid">' +
              '<label>نام<input id="qaEditName" value="' + escapeHtml(rowValue(record,"name")) + '"></label>' +
              '<label>نام خانوادگی<input id="qaEditLastname" value="' + escapeHtml(rowValue(record,"lastname")) + '"></label>' +
              '<label>نام پدر<input id="qaEditFather" value="' + escapeHtml(rowValue(record,"father_name")) + '"></label>' +
              '<label>قطعه<input id="qaEditPiece" value="' + escapeHtml(rowValue(record,"piece")) + '"></label>' +
              '<label>ردیف<input id="qaEditRow" value="' + escapeHtml(rowValue(record,"grave_row")) + '"></label>' +
              '<label>شماره مزار<input id="qaEditNumber" value="' + escapeHtml(rowValue(record,"grave_number")) + '"></label>' +
              '<label>نوع سنگ<input id="qaEditStone" value="' + escapeHtml(rowValue(record,"stone_type")) + '"></label>' +
              '<label>مرحله عملیات<input id="qaEditStage" value="' + escapeHtml(rowValue(record,"stage") || rowValue(record,"operation_stage")) + '"></label>' +
              '<label class="full">توضیحات<textarea id="qaEditNotes">' + escapeHtml(rowValue(record,"notes")) + '</textarea></label>' +
            '</div>' +
          '</section>' +
          '<div class="golzar-ai-quality-footer"><div class="golzar-ai-quality-actions">' +
            '<button type="button" class="golzar-ai-quality-action" id="qaCancelCorrection">انصراف</button>' +
            '<button type="button" class="golzar-ai-quality-action correction" id="qaSubmitCorrection">ثبت اصلاح و ارسال برای تأیید ناظر</button>' +
          '</div></div>' +
        '</div>' +
      '</div>';

    function close() { modal.remove(); }

    modal.addEventListener("click", function(event) {
      if (event.target === modal) close();
    });
    modal.querySelector(".golzar-ai-quality-close").onclick = close;
    modal.querySelector("#qaCancelCorrection").onclick = close;

    modal.querySelector("#qaSubmitCorrection").onclick = function() {
      const updatedRecord = {
        ...record,
        name: modal.querySelector("#qaEditName").value.trim(),
        lastname: modal.querySelector("#qaEditLastname").value.trim(),
        father_name: modal.querySelector("#qaEditFather").value.trim(),
        piece: modal.querySelector("#qaEditPiece").value.trim(),
        grave_row: modal.querySelector("#qaEditRow").value.trim(),
        grave_number: modal.querySelector("#qaEditNumber").value.trim(),
        stone_type: modal.querySelector("#qaEditStone").value.trim(),
        stage: modal.querySelector("#qaEditStage").value.trim(),
        notes: modal.querySelector("#qaEditNotes").value.trim()
      };

      item.proposedRecord = updatedRecord;
      item.status = "در انتظار تأیید نهایی";
      item.resubmittedAt = new Date().toISOString();
      item.correctionHistory = item.correctionHistory || [];
      item.correctionHistory.push({
        submittedAt: item.resubmittedAt,
        previousStatus: "برگشت برای اصلاح",
        record: updatedRecord
      });

      saveQaQueue(store);
      close();
      renderWorkflowSections();
      alert("اصلاحات ثبت شد و رکورد برای تأیید نهایی ناظر ارسال شد.");
    };

    document.body.appendChild(modal);
  }

  function openApprovalReview(recordId) {
    const store = loadQaQueue();
    const item = store[String(recordId)];

    if (!item || item.status !== "در انتظار تأیید نهایی") {
      alert("رکوردی برای تأیید نهایی پیدا نشد.");
      return;
    }

    const original = item.originalRecord || {};
    const proposed = item.proposedRecord || {};

    const fields = [
      ["نام", "name"],
      ["نام خانوادگی", "lastname"],
      ["نام پدر", "father_name"],
      ["قطعه", "piece"],
      ["ردیف", "grave_row"],
      ["شماره مزار", "grave_number"],
      ["نوع سنگ", "stone_type"],
      ["مرحله عملیات", "stage"]
    ];

    const compareHtml = fields.map(function(entry) {
      const label = entry[0];
      const key = entry[1];
      return (
        '<div class="golzar-ai-quality-compare-row">' +
          '<b>' + label + '</b>' +
          '<span>' + escapeHtml(rowValue(original, key) || "—") + '</span>' +
          '<span>' + escapeHtml(rowValue(proposed, key) || "—") + '</span>' +
        '</div>'
      );
    }).join("");

    const modal = document.createElement("div");
    modal.className = "golzar-ai-quality-modal";
    modal.style.zIndex = "2147483800";

    modal.innerHTML =
      '<div class="golzar-ai-quality-dialog" style="max-width:980px">' +
        '<div class="golzar-ai-quality-head">' +
          '<div class="golzar-ai-quality-head-icon" aria-hidden="true">✅</div>' +
          '<div><h2>تأیید اطلاعات رکورد ' + formatNumber(Number(recordId)) + '</h2>' +
            '<p>مقایسه اطلاعات قبلی و اطلاعات اصلاح‌شده</p></div>' +
          '<button class="golzar-ai-quality-close" type="button">×</button>' +
        '</div>' +
        '<div class="golzar-ai-quality-body">' +
          '<div class="golzar-ai-quality-compare-header"><span>عنوان</span><span>اطلاعات قبلی</span><span>اطلاعات اصلاح‌شده</span></div>' +
          '<div class="golzar-ai-quality-compare-table">' + compareHtml + '</div>' +
          '<div class="golzar-ai-quality-footer"><div class="golzar-ai-quality-actions">' +
            '<button type="button" class="golzar-ai-quality-action correction" id="qaReturnAgain">برگشت برای اصلاح</button>' +
            '<button type="button" class="golzar-ai-quality-action primary" id="qaApproveFinal">تأیید نهایی</button>' +
          '</div></div>' +
        '</div>' +
      '</div>';

    function close() { modal.remove(); }

    modal.addEventListener("click", function(event) {
      if (event.target === modal) close();
    });
    modal.querySelector(".golzar-ai-quality-close").onclick = close;

    modal.querySelector("#qaApproveFinal").onclick = function() {
      item.status = "تأیید نهایی شد";
      item.reviewedAt = new Date().toISOString();
      item.reviewerNote = "تأیید نهایی توسط ناظر";
      saveQaQueue(store);
      close();
      renderWorkflowSections();
      alert("تأیید نهایی انجام شد. اطلاعات اصلی سامانه در این نسخه تغییر نکرد.");
    };

    modal.querySelector("#qaReturnAgain").onclick = function() {
      item.status = "برگشت برای اصلاح";
      item.reviewedAt = new Date().toISOString();
      item.returnReview = {
        reasons: ["نیازمند اصلاح مجدد"],
        note: "بازگشت مجدد توسط ناظر برای اصلاح بیشتر",
        priority: "مهم",
        submittedAt: new Date().toISOString()
      };
      saveQaQueue(store);
      close();
      renderWorkflowSections();
      alert("رکورد برای اصلاح مجدد برگشت داده شد.");
    };

    document.body.appendChild(modal);
  }

  function renderApprovalQueue(data) {
    const store = loadQaQueue();
    const items = Object.values(store).filter(function(item) {
      return item.status === "در انتظار تأیید نهایی";
    });

    const count = document.getElementById("golzar-ai-quality-approval-count");
    const list = document.getElementById("golzar-ai-quality-approval-list");

    if (count) {
      count.textContent = formatNumber(items.length) + " مورد در انتظار تأیید";
    }
    if (!list) return;

    if (!items.length) {
      list.innerHTML =
        '<div class="golzar-ai-quality-empty">در حال حاضر اطلاعاتی برای تأیید نهایی وجود ندارد.</div>';
      return;
    }

    list.innerHTML = items.map(function(item) {
      const record = item.proposedRecord || item.originalRecord || {};
      return (
        '<div class="golzar-ai-quality-work-item">' +
          '<div><strong>شناسه ' + formatNumber(Number(item.recordId)) + '</strong> — ' +
            escapeHtml(rowValue(record, "name") || "—") + ' ' +
            escapeHtml(rowValue(record, "lastname") || "") +
          '</div>' +
          '<span class="golzar-ai-quality-status-badge problem">در انتظار تأیید نهایی</span>' +
          '<button type="button" class="golzar-ai-quality-detail" data-approval-review="' +
            escapeHtml(item.recordId) + '">بررسی</button>' +
        '</div>'
      );
    }).join("");

    list.querySelectorAll("[data-approval-review]").forEach(function(button) {
      button.onclick = function() {
        openApprovalReview(button.getAttribute("data-approval-review"));
      };
    });
  }

  function renderCorrectionQueue(data) {
    const store = loadQaQueue();
    const items = Object.values(store).filter(function(item) {
      return item.status === "برگشت برای اصلاح";
    });

    const count = document.getElementById("golzar-ai-quality-correction-count");
    const list = document.getElementById("golzar-ai-quality-correction-list");

    if (count) {
      count.textContent = formatNumber(items.length) + " مورد برگشتی";
    }
    if (!list) return;

    if (!items.length) {
      list.innerHTML =
        '<div class="golzar-ai-quality-empty">در حال حاضر رکوردی برای اصلاح وجود ندارد.</div>';
      return;
    }

    list.innerHTML = items.map(function(item) {
      const record = item.proposedRecord || item.originalRecord || {};
      const review = item.returnReview || {};
      return (
        '<div class="golzar-ai-quality-work-item">' +
          '<div><strong>شناسه ' + formatNumber(Number(item.recordId)) + '</strong> — ' +
            escapeHtml(rowValue(record, "name") || "—") + ' ' +
            escapeHtml(rowValue(record, "lastname") || "") +
          '</div>' +
          '<div class="golzar-ai-quality-related-meta">علت: ' +
            escapeHtml((review.reasons || []).join("، ") || "—") +
            ' · اولویت: ' + escapeHtml(review.priority || "عادی") +
          '</div>' +
          '<button type="button" class="golzar-ai-quality-detail" data-correction-edit="' +
            escapeHtml(item.recordId) + '">اصلاح اطلاعات</button>' +
        '</div>'
      );
    }).join("");

    list.querySelectorAll("[data-correction-edit]").forEach(function(button) {
      button.onclick = function() {
        openCorrectionForm(button.getAttribute("data-correction-edit"));
      };
    });
  }

  function renderWorkflowSections() {
    const data = getQaData();
    if (!data) return;
    renderApprovalQueue(data);
    renderCorrectionQueue(data);
  }

  function renderModalContent() {
    const body = document.querySelector("#golzar-ai-quality-body");
    if (!body) return;

    const data = getQaData();

    if (!data || !data.quality) {
      body.innerHTML =
        '<div class="golzar-ai-quality-loading">اطلاعات کنترل کیفیت هنوز آماده نشده است.<br>در حال انتظار برای شاخص زنده هوش مصنوعی…</div>' +
        '<div class="golzar-ai-quality-footer"><span class="golzar-ai-quality-source">منبع: اطلاعات زنده سامانه · فقط مشاهده</span>' +
        '<div class="golzar-ai-quality-actions"><button class="golzar-ai-quality-action primary" type="button" id="golzar-ai-quality-refresh">تلاش مجدد</button>' +
        '<button class="golzar-ai-quality-action" type="button" id="golzar-ai-quality-close-2">بستن</button></div></div>';
      bindModalButtons();
      return;
    }

    const quality = data.quality;
    const intelligence = data.intelligence || {};
    const total = Number(quality.totalRecords || data.rows.length || 0);
    const clean = Number(quality.clean || 0);
    const problem = Number(quality.problem || 0);
    const issueCounts = quality.issueCounts || {};
    const updatedAt = data.snapshot?.updatedAt
      ? new Date(data.snapshot.updatedAt).toLocaleString("fa-IR")
      : "نامشخص";

    const issueOrder = [
      "ردیف مزار خالی",
      "شماره مزار خالی",
      "مرحله خالی",
      "نام/هویت تکراری یا چندرکوردی",
      "قطعه خالی",
      "خارج از محدوده ۸ قطعه آماری",
      "موقعیت مزار تکراری",
      "نوع سنگ خالی",
      "نام خالی"
    ];

    const issueCards = issueOrder.map(function(issue) {
      return (
        '<button type="button" class="golzar-ai-quality-issue" data-issue-filter="' +
          escapeHtml(issue) + '">' +
          '<span>' + escapeHtml(qaIssueLabel(issue)) + '</span>' +
          '<strong>' + formatNumber(Number(issueCounts[issue] || 0)) + '</strong>' +
        '</button>'
      );
    }).join("");

    const queue = loadQaQueue();
    const approvalCount = Object.values(queue).filter(function(item) {
      return item.status === "در انتظار تأیید نهایی";
    }).length;
    const correctionCount = Object.values(queue).filter(function(item) {
      return item.status === "برگشت برای اصلاح";
    }).length;

    body.innerHTML =
      '<div class="golzar-ai-quality-meta">' +
        '<span class="golzar-ai-quality-engine">لایه هوش مصنوعی: تحلیل و پایش کیفیت اطلاعات</span>' +
        '<span class="golzar-ai-quality-engine">تعداد رکورد: <strong>' + formatNumber(total) + '</strong></span>' +
        '<span class="golzar-ai-quality-engine">نسخه موتور: <strong>0.3.0</strong></span>' +
        '<span class="golzar-ai-quality-engine">حالت: <strong>فقط خواندنی</strong></span>' +
      '</div>' +

      '<div class="golzar-ai-quality-status">' +
        '<span class="golzar-ai-quality-pill ' +
          ((data.snapshot && data.snapshot.status === "ready") ? "golzar-ai-quality-pills-ok" : "golzar-ai-quality-pills-warn") +
        '">● وضعیت شاخص: ' +
          ((data.snapshot && data.snapshot.status === "ready") ? "آماده" : escapeHtml((data.snapshot && data.snapshot.status) || "نامشخص")) +
        '</span>' +
        '<span class="golzar-ai-quality-pill">منبع: اطلاعات زنده سامانه</span>' +
        '<span class="golzar-ai-quality-pill">آخرین به‌روزرسانی: ' + escapeHtml(updatedAt) + '</span>' +
      '</div>' +

      '<section class="golzar-ai-quality-section"><h3>خلاصه وضعیت</h3>' +
        '<div class="golzar-ai-quality-kpis">' +
          '<div class="golzar-ai-quality-kpi"><span>کل رکوردها</span><strong>' + formatNumber(total) + '</strong></div>' +
          '<div class="golzar-ai-quality-kpi"><span>بدون مشکل</span><strong>' + formatNumber(clean) + '</strong></div>' +
          '<div class="golzar-ai-quality-kpi"><span>دارای مشکل</span><strong>' + formatNumber(problem) + '</strong></div>' +
        '</div>' +
      '</section>' +

      '<section class="golzar-ai-quality-section"><h3>نوع مشکلات</h3>' +
        '<div class="golzar-ai-quality-issues">' + issueCards + '</div>' +
      '</section>' +

      '<section class="golzar-ai-quality-section">' +
        '<div class="golzar-ai-quality-records-head">' +
          '<div><h3 style="margin-bottom:4px">رکوردها</h3><div id="golzar-ai-quality-records-count" class="golzar-ai-quality-records-count"></div></div>' +
          '<div class="golzar-ai-quality-actions"><button class="golzar-ai-quality-action primary" type="button" id="golzar-ai-quality-refresh">به‌روزرسانی</button></div>' +
        '</div>' +

        '<div class="golzar-ai-quality-filters">' +
          '<div class="golzar-ai-quality-filter golzar-ai-quality-filter-search">' +
            '<label for="golzar-ai-quality-filter-search">جستجو</label>' +
            '<input id="golzar-ai-quality-filter-search" type="search" placeholder="شناسه، نام، نام خانوادگی، قطعه، ردیف یا شماره مزار را جستجو کنید">' +
          '</div>' +
          '<div class="golzar-ai-quality-filter"><label for="golzar-ai-quality-filter-status">وضعیت</label>' +
            '<select id="golzar-ai-quality-filter-status">' +
              '<option value="all">همه وضعیت‌ها</option><option value="clean">کامل</option><option value="incomplete">ناقص</option><option value="duplicate">تکراری/چندرکوردی</option><option value="invalid">متناقض/نامعتبر</option><option value="needs-review">نیازمند بررسی</option>' +
            '</select>' +
          '</div>' +
          '<div class="golzar-ai-quality-filter"><label for="golzar-ai-quality-filter-piece">قطعه</label>' +
            '<select id="golzar-ai-quality-filter-piece">' +
              '<option value="all">همه قطعات</option><option value="17">قطعه 17</option><option value="21">قطعه 21</option><option value="24">قطعه 24</option><option value="26">قطعه 26</option><option value="27">قطعه 27</option><option value="28">قطعه 28</option><option value="29">قطعه 29</option><option value="40">قطعه 40</option><option value="53">قطعه 53</option><option value="outside">قطعات عمومی بهشت زهرا</option>' +
            '</select>' +
          '</div>' +
          '<div class="golzar-ai-quality-filter golzar-ai-quality-filter-action"><button type="button" class="golzar-ai-quality-action" id="golzar-ai-quality-clear-filters">پاک کردن فیلترها</button></div>' +
        '</div>' +

        '<div class="golzar-ai-quality-active-filter" id="golzar-ai-quality-active-filter" hidden></div>' +

        '<div class="golzar-ai-quality-table-wrap">' +
          '<table class="golzar-ai-quality-table"><thead><tr>' +
            '<th>جزئیات</th><th>شناسه</th><th>نام</th><th>نام خانوادگی</th><th>قطعه</th><th>ردیف</th><th>شماره مزار</th><th>نوع سنگ</th><th>مرحله</th><th>وضعیت کنترل کیفیت</th><th>مشکلات</th>' +
          '</tr></thead><tbody id="golzar-ai-quality-records-body"></tbody></table>' +
        '</div>' +

        '<div class="golzar-ai-quality-pagination">' +
          '<button class="golzar-ai-quality-page-btn" type="button" id="golzar-ai-quality-page-prev">قبلی</button>' +
          '<span class="golzar-ai-quality-page-info" id="golzar-ai-quality-page-info"></span>' +
          '<button class="golzar-ai-quality-page-btn" type="button" id="golzar-ai-quality-page-next">بعدی</button>' +
        '</div>' +
      '</section>' +

      '<section class="golzar-ai-quality-section"><h3>خلاصه هوشمندی داده</h3>' +
        '<p class="golzar-ai-quality-work-description">این بخش، روابط و تعارض‌های بین رکوردها را از روی اطلاعات زنده سامانه بررسی می‌کند؛ آمار آن مستقل از تعداد درخواست‌های بهسازی است. این شاخص‌ها زنده‌اند: با اصلاح واقعی رکورد در منبع اصلی و سپس به‌روزرسانی شاخص، اعداد ممکن است کم یا زیاد شوند. ثبت اصلاح در صف محلی این صفحه، به‌تنهایی عددها را تغییر نمی‌دهد.</p>' +
        '<div class="golzar-ai-quality-issues">' +
          '<div class="golzar-ai-quality-issue static"><span>گروه‌های تکراری کامل</span><strong>' + formatNumber(intelligence.duplicateGroups || 0) + '</strong></div>' +
          '<div class="golzar-ai-quality-issue static"><span>تعارض هویتی</span><strong>' + formatNumber(intelligence.identityConflicts || 0) + '</strong></div>' +
          '<div class="golzar-ai-quality-issue static"><span>تعارض محل</span><strong>' + formatNumber(intelligence.locationConflicts || 0) + '</strong></div>' +
          '<div class="golzar-ai-quality-issue static"><span>رکورد ناقص</span><strong>' + formatNumber(intelligence.incompleteRecords || 0) + '</strong></div>' +
          '<div class="golzar-ai-quality-issue static"><span>موارد نیازمند یکسان‌سازی مرحله</span><strong>' + formatNumber(intelligence.stageNormalizations || 0) + '</strong></div>' +
          '<div class="golzar-ai-quality-issue static"><span>مراحل ناشناخته</span><strong>' + formatNumber(intelligence.stageAnomalies || 0) + '</strong></div>' +
        '</div>' +
      '</section>' +

      '<div class="golzar-ai-quality-two-col">' +
        '<section class="golzar-ai-quality-section"><h3>تأیید اطلاعات وارد شده</h3>' +
          '<p class="golzar-ai-quality-work-description">اطلاعات اصلاح‌شده پس از ارسال تا زمان بررسی ناظر در این بخش قرار می‌گیرد.</p>' +
          '<div class="golzar-ai-quality-kpis"><div class="golzar-ai-quality-kpi"><span>در انتظار تأیید</span><strong id="golzar-ai-quality-approval-count">' + formatNumber(approvalCount) + '</strong></div></div>' +
          '<div id="golzar-ai-quality-approval-list" class="golzar-ai-quality-work-list"></div>' +
        '</section>' +
        '<section class="golzar-ai-quality-section"><h3>رکوردهای برگشتی برای اصلاح</h3>' +
          '<p class="golzar-ai-quality-work-description">رکوردهای ارجاع‌شده برای اصلاح و ارسال دوباره در این بخش قرار می‌گیرند.</p>' +
          '<div class="golzar-ai-quality-kpis"><div class="golzar-ai-quality-kpi"><span>مورد برگشتی</span><strong id="golzar-ai-quality-correction-count">' + formatNumber(correctionCount) + '</strong></div></div>' +
          '<div id="golzar-ai-quality-correction-list" class="golzar-ai-quality-work-list"></div>' +
        '</section>' +
      '</div>' +

      '<section class="golzar-ai-quality-section"><h3>راهنمای مراحل</h3>' +
        '<div class="golzar-ai-quality-guide">' +
          '<div class="golzar-ai-quality-guide-row"><b>مرحله ثبت‌شده</b><span>مقدار ثبت‌شده در رکورد اصلی و ثبت‌های قدیمی، بدون تغییر.</span></div>' +
          '<div class="golzar-ai-quality-guide-row"><b>مرحله استاندارد</b><span>عنوان استانداردشده برای یکسان‌سازی تحلیل و گزارش‌گیری؛ مقدار ثبت‌شده اصلی تغییر نمی‌کند.</span></div>' +
        '</div>' +
      '</section>' +

      '<div class="golzar-ai-quality-footer">' +
        '<span class="golzar-ai-quality-source">این بخش داده اصلی را تغییر نمی‌دهد؛ صف اصلاح و تأیید فقط در مرورگر نگهداری می‌شود.</span>' +
        '<div class="golzar-ai-quality-actions"><button class="golzar-ai-quality-action" type="button" id="golzar-ai-quality-close-2">بستن</button></div>' +
      '</div>';

    renderQaRecords(data);
    renderWorkflowSections();
    bindQaControls(data);
    bindModalButtons();
  }

  function bindQaControls(data) {
    const search = document.getElementById("golzar-ai-quality-filter-search");
    const status = document.getElementById("golzar-ai-quality-filter-status");
    const piece = document.getElementById("golzar-ai-quality-filter-piece");
    const clear = document.getElementById("golzar-ai-quality-clear-filters");
    const prev = document.getElementById("golzar-ai-quality-page-prev");
    const next = document.getElementById("golzar-ai-quality-page-next");
    const active = document.getElementById("golzar-ai-quality-active-filter");

    if (search) {
      search.value = qaState.search;
      search.oninput = function() {
        qaState.search = search.value;
        qaState.page = 1;
        renderQaRecords(data);
        updateActiveQaFilter();
      };
    }

    if (status) {
      status.value = qaState.status;
      status.onchange = function() {
        qaState.status = status.value;
        qaState.issue = null;
        qaState.page = 1;
        renderQaRecords(data);
        updateActiveQaFilter();
      };
    }

    if (piece) {
      piece.value = qaState.piece;
      piece.onchange = function() {
        qaState.piece = piece.value;
        qaState.issue = null;
        qaState.page = 1;
        renderQaRecords(data);
        updateActiveQaFilter();
      };
    }

    if (clear) {
      clear.onclick = function() {
        qaState.status = "all";
        qaState.piece = "all";
        qaState.search = "";
        qaState.issue = null;
        qaState.page = 1;
        renderQaRecords(data);
        bindQaControls(data);
        updateActiveQaFilter();
      };
    }

    if (prev) {
      prev.onclick = function() {
        if (qaState.page > 1) {
          qaState.page -= 1;
          renderQaRecords(data);
          updateActiveQaFilter();
        }
      };
    }

    if (next) {
      next.onclick = function() {
        const filtered = qaFiltered(data);
        if (qaState.page < filtered.pages) {
          qaState.page += 1;
          renderQaRecords(data);
          updateActiveQaFilter();
        }
      };
    }

    document.querySelectorAll("[data-issue-filter]").forEach(function(button) {
      button.onclick = function() {
        qaState.search = "";
        qaState.status = "all";
        qaState.piece = "all";
        qaState.issue = button.getAttribute("data-issue-filter");
        qaState.page = 1;
        renderQaRecords(data);
        updateActiveQaFilter();
      };
    });

    function updateActiveQaFilter() {
      if (!active) return;
      const parts = [];
      if (qaState.search) parts.push("جستجو: " + qaState.search);
      if (qaState.status !== "all") parts.push("وضعیت: " + ({
        clean: "کامل",
        problem: "ناقص",
        duplicate: "تکراری/چندرکوردی",
        invalid: "متناقض/نامعتبر",
        incomplete: "ناقص",
        "needs-review": "نیازمند بررسی"
      }[qaState.status] || qaState.status));
      if (qaState.piece !== "all") {
        parts.push("قطعه: " + (qaState.piece === "outside" ? "قطعات عمومی بهشت زهرا" : qaState.piece));
      }
      if (qaState.issue) parts.push("مشکل: " + qaIssueLabel(qaState.issue));

      active.hidden = !parts.length;
      active.textContent = parts.join("  |  ");
    }

    updateActiveQaFilter();
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
          <small>بررسی مستقل رکوردهای سالم، مسئله‌دار و تعارض‌های اطلاعاتی</small>
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
    version: "0.3.0-full-qa-local-workflow",
    open: openModal,
    close: closeModal,
    refresh: function () {
      renderModalContent();
    }
  };
})();
