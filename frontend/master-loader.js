"use strict";

// ============================================================
// GolzarStone master loader
// این فایل دیگر Excel را به صورت خودکار وارد بانک نمی‌کند.
// انتقال داده توسط import_master_v2.py انجام می‌شود.
// ============================================================

function loadApp() {
  const script = document.createElement("script");
  script.src = "app.js?v=20260822-17";
  script.onload = () => {
    installExactSearch();
    window.__GOLZAR_MASTER_READY__ = true;
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

function addDuplicateNotice(results) {
  const container = document.getElementById("search-results");
  if (!container) return;

  const old = document.getElementById("golzar-duplicate-notice");
  if (old) old.remove();

  const groups = new Map();
  for (const record of results || []) {
    const key = [record.piece, record.grave_row, record.grave_number]
      .map(normalizeExactValue)
      .join("|");
    if (!key.replace(/\|/g, "")) continue;
    groups.set(key, (groups.get(key) || 0) + 1);
  }

  const duplicates = [...groups.entries()].filter(([, count]) => count > 1);
  if (!duplicates.length) return;

  const notice = document.createElement("div");
  notice.id = "golzar-duplicate-notice";
  notice.style.cssText = "margin:12px 0;padding:12px 14px;border-radius:12px;background:#fff4e5;border:1px solid #f0c98b;color:#7a4b00;line-height:1.9;font-family:Tahoma,Arial,sans-serif";
  notice.textContent = `⚠️ در این نتیجه ${duplicates.length} موقعیت مکانی تکراری وجود دارد. رکوردها حذف نشده‌اند؛ برای بررسی مغایرت نگه داشته شده‌اند.`;
  container.parentNode.insertBefore(notice, container);
}

async function exactPerformSearch() {
  const get = id => document.getElementById(id);
  const name = typeof normalizeSearchText === "function" ? normalizeSearchText(get("search-name")?.value) : (get("search-name")?.value || "").trim();
  const lastname = typeof normalizeSearchText === "function" ? normalizeSearchText(get("search-lastname")?.value) : (get("search-lastname")?.value || "").trim();
  const piece = normalizeExactValue(get("search-piece")?.value);
  const row = normalizeExactValue(get("search-row")?.value);
  const number = normalizeExactValue(get("search-number")?.value);
  const status = get("search-status")?.value || "";

  if (!name && !lastname && !piece && !row && !number && !status) {
    alert("حداقل یک معیار جستجو وارد کنید.");
    return;
  }

  if (typeof lastSearchFilters !== "undefined") {
    lastSearchFilters = { name, lastname, piece, row, number, status };
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

      // نام و نام خانوادگی می‌توانند جستجوی متنی باشند؛
      // اما محل مزار باید کاملاً Exact باشد.
      if (name) query = query.ilike("name", `%${name}%`);
      if (lastname) query = query.ilike("lastname", `%${lastname}%`);
      if (piece) query = query.eq("piece", piece);
      if (row) query = query.eq("grave_row", row);
      if (number) query = query.eq("grave_number", number);
      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;

      const batch = data || [];
      results.push(...batch);

      if (batch.length < PAGE) break;
      from += PAGE;
    }

    // حذف تکرار نمایشی بر اساس id؛ رکوردهای واقعی تکراری حذف نمی‌شوند.
    const unique = [];
    const ids = new Set();
    for (const record of results) {
      const id = String(record.id);
      if (ids.has(id)) continue;
      ids.add(id);
      unique.push(record);
    }

    if (typeof lastSearchResults !== "undefined") lastSearchResults = unique;

    if (typeof renderSearchResults === "function") {
      renderSearchResults(unique);
      addDuplicateNotice(unique);
    }
  } catch (error) {
    console.error("Exact search error:", error);
    alert(`خطا در جستجو:\n\n${error.message || error}`);
  }
}

function installExactSearch() {
  // از event delegation و capture استفاده می‌کنیم تا هر بار که صفحه جستجو
  // دوباره ساخته شد، باز هم جستجوی دقیق فعال بماند.
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

// چون master-loader بعد از آماده شدن DOM اجرا می‌شود، مستقیماً app را بالا می‌آوریم.
loadApp();
