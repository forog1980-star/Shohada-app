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
      .golzar-ai-quality-detail{border:1px solid #d8ceb1;border-radius:9px;padding:6px 9px;background:#fff;color:#544c37;font:inherit;font-size:10px;cursor:pointer;white-space:nowrap}
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


  const qaState = {
    status: "needs-review",
    piece: "all",
    page: 1,
    pageSize: 25
  };

  function rowValue(row, name) {
    if (!row) return "";
    const aliases = {
      lastname: ["lastname", "family", "last_name"],
      grave_row: ["grave_row", "graveRow"],
      grave_number: ["grave_number", "graveNumber"],
      stone_type: ["stone_type", "stoneType"],
      piece: ["piece", "grave_piece"]
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

    const rows = index.getLiveRows().slice().sort(function(a,b){
      return Number(rowValue(a,"id")) - Number(rowValue(b,"id"));
    });
    const quality = typeof index.getDataQualityIndex === "function"
      ? index.getDataQualityIndex()
      : index.dataQuality;
    const intelligence = typeof index.getDataIntelligenceIndex === "function"
      ? index.getDataIntelligenceIndex()
      : index.dataIntelligence;

    const issueNames = [
      "مرحله خالی",
      "نام/هویت تکراری یا چندرکوردی",
      "ردیف مزار خالی",
      "شماره مزار خالی",
      "موقعیت مزار تکراری",
      "نوع سنگ خالی",
      "قطعه خالی",
      "نام خالی",
      "خارج از محدوده ۸ قطعه آماری"
    ];
    const issuesById = new Map();

    issueNames.forEach(function(issue){
      const ids = quality && typeof quality.getIssueIds === "function"
        ? quality.getIssueIds(issue)
        : [];
      ids.forEach(function(id){
        const numericId = Number(id);
        if (!issuesById.has(numericId)) issuesById.set(numericId, []);
        issuesById.get(numericId).push(issue);
      });
    });

    const snapshot = typeof index.getSnapshot === "function" ? index.getSnapshot() : null;
    return {
      index:index,
      rows:rows,
      quality:quality && typeof quality.getSummary === "function" ? quality.getSummary() : null,
      intelligence:intelligence && typeof intelligence.getSummary === "function" ? intelligence.getSummary() : null,
      issuesById:issuesById,
      snapshot:snapshot
    };
  }

  function qaStatusForIssues(issues) {
    if (!issues.length) return "clean";
    if (issues.includes("نام/هویت تکراری یا چندرکوردی")) return "duplicate";
    if (issues.includes("موقعیت مزار تکراری") || issues.includes("خارج از محدوده ۸ قطعه آماری")) return "invalid";
    return "problem";
  }

  function qaStatusText(status) {
    return {
      clean:"کامل",
      problem:"ناقص",
      duplicate:"تکراری/چندرکوردی",
      invalid:"متناقض/نامعتبر"
    }[status] || "نیازمند بررسی";
  }

  function qaIssueText(issue) {
    return issue === "نام/هویت تکراری یا چندرکوردی" ? "نام/هویت تکراری" : issue;
  }

  function qaFiltered(data) {
    const rows = data.rows.filter(function(row){
      const id = Number(rowValue(row,"id"));
      const issues = data.issuesById.get(id) || [];
      const status = qaStatusForIssues(issues);
      const piece = String(rowValue(row,"piece") || "").trim();

      let statusOk = true;
      if (qaState.status === "clean") statusOk = status === "clean";
      else if (qaState.status === "problem") statusOk = status === "problem";
      else if (qaState.status === "duplicate") statusOk = status === "duplicate";
      else if (qaState.status === "invalid") statusOk = status === "invalid";
      else if (qaState.status === "incomplete") {
        statusOk = issues.some(function(issue){
          return [
            "مرحله خالی",
            "ردیف مزار خالی",
            "شماره مزار خالی",
            "نوع سنگ خالی",
            "قطعه خالی",
            "نام خالی"
          ].includes(issue);
        });
      } else if (qaState.status === "needs-review") statusOk = issues.length > 0;

      const pieceOk = qaState.piece === "all" || piece === qaState.piece;
      return statusOk && pieceOk;
    });

    const pages = Math.max(1, Math.ceil(rows.length / qaState.pageSize));
    if (qaState.page > pages) qaState.page = pages;
    return {rows:rows,pages:pages};
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
    if (countEl) countEl.textContent = filtered.rows.length.toLocaleString("fa-IR") + " رکورد";
    if (pageInfo) pageInfo.textContent = "صفحه " + qaState.page.toLocaleString("fa-IR") + " از " + filtered.pages.toLocaleString("fa-IR");
    if (prev) prev.disabled = qaState.page <= 1;
    if (next) next.disabled = qaState.page >= filtered.pages;

    if (!pageRows.length) {
      tbody.innerHTML = '<tr><td colspan="11"><div class="golzar-ai-quality-empty">رکوردی با فیلتر انتخاب‌شده یافت نشد.</div></td></tr>';
      return;
    }

    tbody.innerHTML = pageRows.map(function(row){
      const id = Number(rowValue(row,"id"));
      const issues = data.issuesById.get(id) || [];
      const status = qaStatusForIssues(issues);
      const issueHtml = issues.length
        ? issues.map(qaIssueText).map(escapeHtml).map(function(item){ return "• " + item; }).join("<br>")
        : "بدون مشکل";

      return '<tr>' +
        '<td class="golzar-ai-quality-id">' + id.toLocaleString("fa-IR") + '</td>' +
        '<td>' + escapeHtml(rowValue(row,"name") || "—") + '</td>' +
        '<td>' + escapeHtml(rowValue(row,"lastname") || "—") + '</td>' +
        '<td>' + escapeHtml(rowValue(row,"piece") || "—") + '</td>' +
        '<td>' + escapeHtml(rowValue(row,"grave_row") || "—") + '</td>' +
        '<td>' + escapeHtml(rowValue(row,"grave_number") || "—") + '</td>' +
        '<td>' + escapeHtml(rowValue(row,"stone_type") || "—") + '</td>' +
        '<td>' + escapeHtml(rowValue(row,"stage") || "—") + '</td>' +
        '<td><span class="golzar-ai-quality-status-badge ' + status + '">' + qaStatusText(status) + '</span></td>' +
        '<td class="golzar-ai-quality-issues-cell">' + issueHtml + '</td>' +
        '<td><button type="button" class="golzar-ai-quality-detail" data-quality-detail="' + id + '">جزئیات</button></td>' +
      '</tr>';
    }).join("");

    tbody.querySelectorAll("[data-quality-detail]").forEach(function(button){
      button.onclick = function(){
        const id = Number(button.getAttribute("data-quality-detail"));
        const row = data.rows.find(function(item){ return Number(rowValue(item,"id")) === id; });
        if (row) qaShowDetail(row, data.issuesById.get(id) || []);
      };
    });
  }

  function qaShowDetail(row, issues) {
    const id = Number(rowValue(row,"id"));
    const modal = document.createElement("div");
    modal.className = "golzar-ai-quality-modal";
    modal.style.zIndex = "2147483600";
    const issueHtml = issues.length
      ? issues.map(qaIssueText).map(escapeHtml).map(function(item){
          return '<div class="golzar-ai-quality-guide-row"><b>بررسی</b><span>' + item + '</span></div>';
        }).join("")
      : '<div class="golzar-ai-quality-guide-row"><b>وضعیت</b><span>این رکورد در شاخص فعلی بدون مشکل شناسایی شده است.</span></div>';

    modal.innerHTML =
      '<div class="golzar-ai-quality-dialog" style="max-width:760px">' +
        '<div class="golzar-ai-quality-head">' +
          '<div class="golzar-ai-quality-head-icon" aria-hidden="true">🔎</div>' +
          '<div><h2>جزئیات رکورد ' + id.toLocaleString("fa-IR") + '</h2><p>فقط خواندنی؛ این پنجره هیچ تغییری در داده ایجاد نمی‌کند.</p></div>' +
          '<button class="golzar-ai-quality-close" type="button">×</button>' +
        '</div>' +
        '<div class="golzar-ai-quality-body">' +
          '<div class="golzar-ai-quality-two-col">' +
            '<section class="golzar-ai-quality-section"><h3>اطلاعات رکورد</h3><div class="golzar-ai-quality-guide">' +
              '<div class="golzar-ai-quality-guide-row"><b>نام</b><span>' + escapeHtml(rowValue(row,"name") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>نام خانوادگی</b><span>' + escapeHtml(rowValue(row,"lastname") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>قطعه</b><span>' + escapeHtml(rowValue(row,"piece") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>ردیف</b><span>' + escapeHtml(rowValue(row,"grave_row") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>شماره</b><span>' + escapeHtml(rowValue(row,"grave_number") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>نوع سنگ</b><span>' + escapeHtml(rowValue(row,"stone_type") || "—") + '</span></div>' +
              '<div class="golzar-ai-quality-guide-row"><b>مرحله</b><span>' + escapeHtml(rowValue(row,"stage") || "—") + '</span></div>' +
            '</div></section>' +
            '<section class="golzar-ai-quality-section"><h3>مشکلات شناسایی‌شده</h3><div class="golzar-ai-quality-guide">' + issueHtml + '</div></section>' +
          '</div>' +
          '<div class="golzar-ai-quality-footer"><span class="golzar-ai-quality-source">فقط خواندنی · بدون Write به Supabase</span><div class="golzar-ai-quality-actions"><button class="golzar-ai-quality-action primary" type="button">بستن</button></div></div>' +
        '</div>' +
      '</div>';

    modal.addEventListener("click",function(event){
      if (event.target === modal) modal.remove();
    });
    modal.querySelector(".golzar-ai-quality-close").onclick = function(){ modal.remove(); };
    modal.querySelector(".golzar-ai-quality-action.primary").onclick = function(){ modal.remove(); };
    document.body.appendChild(modal);
  }

  function bindQaControls(data) {
    const status = document.getElementById("golzar-ai-quality-filter-status");
    const piece = document.getElementById("golzar-ai-quality-filter-piece");
    const clear = document.getElementById("golzar-ai-quality-clear-filters");
    const prev = document.getElementById("golzar-ai-quality-page-prev");
    const next = document.getElementById("golzar-ai-quality-page-next");

    if (status) {
      status.value = qaState.status;
      status.onchange = function(){
        qaState.status = status.value;
        qaState.page = 1;
        renderQaRecords(data);
        bindQaControls(data);
      };
    }

    if (piece) {
      piece.value = qaState.piece;
      piece.onchange = function(){
        qaState.piece = piece.value;
        qaState.page = 1;
        renderQaRecords(data);
        bindQaControls(data);
      };
    }

    if (clear) {
      clear.onclick = function(){
        qaState.status = "all";
        qaState.piece = "all";
        qaState.page = 1;
        renderQaRecords(data);
        bindQaControls(data);
      };
    }

    if (prev) {
      prev.onclick = function(){
        if (qaState.page > 1) {
          qaState.page -= 1;
          renderQaRecords(data);
          bindQaControls(data);
        }
      };
    }

    if (next) {
      next.onclick = function(){
        const filtered = qaFiltered(data);
        if (qaState.page < filtered.pages) {
          qaState.page += 1;
          renderQaRecords(data);
          bindQaControls(data);
        }
      };
    }
  }

  function renderModalContent() {
    const body = document.querySelector("#golzar-ai-quality-body");
    if (!body) return;

    const data = getQaData();
    if (!data || !data.quality) {
      body.innerHTML =
        '<div class="golzar-ai-quality-loading">اطلاعات کنترل کیفیت هنوز آماده نشده است.<br>در حال انتظار برای شاخص زنده هوش مصنوعی…</div>' +
        '<div class="golzar-ai-quality-footer"><span class="golzar-ai-quality-source">منبع: Supabase public.martyrs · فقط خواندنی</span><div class="golzar-ai-quality-actions">' +
        '<button class="golzar-ai-quality-action primary" type="button" id="golzar-ai-quality-refresh">تلاش مجدد</button>' +
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
    const updatedAt = data.snapshot && data.snapshot.updatedAt
      ? new Date(data.snapshot.updatedAt).toLocaleString("fa-IR")
      : "نامشخص";
    const approvalCount = data.rows.filter(function(row){
      return String(rowValue(row,"status") || "").trim() === "در انتظار تأیید";
    }).length;

    body.innerHTML =
      '<div class="golzar-ai-quality-meta">' +
        '<span class="golzar-ai-quality-engine">لایه هوش مصنوعی: تحلیل و پایش کیفیت اطلاعات</span>' +
        '<span class="golzar-ai-quality-engine">فقط خواندنی</span>' +
        '<span class="golzar-ai-quality-engine">تعداد رکورد: <strong>' + total.toLocaleString("fa-IR") + '</strong></span>' +
        '<span class="golzar-ai-quality-engine">نسخه موتور: <strong>0.2.0</strong></span>' +
        '<span class="golzar-ai-quality-engine">حالت: <strong>فقط خواندنی</strong></span>' +
      '</div>' +
      '<div class="golzar-ai-quality-status">' +
        '<span class="golzar-ai-quality-pill ' + ((data.snapshot && data.snapshot.status === "ready") ? "golzar-ai-quality-pills-ok" : "golzar-ai-quality-pills-warn") + '">● وضعیت شاخص: ' +
          ((data.snapshot && data.snapshot.status === "ready") ? "آماده" : escapeHtml((data.snapshot && data.snapshot.status) || "نامشخص")) + '</span>' +
        '<span class="golzar-ai-quality-pill">منبع: Supabase public.martyrs</span>' +
        '<span class="golzar-ai-quality-pill">آخرین به‌روزرسانی: ' + escapeHtml(updatedAt) + '</span>' +
      '</div>' +

      '<section class="golzar-ai-quality-section"><h3>کل رکوردها</h3><div class="golzar-ai-quality-kpis">' +
        '<div class="golzar-ai-quality-kpi"><span>کل رکوردها</span><strong>' + total.toLocaleString("fa-IR") + '</strong></div>' +
        '<div class="golzar-ai-quality-kpi"><span>بدون مشکل</span><strong>' + clean.toLocaleString("fa-IR") + '</strong></div>' +
        '<div class="golzar-ai-quality-kpi"><span>دارای مشکل</span><strong>' + problem.toLocaleString("fa-IR") + '</strong></div>' +
        '<div class="golzar-ai-quality-kpi"><span>درصد رکورد سالم</span><strong>' + formatPercent(clean,total) + '</strong></div>' +
      '</div></section>' +

      '<section class="golzar-ai-quality-section"><h3>نوع مشکلات</h3><div class="golzar-ai-quality-issues">' +
        Object.entries({
          "ردیف مزار خالی": issueCounts["ردیف مزار خالی"] || 0,
          "شماره مزار خالی": issueCounts["شماره مزار خالی"] || 0,
          "مرحله خالی": issueCounts["مرحله خالی"] || 0,
          "نام/هویت تکراری": issueCounts["نام/هویت تکراری یا چندرکوردی"] || 0,
          "قطعه خالی": issueCounts["قطعه خالی"] || 0,
          "خارج از محدوده ۸ قطعه آماری": issueCounts["خارج از محدوده ۸ قطعه آماری"] || 0,
          "موقعیت مزار تکراری": issueCounts["موقعیت مزار تکراری"] || 0,
          "نوع سنگ خالی": issueCounts["نوع سنگ خالی"] || 0,
          "نام خالی": issueCounts["نام خالی"] || 0
        }).map(function(item){
          return '<div class="golzar-ai-quality-issue"><span>' + escapeHtml(item[0]) + '</span><strong>' + Number(item[1]).toLocaleString("fa-IR") + '</strong></div>';
        }).join("") +
      '</div></section>' +

      '<section class="golzar-ai-quality-section"><h3>خلاصه Data Intelligence</h3><div class="golzar-ai-quality-issues">' +
        '<div class="golzar-ai-quality-issue"><span>گروه‌های تکراری کامل</span><strong>' + Number(intelligence.duplicateGroups || 0).toLocaleString("fa-IR") + '</strong></div>' +
        '<div class="golzar-ai-quality-issue"><span>تعارض هویتی</span><strong>' + Number(intelligence.identityConflicts || 0).toLocaleString("fa-IR") + '</strong></div>' +
        '<div class="golzar-ai-quality-issue"><span>تعارض محل</span><strong>' + Number(intelligence.locationConflicts || 0).toLocaleString("fa-IR") + '</strong></div>' +
        '<div class="golzar-ai-quality-issue"><span>رکورد ناقص</span><strong>' + Number(intelligence.incompleteRecords || 0).toLocaleString("fa-IR") + '</strong></div>' +
        '<div class="golzar-ai-quality-issue"><span>موارد نیازمند نرمال‌سازی مرحله</span><strong>' + Number(intelligence.stageNormalizations || 0).toLocaleString("fa-IR") + '</strong></div>' +
        '<div class="golzar-ai-quality-issue"><span>مراحل ناشناخته</span><strong>' + Number(intelligence.stageAnomalies || 0).toLocaleString("fa-IR") + '</strong></div>' +
      '</div></section>' +

      '<section class="golzar-ai-quality-section">' +
        '<div class="golzar-ai-quality-records-head"><div><h3 style="margin-bottom:4px">رکوردها</h3><div id="golzar-ai-quality-records-count" class="golzar-ai-quality-records-count"></div></div>' +
        '<div class="golzar-ai-quality-actions"><button class="golzar-ai-quality-action primary" type="button" id="golzar-ai-quality-refresh">به‌روزرسانی</button></div></div>' +
        '<div class="golzar-ai-quality-filters">' +
          '<div class="golzar-ai-quality-filter"><label for="golzar-ai-quality-filter-status">وضعیت</label><select id="golzar-ai-quality-filter-status">' +
            '<option value="all">همه وضعیت‌ها</option><option value="clean">کامل</option><option value="incomplete">ناقص</option><option value="duplicate">تکراری/چندرکوردی</option><option value="invalid">متناقض/نامعتبر</option><option value="needs-review">نیازمند بررسی</option>' +
          '</select></div>' +
          '<div class="golzar-ai-quality-filter"><label for="golzar-ai-quality-filter-piece">قطعه</label><select id="golzar-ai-quality-filter-piece">' +
            '<option value="all">همه قطعات</option><option value="17">قطعه 17</option><option value="24">قطعه 24</option><option value="26">قطعه 26</option><option value="27">قطعه 27</option><option value="28">قطعه 28</option><option value="29">قطعه 29</option><option value="40">قطعه 40</option><option value="53">قطعه 53</option>' +
          '</select></div>' +
          '<div class="golzar-ai-quality-filter" style="justify-content:center"><button type="button" class="golzar-ai-quality-action" id="golzar-ai-quality-clear-filters">پاک کردن فیلترها</button></div>' +
        '</div>' +
        '<div class="golzar-ai-quality-table-wrap" style="margin-top:11px"><table class="golzar-ai-quality-table"><thead><tr>' +
          '<th>ID</th><th>نام</th><th>نام خانوادگی</th><th>قطعه</th><th>ردیف</th><th>شماره</th><th>نوع سنگ</th><th>مرحله</th><th>وضعیت کنترل کیفیت</th><th>مشکلات</th><th>جزئیات</th>' +
        '</tr></thead><tbody id="golzar-ai-quality-records-body"></tbody></table></div>' +
        '<div class="golzar-ai-quality-pagination"><button class="golzar-ai-quality-page-btn" type="button" id="golzar-ai-quality-page-prev">قبلی</button><span class="golzar-ai-quality-page-info" id="golzar-ai-quality-page-info"></span><button class="golzar-ai-quality-page-btn" type="button" id="golzar-ai-quality-page-next">بعدی</button></div>' +
      '</section>' +

      '<div class="golzar-ai-quality-two-col">' +
        '<section class="golzar-ai-quality-section"><h3>تأیید اطلاعات وارد شده</h3><p style="margin:0 0 10px;color:#746d59;font-size:11px;line-height:1.8">اطلاعات ثبت یا اصلاح‌شده پس از ارسال، تا زمان بررسی ناظر در این بخش باقی می‌ماند.</p>' +
          '<div class="golzar-ai-quality-kpis"><div class="golzar-ai-quality-kpi"><span>در انتظار تأیید</span><strong>' + approvalCount.toLocaleString("fa-IR") + '</strong></div></div>' +
          '<div class="golzar-ai-quality-empty" style="margin-top:10px">' + (approvalCount ? "رکوردهای در انتظار تأیید در داده زنده شناسایی شدند؛ عملیات تأیید در این پنجره انجام نمی‌شود." : "در حال حاضر اطلاعاتی برای تأیید نهایی وجود ندارد.") + '</div>' +
        '</section>' +
        '<section class="golzar-ai-quality-section"><h3>رکوردهای برگشتی برای اصلاح</h3><p style="margin:0 0 10px;color:#746d59;font-size:11px;line-height:1.8">رکوردهایی که توسط ناظر برای اصلاح برگشت داده شده‌اند در این بخش نمایش داده می‌شوند.</p>' +
          '<div class="golzar-ai-quality-kpis"><div class="golzar-ai-quality-kpi"><span>مورد برگشتی</span><strong>۰</strong></div></div>' +
          '<div class="golzar-ai-quality-empty" style="margin-top:10px">وضعیت «برگشتی برای اصلاح» در قرارداد فعلی AI Live Index به‌صورت مستقل عرضه نشده است.</div>' +
        '</section>' +
      '</div>' +

      '<section class="golzar-ai-quality-section"><h3>راهنمای مراحل عملیات</h3><div class="golzar-ai-quality-two-col">' +
        '<div class="golzar-ai-quality-guide"><div class="golzar-ai-quality-guide-row"><b>ترمیمی</b><span>ارسال طرح سنگ به واحد مرمت → سنگ مرمتی آماده نصب است → سنگ مرمت شده نصب شد</span></div></div>' +
        '<div class="golzar-ai-quality-guide"><div class="golzar-ai-quality-guide-row"><b>تعویضی</b><span>ارسال طرح سنگ به واحد تعویض → سنگ تعویضی آماده نصب است → سنگ تعویضی نصب شد</span></div></div>' +
      '</div><div class="golzar-ai-quality-guide" style="margin-top:8px">' +
        '<div class="golzar-ai-quality-guide-row"><b>مرحله ثبت‌شده</b><span>مقدار ثبت‌شده در رکورد اصلی و ثبت‌های قدیمی، بدون تغییر.</span></div>' +
        '<div class="golzar-ai-quality-guide-row"><b>مرحله استاندارد</b><span>نام استانداردشده برای یکسان‌سازی تحلیل و گزارش‌گیری؛ ممکن است چند عنوان قدیمی یا متفاوت به یک عنوان استاندارد تبدیل شوند.</span></div>' +
      '</div></section>' +

      '<div class="golzar-ai-quality-footer"><span class="golzar-ai-quality-source">این بخش فقط خواندنی است و هیچ تغییری در داده‌های عملیاتی انجام نمی‌دهد.</span><div class="golzar-ai-quality-actions"><button class="golzar-ai-quality-action" type="button" id="golzar-ai-quality-close-2">بستن</button></div></div>';

    renderQaRecords(data);
    bindQaControls(data);
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
    version: "0.2.0-full-qa",
    open: openModal,
    close: closeModal,
    refresh: function () {
      renderModalContent();
    }
  };
})();
