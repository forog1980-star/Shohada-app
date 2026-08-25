"use strict";

// تبدیل «تست اتصال» به کلید واقعی «گزارش‌های آماری».
// منطق ثبت، جستجو و Supabase دست‌نخورده می‌ماند.
function installStatsLabel() {
  const replaceStatsButton = () => {
    const candidates = Array.from(document.querySelectorAll("button, a, div"));
    const target = candidates.find((el) => {
      const strong = el.querySelector?.(".button-text strong");
      return strong && strong.textContent.trim() === "تست اتصال";
    });
    if (!target) return false;

    const replacement = target.cloneNode(true);
    replacement.removeAttribute("id");
    replacement.removeAttribute("onclick");
    replacement.removeAttribute("role");
    replacement.removeAttribute("tabindex");
    replacement.style.cursor = "pointer";

    const title = replacement.querySelector(".button-text strong");
    const subtitle = replacement.querySelector(".button-text small");
    const icon = replacement.querySelector(".icon");
    const arrow = replacement.querySelector(".button-arrow");

    if (icon) icon.textContent = "📊";
    if (title) title.textContent = "گزارش‌های آماری";
    if (subtitle) subtitle.textContent = "گزارش‌ها و آمار سامانه";
    if (arrow) arrow.textContent = "←";

    replacement.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.href = "statistics.html?v=20260825-03";
    }, true);

    target.replaceWith(replacement);
    return true;
  };

  replaceStatsButton();
  if (!window.__GOLZAR_STATS_OBSERVER__) {
    const observer = new MutationObserver(() => replaceStatsButton());
    const app = document.querySelector(".app") || document.body;
    observer.observe(app, { childList: true, subtree: true });
    window.__GOLZAR_STATS_OBSERVER__ = observer;
  }
}
window.installStatsLabel = installStatsLabel;
