"use strict";

// ============================================================
// Shohada-app / GolzarStone
// search-back-restore-fix.js
//
// Independent fix for:
// Search -> Detail -> Back to search results
//
// No Supabase write is performed here.
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
    return originalPerformSearch.apply(this, args);
  };

  window.renderSearchResults = function renderSearchResultsWithRestoreCache(results, ...args) {
    const result = originalRenderSearchResults.call(this, results, ...args);
    const container = document.getElementById("search-results");

    if (container) {
      window.__GOLZAR_SEARCH_RESULTS_HTML__ = container.innerHTML;
      window.__GOLZAR_SEARCH_RESULT_COUNT__ = Array.isArray(results) ? results.length : 0;
    }

    return result;
  };

  window.restoreSearchPage = function restoreSearchPageWithResults() {
    const cachedFilters = window.__GOLZAR_SEARCH_FILTERS__ || {};
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
    if (container && cachedHtml !== null && cachedHtml !== undefined) {
      container.innerHTML = cachedHtml;
    }
  };

  window.__GOLZAR_SEARCH_BACK_RESTORE_READY__ = true;
})();
