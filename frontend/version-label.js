// GolzarStone — Version label
// فقط نمایش شماره نسخه در فوتر؛ هیچ منطق برنامه را تغییر نمی‌دهد.

(function () {
  "use strict";

  const APP_VERSION = "۲.۰.۲";

  function installVersionLabel() {
    const footer = document.querySelector(".footer");
    if (!footer) return false;

    if (footer.querySelector(".app-version")) return true;

    const version = document.createElement("div");
    version.className = "app-version";
    version.textContent = `نسخه ${APP_VERSION}`;
    version.style.cssText =
      "margin-top:6px;font-size:12px;opacity:.75;";

    footer.appendChild(version);
    return true;
  }

  window.installVersionLabel = installVersionLabel;
})();
