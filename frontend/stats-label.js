"use strict";

// فقط جایگزینی ظاهری «تست اتصال» با «گزارش‌های آماری».
// هیچ لینک، تصویر یا عملکرد جدیدی اضافه نمی‌شود.
function installStatsLabel() {
  const candidates = Array.from(document.querySelectorAll("button, a, div"));
  const target = candidates.find((el) => {
    const strong = el.querySelector?.(".button-text strong");
    return strong && strong.textContent.trim() === "تست اتصال";
  });

  if (!target) {
    console.warn("GolzarStone: دکمه «تست اتصال» برای جایگزینی پیدا نشد.");
    return;
  }

  const replacement = target.cloneNode(true);
  replacement.removeAttribute("id");
  replacement.removeAttribute("href");
  replacement.removeAttribute("onclick");
  replacement.removeAttribute("role");
  replacement.removeAttribute("tabindex");
  replacement.style.cursor = "default";
  replacement.className = target.className || "menu-button menu-test";

  const title = replacement.querySelector(".button-text strong");
  const subtitle = replacement.querySelector(".button-text small");
  const icon = replacement.querySelector(".icon");
  const arrow = replacement.querySelector(".button-arrow");

  if (icon) icon.textContent = "📊";
  if (title) title.textContent = "گزارش‌های آماری";
  if (subtitle) subtitle.textContent = "گزارش‌ها و آمار سامانه";
  if (arrow) arrow.remove();

  // جلوگیری از هر عملکرد قبلی روی عنصر جایگزین.
  replacement.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
  }, true);

  target.replaceWith(replacement);
}

window.installStatsLabel = installStatsLabel;
