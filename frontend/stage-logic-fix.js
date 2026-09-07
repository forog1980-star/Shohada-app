"use strict";

// ============================================================
// GolzarStone — Canonical Stage Logic
// ============================================================
// تعریف واحد و نهایی مراحل عملیات سنگ مزار.
// این فایل بعد از app.js بارگذاری می‌شود تا منطق انتخاب مرحله
// با متن‌های رسمی و فعلی پروژه هماهنگ بماند.
// ============================================================

(function () {
  const REPAIR = "ترمیمی";
  const REPLACEMENT = "تعویضی";

  const CANONICAL_STAGES = Object.freeze({
    [REPAIR]: Object.freeze([
      "طرح سنگ به واحد مرمت ارسال شد",
      "سنگ مرمتی آماده است",
      "نصب سنگ مرمت شده",
    ]),
    [REPLACEMENT]: Object.freeze([
      "طرح سنگ به واحد تعویض ارسال شد",
      "سنگ تعویضی آماده است",
      "سنگ تعویضی نصب شد",
    ]),
  });

  // فقط برای سازگاری با رکوردهای قدیمی؛ مقدار جدید همیشه canonical است.
  const LEGACY_STAGE_MAP = Object.freeze({
    "ارسال به واحد مرمت": CANONICAL_STAGES[REPAIR][0],
    "سنگ آماده ارسال به واحد مرمت": CANONICAL_STAGES[REPAIR][0],
    "سنگ مرمتی آماده": CANONICAL_STAGES[REPAIR][1],
    "نصب مرمتی شده": CANONICAL_STAGES[REPAIR][2],
    "ارسال به واحد تعویض": CANONICAL_STAGES[REPLACEMENT][0],
    "سنگ آماده ارسال به واحد تعویض": CANONICAL_STAGES[REPLACEMENT][0],
    "سنگ تعویضی آماده": CANONICAL_STAGES[REPLACEMENT][1],
    "تعویضی نصب شده": CANONICAL_STAGES[REPLACEMENT][2],
    "سنگ تعویضی نصب شده": CANONICAL_STAGES[REPLACEMENT][2],
  });

  function normalizeStage(stage) {
    const value = String(stage ?? "").trim();
    return LEGACY_STAGE_MAP[value] || value;
  }

  function isValidStageForStoneType(stoneType, stage) {
    if (!stoneType || !stage) return false;
    const stages = CANONICAL_STAGES[String(stoneType).trim()];
    return Array.isArray(stages) && stages.includes(normalizeStage(stage));
  }

  function renderStageOptions(selectedStage = "") {
    const selected = normalizeStage(selectedStage);
    const allStages = [
      ...CANONICAL_STAGES[REPAIR],
      ...CANONICAL_STAGES[REPLACEMENT],
    ];

    return allStages
      .map(
        (stage) => `
          <label
            class="stage-option disabled"
            data-stage="${escapeHtml(stage)}"
          >
            <input
              type="radio"
              name="stage"
              value="${escapeHtml(stage)}"
              disabled
              ${stage === selected ? "checked" : ""}
            >
            <span>${escapeHtml(stage)}</span>
          </label>
        `
      )
      .join("");
  }

  function updateStageOptions() {
    const selectedType = document.querySelector(
      'input[name="stone-type"]:checked'
    );
    const stageOptions = document.querySelectorAll(".stage-option");

    stageOptions.forEach((option) => {
      const stage = option.dataset.stage;
      const input = option.querySelector('input[name="stage"]');
      if (!input) return;

      const allowed =
        !!selectedType &&
        isValidStageForStoneType(selectedType.value, stage);

      option.classList.toggle("disabled", !allowed);
      input.disabled = !allowed;

      if (!allowed) {
        input.checked = false;
      }
    });
  }

  // توابع عمومی موجود در app.js را با نسخه canonical جایگزین می‌کنیم.
  window.isValidStageForStoneType = isValidStageForStoneType;
  window.renderStageOptions = renderStageOptions;
  window.updateStageOptions = updateStageOptions;
  window.GOLZAR_STAGE_DEFINITIONS = CANONICAL_STAGES;
  window.normalizeGolzarStage = normalizeStage;
})();
