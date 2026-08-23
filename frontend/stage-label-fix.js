"use strict";

// ============================================================
// Canonical operation-stage labels
// Runtime-only compatibility layer: no new columns, no DB schema changes.
// ============================================================

const GOLZAR_CANONICAL_STAGE = {
  "ارسال به واحد مرمت": "طرح سنگ ارسال به واحد مرمت",
  "نصب مرمتی شده": "نصب سنگ مرمت شده",
  "ارسال به واحد تعویض": "طرح سنگ ارسال به واحد تعویض",
  "تعویضی نصب شده": "نصب سنگ تعویض شده"
};

const GOLZAR_CANONICAL_STAGE_LIST = [
  "طرح سنگ ارسال به واحد مرمت",
  "سنگ مرمتی آماده",
  "نصب سنگ مرمت شده",
  "طرح سنگ ارسال به واحد تعویض",
  "سنگ تعویضی آماده",
  "نصب سنگ تعویض شده"
];

function golzarCanonicalStage(value) {
  const text = String(value || "").trim();
  return GOLZAR_CANONICAL_STAGE[text] || text;
}

// اعتبارسنجی را بدون دستکاری STAGES اصلی، با عناوین رسمی سازگار می‌کند.
window.isValidStageForStoneType = function (stoneType, stage) {
  if (!stoneType || !stage) return false;
  const s = golzarCanonicalStage(stage);
  if (stoneType === "ترمیمی") {
    return GOLZAR_CANONICAL_STAGE_LIST.slice(0, 3).includes(s);
  }
  if (stoneType === "تعویضی") {
    return GOLZAR_CANONICAL_STAGE_LIST.slice(3).includes(s);
  }
  return false;
};

function patchStageInputs(root = document) {
  root.querySelectorAll?.('input[name="stage"]').forEach((input) => {
    const oldValue = input.value;
    const canonical = golzarCanonicalStage(oldValue);
    if (canonical !== oldValue) input.value = canonical;

    const label = input.closest("label");
    if (label) {
      const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let node;
      while ((node = walker.nextNode())) nodes.push(node);
      nodes.forEach((textNode) => {
        const replaced = golzarCanonicalStage(textNode.nodeValue);
        if (replaced !== textNode.nodeValue) textNode.nodeValue = replaced;
      });
    }
  });

  // نمایش مرحله در کارت‌ها/جزئیات/خروجی‌های HTML
  root.querySelectorAll?.(".detail-row strong, .record-card, .record-summary").forEach((el) => {
    if (el.children.length) return;
    const replaced = golzarCanonicalStage(el.textContent);
    if (replaced !== el.textContent) el.textContent = replaced;
  });
}

function installCanonicalStageLabels() {
  patchStageInputs(document);
  if (window.__GOLZAR_STAGE_OBSERVER__) return;
  const observer = new MutationObserver(() => patchStageInputs(document));
  observer.observe(document.body, { childList: true, subtree: true });
  window.__GOLZAR_STAGE_OBSERVER__ = observer;
}

window.installCanonicalStageLabels = installCanonicalStageLabels;
