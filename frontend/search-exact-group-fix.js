"use strict";

// ============================================================
// Shohada-app / GolzarStone
// search-exact-group-fix.js
//
// مستقل از app.js:
// - تطبیق دقیق فیلد نام و نام خانوادگی
// - جدا کردن نتیجه دقیق از نتایج مشابه
// - نمایش نتیجه‌های دقیق در ابتدای فهرست
// - حفظ جستجوی جزئی برای پیدا کردن نتایج مشابه
// - هماهنگی با Search -> Detail -> Back
//
// هیچ تغییر در Supabase schema یا داده ایجاد نمی‌کند.
// ============================================================

(function installExactSearchGroupFix() {
  const PAGE_SIZE = 1000;
  const MAX_PAGES = 100;

  function clean(value) {
    if (typeof normalizeSearchText === "function") {
      return normalizeSearchText(value || "");
    }
    return String(value ?? "")
      .trim()
      .replace(/\u200c/g, " ")
      .replace(/\s+/g, " ")
      .replace(/ي/g, "ی")
      .replace(/ى/g, "ی")
      .replace(/ك/g, "ک")
      .toLowerCase();
  }

  function field(record, key) {
    return clean(record?.[key]);
  }

  function exactFilterMatch(record, filters) {
    if (filters.name && field(record, "name") !== filters.name) return false;
    if (filters.lastname && field(record, "lastname") !== filters.lastname) return false;
    if (filters.piece && field(record, "piece") !== clean(filters.piece)) return false;
    if (filters.row && field(record, "grave_row") !== filters.row) return false;
    if (filters.number && field(record, "grave_number") !== filters.number) return false;
    if (filters.status && field(record, "stone_type") !== clean(filters.status)) return false;
    return true;
  }

  function injectStyles() {
    if (document.getElementById("golzar-exact-search-group-styles")) return;

    const style = document.createElement("style");
    style.id = "golzar-exact-search-group-styles";
    style.textContent = `
      .golzar-search-result-group {
        margin-top: 14px;
      }
      .golzar-search-result-group-title {
        margin: 0 0 10px;
        padding: 10px 13px;
        border-radius: 13px;
        font-weight: 800;
        font-size: 15px;
      }
      .golzar-search-exact-group .golzar-search-result-group-title {
        background: #e8f5ed;
        color: #17633d;
        border-right: 4px solid #238b57;
      }
      .golzar-search-similar-group .golzar-search-result-group-title {
        background: #f4f7f5;
        color: #5f6d66;
        border-right: 4px solid #b7c3bd;
      }
      .golzar-search-result-separator {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 18px 0 6px;
        color: #708078;
        font-size: 13px;
        font-weight: 700;
      }
      .golzar-search-result-separator::before,
      .golzar-search-result-separator::after {
        content: "";
        height: 1px;
        background: #dce6df;
        flex: 1;
      }
    `;
    document.head.appendChild(style);
  }

  async function fetchAll(filters) {
    const all = [];

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabaseClient
        .from(TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filters.name) query = query.ilike("name", `%${filters.name}%`);
      if (filters.lastname) query = query.ilike("lastname", `%${filters.lastname}%`);
      if (filters.piece) query = query.eq("piece", filters.piece);
      if (filters.row) query = query.ilike("grave_row", `%${filters.row}%`);
      if (filters.number) query = query.ilike("grave_number", `%${filters.number}%`);
      if (filters.status) query = query.eq("stone_type", filters.status);

      const { data, error } = await query;
      if (error) throw error;

      const rows = data || [];
      all.push(...rows);
      if (rows.length < PAGE_SIZE) break;
    }

    const seen = new Set();
    return all.filter((record) => {
      const id = String(record?.id ?? "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  function renderGroupedResults(results, filters) {
    const container = document.getElementById("search-results");
    if (!container) return;

    const exact = results.filter((record) => exactFilterMatch(record, filters));
    const exactIds = new Set(exact.map((record) => String(record.id)));
    const similar = results.filter((record) => !exactIds.has(String(record.id)));

    container.innerHTML = `
      <div class="search-count">
        ${toPersianDigits(results.length)} رکورد پیدا شد.
      </div>

      ${results.length > 0 ? `
        <button type="button" class="export-button" id="export-search-results">
          📊 خروجی اکسل
        </button>
      ` : ""}

      ${exact.length ? `
        <section class="golzar-search-result-group golzar-search-exact-group">
          <div class="golzar-search-result-group-title">
            نتایج دقیق جستجو — ${toPersianDigits(exact.length)} مورد
          </div>
          <div class="records-container">
            ${exact.map(recordSummaryCard).join("")}
          </div>
        </section>
      ` : ""}

      ${similar.length ? `
        ${exact.length ? `
          <div class="golzar-search-result-separator"><span>نتایج مشابه</span></div>
        ` : ""}
        <section class="golzar-search-result-group golzar-search-similar-group">
          <div class="golzar-search-result-group-title">
            نتایج مشابه — ${toPersianDigits(similar.length)} مورد
          </div>
          <div class="records-container">
            ${similar.map(recordSummaryCard).join("")}
          </div>
        </section>
      ` : ""}

      ${!results.length ? `
        <div class="empty-message">رکوردی با این مشخصات پیدا نشد.</div>
      ` : ""}
    `;

    const exportButton = document.getElementById("export-search-results");
    if (exportButton) exportButton.addEventListener("click", exportSearchResultsToExcel);

    results.forEach((record) => {
      const card = document.getElementById(`record-summary-${record.id}`);
      if (card) {
        card.addEventListener("click", () => showRecordDetail(record.id, "search"));
      }
    });
  }

  function readCurrentFilters() {
    const value = (id) => clean(document.getElementById(id)?.value || "");
    return {
      name: value("search-name"),
      lastname: value("search-lastname"),
      piece: clean(document.getElementById("search-piece")?.value || ""),
      row: value("search-row"),
      number: value("search-number"),
      status: clean(document.getElementById("search-status")?.value || ""),
    };
  }

  window.performSearch = async function performSearchWithExactGrouping() {
    const filters = readCurrentFilters();
    const container = document.getElementById("search-results");
    if (!container) return;

    lastSearchFilters = filters;
    window.__GOLZAR_SEARCH_FILTERS__ = { ...filters };
    window.__GOLZAR_SEARCH_RESULTS_HTML__ = null;
    window.__GOLZAR_SEARCH_RESULTS_DATA__ = null;

    container.innerHTML = '<div class="loading-message">در حال جستجو و تفکیک نتایج...</div>';

    try {
      const results = await fetchAll(filters);
      lastSearchResults = results;
      window.__GOLZAR_SEARCH_RESULTS__ = results;
      window.__GOLZAR_SEARCH_RESULTS_DATA__ = results.slice();
      renderGroupedResults(results, filters);
      window.__GOLZAR_SEARCH_RESULTS_HTML__ = container.innerHTML;
      window.__GOLZAR_SEARCH_RESULT_COUNT__ = results.length;
    } catch (error) {
      console.error("Exact search grouping error:", error);
      container.innerHTML = `
        <div class="error-message">
          جستجو انجام نشد.<br><br>
          ${escapeHtml(error?.message || String(error))}
        </div>
      `;
    }
  };

  // ----------------------------------------------------------
  // Integration with Search -> Detail -> Back
  // ----------------------------------------------------------
  // search-back-restore-fix.js is intentionally loaded before this
  // module. Therefore this module takes ownership of restoreSearchPage
  // and restores the grouped exact/similar view from the same data cache.
  const previousRestoreSearchPage = window.restoreSearchPage;
  window.restoreSearchPage = function restoreExactGroupedSearchPage() {
    const filters = window.__GOLZAR_SEARCH_FILTERS__ || lastSearchFilters || readCurrentFilters();
    const cachedResults = window.__GOLZAR_SEARCH_RESULTS_DATA__;

    if (typeof window.showSearch !== "function") {
      console.error("Exact search grouping: showSearch not found.");
      return;
    }

    window.showSearch(true);

    const fields = {
      "search-name": filters.name || "",
      "search-lastname": filters.lastname || "",
      "search-piece": filters.piece || "",
      "search-row": filters.row || "",
      "search-number": filters.number || "",
      "search-status": filters.status || "",
    };

    Object.entries(fields).forEach(([id, value]) => {
      const fieldElement = document.getElementById(id);
      if (fieldElement) fieldElement.value = value;
    });

    if (Array.isArray(cachedResults)) {
      renderGroupedResults(cachedResults.slice(), filters);
      window.__GOLZAR_SEARCH_RESULTS_HTML__ = document.getElementById("search-results")?.innerHTML || null;
      window.__GOLZAR_SEARCH_RESULT_COUNT__ = cachedResults.length;
      return;
    }

    // Compatibility fallback for older cached state.
    if (typeof previousRestoreSearchPage === "function") {
      previousRestoreSearchPage();
    }
  };

  injectStyles();
  window.__GOLZAR_EXACT_SEARCH_GROUP_FIX_READY__ = true;
})();
