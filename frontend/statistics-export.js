"use strict";

// ============================================================
// Shohada-app / GolzarStone
// statistics-export.js
//
// ماژول مستقل خروجی Excel از آمارِ در حال نمایش.
// بدون تغییر در منطق محاسبه و بدون عملیات نوشتن روی Supabase.
// ============================================================

(function installStatisticsExport() {
  const BUTTON_ID = "golzar-statistics-export-button";
  const FILE_PREFIX = "گزارش-آماری-گلزار-شهدای-تهران";

  function persianDigits(value) {
    return String(value ?? "").replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
  }

  function dateStamp() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}_${hh}-${mi}`;
  }

  function currentStats() {
    if (typeof STATS === "undefined") {
      throw new Error("داده‌های آماری در دسترس نیست.");
    }
    return STATS;
  }

  function makeWorkbook() {
    if (!window.XLSX || typeof window.XLSX.utils?.book_new !== "function") {
      throw new Error("کتابخانه Excel (XLSX) بارگذاری نشده است.");
    }

    const stats = currentStats();
    const wb = window.XLSX.utils.book_new();

    const summary = [
      ["گزارش آماری گلزار شهدای تهران"],
      ["تاریخ و ساعت تهیه گزارش", new Date().toLocaleString("fa-IR")],
      [],
      ["شاخص", "تعداد"],
      ["کل مزارها", stats.totalGraves],
      ["درخواست کار عمرانی", stats.totalRequests],
      ["قابل اقدام تعویضی", stats.replacement.total],
      ["تعویض شده", stats.replacement.completed],
      ["باقی مانده تعویض", stats.replacement.remaining],
      ["قابل اقدام ترمیمی", stats.repair.total],
      ["ترمیم شده", stats.repair.completed],
      ["باقی مانده ترمیم", stats.repair.remaining],
      ["قابل اقدام در تفکیک", stats.trackedOperations],
      ["وارد نشده در تفکیک", stats.unclassified],
    ];

    const pieces = [
      [
        "قطعه",
        "کل مزار",
        "درخواست کار عمرانی",
        "قابل تعویض",
        "تعویض شده",
        "باقی مانده تعویض",
        "قابل ترمیم",
        "ترمیم شده",
        "باقی مانده ترمیم",
      ],
    ];

    for (const p of stats.pieces || []) {
      pieces.push([
        p.piece,
        p.total,
        p.requests,
        p.replacement,
        p.replacementDone,
        p.replacementRemaining,
        p.repair,
        p.repairDone,
        p.repairRemaining,
      ]);
    }

    pieces.push([
      "جمع",
      stats.totalGraves,
      stats.totalRequests,
      stats.replacement.total,
      stats.replacement.completed,
      stats.replacement.remaining,
      stats.repair.total,
      stats.repair.completed,
      stats.repair.remaining,
    ]);

    const stages = [
      ["نوع عملیات", "مرحله", "تعداد"],
      ["تعویضی", "سنگ آماده ارسال به واحد تعویض", stats.replacementStages[0]],
      ["تعویضی", "سنگ تعویضی آماده", stats.replacementStages[1]],
      ["تعویضی", "سنگ تعویضی نصب شده", stats.replacementStages[2]],
      ["ترمیمی", "سنگ آماده ارسال به واحد مرمت", stats.repairStages[0]],
      ["ترمیمی", "سنگ مرمتی آماده", stats.repairStages[1]],
      ["ترمیمی", "نصب سنگ مرمت شده", stats.repairStages[2]],
    ];

    const wsSummary = window.XLSX.utils.aoa_to_sheet(summary);
    const wsPieces = window.XLSX.utils.aoa_to_sheet(pieces);
    const wsStages = window.XLSX.utils.aoa_to_sheet(stages);

    wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }];
    wsPieces["!cols"] = [
      { wch: 12 }, { wch: 14 }, { wch: 20 }, { wch: 14 },
      { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 18 },
    ];
    wsStages["!cols"] = [{ wch: 14 }, { wch: 34 }, { wch: 14 }];

    window.XLSX.utils.book_append_sheet(wb, wsSummary, "خلاصه");
    window.XLSX.utils.book_append_sheet(wb, wsPieces, "قطعات");
    window.XLSX.utils.book_append_sheet(wb, wsStages, "مراحل");

    return wb;
  }

  function exportExcel() {
    try {
      const wb = makeWorkbook();
      const fileName = `${FILE_PREFIX}-${dateStamp()}.xlsx`;
      window.XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Statistics export failed:", error);
      alert(error?.message || "خروجی Excel تهیه نشد.");
    }
  }

  function addButton() {
    if (document.getElementById(BUTTON_ID)) return true;

    const actions = document.querySelector(".head-actions");
    if (!actions) return false;

    const button = document.createElement("button");
    button.type = "button";
    button.id = BUTTON_ID;
    button.textContent = "خروجی Excel";
    button.setAttribute("aria-label", "دریافت خروجی Excel آمار");
    button.addEventListener("click", exportExcel);
    actions.appendChild(button);
    return true;
  }

  function boot() {
    addButton();
    const observer = new MutationObserver(() => addButton());
    observer.observe(document.getElementById("statistics-app") || document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.__GOLZAR_STATISTICS_EXPORT_READY__ = true;
})();
