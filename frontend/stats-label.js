"use strict";

// فقط عنوان «تست اتصال» را به «گزارش‌های آماری» تبدیل می‌کند.
// این دکمه عمداً هیچ لینک، تصویر یا عملکرد کلیکی ندارد.
function installStatsLabel() {
  const button = document.getElementById("btn-test");
  if (!button) return;

  const replacement = button.cloneNode(true);
  replacement.removeAttribute("id");
  replacement.id = "btn-stats";
  replacement.className = "menu-button menu-test";
  replacement.removeAttribute("onclick");

  const title = replacement.querySelector(".button-text strong");
  const subtitle = replacement.querySelector(".button-text small");
  const icon = replacement.querySelector(".icon");
  const arrow = replacement.querySelector(".button-arrow");

  if (icon) icon.textContent = "📊";
  if (title) title.textContent = "گزارش‌های آماری";
  if (subtitle) subtitle.textContent = "گزارش‌ها و آمار سامانه";
  if (arrow) arrow.remove();

  button.replaceWith(replacement);
}

window.installStatsLabel = installStatsLabel;
