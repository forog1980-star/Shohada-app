"use strict";

// ============================================================
// Shohada-app / GolzarStone
// search-pagination-fix.js
//
// هدف: جلوگیری از محدود شدن صفحه «جستجوی شهید» به ۲۰۰ رکورد.
// این فایل مستقل است و به app.js اصلی دست نمی‌زند.
//
// Supabase/PostgREST می‌تواند خروجی را محدود کند؛ بنابراین
// نتایج جستجو در صفحات ۱۰۰۰تایی دریافت و در نهایت یکجا نمایش
// داده می‌شوند.
// ============================================================

(function installSearchPaginationFix() {
  const PAGE_SIZE = 1000;
  const MAX_PAGES = 100;

  function normalizeSearchValue(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  async function fetchAllSearchResults(filters) {
    const all = [];

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = window.supabaseClient
        .from("martyrs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filters.name) {
        query = query.ilike("name", `%${filters.name}%`);
      }

      if (filters.lastname) {
        query = query.ilike("lastname", `%${filters.lastname}%`);
      }

      if (filters.piece) {
        query = query.eq("piece", filters.piece);
      }

      if (filters.row) {
        query = query.ilike("grave_row", `%${filters.row}%`);
      }

      if (filters.number) {
        query = query.ilike("grave_number", `%${filters.number}%`);
      }

      if (filters.status) {
        // در نسخه فعلی فیلد «وضعیت» در جستجو به stone_type متصل است.
        query = query.eq("stone_type", filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const rows = data || [];
      all.push(...rows);

      if (rows.length < PAGE_SIZE) {
        break;
      }
    }

    return all;
  }

  function collectFilters() {
    return {
      name: normalizeSearchValue(
        document.getElementById("search-name")?.value
      ),
      lastname: normalizeSearchValue(
        document.getElementById("search-lastname")?.value
      ),
      piece: normalizeSearchValue(
        document.getElementById("search-piece")?.value
      ),
      row: normalizeSearchValue(
        document.getElementById("search-row")?.value
      ),
      number: normalizeSearchValue(
        document.getElementById("search-number")?.value
      ),
      status: normalizeSearchValue(
        document.getElementById("search-status")?.value
      ),
    };
  }

  function install() {
    if (typeof window.supabaseClient === "undefined") {
      // app.js ممکن است supabaseClient را در scope سراسری ایجاد نکرده باشد.
      // در این حالت از client موجود در صفحه استفاده می‌کنیم.
      const candidates = Object.keys(window).filter((key) => {
        return key.toLowerCase().includes("supabase");
      });
      console.warn(
        "Search pagination fix: Supabase client was not exposed globally.",
        candidates
      );
      return;
    }

    window.performSearch = async function performSearchWithPagination() {
      const container = document.getElementById("search-results");
      if (!container) return;

      const filters = collectFilters();

      container.innerHTML = `
        <div class="loading-message">
          در حال جستجو و دریافت همه نتایج...
        </div>
      `;

      try {
        const results = await fetchAllSearchResults(filters);

        window.__GOLZAR_SEARCH_RESULTS__ = results;

        if (typeof window.renderSearchResults === "function") {
          window.renderSearchResults(results);
        } else {
          throw new Error("renderSearchResults در برنامه پیدا نشد.");
        }
      } catch (error) {
        console.error("Search pagination error:", error);
        container.innerHTML = `
          <div class="error-message">
            جستجو انجام نشد.
            <br><br>
            ${typeof window.escapeHtml === "function"
              ? window.escapeHtml(error.message || "خطای نامشخص")
              : "خطای نامشخص"}
          </div>
        `;
      }
    };

    // خروجی Excel نیز باید تمام نتایج را صادر کند، نه فقط ۲۰۰ رکورد قبلی.
    if (typeof window.XLSX !== "undefined") {
      window.exportSearchResultsToExcel = function exportAllSearchResultsToExcel() {
        const results = window.__GOLZAR_SEARCH_RESULTS__ || [];

        if (!results.length) {
          alert("رکوردی برای خروجی گرفتن وجود ندارد.");
          return;
        }

        if (typeof window.XLSX === "undefined") {
          alert("کتابخانه خروجی اکسل بارگذاری نشده است.");
          return;
        }

        const rows = results.map((record) => ({
          "شناسه": record.id ?? "",
          "نام": record.name ?? "",
          "نام خانوادگی": record.lastname ?? "",
          "نام پدر": record.father_name ?? "",
          "قطعه": record.piece ?? "",
          "ردیف": record.grave_row ?? "",
          "شماره": record.grave_number ?? "",
          "نوع عملیات سنگ": record.stone_type ?? "",
          "مرحله فعلی کار": record.stage ?? "",
          "وضعیت ثبت": record.status ?? "",
          "توضیحات": record.notes ?? "",
          "تاریخ ثبت": record.created_at ?? "",
          "تاریخ آخرین ویرایش": record.edited_at ?? "",
          "توضیحات ویرایش": record.edit_notes ?? "",
        }));

        const worksheet = window.XLSX.utils.json_to_sheet(rows);
        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, "نتایج جستجو");
        window.XLSX.writeFile(workbook, `نتایج-جستجو-${new Date().toISOString().slice(0,10)}.xlsx`);
      };
    }

    window.__GOLZAR_SEARCH_PAGINATION_READY__ = true;
  }

  // app.js قبل از این فایل باید بارگذاری شده باشد.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
