"use strict";

// ============================================================
// Shohada-app / GolzarStone
// search-export-fix.js
//
// مستقل از app.js — خروجی Excel را به نتایج کامل جستجوی
// صفحه‌بندی‌شده متصل می‌کند تا بعد از رفع محدودیت ۲۰۰ رکورد،
// خروجی با پیام «رکوردی برای خروجی گرفتن وجود ندارد» متوقف نشود.
// ============================================================

(function installSearchExportFix() {
  const BUTTON_ID = "export-search-results";

  const HEADERS = {
    id: "شناسه بانک",
    name: "نام",
    lastname: "نام خانوادگی",
    father_name: "نام پدر",
    piece: "قطعه",
    grave_row: "ردیف",
    grave_number: "شماره",
    stone_type: "نوع عملیات",
    stage: "مرحله عملیات",
    status: "وضعیت تأیید",
    notes: "توضیحات",
    created_at: "تاریخ ثبت",
    edited_at: "تاریخ آخرین ویرایش",
    edit_notes: "توضیحات ویرایش",
  };

  function value(record, key) {
    const v = record?.[key];
    return v === null || v === undefined ? "" : v;
  }

  function jalaliDate(value) {
    if (!value) return "";
    if (typeof window.formatJalaliDateForExcel === "function") {
      return window.formatJalaliDateForExcel(value);
    }
    return value;
  }

  function getRows() {
    const rows = window.__GOLZAR_SEARCH_RESULTS__;
    return Array.isArray(rows) ? rows : [];
  }

  function exportResults() {
    const results = getRows();

    if (!results.length) {
      alert("رکوردی برای خروجی گرفتن وجود ندارد.");
      return;
    }

    if (typeof XLSX === "undefined") {
      alert("کتابخانه خروجی اکسل بارگذاری نشده است.\n\nلطفاً SheetJS را در index.html بارگذاری کنید.");
      return;
    }

    try {
      const exportData = results.map((record) => ({
        [HEADERS.id]: value(record, "id"),
        [HEADERS.name]: value(record, "name"),
        [HEADERS.lastname]: value(record, "lastname"),
        [HEADERS.father_name]: value(record, "father_name"),
        [HEADERS.piece]: value(record, "piece"),
        [HEADERS.grave_row]: value(record, "grave_row"),
        [HEADERS.grave_number]: value(record, "grave_number"),
        [HEADERS.stone_type]: value(record, "stone_type"),
        [HEADERS.stage]: value(record, "stage"),
        [HEADERS.status]: value(record, "status"),
        [HEADERS.notes]: value(record, "notes"),
        [HEADERS.created_at]: jalaliDate(value(record, "created_at")),
        [HEADERS.edited_at]: jalaliDate(value(record, "edited_at")),
        [HEADERS.edit_notes]: value(record, "edit_notes"),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet["!cols"] = Object.keys(exportData[0]).map((key) => ({
        wch: Math.min(Math.max(String(key).length + 4, 12), 30),
      }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "نتایج جستجو");

      const date =
        typeof window.getTodayJalaliForFileName === "function"
          ? window.getTodayJalaliForFileName()
          : new Date().toISOString().slice(0, 10);

      XLSX.writeFile(
        workbook,
        `GolzarStone_نتایج_جستجو_${date}.xlsx`
      );

      alert(
        "خروجی اکسل با موفقیت ایجاد شد." +
        `\n\nتعداد رکورد: ${results.length}`
      );
    } catch (error) {
      console.error("Search Excel export error:", error);
      alert(`ایجاد خروجی اکسل انجام نشد.\n\n${error.message}`);
    }
  }

  function installButton() {
    const button = document.getElementById(BUTTON_ID);
    if (!button || button.dataset.searchExportFixInstalled === "1") {
      return;
    }

    button.dataset.searchExportFixInstalled = "1";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      exportResults();
    }, true);
  }

  const observer = new MutationObserver(installButton);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener("DOMContentLoaded", installButton);
  installButton();

  window.__GOLZAR_SEARCH_EXPORT_FIX_READY__ = true;
})();
