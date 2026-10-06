"use strict";
(function () {
  const REPAIR = "ترمیمی";
  const REPLACEMENT = "تعویضی";
  const STATISTICAL_PIECES = new Set(["17","24","26","27","28","29","40","53"]);
  const normalize = v => String(v ?? "")
    .trim()
    .replace(/ي/g,"ی")
    .replace(/ى/g,"ی")
    .replace(/ك/g,"ک");

  const typeOf = r => normalize(r?.stone_type ?? r?.stoneType ?? r?.operation_type ?? r?.operationType);
  const stageOf = r => normalize(r?.stage ?? r?.operation_stage ?? r?.operationStage);
  const statusOf = r => normalize(r?.status);

  const isApproved = r => statusOf(r) === "تأیید شده";
  const inStatisticalScope = r => STATISTICAL_PIECES.has(normalize(r?.piece));

  function isDone(type, stage) {
    const s = stageOf(stage);
    if (type === REPAIR) {
      return s === "نصب سنگ مرمت شده" || s === "نصب مرمتی شده";
    }
    if (type === REPLACEMENT) {
      return s === "سنگ تعویضی نصب شد" || s === "تعویضی نصب شده";
    }
    return false;
  }

  function stageIndex(type, stage) {
    const s = stageOf(stage);
    if (type === REPAIR) {
      if (s === "طرح سنگ به واحد مرمت ارسال شد") return 0;
      if (s === "سنگ مرمتی آماده است" || s === "سنگ مرمتی آماده") return 1;
      if (isDone(REPAIR, s)) return 2;
    }
    if (type === REPLACEMENT) {
      if (s === "طرح سنگ به واحد تعویض ارسال شد" || s === "ارسال به واحد تعویض") return 0;
      if (s === "سنگ تعویضی آماده") return 1;
      if (isDone(REPLACEMENT, s)) return 2;
    }
    return -1;
  }

  function emptyPiece(piece, total) {
    return {
      piece,
      total,
      requests: 0,
      replacement: 0,
      replacementDone: 0,
      replacementRemaining: 0,
      repair: 0,
      repairDone: 0,
      repairRemaining: 0
    };
  }

  function rebuild(rows) {
    const basePieces = Array.isArray(STATS?.pieces) ? STATS.pieces : [];
    const pieceTotals = new Map(basePieces.map(p => [normalize(p.piece), p.total]));
    const pieces = [...STATISTICAL_PIECES]
      .sort((a,b) => Number(a) - Number(b))
      .map(piece => emptyPiece(piece, pieceTotals.get(piece) ?? 0));

    const pieceMap = new Map(pieces.map(p => [p.piece, p]));
    let totalRequests = 0;
    let trackedOperations = 0;
    let replacementTotal = 0;
    let replacementDone = 0;
    let repairTotal = 0;
    let repairDone = 0;
    const replacementStages = [0,0,0];
    const repairStages = [0,0,0];

    for (const row of rows || []) {
      if (!isApproved(row) || !inStatisticalScope(row)) continue;

      totalRequests++;
      const piece = pieceMap.get(normalize(row.piece));
      const type = typeOf(row);
      const done = isDone(type, row.stage);
      const idx = stageIndex(type, row.stage);

      if (piece) piece.requests++;

      if (type === REPLACEMENT) {
        trackedOperations++;
        replacementTotal++;
        if (piece) {
          piece.replacement++;
          if (done) piece.replacementDone++;
        }
        if (done) replacementDone++;
        if (idx >= 0) replacementStages[idx]++;
      } else if (type === REPAIR) {
        trackedOperations++;
        repairTotal++;
        if (piece) {
          piece.repair++;
          if (done) piece.repairDone++;
        }
        if (done) repairDone++;
        if (idx >= 0) repairStages[idx]++;
      }
    }

    for (const piece of pieces) {
      piece.replacementRemaining = piece.replacement - piece.replacementDone;
      piece.repairRemaining = piece.repair - piece.repairDone;
    }

    STATS.totalRequests = totalRequests;
    STATS.trackedOperations = trackedOperations;
    STATS.unclassified = totalRequests - trackedOperations;
    STATS.replacement = {
      total: replacementTotal,
      completed: replacementDone,
      remaining: replacementTotal - replacementDone
    };
    STATS.repair = {
      total: repairTotal,
      completed: repairDone,
      remaining: repairTotal - repairDone
    };
    STATS.replacementStages = replacementStages;
    STATS.repairStages = repairStages;
    STATS.pieces = pieces;
  }

  const seenRows = new Map();

  function applyInitial(rows) {
    seenRows.clear();
    for (const row of rows || []) {
      const id = Number(row?.id ?? row?.ID);
      if (Number.isFinite(id)) seenRows.set(id, row);
    }
    rebuild(Array.from(seenRows.values()));
  }

  function applyChange(change) {
    const oldRow = change?.old || null;
    const newRow = change?.new || null;
    const id = Number(newRow?.id ?? oldRow?.id ?? newRow?.ID ?? oldRow?.ID);

    if (!Number.isFinite(id)) return;

    if (change?.event === "DELETE") {
      seenRows.delete(id);
    } else if (change?.event === "INSERT" || change?.event === "UPDATE") {
      seenRows.set(id, newRow);
    }

    rebuild(Array.from(seenRows.values()));
  }

  window.addEventListener("golzar:statistics-live", event => {
    const detail = event.detail || {};
    if (detail.initial) {
      applyInitial(detail.rows || []);
    } else {
      for (const change of detail.changes || []) applyChange(change);
    }
    if (typeof render === "function") render();
  });
})();