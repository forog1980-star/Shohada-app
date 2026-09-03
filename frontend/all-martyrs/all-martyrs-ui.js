"use strict";

const AllMartyrsUI = (() => {
  const TYPE_LABELS = {
    martyr: "شهید",
    unknown_martyr: "شهید گمنام",
    non_martyr: "غیرشهید — اموات"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function card(record) {
    const fullName = [record.first_name, record.last_name].filter(Boolean).join(" ") || TYPE_LABELS[record.record_type];
    const father = record.father_name || "—";
    const birth = record.birth_date.display || "—";
    const death = record.death_date.display || "—";
    const location = [record.grave_piece, record.grave_row, record.grave_number].filter(Boolean).join(" / ") || "—";

    return `<article class="all-martyrs-card" data-record-id="${escapeHtml(record.id)}">
      <div class="all-martyrs-card-head">
        <h3>${escapeHtml(fullName)}</h3>
        <span class="all-martyrs-type all-martyrs-type-${escapeHtml(record.record_type)}">${escapeHtml(TYPE_LABELS[record.record_type])}</span>
      </div>
      <div class="all-martyrs-grid">
        <div><span>نام پدر</span><strong>${escapeHtml(father)}</strong></div>
        <div><span>جنسیت</span><strong>${escapeHtml(record.gender || "—")}</strong></div>
        <div><span>تولد</span><strong>${escapeHtml(birth)}</strong></div>
        <div><span>شهادت</span><strong>${escapeHtml(death)}</strong></div>
        <div><span>سن</span><strong>${escapeHtml(record.age_display || "—")}</strong></div>
        <div><span>عملیات / دسته‌بندی</span><strong>${escapeHtml(record.martyrdom_category || "—")}</strong></div>
        <div><span>محل شهادت</span><strong>${escapeHtml(record.martyrdom_location || "—")}</strong></div>
        <div><span>مزار</span><strong>${escapeHtml(location)}</strong></div>
      </div>
    </article>`;
  }

  function render(container, records, total) {
    container.innerHTML = `
      <div class="all-martyrs-result-summary">
        <strong>تعداد کل نتایج: ${Number(total).toLocaleString("fa-IR")}</strong>
        <span>نمایش فعلی: ${Number(records.length).toLocaleString("fa-IR")}</span>
      </div>
      <div class="all-martyrs-results">
        ${records.length ? records.map(card).join("") : '<div class="all-martyrs-empty">نتیجه‌ای پیدا نشد.</div>'}
      </div>`;
  }

  return { render, card, TYPE_LABELS };
})();
