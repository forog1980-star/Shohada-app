"use strict";

// GolzarStone / PWA install helper
// مستقل از هسته برنامه؛ هیچ دسترسی نوشتاری به Supabase ندارد.
(function installPwaPromptHelper() {
  let deferredPrompt = null;
  let installButton = null;

  function isStandalone() {
    return window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
  }

  function removeButton() {
    if (installButton?.isConnected) installButton.remove();
    installButton = null;
  }

  function showInstallHelp() {
    alert(
      "برای نصب برنامه: از منوی سه‌نقطه Chrome گزینه «افزودن به صفحه اصلی» را انتخاب کنید."
    );
  }

  function createButton() {
    if (installButton || isStandalone()) return;

    installButton = document.createElement("button");
    installButton.type = "button";
    installButton.textContent = "نصب برنامه";
    installButton.setAttribute("aria-label", "نصب برنامه گلزار شهدا");
    installButton.style.position = "fixed";
    installButton.style.right = "12px";
    installButton.style.top = "12px";
    installButton.style.zIndex = "2147483647";
    installButton.style.padding = "10px 16px";
    installButton.style.border = "0";
    installButton.style.borderRadius = "10px";
    installButton.style.fontFamily = "Tahoma, Arial, sans-serif";
    installButton.style.fontSize = "14px";
    installButton.style.fontWeight = "700";
    installButton.style.cursor = "pointer";
    installButton.style.boxShadow = "0 3px 12px rgba(0,0,0,.15)";
    installButton.style.background = "#17633d";
    installButton.style.color = "#fff";

    installButton.addEventListener("click", async function () {
      if (!deferredPrompt) {
        showInstallHelp();
        return;
      }

      const promptEvent = deferredPrompt;
      deferredPrompt = null;

      try {
        await promptEvent.prompt();
        await promptEvent.userChoice;
      } catch (error) {
        console.warn("PWA install prompt failed:", error);
        showInstallHelp();
      }
    });

    document.body.appendChild(installButton);
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    window.__GOLZAR_PWA_INSTALL_READY__ = true;
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    removeButton();
    window.__GOLZAR_PWA_INSTALLED__ = true;
  });

  function boot() {
    createButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.__GOLZAR_PWA_INSTALL_HELPER_READY__ = true;
})();
