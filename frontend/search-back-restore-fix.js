"use strict";

// ============================================================
// Shohada-app / GolzarStone
// search-back-restore-fix.js
//
// Final independent fix for:
// Search -> Detail -> Back -> Search results
//
// - Restore results from data, not raw HTML, so click handlers
//   are reinstalled after returning from a detail page.
// - Add delegated card navigation as a defensive fallback so
//   every result card remains clickable even if another renderer
//   replaces the card DOM.
// - No Supabase write is performed here.
// ============================================================

(function installSearchBackRestoreFix() {
  if (window.__GOLZAR_SEARCH_BACK_RESTORE_INSTALLED__) return;

  const originalPerformSearch = window.performSearch;
  const originalRenderSearchResults = window.renderSearchResults;

  if (typeof originalPerformSearch !== "function") {
    console.error("Search back restore fix: performSearch not found.");
    return;
  }

  if (typeof originalRenderSearchResults !== "function") {
    console.error("Search back restore fix: renderSearchResults not found.");
    return;
  }

  window.__GOLZAR_SEARCH_BACK_RESTORE_INSTALLED__ = true;

  const readFilters = () => ({
    name: String(document.getElementById("search-name")?.value || ""),
    lastname: String(document.getElementById("search-lastname")?.value || ""),
    piece: String(document.getElementById("search-piece")?.value || ""),
    row: String(document.getElementById("search-row")?.value || ""),
    number: String(document.getElementById("search-number")?.value || ""),
    status: String(document.getElementById("search-status")?.value || ""),
  });

  window.performSearch = async function performSearchWithRestoreCache(...args) {
    window.__GOLZAR_SEARCH_FILTERS__ = readFilters();
    window.__GOLZAR_SEARCH_RESULTS_HTML__ = null;
    window.__GOLZAR_SEARCH_RESULTS_DATA__ = null;
    return originalPerformSearch.apply(this, args);
  };

  window.renderSearchResults = function renderSearchResultsWithRestoreCache(results, ...args) {
    const safeResults = Array.isArray(results) ? results.slice() : [];
    const result = originalRenderSearchResults.call(this, safeResults, ...args);
    const container = document.getElementById("search-results");

    window.__GOLZAR_SEARCH_RESULTS_DATA__ = safeResults;

    if (container) {
      window.__GOLZAR_SEARCH_RESULTS_HTML__ = container.innerHTML;
      window.__GOLZAR_SEARCH_RESULT_COUNT__ = safeResults.length;
    }

    return result;
  };

  window.restoreSearchPage = function restoreSearchPageWithResults() {
    const cachedFilters = window.__GOLZAR_SEARCH_FILTERS__ || {};
    const cachedResults = window.__GOLZAR_SEARCH_RESULTS_DATA__;
    const cachedHtml = window.__GOLZAR_SEARCH_RESULTS_HTML__;

    if (typeof window.showSearch !== "function") {
      console.error("Search back restore fix: showSearch not found.");
      return;
    }

    window.showSearch(true);

    const fields = {
      "search-name": cachedFilters.name || "",
      "search-lastname": cachedFilters.lastname || "",
      "search-piece": cachedFilters.piece || "",
      "search-row": cachedFilters.row || "",
      "search-number": cachedFilters.number || "",
      "search-status": cachedFilters.status || "",
    };

    Object.entries(fields).forEach(([id, value]) => {
      const field = document.getElementById(id);
      if (field) field.value = value;
    });

    const container = document.getElementById("search-results");

    // مهم: هرگز HTML ذخیره‌شده را به تنهایی برنمی‌گردانیم؛
    // چون event listener های کارت‌ها با innerHTML از بین می‌روند.
    // ابتدا همان داده‌های قبلی را دوباره render می‌کنیم تا همه
    // کارت‌ها دوباره handler مستقل داشته باشند.
    if (container && Array.isArray(cachedResults)) {
      window.renderSearchResults(cachedResults);
      return;
    }

    // فقط برای سازگاری با نسخه‌های قدیمی که داده cache نشده است.
    if (container && cachedHtml !== null && cachedHtml !== undefined) {
      container.innerHTML = cachedHtml;
    }
  };

  // ----------------------------------------------------------
  // Defensive delegated navigation
  // ----------------------------------------------------------
  // حتی اگر یک renderer دیگر کارت‌ها را با innerHTML جایگزین کند،
  // کلیک روی هر کارت نتیجه جستجو باید مستقل از handler داخلی
  // همان کارت به جزئیات همان id برود.
  // ----------------------------------------------------------
  document.addEventListener("click", (event) => {
    if (window.currentAppPage && window.currentAppPage !== "search") return;

    const card = event.target?.closest?.(
      "#search-results .record-card.clickable"
    );

    if (!card) return;

    const prefix = "record-summary-";
    const rawId =
      card.dataset?.recordId ||
      (String(card.id || "").startsWith(prefix)
        ? String(card.id).slice(prefix.length)
        : "");

    if (!rawId || typeof window.showRecordDetail !== "function") return;

    event.preventDefault();
    event.stopImmediatePropagation();

    window.showRecordDetail(rawId, "search");
  }, true);

  window.__GOLZAR_SEARCH_BACK_RESTORE_READY__ = true;
})();