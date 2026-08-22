"use strict";

// ============================================================
// GolzarStone runtime fixes
// - جستجوی بدون اجبار فیلد
// - دریافت همه رکوردها با pagination
// - جزئیات بدون .single() برای جلوگیری از خطای coercion
// - فهرست اطلاعات ثبت‌شده بدون سقف 200 رکورد
// ============================================================

const GOLZAR_PAGE_SIZE = 1000;

function golzarUniqueById(rows) {
  const seen = new Set();
  const out = [];
  for (const row of rows || []) {
    const key = String(row.id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

async function golzarFetchAll(buildQuery) {
  const all = [];
  let from = 0;

  while (true) {
    const query = buildQuery()
      .order("id", { ascending: true })
      .range(from, from + GOLZAR_PAGE_SIZE - 1);

    const { data, error } = await query;
    if (error) throw error;

    const batch = data || [];
    all.push(...batch);

    if (batch.length < GOLZAR_PAGE_SIZE) break;
    from += GOLZAR_PAGE_SIZE;
  }

  return golzarUniqueById(all);
}

// ------------------------------------------------------------
// جستجو: هیچ فیلدی اجباری نیست.
// نام و نام خانوادگی متنی؛ محل مزار Exact؛ نوع عملیات بر اساس stone_type
// ------------------------------------------------------------

async function exactPerformSearch() {
  const get = (id) => document.getElementById(id);

  const name = normalizeSearchText(get("search-name")?.value || "");
  const lastname = normalizeSearchText(get("search-lastname")?.value || "");
  const piece = normalizeSearchText(get("search-piece")?.value || "");
  const row = normalizeSearchText(get("search-row")?.value || "");
  const number = normalizeSearchText(get("search-number")?.value || "");
  const stoneType = get("search-status")?.value || "";
  const container = get("search-results");

  if (!container) return;

  lastSearchFilters = {
    name,
    lastname,
    piece,
    row,
    number,
    status: stoneType,
  };

  container.innerHTML = '<div class="loading-message">در حال جستجو...</div>';

  try {
    const results = await golzarFetchAll(() => {
      let query = supabaseClient.from(TABLE_NAME).select("*");

      if (name) query = query.ilike("name", `%${name}%`);
      if (lastname) query = query.ilike("lastname", `%${lastname}%`);
      if (piece) query = query.eq("piece", piece);
      if (row) query = query.eq("grave_row", row);
      if (number) query = query.eq("grave_number", number);
      if (stoneType) query = query.eq("stone_type", stoneType);

      return query;
    });

    lastSearchResults = results;
    renderSearchResults(results);
  } catch (error) {
    console.error("Golzar search error:", error);
    container.innerHTML = `
      <div class="error-message">
        جستجو انجام نشد.<br><br>
        ${escapeHtml(error.message || String(error))}
      </div>
    `;
  }
}

// ------------------------------------------------------------
// جزئیات رکورد: به جای .single()، اولین رکورد یکتا بر اساس id
// ------------------------------------------------------------

async function showRecordDetail(id, source = "records") {
  const app = document.querySelector(".app");

  app.innerHTML = `
    ${internalHeader(
      "جزئیات اطلاعات شهید",
      source === "search" ? "مشاهده اطلاعات شهید" : "بررسی و تصمیم نهایی کارشناس"
    )}
    <main class="content">
      <div id="detail-container" class="detail-card">
        <div class="loading-message">در حال دریافت اطلاعات...</div>
      </div>
    </main>
  `;

  const goBack = () =>
    source === "search" ? restoreSearchPage() : showPendingRecords(true);

  document.getElementById("back-home").addEventListener("click", goBack);

  let data = null;
  let error = null;

  try {
    const result = await supabaseClient
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .order("id", { ascending: true })
      .limit(1);

    data = result.data && result.data.length ? result.data[0] : null;
    error = result.error;
  } catch (e) {
    error = e;
  }

  const detailContainer = document.getElementById("detail-container");

  if (error || !data) {
    detailContainer.innerHTML = `
      <div class="error-message">
        دریافت اطلاعات انجام نشد.
        <br><br>
        ${escapeHtml(error?.message || "رکورد موردنظر پیدا نشد.")}
      </div>
    `;
    return;
  }

  const status = data.status || STATUS.PENDING;
  const isApproved = status === STATUS.APPROVED;
  const showManagementActions = source === "records";
  const editedAt = getRecordEditedAt(data);

  detailContainer.innerHTML = `
    <div class="detail-title">${escapeHtml(data.name)} ${escapeHtml(data.lastname)}</div>

    <div class="detail-row"><span>شناسه</span><strong>${escapeHtml(data.id)}</strong></div>
    <div class="detail-row"><span>وضعیت ثبت</span><strong>${escapeHtml(status)}</strong></div>
    <div class="detail-row"><span>نوع عملیات سنگ</span><strong>${escapeHtml(data.stone_type)}</strong></div>
    <div class="detail-row"><span>قطعه</span><strong>${toPersianDigits(data.piece)}</strong></div>
    <div class="detail-row"><span>ردیف</span><strong>${escapeHtml(data.grave_row)}</strong></div>
    <div class="detail-row"><span>شماره</span><strong>${escapeHtml(data.grave_number)}</strong></div>
    <div class="detail-row"><span>مرحله فعلی کار</span><strong>${escapeHtml(data.stage)}</strong></div>

    ${getRecordCreatedAt(data) ? `
      <div class="detail-row">
        <span>تاریخ ثبت</span>
        <strong>${escapeHtml(getJalaliDateTime(getRecordCreatedAt(data)))}</strong>
      </div>` : ""}

    ${editedAt ? `
      <div class="detail-row edited-row">
        <span>آخرین ویرایش</span>
        <strong>✏️ ${escapeHtml(getJalaliDateTime(editedAt))}</strong>
      </div>` : ""}

    ${data.edit_notes ? `
      <div class="detail-row edited-row">
        <span>توضیحات ویرایش</span>
        <strong>${escapeHtml(data.edit_notes)}</strong>
      </div>` : ""}

    ${data.notes ? `
      <div class="detail-row">
        <span>توضیحات</span>
        <strong>${escapeHtml(data.notes)}</strong>
      </div>` : ""}

    <div class="detail-actions">
      ${source === "search" ? `
        <button type="button" class="edit-button" id="edit-record">✏️ ویرایش اطلاعات</button>
      ` : ""}

      ${showManagementActions && !isApproved ? `
        <button type="button" class="approve-button" id="approve-record">✓ تأیید این اطلاعات</button>
      ` : ""}

      ${showManagementActions ? `
        <button type="button" class="danger-button" id="delete-detail">حذف این رکورد</button>
      ` : ""}

      <button type="button" class="back-secondary" id="back-records">
        ${source === "search" ? "بازگشت به نتایج جستجو" : "بازگشت به فهرست"}
      </button>
    </div>
  `;

  if (source === "search") {
    document.getElementById("edit-record")?.addEventListener("click", () => showEditRecord(id, "search"));
  }

  if (showManagementActions && !isApproved) {
    document.getElementById("approve-record")?.addEventListener("click", () => approveRecord(id));
  }

  if (showManagementActions) {
    document.getElementById("delete-detail")?.addEventListener("click", () => deleteRecord(id));
  }

  document.getElementById("back-records")?.addEventListener("click", goBack);
}

// ------------------------------------------------------------
// فهرست اطلاعات ثبت‌شده: همه رکوردهای در انتظار تأیید
// ------------------------------------------------------------

async function loadPendingRecords() {
  const container = document.getElementById("pending-container");
  const summary = document.getElementById("records-summary");
  if (!container || !summary) return;

  container.innerHTML = '<div class="loading-message">در حال دریافت اطلاعات تازه...</div>';

  try {
    const records = await golzarFetchAll(() =>
      supabaseClient
        .from(TABLE_NAME)
        .select("*")
        .eq("status", STATUS.PENDING)
    );

    summary.innerHTML = `
      <div class="summary-box warning"><strong>${toPersianDigits(records.length)}</strong><small>در انتظار تأیید</small></div>
      <div class="summary-box"><strong>${toPersianDigits(records.length)}</strong><small>قابل بررسی</small></div>
    `;

    if (!records.length) {
      container.innerHTML = '<div class="empty-message">رکوردی در انتظار تأیید وجود ندارد.</div>';
      return;
    }

    container.innerHTML = records.map(recordSummaryCard).join("");
    records.forEach(record => {
      document.getElementById(`record-summary-${record.id}`)?.addEventListener(
        "click", () => showRecordDetail(record.id, "records")
      );
    });
  } catch (error) {
    showRecordsError(error.message || "خطای غیرمنتظره هنگام دریافت اطلاعات.");
  }
}
