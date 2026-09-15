"use strict";

// ============================================================
// GolzarStone — Canonical Stone Stage Definition
// ============================================================
// این فایل تنها مرجع رسمی مراحل عملیات سنگ است.
// تمام لایه‌های مرتبط باید از این تعریف استفاده کنند.
// ============================================================

(function () {
  const definition = {
    "ترمیمی": [
      "طرح سنگ به واحد مرمت ارسال شد",
      "سنگ مرمتی آماده است",
      "نصب سنگ مرمت شده",
    ],
    "تعویضی": [
      "طرح سنگ به واحد تعویض ارسال شد",
      "سنگ تعویضی آماده است",
      "سنگ تعویضی نصب شد",
    ],
  };

  const frozen = Object.freeze({
    "ترمیمی": Object.freeze([...definition["ترمیمی"]]),
    "تعویضی": Object.freeze([...definition["تعویضی"]]),
  });

  window.GOLZAR_STAGE_DEFINITION = frozen;
  window.GOLZAR_STAGE_TYPES = Object.freeze(
    Object.keys(frozen)
  );

  window.getGolzarStagesForStoneType = function (stoneType) {
    return frozen[stoneType] ? [...frozen[stoneType]] : [];
  };

  window.isGolzarStageValid = function (stoneType, stage) {
    return !!stoneType && !!stage &&
      !!frozen[stoneType] &&
      frozen[stoneType].includes(stage);
  };

  // app.js یک شیء STAGES قدیمی دارد. آن را بدون تغییر ساختار
  // داخلی برنامه، با مرجع رسمی همگام می‌کنیم.
  try {
    if (typeof STAGES !== "undefined" && STAGES) {
      STAGES["ترمیمی"] = [...frozen["ترمیمی"]];
      STAGES["تعویضی"] = [...frozen["تعویضی"]];
    }
  } catch (error) {
    console.warn("GolzarStone stage definition sync warning:", error);
  }
})();
