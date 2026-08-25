"use strict";

// Shohada-app V2 / PWA service worker
// مرحله اول عمداً بدون cache کردن فایل‌های برنامه یا داده‌هاست.
// هدف فعلی فقط فراهم‌کردن زیرساخت PWA بدون ایجاد ریسک برای نسخه عملیاتی است.

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});
