"use strict";
(function () {
  const REPAIR = "ترمیمی";
  const REPLACEMENT = "تعویضی";

  const normalize = v =>
    String(v ?? "").trim().replace(/ي/g, "ی").replace(/ى/g, "ی").replace(/ك/g, "ک");

  const typeOf = r =>
    normalize(r?.stone_type ?? r?.stoneType ?? r?.operation_type ?? r?.operationType);

  const stageOf = r =>
    normalize(r?.stage ?? r?.operation_stage ?? r?.operationStage);

  const statusOf = r => normalize(r?.status);

  const isRequest = r => statusOf(r) === "تأیید شده";

  const isDone = (type, stage) => {
    const s = normalize(stage);

    if (type === REPAIR) {
      return s === "سنگ مرمت شده نصب شد" ||
             s === "نصب سنگ مرمت شده" ||
             s === "نصب مرمتی شده";
    }

    if (type === REPLACEMENT) {
      return s === "سنگ تعویضی نصب شد" ||
             s === "تعویضی نصب شده";
    }

    return false;
  };

  const stageIndex = (type, stage) => {
    const s = normalize(stage);

    if (type === REPAIR) {
      if (s === "ارسال طرح سنگ به واحد مرمت") return 0;
      if (s === "سنگ مرمتی آماده نصب است") return 1;
      if (isDone(type, s)) return 2;
    }

    if (type === REPLACEMENT) {
      if (s === "ارسال طرح سنگ به واحد تعویض") return 0;
      if (s === "سنگ تعویضی آماده نصب است") return 1;
      if (isDone(type, s)) return 2;
    }

    return -1;
  };

  const seenIds = new Set();

  function resetStats() {
    STATS.totalRequests = 0;
    STATS.trackedOperations = 0;
    STATS.unclassified = 0;

    STATS.repair.total = 0;
    STATS.repair.completed = 0;
    STATS.repair.remaining = 0;

    STATS.replacement.total = 0;
    STATS.replacement.completed = 0;
    STATS.replacement.remaining = 0;

    STATS.repairStages = [0, 0, 0];
    STATS.replacementStages = [0, 0, 0];
  }

  function contribution(r, sign = 1) {
    if (!r || !isRequest(r)) return;

    const t = typeOf(r);
    const stage = stageOf(r);
    const done = isDone(t, stage);
    const idx = stageIndex(t, stage);

    STATS.totalRequests += sign;

    if (t === REPAIR) {
      STATS.repair.total += sign;
      STATS.repair.remaining += sign;

      if (done) {
        STATS.repair.completed += sign;
        STATS.repair.remaining -= sign;
      }

      if (idx >= 0) STATS.repairStages[idx] += sign;

    } else if (t === REPLACEMENT) {
      STATS.replacement.total += sign;
      STATS.replacement.remaining += sign;

      if (done) {
        STATS.replacement.completed += sign;
        STATS.replacement.remaining -= sign;
      }

      if (idx >= 0) STATS.replacementStages[idx] += sign;
    }

    STATS.trackedOperations =
      STATS.replacement.total + STATS.repair.total;

    STATS.unclassified =
      STATS.totalRequests - STATS.trackedOperations;
  }

  function applyInitial(rows) {
    seenIds.clear();
    resetStats();

    for (const r of rows || []) {
      const id = Number(r?.id ?? r?.ID);

      if (Number.isFinite(id)) {
        seenIds.add(id);
      }

      contribution(r, 1);
    }

    console.info(
      "[Golzar statistics] rebuilt from Supabase:",
      {
        totalRequests: STATS.totalRequests,
        replacement: STATS.replacement,
        repair: STATS.repair,
        replacementStages: STATS.replacementStages,
        repairStages: STATS.repairStages,
        trackedOperations: STATS.trackedOperations,
        unclassified: STATS.unclassified
      }
    );
  }

  function applyChange(c) {
    const oldR = c?.old || null;
    const newR = c?.new || null;

    if (c?.event === "INSERT") {
      const id = Number(newR?.id ?? newR?.ID);

      if (Number.isFinite(id) && seenIds.has(id)) return;

      if (Number.isFinite(id)) seenIds.add(id);

      contribution(newR, 1);
      return;
    }

    if (c?.event === "DELETE") {
      const id = Number(oldR?.id ?? oldR?.ID);

      if (Number.isFinite(id)) seenIds.delete(id);

      contribution(oldR, -1);
      return;
    }

    if (c?.event === "UPDATE") {
      const id = Number(
        newR?.id ??
        oldR?.id ??
        newR?.ID ??
        oldR?.ID
      );

      if (Number.isFinite(id)) seenIds.add(id);

      contribution(oldR, -1);
      contribution(newR, 1);
    }
  }

  window.addEventListener("golzar:statistics-live", event => {
    const detail = event.detail || {};

    if (detail.initial) {
      applyInitial(detail.rows || []);
    } else {
      for (const c of detail.changes || []) {
        applyChange(c);
      }
    }

    if (typeof render === "function") render();
  });
})();
