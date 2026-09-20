"use strict";

/*
 * GolzarStone — Search -> Detail -> Back — 2026-09-20
 *
 * هدف:
 * - فقط در مسیر Search -> Detail، دکمه‌های Back مستقیماً
 *   restoreSearchPage() را اجرا کنند.
 * - وضعیت فیلترها و نتایج جستجوی قبلی حفظ شود.
 * - موقعیت اسکرول قبلی تا حد ممکن حفظ شود.
 * - هیچ تغییر در History، Supabase یا مسیرهای غیر Search ایجاد نشود.
 */

(function installSearchBackDirectFix() {
  if (window.__GOLZAR_SEARCH_BACK_DIRECT_INSTALLED__) return;

  const originalShowRecordDetail = window.showRecordDetail;

  if (typeof originalShowRecordDetail !== "function") {
    console.error("Search back direct fix: showRecordDetail not found.");
    return;
  }

  window.__GOLZAR_SEARCH_BACK_DIRECT_INSTALLED__ = true;

  function restoreScroll(savedScrollY) {
    const top = Math.max(0, Number(savedScrollY) || 0);

    const apply = () => {
      window.scrollTo({
        top,
        behavior: "auto",
      });
    };

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(apply);
      });
    } else {
      setTimeout(apply, 0);
    }
  }

  function handleSearchBack(event, savedScrollY) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    try {
      if (typeof window.restoreSearchPage !== "function") {
        throw new Error("restoreSearchPage not found.");
      }

      window.restoreSearchPage();
      restoreScroll(savedScrollY);
    } catch (error) {
      console.error("Search back direct restore error:", error);
    }
  }

  function replaceBackButton(id, savedScrollY) {
    const current = document.getElementById(id);
    if (!current) return false;

    const replacement = current.cloneNode(true);
    current.replaceWith(replacement);

    replacement.addEventListener("click", (event) => {
      handleSearchBack(event, savedScrollY);
    });

    return true;
  }

  function patchSearchBackButtons(savedScrollY) {
    replaceBackButton("back-home", savedScrollY);
    replaceBackButton("back-records", savedScrollY);
  }

  window.showRecordDetail = function showRecordDetailWithDirectSearchBack(...args) {
    const source = args[1] || "records";

    if (source !== "search") {
      return originalShowRecordDetail.apply(this, args);
    }

    const savedScrollY = window.scrollY || 0;
    let result;

    try {
      result = originalShowRecordDetail.apply(this, args);
    } catch (error) {
      patchSearchBackButtons(savedScrollY);
      throw error;
    }

    // back-home is created and wired synchronously by the original
    // function, so replace it immediately to remove its old listener.
    patchSearchBackButtons(savedScrollY);

    // back-records is created only after the detail query finishes.
    if (result && typeof result.finally === "function") {
      return result.finally(() => {
        patchSearchBackButtons(savedScrollY);
      });
    }

    return result;
  };

  window.__GOLZAR_SEARCH_BACK_DIRECT_READY__ = true;
})();
