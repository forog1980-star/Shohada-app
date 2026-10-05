"use strict";

(function () {
  /*
   * Safe AI-layer bridge.
   *
   * Rules:
   * 1) Never writes to Supabase.
   * 2) Never replaces existing application functions.
   * 3) Never blocks application startup.
   * 4) If the AI layer fails, the main application continues normally.
   */

  const BRIDGE_NAME = "GOLZAR_AI_LAYER";
  const READY_EVENT = "golzar:ai-layer-ready";

  function safeSnapshot() {
    try {
      const rows = Array.isArray(window.__GOLZAR_LIVE_ROWS__)
        ? window.__GOLZAR_LIVE_ROWS__
        : [];

      return {
        source: rows.length ? "live-rows" : "unavailable",
        rowCount: rows.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("[Golzar AI] snapshot failed:", error);
      return {
        source: "error",
        rowCount: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  function waitForMasterReady(resolve) {
    const started = Date.now();
    const timeoutMs = 15000;

    function check() {
      try {
        if (window.__GOLZAR_MASTER_READY__ === true) {
          resolve(true);
          return;
        }
      } catch (error) {
        console.error("[Golzar AI] readiness check failed:", error);
      }

      if (Date.now() - started >= timeoutMs) {
        console.warn("[Golzar AI] main loader timeout; bridge stays inactive.");
        resolve(false);
        return;
      }

      setTimeout(check, 100);
    }

    check();
  }

  function install() {
    try {
      if (window[BRIDGE_NAME]) {
        console.info("[Golzar AI] bridge already installed.");
        return;
      }

      const api = {
        version: "0.1.0-safe",
        status: "ready",
        getSnapshot: safeSnapshot,
        getLiveRows: function () {
          try {
            return Array.isArray(window.__GOLZAR_LIVE_ROWS__)
              ? window.__GOLZAR_LIVE_ROWS__.slice()
              : [];
          } catch (error) {
            console.error("[Golzar AI] live rows unavailable:", error);
            return [];
          }
        }
      };

      window[BRIDGE_NAME] = api;

      window.dispatchEvent(
        new CustomEvent(READY_EVENT, {
          detail: {
            version: api.version,
            status: api.status,
            snapshot: safeSnapshot()
          }
        })
      );

      console.info("[Golzar AI] safe bridge ready.");
    } catch (error) {
      console.error("[Golzar AI] bridge installation failed:", error);
    }
  }

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      waitForMasterReady(function (ready) {
        if (!ready) return;
        install();
      });
    },
    { once: true }
  );
})();
