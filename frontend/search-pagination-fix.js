"use strict";

// ============================================================
// Shohada-app / GolzarStone
// search-pagination-fix.js
//
// مستقل از app.js — رفع محدودیت ۲۰۰ رکورد در جستجو.
// ============================================================

(function installSearchPaginationFix() {
  const PAGE_SIZE = 1000;
  const MAX_PAGES = 100;

  const SUPABASE_URL = "https://bafrksgdcmglahyrppfy.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_O5CkSuivysXJf-8hu1IUCA_izu8hWiX";

  let client = null;

  function getClient() {
    if (client) return client;
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("کتابخانه Supabase بارگذاری نشده است.");
    }
    client = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );
    return client;
  }

  function value(id) {
    return String(document.getElementById(id)?.value ?? "").trim();
  }

  async function fetchAllSearchResults(filters) {
    const all = [];
    const sb = getClient();

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = sb
        .from("martyrs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filters.name) query = query.ilike("name", `%${filters.name}%`);
      if (filters.lastname) query = query.ilike("lastname", `%${filters.lastname}%`);
      if (filters.piece) query = query.eq("piece", filters.piece);
      if (filters.row) query = query.ilike("grave_row", `%${filters.row}%`);
      if (filters.number) query = query.ilike("grave_number", `%${filters.number}%`);
      if (filters.status) query = query.eq("stone_type", filters.status);

      const { data, error } = await query;
      if (error) throw error;

      const rows = data || [];
      all.push(...rows);

      if (rows.length < PAGE_SIZE) break;
    }

    return all;
  }

  function install() {
    window.performSearch = async function performSearchWithPagination() {
      const container = document.getElementById("search-results");
      if (!container) return;

      const filters = {
        name: value("search-name"),
        lastname: value("search-lastname"),
        piece: value("search-piece"),
        row: value("search-row"),
        number: value("search-number"),
        status: value("search-status"),
      };

      container.innerHTML = `
        <div class="loading-message">
          در حال جستجو و دریافت همه نتایج...
        </div>
      `;

      try {
        const results = await fetchAllSearchResults(filters);
        window.__GOLZAR_SEARCH_RESULTS__ = results;

        if (typeof window.renderSearchResults !== "function") {
          throw new Error("تابع نمایش نتایج جستجو در برنامه پیدا نشد.");
        }

        window.renderSearchResults(results);
      } catch (error) {
        console.error("Search pagination error:", error);
        container.innerHTML = `
          <div class="error-message">
            جستجو انجام نشد.
            <br><br>
            ${String(error?.message || "خطای نامشخص")}
          </div>
        `;
      }
    };

    window.__GOLZAR_SEARCH_PAGINATION_READY__ = true;
  }

  install();
})();
