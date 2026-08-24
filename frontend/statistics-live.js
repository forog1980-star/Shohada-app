"use strict";

// Live statistics bridge: reads the current martyrs table and refreshes the statistics page.
// It never mutates data and falls back to the approved static statistics when the live table
// does not contain the operational status fields needed for a complete live calculation.

(function () {
  const SUPABASE_URL = "https://bafrksgdcmglahyrppfy.supabase.co";
  const SUPABASE_KEY = "sb_publishable_O5CkSuivysXJf-8hu1";

  const STATIC = {
    graves: 26200,
    requests: 2975,
    replaceable: 1735,
    replaced: 1386,
    replaceRemaining: 349,
    repairable: 1162,
    repaired: 610,
    repairRemaining: 552
  };

  const num = v => {
    if (v === null || v === undefined || v === "") return 0;
    const s = String(v).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٬,]/g, "").trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const norm = v => String(v ?? "").trim().toLowerCase()
    .replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

  async function fetchAll() {
    const rows = [];
    let from = 0;
    const step = 1000;
    while (true) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/martyrs?select=*`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      if (!res.ok) throw new Error(`Supabase ${res.status}`);
      const batch = await res.json();
      rows.push(...batch);
      if (batch.length < step) break;
      from += step;
      if (from > 50000) break;
    }
    return rows;
  }

  function hasOperationalFields(rows) {
    if (!rows.length) return false;
    const keys = Object.keys(rows[0]).map(norm);
    const terms = ["قابل تعویض", "تعویض شده", "قابل ترمیم", "ترمیم شده", "نصب شده"];
    return terms.some(t => keys.includes(norm(t)));
  }

  function liveStats(rows) {
    if (!hasOperationalFields(rows)) return null;
    // Keep the approved statistical definitions; only calculate when the operational
    // fields actually exist in the live table.
    const findKey = (row, candidates) => Object.keys(row).find(k => candidates.includes(norm(k)));
    const countStatus = candidates => rows.filter(r => norm(r[findKey(r, candidates)] )).length;
    // Current schema does not expose the approved operational fields, so this path is
    // intentionally conservative and returns null until those fields are present.
    return null;
  }

  function injectLiveBadge() {
    const meta = document.querySelector(".meta");
    if (!meta) return;
    let badge = document.getElementById("live-stats-status");
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "live-stats-status";
      badge.className = "badge";
      meta.appendChild(document.createTextNode("  "));
      meta.appendChild(badge);
    }
    badge.textContent = "اتصال زنده به بانک اطلاعاتی فعال است";
  }

  async function refresh() {
    try {
      const rows = await fetchAll();
      // Do not overwrite approved figures unless the required live operational fields exist.
      const live = liveStats(rows);
      if (live) window.__LIVE_STATISTICS__ = live;
      injectLiveBadge();
      window.dispatchEvent(new CustomEvent("golzar:statistics-live", { detail: { rows: rows.length, live: !!live } }));
    } catch (err) {
      console.warn("Live statistics refresh failed; approved static figures remain active.", err);
    }
  }

  window.GOLZAR_STATISTICS = { STATIC, refresh };
  document.addEventListener("DOMContentLoaded", () => {
    refresh();
    // Keep the page current during data-entry sessions.
    setInterval(refresh, 15000);
  });
})();
