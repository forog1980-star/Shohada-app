"use strict";

// ============================================================
// GolzarStone — navigation fix
// بازگشت از صفحات داخلی به «یک مرحله قبل» در منوی مدیریت سنگ مزار.
// ============================================================

function goBackToStoneManagementMenu() {
  // این مسیر فقط ناوبری UI است و هیچ داده‌ای را تغییر نمی‌دهد.
  window.history.replaceState(
    {
      golzarApp: true,
      page: "stone-menu",
    },
    "",
    window.location.href
  );

  currentAppPage = "stone-menu";

  if (typeof window.showStoneManagementMenu === "function") {
    window.showStoneManagementMenu(false);
  } else if (typeof window.showHome === "function") {
    window.showHome();
  }
}
document.addEventListener("click", function (event) {
  const button = event.target.closest?.("#back-home");
  if (!button) return;

  if (
    typeof currentAppPage === "undefined" ||
    (currentAppPage !== "new" && currentAppPage !== "pending")
  ) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  goBackToStoneManagementMenu();
}, true);
