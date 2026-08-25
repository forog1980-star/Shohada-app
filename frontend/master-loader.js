"use strict";

// ============================================================
// GolzarStone master loader
// ============================================================
// Excel به صورت خودکار وارد بانک نمی‌شود.
// انتقال داده فقط با ExcelData/import_master_v2.py انجام می‌شود.
// ============================================================

function loadApp() {
  const script = document.createElement("script");
  script.src = "app.js?v=20260823-01";

  script.onload = () => {
    installExactSearch();

    const fix = document.createElement("script");
    fix.src = "runtime-fix.js?v=20260823-01";
    fix.onload = () => {
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
    };
    fix.onerror = () => {
      window.__GOLZAR_MASTER_READY__ = true;
    };
    document.body.appendChild(fix);
  };

  script.onerror = () => {
    window.__GOLZAR_MASTER_READY__ = true;
  };
  document.body.appendChild(script);
}

function installExactSearch() {
  const script = document.createElement("script");
  script.src = "search-exact.js?v=20260823-01";
  script.onload = () => loadApp();
  script.onerror = () => loadApp();
  document.body.appendChild(script);
}

document.addEventListener("DOMContentLoaded", loadApp);
