"use strict";

// ============================================================
// GolzarStone master loader
// ============================================================
// Excel به صورت خودکار وارد بانک نمی‌شود.
// انتقال داده فقط با ExcelData/import_master_v2.py انجام می‌شود.
// ============================================================

function loadApp() {
  const script = document.createElement("script");
  script.src = "app.js?v=20260822-18";

  script.onload = () => {
    installExactSearch();

    // اصلاحات runtime بعد از app.js بارگذاری می‌شوند.
    const fix = document.createElement("script");
    fix.src = "runtime-fix.js?v=20260823-19";
    fix.onload = () => {
      window.__GOLZAR_MASTER_READY__ = true;
    };
    fix.onerror = () => {
      console.error("GolzarStone runtime-fix.js failed to load.");
      window.__GOLZAR_MASTER_READY__ = true;
    };
    document.body.appendChild(fix);
  };

  script.onerror = () => {
    document.body.innerHTML = '<div dir="rtl" style="padding:30px;font-family:Tahoma;text-align:center">❌ بارگذاری برنامه انجام نشد.</div>';
  };

  document.body.appendChild(script);
}

function normalizeExactValue(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .trim()
    .replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\.0$/, "");
}

// ------------------------------------------------------------
// جستجوی دقیق
// محل مزار Exact است.
// هیچ فیلدی اجباری نیست؛ جستجوی خالی = کل بانک.
// ------------------------------------------------------------

async function exactPerformSearch() {
  const get = id => document.getElementById(id);

  const name = typeof normalizeSearchText === "function"
    ? normalizeSearchText(get("search-name")?.value || "")
    : (get("search-name")?.value || "").trim();

  const lastname = typeof normalizeSearchText === "function"
    ? normalizeSearchText(get("search-lastname")?.value || "")
    : (get("search-lastname")?.value || "").trim();

  const piece = normalizeExactValue(get("search-piece")?.value);
  const row = normalizeExactValue(get("search-row")?.value);
  const number = normalizeExactValue(get("search-number")?.value);
  const stoneType = get("search-status")?.value || "";

  if (typeof lastSearchFilters !== "undefined") {
    lastSearchFilters = { name, lastname, piece, row, number, status: stoneType };
  }

  const container = get("search-results");
  if (container) {
    container.innerHTML = '<div class="loading-message">در حال جستجو...</div>';
  }

  const results = [];
  const PAGE = 1000;
  let from = 0;

  try {
    while (true) {
      let query = supabaseClient
        .from(TABLE_NAME)
        .select("*")
        .order("id", { ascending: true })
        .range(from, from + PAGE - 1);

      if (name) query = query.ilike("name", `%${name}%`);
      if (lastname) query = query.ilike("lastname", `%${lastname}%`);
      if (piece) query = query.eq("piece", piece);
      if (row) query = query.eq("grave_row", row);
      if (number) query = query.eq("grave_number", number);
      if (stoneType) query = query.eq("stone_type", stoneType);

      const { data, error } = await query;
      if (error) throw error;

      const batch = data || [];
      results.push(...batch);

      if (batch.length < PAGE) break;
      from += PAGE;
    }

    const unique = [];
    const ids = new Set();
    for (const record of results) {
      const id = String(record.id);
      if (ids.has(id)) continue;
      ids.add(id);
      unique.push(record);
    }

    if (typeof lastSearchResults !== "undefined") {
      lastSearchResults = unique;
    }

    if (typeof renderSearchResults === "function") {
      renderSearchResults(unique);
    }
  } catch (error) {
    console.error("Exact search error:", error);
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          جستجو انجام نشد.<br><br>
          ${typeof escapeHtml === "function" ? escapeHtml(error.message || String(error)) : (error.message || String(error))}
        </div>
      `;
    }
  }
}

function installExactSearch() {
  document.addEventListener("click", event => {
    const button = event.target.closest?.("#search-button");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    exactPerformSearch();
  }, true);

  document.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    const target = event.target;
    if (!target?.matches?.("#search-name,#search-lastname,#search-piece,#search-row,#search-number")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    exactPerformSearch();
  }, true);
}

loadApp();
