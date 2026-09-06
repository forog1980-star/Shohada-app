"use strict";

// ============================================================
// GolzarStone master loader
// ============================================================
// Excel به صورت خودکار وارد بانک نمی‌شود.
// انتقال داده فقط با ExcelData/import_master_v2.py انجام می‌شود.
// ============================================================

function loadApp() {
  const script = document.createElement("script");
  script.src = "app.js?v=20260906-final-01";

  script.onload = () => loadFinalQAFix();
  script.onerror = () => loadFinalQAFix();
  document.body.appendChild(script);
}

function loadFinalQAFix() {
  const fix = document.createElement("script");
  fix.src = "final-qa-fix-2026-09-06.js?v=20260906-final-01";
  fix.onload = () => loadNavigationFix();
  fix.onerror = () => loadNavigationFix();
  document.body.appendChild(fix);
}

function loadNavigationFix() {
  const navigation = document.createElement("script");
  navigation.src = "navigation-fix.js?v=20260906-final-01";
  navigation.onload = () => loadSearchFixes();
  navigation.onerror = () => loadSearchFixes();
  document.body.appendChild(navigation);
}

function loadSearchFixes() {
  const searchFix = document.createElement("script");
  searchFix.src = "search-pagination-fix.js?v=20260825-01";
  searchFix.onload = () => loadSearchExportFix();
  searchFix.onerror = () => loadSearchExportFix();
  document.body.appendChild(searchFix);
}

function loadSearchExportFix() {
  const script = document.createElement("script");
  script.src = "search-export-fix.js?v=20260825-01";
  script.onload = () => loadExactSearch();
  script.onerror = () => loadExactSearch();
  document.body.appendChild(script);
}

function loadExactSearch() {
  const script = document.createElement("script");
  script.src = "search-exact.js?v=20260823-01";
  script.onload = () => loadRuntimeFix();
  script.onerror = () => loadRuntimeFix();
  document.body.appendChild(script);
}

function loadRuntimeFix() {
  const fix = document.createElement("script");
  fix.src = "runtime-fix.js?v=20260823-01";
  fix.onload = () => loadSearchBackFix();
  fix.onerror = () => loadSearchBackFix();
  document.body.appendChild(fix);
}

function loadSearchBackFix() {
  const searchBackFix = document.createElement("script");
  searchBackFix.src = "search-back-restore-fix.js?v=20260906-01";
  searchBackFix.onload = () => loadStatsLabel();
  searchBackFix.onerror = () => loadStatsLabel();
  document.body.appendChild(searchBackFix);
}

function loadStatsLabel() {
  const stats = document.createElement("script");
  stats.src = "stats-label.js?v=20260825-03";
  stats.onload = () => {
    if (typeof window.installStatsLabel === "function") {
      window.installStatsLabel();
    }
    window.__GOLZAR_MASTER_READY__ = true;
  };
  stats.onerror = () => {
    window.__GOLZAR_MASTER_READY__ = true;
  };
  document.body.appendChild(stats);
}

document.addEventListener("DOMContentLoaded", loadApp);