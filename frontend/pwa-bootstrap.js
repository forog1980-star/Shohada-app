"use strict";

// Shohada-app V2 / PWA bootstrap
// مستقل از منطق اصلی برنامه. فعلاً فقط ثبت Service Worker را آماده می‌کند.
// هیچ cache از app.js یا داده‌های Supabase در این مرحله ایجاد نمی‌شود.
(function () {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
      .then(function (registration) {
        console.info("Shohada-app V2 PWA ready:", registration.scope);
      })
      .catch(function (error) {
        console.warn("Shohada-app V2 PWA registration failed:", error);
      });
  });
})();
