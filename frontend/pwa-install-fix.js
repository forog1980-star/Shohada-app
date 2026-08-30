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

  function createButton() {
    if (installButton || isStandalone() || !deferredPrompt) return;

    installButton = document.createElement("button");
    installButton.type = "button";
    installButton.textContent = "نصب برنامه";
    installButton.setAttribute("aria-label", "نصب برنامه گلزار شهدا");
    installButton.style.position = "fixed";
    installButton.style.top = "12px";
    installButton.style.left = "12px";
    installButton.style.zIndex = "2147483647";
    installButton.style.padding = "9px 14px";
    installButton.style.border = "0";
    installButton.style.borderRadius = "10px";
    installButton.style.fontFamily = "Tahoma, Arial, sans-serif";
    installButton.style.fontSize = "14px";
    installButton.style.cursor = "pointer";
    installButton.style.boxShadow = "0 3px 12px rgba(0,0,0,.15)";
    installButton.style.background = "#17633d";
    installButton.style.color = "#fff";

    installButton.addEventListener("click", async function () {
      if (!deferredPrompt) return;
      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      removeButton();

      try {
        await promptEvent.prompt();
        await promptEvent.userChoice;
      } catch (error) {
        console.warn("PWA install prompt failed:", error);
      }
    });

    document.body.appendChild(installButton);
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    window.__GOLZAR_PWA_INSTALL_READY__ = true;
    createButton();
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    removeButton();
    window.__GOLZAR_PWA_INSTALLED__ = true;
  });

  window.__GOLZAR_PWA_INSTALL_HELPER_READY__ = true;
})();
