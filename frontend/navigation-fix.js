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
      page: "home",
    },
    "",
    window.location.href
  );

  currentAppPage = "home";

  if (typeof window.showHome === "function") {
    window.showHome();
  }

  // showHome توسط launcher به منوی دوگانه برمی‌گردد؛
  // سپس کارت سبز «مدیریت و بهسازی سنگ مزار» را باز می‌کنیم.
  setTimeout(() => {
    const stoneButton = document.querySelector(
      ".modular-home-main-action.green"
    );

    if (stoneButton) {
      stoneButton.click();
    }
  }, 0);
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
