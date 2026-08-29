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
  const originalPerformSearch = window.performSearch;

  if (typeof originalPerformSearch !== "function") {
    console.error("Search back restore fix: performSearch not found.");
    return;
  }

  if (window.__GOLZAR_SEARCH_BACK_RESTORE_INSTALLED__) return;
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
    const result = await originalPerformSearch.apply(this, args);
    return result;
  };

  window.restoreSearchPage = function restoreSearchPageWithResults() {
    const cachedResults = Array.isArray(window.__GOLZAR_SEARCH_RESULTS__)
      ? [...window.__GOLZAR_SEARCH_RESULTS__]
      : [];
    const cachedFilters = window.__GOLZAR_SEARCH_FILTERS__ || {};

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

    if (typeof window.renderSearchResults === "function") {
      window.renderSearchResults(cachedResults);
    }
  };

  window.__GOLZAR_SEARCH_BACK_RESTORE_READY__ = true;
})();
