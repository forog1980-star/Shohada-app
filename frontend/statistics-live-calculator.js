"use strict";

(function () {
  const REPAIR = "ترمیمی";
  const REPLACEMENT = "تعویضی";
  const APPROVED = "تأیید شده";
  const LEGACY_REPLACEMENT_DONE = "سنگ تعویضی نصب شد";

  const STAGE_DEFINITION = window.GOLZAR_STAGE_DEFINITION || {
    [REPAIR]: [
      "طرح سنگ به واحد مرمت ارسال شد",
      "سنگ مرمتی آماده است",
      "نصب سنگ مرمت شده",
    ],
    [REPLACEMENT]: [
      "طرح سنگ به واحد تعویض ارسال شد",
      "سنگ تعویضی آماده است",
      "تعویضی نصب شده",
    ],
  };

  const REPAIR_STAGES = STAGE_DEFINITION[REPAIR] || [];
  const REPLACEMENT_STAGES = STAGE_DEFINITION[REPLACEMENT] || [];

  const STAGE_ALIASES = {
    [REPAIR]: [
      ["طرح سنگ به واحد مرمت ارسال شد", "ارسال به واحد مرمت", "سنگ آماده ارسال به واحد مرمت"],
      ["سنگ مرمتی آماده است", "سنگ مرمتی آماده"],
      ["نصب سنگ مرمت شده", "نصب مرمتی شده"],
    ],
    [REPLACEMENT]: [
      ["طرح سنگ به واحد تعویض ارسال شد", "ارسال به واحد تعویض", "سنگ آماده ارسال به واحد تعویض"],
      ["سنگ تعویضی آماده است", "سنگ تعویضی آماده"],
      ["تعویضی نصب شده", LEGACY_REPLACEMENT_DONE],
    ],
  };

  const OFFICIAL_PIECES = new Set(
    Array.isArray(STATS?.pieces)
      ? STATS.pieces.map((p) => String(p.piece))
      : []
  );

  function norm(v) {
    return String(v ?? "")
      .trim()
      .replace(/ي/g, "ی")
      .replace(/ى/g, "ی")
      .replace(/ك/g, "ک");
  }

  function typeOf(r) {
    return norm(
      r?.stone_type ??
      r?.stoneType ??
      r?.operation_type ??
      r?.operationType
    );
  }

  function stageOf(r) {
    return norm(
      r?.stage ??
      r?.operation_stage ??
      r?.operationStage
    );
  }

  function pieceOf(r) {
    return norm(
      r?.piece ??
      r?.قطعه ??
      r?.piece_number ??
      r?.pieceNumber
    );
  }

  function statusOf(r) {
    return norm(r?.status);
  }

  function isRequest(r) {
    return statusOf(r) === APPROVED;
  }

  function stageIndex(type, stage) {
    const groups = STAGE_ALIASES[type] || [];
    return groups.findIndex((aliases) =>
      aliases.some((value) => norm(value) === stage)
    );
  }

  function isCompleted(type, stage) {
    return stageIndex(type, stage) === 2;
  }

  function resetStats() {
    STATS.totalRequests = 0;
    STATS.trackedOperations = 0;
    STATS.unclassified = 0;

    STATS.replacement.total = 0;
    STATS.replacement.completed = 0;
    STATS.replacement.remaining = 0;

    STATS.repair.total = 0;
    STATS.repair.completed = 0;
    STATS.repair.remaining = 0;

    STATS.replacementStages = REPLACEMENT_STAGES.map(() => 0);
    STATS.repairStages = REPAIR_STAGES.map(() => 0);

    for (const piece of STATS.pieces) {
      piece.requests = 0;
      piece.replacement = 0;
      piece.replacementDone = 0;
      piece.replacementRemaining = 0;
      piece.repair = 0;
      piece.repairDone = 0;
      piece.repairRemaining = 0;
    }
  }

  function recalculate(rows) {
    resetStats();

    for (const row of rows || []) {
      if (!isRequest(row)) continue;

      STATS.totalRequests += 1;

      const type = typeOf(row);
      const stage = stageOf(row);
      const pieceValue = pieceOf(row);
      const piece = OFFICIAL_PIECES.has(pieceValue)
        ? STATS.pieces.find((p) => String(p.piece) === pieceValue)
        : null;

      if (piece) {
        piece.requests += 1;
      }

      if (type === REPAIR) {
        STATS.repair.total += 1;

        const index = stageIndex(REPAIR, stage);
        if (index >= 0 && STATS.repairStages[index] !== undefined) {
          STATS.repairStages[index] += 1;
        }

        if (isCompleted(REPAIR, stage)) {
          STATS.repair.completed += 1;
          if (piece) piece.repairDone += 1;
        }

        if (piece) piece.repair += 1;
      } else if (type === REPLACEMENT) {
        STATS.replacement.total += 1;

        const index = stageIndex(REPLACEMENT, stage);
        if (index >= 0 && STATS.replacementStages[index] !== undefined) {
          STATS.replacementStages[index] += 1;
        }

        if (isCompleted(REPLACEMENT, stage)) {
          STATS.replacement.completed += 1;
          if (piece) piece.replacementDone += 1;
        }

        if (piece) piece.replacement += 1;
      }
    }

    STATS.repair.remaining =
      STATS.repair.total - STATS.repair.completed;

    STATS.replacement.remaining =
      STATS.replacement.total - STATS.replacement.completed;

    for (const piece of STATS.pieces) {
      piece.repairRemaining =
        piece.repair - piece.repairDone;
      piece.replacementRemaining =
        piece.replacement - piece.replacementDone;
    }

    STATS.trackedOperations =
      STATS.replacement.total + STATS.repair.total;

    STATS.unclassified =
      STATS.totalRequests - STATS.trackedOperations;
  }

  window.addEventListener(
    "golzar:statistics-live",
    (event) => {
      const rows = event?.detail?.rows;

      // bridge-v2 sends the complete current snapshot. Recalculate from
      // that snapshot instead of applying deltas to an old hard-coded baseline.
      if (Array.isArray(rows)) {
        recalculate(rows);

        if (typeof render === "function") {
          render();
        }
      }
    }
  );
})();
