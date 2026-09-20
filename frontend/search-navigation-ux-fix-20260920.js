"use strict";

/*
 * GolzarStone — Search Navigation UX Fix — 2026-09-20
 *
 * هدف:
 * 1) حفظ موقع اسکرول هنگام ورود از نتایج جستجو به جزئیات و بازگشت.
 * 2) افزودن دکمه شناور «بازگشت به بالا» برای صفحات داخلی برنامه.
 * 3) حذف فلش متنی قدیمی «←» از دکمه بازگشت در نسخه QA.
 *
 * این ماژول مستقل است و داده/Schema مربوط به Supabase را تغییر نمی‌دهد.
 */

(function installSearchNavigationUxFix() {
  if (window.__GOLZAR_SEARCH_NAVIGATION_UX_FIX__) return;
  window.__GOLZAR_SEARCH_NAVIGATION_UX_FIX__ = true;

  const SCROLL_KEY = "__GOLZAR_SEARCH_SCROLL_Y__";
  const TOP_BUTTON_ID = "golzar-back-to-top";

  function currentPage() {
    return window.currentAppPage || window.history.state?.page || "home";
  }

  function getScrollY() {
    return Math.max(
      0,
      Number(window.scrollY || document.documentElement?.scrollTop || 0)
    );
  }

  function normalizeBackLabels() {
    document.querySelectorAll(".back-button").forEach((button) => {
      const text = String(button.textContent || "").trim();
      if (text.startsWith("←")) {
        button.textContent = text.replace(/^←\s*/, "");
      }
    });
  }

  function updateTopButton() {
    const button = document.getElementById(TOP_BUTTON_ID);
    if (!button) return;

    const visible =
      currentPage() !== "home" &&
      getScrollY() > 420;

    button.classList.toggle("is-visible", visible);
    button.setAttribute("aria-hidden", visible ? "false" : "true");
    button.tabIndex = visible ? 0 : -1;
  }

  function ensureTopButton() {
    let button = document.getElementById(TOP_BUTTON_ID);

    if (!button) {
      button = document.createElement("button");
      button.id = TOP_BUTTON_ID;
      button.type = "button";
      button.className = "golzar-back-to-top";
      button.setAttribute("aria-label", "بازگشت به بالای صفحه");
      button.title = "بازگشت به بالا";
      button.textContent = "↑";

      button.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });

      document.body.appendChild(button);
    }

    updateTopButton();
  }

  function restoreSearchScroll() {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (raw === null) return;

    const saved = Number(raw);
    sessionStorage.removeItem(SCROLL_KEY);

    if (!Number.isFinite(saved) || saved < 0) return;

    const apply = () => {
      window.scrollTo({
        top: saved,
        behavior: "auto",
      });
      updateTopButton();
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        apply();
        setTimeout(apply, 60);
      });
    });
  }

  const originalShowRecordDetail = window.showRecordDetail;
  if (typeof originalShowRecordDetail === "function") {
    window.showRecordDetail = function patchedShowRecordDetail(
      id,
      source = "records"
    ) {
      if (source === "search") {
        try {
          sessionStorage.setItem(SCROLL_KEY, String(getScrollY()));
        } catch (error) {
          console.warn(
            "GolzarStone search scroll save failed:",
            error
          );
        }
      }

      return originalShowRecordDetail.call(this, id, source);
    };
  }

  const originalRestoreSearchPage = window.restoreSearchPage;
  if (typeof originalRestoreSearchPage === "function") {
    window.restoreSearchPage = function patchedRestoreSearchPage(...args) {
      const result = originalRestoreSearchPage.apply(this, args);
      restoreSearchScroll();
      return result;
    };
  }

  const style = document.createElement("style");
  style.id = "golzar-search-navigation-ux-fix-styles";
  style.textContent = `
    #${TOP_BUTTON_ID} {
      position: fixed;
      left: 50%;
      bottom: 22px;
      z-index: 1000;
      width: 48px;
      height: 48px;
      border: 0;
      border-radius: 50%;
      background: #17633d;
      color: #ffffff;
      font-family: inherit;
      font-size: 26px;
      font-weight: 800;
      line-height: 1;
      box-shadow: 0 5px 16px rgba(0,0,0,.18);
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transform: translate(-50%, 8px);
      transition: opacity .18s ease, visibility .18s ease, transform .18s ease;
    }

    #${TOP_BUTTON_ID}.is-visible {
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, 0);
    }

    #${TOP_BUTTON_ID}:focus-visible {
      outline: 3px solid rgba(40,120,184,.35);
      outline-offset: 2px;
    }

    @media (max-width: 520px) {
      #${TOP_BUTTON_ID} {
        left: 50%;
        bottom: 16px;
        width: 44px;
        height: 44px;
      }
    }
  `;
  document.head.appendChild(style);

  const observer = new MutationObserver(() => {
    normalizeBackLabels();
    ensureTopButton();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener("scroll", updateTopButton, { passive: true });
  window.addEventListener("resize", updateTopButton);

  document.addEventListener("DOMContentLoaded", () => {
    normalizeBackLabels();
    ensureTopButton();
    updateTopButton();

    if (currentPage() === "search") {
      restoreSearchScroll();
    }
  });

  window.__GOLZAR_SEARCH_NAVIGATION_UX_FIX_READY__ = true;
})();
