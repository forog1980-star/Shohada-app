"use strict";

// ============================================================
// GolzarStone — Search Ranking / Valid Grave Location Guard
// ============================================================

(function installSearchRankingFix() {
  if (window.__GOLZAR_SEARCH_RANKING_FIX_INSTALLED__) return;
  if (!window.AllMartyrsSearch || typeof window.AllMartyrsSearch.search !== "function") return;

  const api = window.AllMartyrsSearch;
  const originalSearch = api.search;

  const clean = (value) => AllMartyrsNormalizer.clean(value);
  const isZero = (value) => clean(value) === "0";

  function fieldScore(record, field, query) {
    const q = clean(query);
    if (!q) return 0;
    const value = clean(api.fieldValue(record, field));
    if (!value) return 0;
    if (value === q) return 100;
    if (value.startsWith(q)) return 40;
    return value.includes(q) ? 10 : 0;
  }

  function resultScore(record, options = {}) {
    const query = options.query || "";
    const field = options.field || "all";
    const filters = options.filters || {};
    let score = 0;

    if (query) {
      if (field !== "all") {
        score += fieldScore(record, field, query);
      } else {
        const q = clean(query);
        const searchable = clean(AllMartyrsNormalizer.searchableText(record));
        if (searchable === q) score += 120;
        else if (searchable.startsWith(q)) score += 50;
        else if (searchable.includes(q)) score += 15;
      }
    }

    const piece = clean(record.grave_piece);
    const row = clean(record.grave_row);
    const number = clean(record.grave_number);
    const fp = clean(filters.grave_piece);
    const fr = clean(filters.grave_row);
    const fn = clean(filters.grave_number);

    if (fp && fp !== "outside" && piece === fp) score += 200;
    if (fr && row === fr) score += 200;
    if (fn && number === fn) score += 200;

    // Full exact grave location gets the highest possible priority.
    if (fp && fp !== "outside" && fr && fn && piece === fp && row === fr && number === fn) {
      score += 1000;
    }

    return score;
  }

  api.search = function searchWithRanking(records, options = {}) {
    const filters = options.filters || {};

    // 0 is not a valid operational grave row/number.
    if (isZero(filters.grave_row) || isZero(filters.grave_number)) {
      return [];
    }

    const result = originalSearch(records, options);

    return result
      .filter((record) => !isZero(record.grave_row) && !isZero(record.grave_number))
      .map((record, index) => ({ record, score: resultScore(record, options), index }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((item) => item.record);
  };

  window.__GOLZAR_SEARCH_RANKING_FIX_INSTALLED__ = true;
})();
