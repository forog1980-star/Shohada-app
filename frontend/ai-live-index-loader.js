"use strict";

(function () {
  /*
   * GolzarStone AI Live Index Loader
   * --------------------------------
   * One read-only live data source for the two active AI POC paths:
   *   1) POC-01 Matching
   *   2) POC-02 Data Intelligence / Data Quality
   *
   * Rules:
   * - public.martyrs is read-only here.
   * - Existing operational functions are not replaced.
   * - Startup is never blocked by this layer.
   * - Realtime changes rebuild the AI index without changing data.
   * - Python POC engines remain the reference implementations.
   */

  const SOURCE_URL = "https://bafrksgdcmglahyrppfy.supabase.co";
  const PUBLISHABLE_KEY =
    "sb_publishable_O5CkSuivysXJf-8hu1IUCA_izu8hWiX";
  const TABLE = "martyrs";
  const PAGE_SIZE = 1000;
  const MAX_PAGES = 100;

  const OFFICIAL_PIECES = new Set([
    "17",
    "24",
    "26",
    "27",
    "28",
    "29",
    "40",
    "53"
  ]);

  const STAGE_ALIASES = {
    "ارسال طرح سنگ به واحد مرمت": "ارسال طرح سنگ به واحد مرمت",
    "سنگ مرمتی آماده نصب است": "سنگ مرمتی آماده نصب است",
    "سنگ مرمت شده نصب شد": "سنگ مرمت شده نصب شد",
    "طرح آماده ارسال به واحد مرمت": "ارسال طرح سنگ به واحد مرمت",
    "طرح سنگ به واحد مرمت ارسال شد": "ارسال طرح سنگ به واحد مرمت",
    "ارسال به واحد مرمت": "ارسال طرح سنگ به واحد مرمت",
    "سنگ آماده ارسال به واحد مرمت": "ارسال طرح سنگ به واحد مرمت",
    "سنگ مرمتی آماده": "سنگ مرمتی آماده نصب است",
    "نصب سنگ مرمت شده": "سنگ مرمت شده نصب شد",
    "نصب مرمتی شده": "سنگ مرمت شده نصب شد",
    "نصب سنگ مرمتی شده": "سنگ مرمت شده نصب شد",

    "ارسال طرح سنگ به واحد تعویض": "ارسال طرح سنگ به واحد تعویض",
    "سنگ تعویضی آماده نصب است": "سنگ تعویضی آماده نصب است",
    "سنگ تعویضی نصب شد": "سنگ تعویضی نصب شد",
    "طرح آماده ارسال به واحد تعویض": "ارسال طرح سنگ به واحد تعویض",
    "طرح سنگ به واحد تعویض ارسال شد": "ارسال طرح سنگ به واحد تعویض",
    "ارسال به واحد تعویض": "ارسال طرح سنگ به واحد تعویض",
    "سنگ آماده ارسال به واحد تعویض": "ارسال طرح سنگ به واحد تعویض",
    "سنگ تعویضی آماده": "سنگ تعویضی آماده نصب است",
    "تعویضی نصب شده": "سنگ تعویضی نصب شد",
    "نصب تعویضی شده": "سنگ تعویضی نصب شد",
    "نصب سنگ تعویضی شده": "سنگ تعویضی نصب شد",
    "نصب سنگ تعویضی آماده شده": "سنگ تعویضی نصب شد"
  };

  const state = {
    status: "initializing",
    rows: [],
    byId: new Map(),
    byIdentity: new Map(),
    byLocation: new Map(),
    byFullKey: new Map(),
    quality: null,
    intelligence: null,
    updatedAt: null,
    error: null,
    channel: null
  };

  function normalize(value) {
    if (value === null || value === undefined) return "";

    let text = String(value)
      .normalize("NFKC")
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/\u200c/g, " ")
      .replace(/\u200d/g, " ")
      .replace(/ـ/g, "")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/[٠-٩۰-۹]/g, function (ch) {
        const arabic = "٠١٢٣٤٥٦٧٨٩";
        const persian = "۰۱۲۳۴۵۶۷۸۹";
        const index =
          arabic.indexOf(ch) >= 0
            ? arabic.indexOf(ch)
            : persian.indexOf(ch);
        return index >= 0 ? String(index) : ch;
      });

    return text.replace(/\s+/g, " ").trim().toLowerCase();
  }

  function value(row, name) {
    if (!row) return "";
    const aliases = {
      lastname: ["lastname", "family", "last_name"],
      father_name: ["father_name", "fatherName"],
      grave_row: ["grave_row", "graveRow"],
      grave_number: ["grave_number", "graveNumber"],
      stone_type: ["stone_type", "stoneType"],
      piece: ["piece", "grave_piece"]
    };

    if (Object.prototype.hasOwnProperty.call(row, name)) {
      return row[name];
    }

    for (const alias of aliases[name] || []) {
      if (Object.prototype.hasOwnProperty.call(row, alias)) {
        return row[alias];
      }
    }

    return "";
  }

  function idOf(row) {
    const id = Number(value(row, "id"));
    return Number.isFinite(id) ? id : null;
  }

  function identityKey(row) {
    return [
      normalize(value(row, "name")),
      normalize(value(row, "lastname"))
    ].join("|");
  }

  function locationKey(row) {
    return [
      normalize(value(row, "piece")),
      normalize(value(row, "grave_row")),
      normalize(value(row, "grave_number"))
    ].join("|");
  }

  function fullKey(row) {
    return [
      identityKey(row),
      normalize(value(row, "piece")),
      normalize(value(row, "grave_row")),
      normalize(value(row, "grave_number"))
    ].join("|");
  }

  function normalizeStage(stage) {
    const raw = normalize(stage);
    return STAGE_ALIASES[raw] || raw;
  }

  function addToMap(map, key, row) {
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }

  function rebuildIndex(rows) {
    state.rows = Array.isArray(rows) ? rows.slice() : [];
    state.byId.clear();
    state.byIdentity.clear();
    state.byLocation.clear();
    state.byFullKey.clear();

    for (const row of state.rows) {
      const id = idOf(row);
      if (id !== null) {
        state.byId.set(id, row);
      }

      addToMap(state.byIdentity, identityKey(row), row);
      addToMap(state.byLocation, locationKey(row), row);

      const fk = fullKey(row);
      if (fk !== "||||") {
        addToMap(state.byFullKey, fk, row);
      }
    }

    rebuildAnalysis();
    window.__GOLZAR_LIVE_ROWS__ = state.rows.slice();
  }

  function rebuildAnalysis() {
    const issueIds = {
      "مرحله خالی": new Set(),
      "نام/هویت تکراری یا چندرکوردی": new Set(),
      "ردیف مزار خالی": new Set(),
      "شماره مزار خالی": new Set(),
      "موقعیت مزار تکراری": new Set(),
      "نوع سنگ خالی": new Set(),
      "قطعه خالی": new Set(),
      "نام خالی": new Set(),
      "خارج از محدوده ۸ قطعه آماری": new Set()
    };

    const incomplete = new Map();
    const stageNormalizations = new Map();
    const stageAnomalies = new Map();

    for (const row of state.rows) {
      const id = idOf(row);
      if (id === null) continue;

      const name = normalize(value(row, "name"));
      const lastname = normalize(value(row, "lastname"));
      const piece = normalize(value(row, "piece"));
      const graveRow = normalize(value(row, "grave_row"));
      const graveNumber = normalize(value(row, "grave_number"));
      const stage = value(row, "stage");
      const normalizedStage = normalizeStage(stage);
      const stoneType = normalize(value(row, "stone_type"));

      if (!name) issueIds["نام خالی"].add(id);
      if (!piece) issueIds["قطعه خالی"].add(id);
      if (!graveRow) issueIds["ردیف مزار خالی"].add(id);
      if (!graveNumber) issueIds["شماره مزار خالی"].add(id);
      if (!stoneType) issueIds["نوع سنگ خالی"].add(id);
      if (!stage || !normalize(stage)) issueIds["مرحله خالی"].add(id);

      const missing = [];
      if (!name) missing.push("name");
      if (!lastname) missing.push("lastname");
      if (!piece) missing.push("piece");
      if (!graveRow) missing.push("grave_row");
      if (!graveNumber) missing.push("grave_number");
      if (missing.length) {
        incomplete.set(id, missing);
      }

      if (piece && !OFFICIAL_PIECES.has(piece)) {
        issueIds["خارج از محدوده ۸ قطعه آماری"].add(id);
      }

      if (
        stage &&
        normalize(stage) &&
        normalizedStage !== normalize(stage)
      ) {
        stageNormalizations.set(id, {
          rawStage: stage,
          normalizedStage
        });
      }

      if (
        stage &&
        normalize(stage) &&
        normalizedStage &&
        !Object.prototype.hasOwnProperty.call(
          STAGE_ALIASES,
          normalize(stage)
        ) &&
        ![
          "ارسال طرح سنگ به واحد مرمت",
          "سنگ مرمتی آماده نصب است",
          "سنگ مرمت شده نصب شد",
          "ارسال طرح سنگ به واحد تعویض",
          "سنگ تعویضی آماده نصب است",
          "سنگ تعویضی نصب شد"
        ].includes(normalizedStage)
      ) {
        stageAnomalies.set(id, {
          rawStage: stage,
          normalizedStage
        });
      }
    }

    for (const rows of state.byIdentity.values()) {
      if (!rows.length) continue;
      const ids = rows.map(idOf).filter((id) => id !== null);
      if (ids.length > 1) {
        ids.forEach((id) => issueIds["نام/هویت تکراری یا چندرکوردی"].add(id));
      }
    }

    for (const rows of state.byLocation.values()) {
      if (!rows.length) continue;
      const complete = rows.filter((row) => {
        const key = locationKey(row).split("|");
        return key.length === 3 && key.every(Boolean);
      });

      if (complete.length > 1) {
        complete
          .map(idOf)
          .filter((id) => id !== null)
          .forEach((id) => issueIds["موقعیت مزار تکراری"].add(id));
      }
    }

    const cleanIds = [];
    const problemIds = [];

    for (const row of state.rows) {
      const id = idOf(row);
      if (id === null) continue;

      let hasProblem = false;
      for (const set of Object.values(issueIds)) {
        if (set.has(id)) {
          hasProblem = true;
          break;
        }
      }

      if (hasProblem) problemIds.push(id);
      else cleanIds.push(id);
    }

    const duplicateGroups = Array.from(state.byFullKey.entries())
      .filter((entry) => entry[1].length > 1)
      .map((entry) => ({
        key: entry[0],
        recordIds: entry[1].map(idOf).filter((id) => id !== null)
      }));

    const identityConflicts = [];
    for (const [key, rows] of state.byIdentity.entries()) {
      if (key === "|" || rows.length < 2) continue;

      const locations = new Set(
        rows
          .map(locationKey)
          .filter((location) => location.split("|").every(Boolean))
      );

      if (locations.size > 1) {
        identityConflicts.push({
          identity: key,
          recordIds: rows.map(idOf).filter((id) => id !== null),
          locations: Array.from(locations)
        });
      }
    }

    const locationConflicts = [];
    for (const [key, rows] of state.byLocation.entries()) {
      if (key === "|||" || rows.length < 2) continue;

      const identities = new Set(
        rows
          .map(identityKey)
          .filter((identity) => identity !== "|")
      );

      if (identities.size > 1) {
        locationConflicts.push({
          location: key,
          recordIds: rows.map(idOf).filter((id) => id !== null),
          identities: Array.from(identities)
        });
      }
    }

    const issueCounts = {};
    for (const [issue, ids] of Object.entries(issueIds)) {
      issueCounts[issue] = ids.size;
    }

    state.quality = {
      totalRecords: state.rows.length,
      clean: cleanIds.length,
      problem: problemIds.length,
      issueCounts,
      issueIds: Object.fromEntries(
        Object.entries(issueIds).map(([issue, ids]) => [
          issue,
          Array.from(ids)
        ])
      )
    };

    state.intelligence = {
      totalRecords: state.rows.length,
      duplicateGroups,
      identityConflicts,
      locationConflicts,
      incompleteRecords: Array.from(incomplete.entries()).map(
        ([id, missingFields]) => ({ id, missingFields })
      ),
      stageNormalizations: Array.from(stageNormalizations.entries()).map(
        ([id, details]) => ({ id, ...details })
      ),
      stageAnomalies: Array.from(stageAnomalies.entries()).map(
        ([id, details]) => ({ id, ...details })
      )
    };
  }

  async function fetchAll() {
    const rows = [];
    let offset = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      const url =
        SOURCE_URL +
        "/rest/v1/" +
        TABLE +
        "?select=*" +
        "&order=id.asc" +
        "&limit=" +
        PAGE_SIZE +
        "&offset=" +
        offset;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          apikey: PUBLISHABLE_KEY,
          Authorization: "Bearer " + PUBLISHABLE_KEY
        },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Supabase HTTP " + response.status);
      }

      const batch = await response.json();

      if (!Array.isArray(batch)) {
        throw new Error("Supabase returned a non-array page");
      }

      rows.push(...batch);

      if (batch.length < PAGE_SIZE) break;

      offset += PAGE_SIZE;
    }

    return rows;
  }

  function publish(source) {
    state.updatedAt = new Date().toISOString();
    state.status = state.error ? "error" : "ready";

    const detail = {
      source,
      status: state.status,
      rowCount: state.rows.length,
      updatedAt: state.updatedAt
    };

    window.dispatchEvent(
      new CustomEvent("golzar:ai-index-ready", { detail })
    );

    window.dispatchEvent(
      new CustomEvent("golzar:ai-data-changed", {
        detail: {
          ...detail,
          quality: state.quality
            ? {
                clean: state.quality.clean,
                problem: state.quality.problem,
                issueCounts: state.quality.issueCounts
              }
            : null
        }
      })
    );
  }

  async function initialSync() {
    try {
      state.status = "loading";
      state.error = null;

      let rows = [];

      if (
        window.GOLZAR_STATISTICS &&
        Array.isArray(window.__GOLZAR_LIVE_ROWS__) &&
        window.__GOLZAR_LIVE_ROWS__.length
      ) {
        rows = window.__GOLZAR_LIVE_ROWS__.slice();
      } else {
        rows = await fetchAll();
      }

      rebuildIndex(rows);
      publish("initial");
    } catch (error) {
      state.status = "error";
      state.error = String(error);
      console.error("[Golzar AI] live index initial sync failed:", error);
      publish("error");
    }
  }

  function applyChanges(changes) {
    if (!Array.isArray(changes) || !changes.length) return;

    const map = new Map(state.rows.map((row) => [idOf(row), row]));

    for (const change of changes) {
      if (change.event === "INSERT" && change.new) {
        const id = idOf(change.new);
        if (id !== null) map.set(id, change.new);
      } else if (change.event === "UPDATE" && change.new) {
        const id = idOf(change.new);
        if (id !== null) map.set(id, change.new);
      } else if (change.event === "DELETE" && change.old) {
        const id = idOf(change.old);
        if (id !== null) map.delete(id);
      }
    }

    rebuildIndex(Array.from(map.values()));
    publish("realtime");
  }

  function startRealtime() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      return;
    }

    try {
      if (window.GOLZAR_STATISTICS) {
        window.addEventListener("golzar:statistics-live", function (event) {
          const detail = event.detail || {};

          if (detail.initial && Array.isArray(detail.rows)) {
            rebuildIndex(detail.rows);
            publish("statistics-bridge");
          } else if (Array.isArray(detail.changes)) {
            applyChanges(detail.changes);
          }
        });
        return;
      }

      const client = window.supabase.createClient(
        SOURCE_URL,
        PUBLISHABLE_KEY
      );

      state.channel = client
        .channel("golzar-ai-live-index-v1")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: TABLE
          },
          function (payload) {
            applyChanges([
              {
                event: payload.eventType,
                old: payload.old || null,
                new: payload.new || null
              }
            ]);
          }
        )
        .subscribe(function (status) {
          console.info(
            "[Golzar AI] Realtime status:",
            status
          );
        });
    } catch (error) {
      console.error("[Golzar AI] Realtime start failed:", error);
    }
  }

  function snapshot() {
    return {
      status: state.status,
      source: "Supabase public.martyrs",
      rowCount: state.rows.length,
      updatedAt: state.updatedAt,
      error: state.error
    };
  }

  const api = {
    version: "0.2.0-live-index",
    status: "initializing",
    source: "Supabase public.martyrs",

    refresh: initialSync,
    getSnapshot: snapshot,
    getLiveRows: function () {
      return state.rows.slice();
    },

    matching: {
      getById: function (id) {
        return state.byId.get(Number(id)) || null;
      },
      findExact: function (record) {
        const rows = state.byFullKey.get(fullKey(record)) || [];
        return rows.slice();
      },
      findByIdentity: function (record) {
        return (state.byIdentity.get(identityKey(record)) || []).slice();
      },
      findByLocation: function (record) {
        return (state.byLocation.get(locationKey(record)) || []).slice();
      },
      indexSizes: function () {
        return {
          ids: state.byId.size,
          identities: state.byIdentity.size,
          locations: state.byLocation.size,
          fullKeys: state.byFullKey.size
        };
      }
    },

    dataQuality: {
      getSummary: function () {
        if (!state.quality) return null;

        return {
          totalRecords: state.quality.totalRecords,
          clean: state.quality.clean,
          problem: state.quality.problem,
          issueCounts: { ...state.quality.issueCounts }
        };
      },
      getIssueIds: function (issue) {
        return state.quality &&
          state.quality.issueIds &&
          state.quality.issueIds[issue]
          ? state.quality.issueIds[issue].slice()
          : [];
      }
    },

    dataIntelligence: {
      getSummary: function () {
        if (!state.intelligence) return null;

        return {
          totalRecords: state.intelligence.totalRecords,
          duplicateGroups: state.intelligence.duplicateGroups.length,
          identityConflicts: state.intelligence.identityConflicts.length,
          locationConflicts: state.intelligence.locationConflicts.length,
          incompleteRecords: state.intelligence.incompleteRecords.length,
          stageNormalizations: state.intelligence.stageNormalizations.length,
          stageAnomalies: state.intelligence.stageAnomalies.length
        };
      }
    }
  };

  window.GOLZAR_AI_INDEX = api;

  window.addEventListener("golzar:statistics-live", function (event) {
    const detail = event.detail || {};
    if (detail.initial && Array.isArray(detail.rows)) {
      rebuildIndex(detail.rows);
      publish("statistics-bridge");
    } else if (Array.isArray(detail.changes)) {
      applyChanges(detail.changes);
    }
  });

  function waitForMasterReady() {
    const started = Date.now();
    const timeoutMs = 15000;

    function check() {
      if (window.__GOLZAR_MASTER_READY__ === true) {
        initialSync();
        startRealtime();
        return;
      }

      if (Date.now() - started >= timeoutMs) {
        console.warn(
          "[Golzar AI] main loader timeout; AI index remains inactive."
        );
        return;
      }

      setTimeout(check, 100);
    }

    check();
  }

  document.addEventListener("DOMContentLoaded", waitForMasterReady, {
    once: true
  });
})();