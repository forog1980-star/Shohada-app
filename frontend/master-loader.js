"use strict";

// ============================================================
// GolzarStone master loader
// ============================================================
// Excel به صورت خودکار وارد بانک نمی‌شود.
// انتقال داده فقط با ExcelData/import_master_v2.py انجام می‌شود.
// ============================================================

function loadApp() {
  const script = document.createElement("script");
  script.src = "app.js?v=20260829-01";

  script.onload = () => {
    const searchFix = document.createElement("script");
    searchFix.src = "search-pagination-fix.js?v=20260825-01";
    searchFix.onload = () => loadSearchExportFix();
    searchFix.onerror = () => loadSearchExportFix();
    document.body.appendChild(searchFix);
  };

  script.onerror = () => {
    window.__GOLZAR_MASTER_READY__ = true;
  };
  document.body.appendChild(script);
}

function loadSearchExportFix() {
  const script = document.createElement("script");
  script.src = "search-export-fix.js?v=20260825-01";
  script.onload = () => loadRuntimeFix();
  script.onerror = () => loadRuntimeFix();
  document.body.appendChild(script);
}

function loadRuntimeFix() {
  const fix = document.createElement("script");
  fix.src = "runtime-fix.js?v=20260829-01";
  fix.onload = () => {
    const stats = document.createElement("script");
    stats.src = "stats-label.js?v=20260825-03";
    stats.onload = () => loadSearchBackRestoreFix();
    stats.onerror = () => loadSearchBackRestoreFix();
    document.body.appendChild(stats);
  };
  fix.onerror = () => loadSearchBackRestoreFix();
  document.body.appendChild(fix);
}

function loadSearchBackRestoreFix() {
  const script = document.createElement("script");
  script.src = "search-back-restore-fix.js?v=20260829-03";
  script.onload = () => {
    if (typeof window.installStatsLabel === "function") {
      window.installStatsLabel();
    }
    window.__GOLZAR_MASTER_READY__ = true;
  };
  script.onerror = () => {
    if (typeof window.installStatsLabel === "function") {
      window.installStatsLabel();
    }
    window.__GOLZAR_MASTER_READY__ = true;
  };
  document.body.appendChild(script);
}

document.addEventListener("DOMContentLoaded", loadApp);
