"use strict";

/*
 * GolzarStone — Back to Top — 2026-09-20
 *
 * فقط دکمه «بازگشت به بالای صفحه».
 * بدون تغییر در منطق Back، History، Search یا Supabase.
 */

(function installBackToTop() {
  if (window.__GOLZAR_BACK_TO_TOP_INSTALLED__) return;
  window.__GOLZAR_BACK_TO_TOP_INSTALLED__ = true;

  const BUTTON_ID = "golzar-back-to-top";

  function ensureButton() {
    if (document.getElementById(BUTTON_ID)) return;

    const button = document.createElement("button");
    button.id = BUTTON_ID;
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

  function updateVisibility() {
    const button = document.getElementById(BUTTON_ID);
    if (!button) return;

    const visible = window.scrollY > 420;
    button.classList.toggle("is-visible", visible);
    button.setAttribute("aria-hidden", visible ? "false" : "true");
    button.tabIndex = visible ? 0 : -1;
  }

  if (!document.getElementById("golzar-back-to-top-styles")) {
    const style = document.createElement("style");
    style.id = "golzar-back-to-top-styles";
    style.textContent = `
      #${BUTTON_ID} {
        position: fixed;
        left: 50%;
        bottom: 22px;
        z-index: 1000;
        width: 48px;
        height: 48px;
        border: 0;
        border-radius: 50%;
        background: #17633d;
        color: #fff;
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

      #${BUTTON_ID}.is-visible {
        opacity: 1;
        visibility: visible;
        transform: translate(-50%, 0);
      }

      #${BUTTON_ID}:focus-visible {
        outline: 3px solid rgba(40,120,184,.35);
        outline-offset: 2px;
      }

      @media (max-width: 520px) {
        #${BUTTON_ID} {
          left: 50%;
          bottom: 16px;
          width: 44px;
          height: 44px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  ensureButton();
  updateVisibility();

  window.addEventListener("scroll", () => {
    ensureButton();
    updateVisibility();
  }, { passive: true });

  window.addEventListener("resize", updateVisibility);

  document.addEventListener("DOMContentLoaded", () => {
    ensureButton();
    updateVisibility();
  });
})();
