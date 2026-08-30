"use strict";

// GolzarStone / PWA install helper
// مستقل از هسته برنامه؛ هیچ دسترسی نوشتاری به Supabase ندارد.
(function installPwaPromptHelper() {
  const INSTALL_STATE_KEY = "golzar_pwa_install_handled_v1";
  let deferredPrompt = null;
  let installButton = null;

  function isStandalone() {
    return window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
  }

  function isInstallHandled() {
    try {
      return localStorage.getItem(INSTALL_STATE_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function markInstallHandled() {
    try {
      localStorage.setItem(INSTALL_STATE_KEY, "1");
    } catch (_) {
      // Storage may be unavailable; installation state can still be detected
      // through standalone mode or the appinstalled event.
    }
  }

  function getCurrentPage() {
    const page = window.history?.state?.page;
    return typeof page === "string" ? page : "home";
  }

  function isHomePage() {
    return getCurrentPage() === "home";
  }

  function removeButton() {
    if (installButton?.isConnected) installButton.remove();
    installButton = null;
  }

  function showInstallHelp() {
    alert(
      "برای نصب برنامه، در Chrome از منوی سه‌نقطه گزینه «افزودن به صفحه اصلی» را انتخاب کنید."
    );
  }

  function createButton() {
    if (
      installButton ||
      isStandalone() ||
      isInstallHandled() ||
      !isHomePage()
    ) return;

    installButton = document.createElement("button");
    installButton.type = "button";
    installButton.setAttribute("aria-label", "نصب برنامه گلزار شهدا");
    installButton.style.position = "fixed";
    installButton.style.left = "50%";
    installButton.style.bottom = "calc(14px + env(safe-area-inset-bottom, 0px))";
    installButton.style.transform = "translateX(-50%)";
    installButton.style.zIndex = "2147483647";
    installButton.style.display = "flex";
    installButton.style.alignItems = "center";
    installButton.style.justifyContent = "center";
    installButton.style.gap = "9px";
    installButton.style.padding = "9px 15px";
    installButton.style.border = "1px solid rgba(255,255,255,.32)";
    installButton.style.borderRadius = "14px";
    installButton.style.fontFamily = "Tahoma, Arial, sans-serif";
    installButton.style.fontSize = "14px";
    installButton.style.fontWeight = "700";
    installButton.style.cursor = "pointer";
    installButton.style.boxShadow = "0 4px 16px rgba(0,0,0,.18)";
    installButton.style.background = "#17633d";
    installButton.style.color = "#fff";
    installButton.style.maxWidth = "calc(100vw - 28px)";

    const icon = document.createElement("img");
    icon.src = "./icons/icon-192.png";
    icon.width = 24;
    icon.height = 24;
    icon.alt = "";
    icon.style.width = "24px";
    icon.style.height = "24px";
    icon.style.borderRadius = "6px";
    icon.style.flex = "0 0 24px";

    const label = document.createElement("span");
    label.textContent = "نصب برنامه";

    installButton.append(icon, label);

    installButton.addEventListener("click", async function () {
      if (!deferredPrompt) {
        markInstallHandled();
        removeButton();
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
      }
    });

    document.body.appendChild(installButton);
  }

  function syncVisibility() {
    if (isStandalone() || isInstallHandled() || !isHomePage()) {
      removeButton();
      return;
    }
    createButton();
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    window.__GOLZAR_PWA_INSTALL_READY__ = true;
    syncVisibility();
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    markInstallHandled();
    removeButton();
    window.__GOLZAR_PWA_INSTALLED__ = true;
  });

  const originalPushState = window.history?.pushState;
  const originalReplaceState = window.history?.replaceState;

  if (typeof originalPushState === "function") {
    window.history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      window.setTimeout(syncVisibility, 0);
      return result;
    };
  }

  if (typeof originalReplaceState === "function") {
    window.history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      window.setTimeout(syncVisibility, 0);
      return result;
    };
  }

  window.addEventListener("popstate", function () {
    window.setTimeout(syncVisibility, 0);
  });

  function boot() {
    window.setTimeout(syncVisibility, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.__GOLZAR_PWA_INSTALL_HELPER_READY__ = true;
})();
