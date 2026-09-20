"use strict";

/*
 * GolzarStone — Global Stone Management Back Navigation — 2026-09-20
 *
 * هدف:
 * - یک رفتار قطعی برای کلید «بازگشت» در تمام مسیرهای مدیریت و بهسازی سنگ مزار.
 * - عدم وابستگی به history.back() برای بازگشت‌های داخلی.
 * - جستجو/جزئیات جستجو → نتایج جستجو
 * - ثبت اطلاعات / تأیید اطلاعات → منوی مدیریت و بهسازی
 * - جزئیات اطلاعات ثبت‌شده → فهرست اطلاعات ثبت‌شده
 * - ویرایش → منبع ورود (جستجو یا فهرست)
 * - بدون تغییر در Supabase data/schema.
 */

(function installGlobalStoneManagementBackFix() {
  if (window.__GOLZAR_GLOBAL_STONE_BACK_FIX__) return;
  window.__GOLZAR_GLOBAL_STONE_BACK_FIX__ = true;

  const state = {
    detailSource: null,
    editSource: null,
  };

  function setPage(page) {
    window.currentAppPage = page;
  }

  function toStoneMenu() {
    state.detailSource = null;
    state.editSource = null;
    setPage("stone-menu");

    if (typeof window.showStoneManagementMenu === "function") {
      window.showStoneManagementMenu(false);
    } else if (typeof window.showHome === "function") {
      window.showHome();
    }
  }

  function toSearchResults() {
    state.detailSource = null;
    state.editSource = null;
    setPage("search");

    if (typeof window.restoreSearchPage === "function") {
      window.restoreSearchPage();
    } else if (typeof window.showSearch === "function") {
      window.showSearch(true);
    }
  }

  function toPendingRecords() {
    state.detailSource = null;
    state.editSource = null;
    setPage("pending");

    if (typeof window.showPendingRecords === "function") {
      window.showPendingRecords(true);
    }
  }

  function handleInternalBack(event) {
    const button = event.target?.closest?.(
      "#back-home, #back-records, .cancel-edit-button"
    );
    if (!button) return;

    const page = String(window.currentAppPage || "");

    /*
     * مهم: این handler در capture phase اجرا می‌شود و قبل از
     * listenerهای native موجود در app.js قرار می‌گیرد.
     */
    event.preventDefault();
    event.stopImmediatePropagation();

    if (page === "search-detail" || state.detailSource === "search") {
      toSearchResults();
      return;
    }

    if (page === "detail" || state.detailSource === "records") {
      toPendingRecords();
      return;
    }

    if (page === "edit") {
      if (state.editSource === "search") {
        toSearchResults();
      } else {
        toPendingRecords();
      }
      return;
    }

    if (page === "new" || page === "pending") {
      toStoneMenu();
      return;
    }

    /*
     * اگر صفحه داخلی است ولی state به هر دلیل با تأخیر به‌روز شده،
     * وجود یکی از دکمه‌های داخلی را به‌عنوان fallback در نظر می‌گیریم.
     */
    if (document.querySelector(".internal-header")) {
      toStoneMenu();
    }
  }

  document.addEventListener("click", handleInternalBack, true);

  const originalShowRecordDetail = window.showRecordDetail;
  if (typeof originalShowRecordDetail === "function") {
    window.showRecordDetail = function globalBackShowRecordDetail(id, source = "records") {
      state.detailSource = source;
      setPage(source === "search" ? "search-detail" : "detail");
      return originalShowRecordDetail.call(this, id, source);
    };
  }

  const originalShowEditRecord = window.showEditRecord;
  if (typeof originalShowEditRecord === "function") {
    window.showEditRecord = function globalBackShowEditRecord(
      id,
      source = "search",
      fromHistory = false
    ) {
      state.editSource = source;
      setPage("edit");
      return originalShowEditRecord.call(this, id, source, fromHistory);
    };
  }

  const originalShowNewRecord = window.showNewRecord;
  if (typeof originalShowNewRecord === "function") {
    window.showNewRecord = function globalBackShowNewRecord(...args) {
      state.detailSource = null;
      state.editSource = null;
      setPage("new");
      return originalShowNewRecord.apply(this, args);
    };
  }

  const originalShowPendingRecords = window.showPendingRecords;
  if (typeof originalShowPendingRecords === "function") {
    window.showPendingRecords = function globalBackShowPendingRecords(...args) {
      state.detailSource = null;
      state.editSource = null;
      setPage("pending");
      return originalShowPendingRecords.apply(this, args);
    };
  }

  window.__GOLZAR_GLOBAL_STONE_BACK_FIX_READY__ = true;
})();
