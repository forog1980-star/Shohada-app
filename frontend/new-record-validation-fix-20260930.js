"use strict";

// GolzarStone — new-record validation fix (2026-09-30)
// Replaces the old final-qa save override for the QA branch.
// No schema changes and no automatic data mutation.

function getCanonicalStageDefinition() {
  return window.GOLZAR_STAGE_DEFINITION || {
    "ترمیمی": [
      "طرح سنگ به واحد مرمت ارسال شد",
      "سنگ مرمتی آماده است",
      "نصب سنگ مرمت شده",
    ],
    "تعویضی": [
      "طرح سنگ به واحد تعویض ارسال شد",
      "سنگ تعویضی آماده است",
      "سنگ تعویضی نصب شد",
    ],
  };
}

let syncingNewRecordStages = false;
let newRecordMatchReviewed = false;
let newRecordSaveInFlight = false;

// نتایج پیدا شده در بررسی قبلی برای کلیک/بررسی بعدی نگه داشته می‌شوند.
// Cache فقط یک لایه سرعت است و جایگزین جستجوی تکمیلی Supabase نیست.
let newRecordCandidateCache = [];
const NEW_RECORD_MATCH_STATUS_DELAY_MS = 5500;
const NEW_RECORD_TARGET_LIMIT = 200;

function syncNewRecordStageOptions() {
  if (syncingNewRecordStages) return;
  const list = document.getElementById("stage-list");
  if (!list) return;

  const stages = getCanonicalStageDefinition();
  const selectedType =
    document.querySelector('input[name="stone-type"]:checked')?.value || "";
  const allowed = new Set(stages[selectedType] || []);

  syncingNewRecordStages = true;
  try {
    list.querySelectorAll('input[name="stage"]').forEach((input, index) => {
      const type = index < 3 ? "ترمیمی" : "تعویضی";
      const stage = (stages[type] || [])[index % 3] || "";
      const option = input.closest(".stage-option");
      const enabled = !!stage && allowed.has(stage);

      input.value = stage;
      input.disabled = !enabled;
      if (!enabled && input.checked) input.checked = false;

      if (option) {
        option.dataset.stage = stage;
        option.classList.toggle("disabled", !enabled);
        const span = option.querySelector("span");
        if (span) span.textContent = stage;
      }
    });

    ensureOptionalStageHint();
  } finally {
    syncingNewRecordStages = false;
  }
}

function ensureOptionalStageHint() {
  const list = document.getElementById("stage-list");
  if (!list) return;

  let hint = document.getElementById("new-record-stage-optional-hint");
  if (!hint) {
    hint = document.createElement("div");
    hint.id = "new-record-stage-optional-hint";
    hint.style.cssText =
      "margin-top:10px;padding:10px 12px;border-radius:12px;" +
      "background:#f4f7f5;border:1px solid #dce6df;color:#5f6d66;" +
      "font-size:13px;line-height:1.8;";
    list.insertAdjacentElement("afterend", hint);
  }

  hint.textContent =
    "انتخاب مرحله فعلی اختیاری است. اگر مرحله هنوز مشخص نشده، این بخش را خالی بگذارید؛ " +
    "بعداً می‌توان مرحله واقعی را ثبت یا به‌روزرسانی کرد.";
}

function getMatchContainer() {
  const button = document.getElementById("save-new");
  if (!button) return null;

  let box = document.getElementById("new-record-match-warning");
  if (!box) {
    box = document.createElement("div");
    box.id = "new-record-match-warning";
    box.style.cssText =
      "margin:12px 0 4px;padding:14px;border-radius:16px;" +
      "border:1px solid #dce6df;background:#fff;line-height:1.9;";
    button.insertAdjacentElement("beforebegin", box);
  }
  return box;
}

function clearMatchWarning() {
  const box = document.getElementById("new-record-match-warning");
  if (box) {
    box.innerHTML = "";
    box.style.background = "#fff";
    box.style.borderColor = "#dce6df";
  }
}

function escapeMatch(value) {
  if (typeof escapeHtml === "function") return escapeHtml(value ?? "");
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function candidateHtml(item) {
  const r = item?.record || {};
  const score = Math.round(Number(item?.score || 0) * 100);
  return `
    <div style="padding:10px 0;border-top:1px solid #e6ece8;">
      <strong>${escapeMatch(r.name)} ${escapeMatch(r.lastname)}</strong>
      <div style="font-size:13px;color:#5f6d66;">
        قطعه ${escapeMatch(r.piece || "—")}
        · ردیف ${escapeMatch(r.grave_row || "—")}
        · شماره ${escapeMatch(r.grave_number || "—")}
      </div>
      ${r.father_name ? `
        <div style="font-size:12px;color:#708078;">
          نام پدر: ${escapeMatch(r.father_name)}
        </div>` : ""}
      ${item.reasons?.length ? `
        <div style="font-size:12px;color:#708078;">
          ${item.reasons.map(escapeMatch).join(" · ")}
        </div>` : ""}
      <div style="font-size:11px;color:#8a9891;">
        امتیاز تطبیق محاسباتی: ${score}٪
      </div>
    </div>`;
}

function showExactWarning(result) {
  const box = getMatchContainer();
  if (!box) return;
  box.style.background = "#fff5f5";
  box.style.borderColor = "#e3aaaa";
  box.innerHTML = `
    <div style="font-weight:800;color:#9d2f2f;font-size:16px;">
      ⛔ رکورد دقیق موجود است؛ ثبت مجدد متوقف شد.
    </div>
    <div style="margin-top:6px;color:#6f3c3c;">
      نام، نام خانوادگی و محل مزار با رکورد موجود یکسان است.
      ابتدا رکورد موجود را بررسی کنید.
    </div>
    ${result.exact.map(candidateHtml).join("")}`;
}

function showSimilarWarning(result) {
  const box = getMatchContainer();
  if (!box) return;
  box.style.background = "#fffaf0";
  box.style.borderColor = "#e4c58b";
  box.innerHTML = `
    <div style="font-weight:800;color:#8a5a13;font-size:16px;">
      ⚠️ رکورد مشابه پیدا شد؛ بررسی دستی لازم است.
    </div>
    <div style="margin-top:6px;color:#6f5a35;">
      این موارد تکراری قطعی محسوب نمی‌شوند. اگر بررسی کردید و مطمئن شدید
      رکورد جدید مربوط به شهید دیگری است، دوباره دکمه ثبت را بزنید.
    </div>
    ${result.similar.map(candidateHtml).join("")}`;
}

function mergeMartyrCandidates(...groups) {
  const byId = new Map();

  for (const group of groups) {
    for (const row of Array.isArray(group) ? group : []) {
      if (!row || row.id == null) continue;
      byId.set(String(row.id), row);
    }
  }

  return Array.from(byId.values());
}

function buildTargetedQuery(input, kind, signal) {
  let query = supabaseClient
    .from("martyrs")
    .select("id,name,lastname,father_name,piece,grave_row,grave_number")
    .limit(NEW_RECORD_TARGET_LIMIT);

  if (kind === "identity") {
    query = query
      .ilike("name", input.name)
      .ilike("lastname", input.lastname);
  } else if (kind === "location") {
    query = query
      .eq("piece", input.piece)
      .ilike("grave_row", input.grave_row)
      .ilike("grave_number", input.grave_number);
  } else if (kind === "piece-row") {
    query = query
      .eq("piece", input.piece)
      .ilike("grave_row", input.grave_row);
  } else if (kind === "piece-number") {
    query = query
      .eq("piece", input.piece)
      .ilike("grave_number", input.grave_number);
  }

  if (signal && typeof query.abortSignal === "function") {
    query = query.abortSignal(signal);
  }

  return query;
}

async function fetchTargetedMartyrCandidates(input, signal) {
  // چهار جستجوی محدود و مستقل:
  // 1) نام + نام خانوادگی
  // 2) محل مزار کامل
  // 3) قطعه + ردیف
  // 4) قطعه + شماره
  //
  // این ترکیب باعث می‌شود با تغییر یک جزء کلیدی، شانس از دست‌رفتن
  // رکورد مشابه کم شود؛ بدون اینکه کل جدول روی موبایل دانلود شود.
  const kinds = ["identity", "location", "piece-row", "piece-number"];

  const results = await Promise.all(
    kinds.map(async kind => {
      const { data, error } = await buildTargetedQuery(input, kind, signal);
      if (error) throw error;
      return data || [];
    })
  );

  return mergeMartyrCandidates(...results);
}

function classifyCachedCandidates(input) {
  if (!Array.isArray(newRecordCandidateCache) || !newRecordCandidateCache.length) {
    return null;
  }

  return window.GolzarMatchingCore.classify(input, newRecordCandidateCache);
}

async function checkNewRecordMatch(input) {
  if (
    !window.GolzarMatchingCore ||
    typeof window.GolzarMatchingCore.classify !== "function"
  ) {
    throw new Error("هسته تطبیق رکوردها بارگذاری نشده است.");
  }

  const cachedResult = classifyCachedCandidates(input);

  // اگر Cache رکورد دقیق دارد، دیگر لازم نیست شبکه را درگیر کنیم.
  if (cachedResult?.classification === "EXACT") {
    return cachedResult;
  }

  const freshCandidates = await fetchTargetedMartyrCandidates(input);

  newRecordCandidateCache = mergeMartyrCandidates(
    newRecordCandidateCache,
    freshCandidates
  );

  return window.GolzarMatchingCore.classify(
    input,
    newRecordCandidateCache
  );
}

function showMatchProgressMessage(startedAt) {
  const box = getMatchContainer();
  if (!box) return;

  const elapsed = Date.now() - startedAt;
  if (elapsed < NEW_RECORD_MATCH_STATUS_DELAY_MS) return;

  box.style.background = "#f7faf8";
  box.style.borderColor = "#cbded3";
  box.innerHTML = `
    <div style="font-weight:800;color:#315f4a;font-size:15px;">
      ⏳ لطفاً شکیبا باشید
    </div>
    <div style="margin-top:5px;color:#5f6d66;">
      در حال بررسی کامل اسامی و سوابق موجود هستیم...
    </div>`;
}

async function saveNewRecordFromQA(event) {
  event.preventDefault();
  event.stopImmediatePropagation();

  if (newRecordSaveInFlight) return;

  const value = id =>
    document.getElementById(id)?.value?.trim() || "";

  const name = value("new-name");
  const lastname = value("new-lastname");
  const piece = value("new-piece");
  const row = value("new-row");
  const number = value("new-number");
  const notes = value("new-notes");
  const stoneType =
    document.querySelector('input[name="stone-type"]:checked')?.value || "";
  const stage =
    document.querySelector('input[name="stage"]:checked')?.value || "";
  const stages = getCanonicalStageDefinition();

  if (!name) return alert("نام شهید را وارد کنید.");
  if (!lastname) return alert("نام خانوادگی شهید را وارد کنید.");
  if (!stoneType) return alert("نوع عملیات سنگ را مشخص کنید.");
  if (!piece) return alert("قطعه را انتخاب کنید.");
  if (!row) return alert("ردیف مزار را وارد کنید.");
  if (!number) return alert("شماره مزار را وارد کنید.");

  if (stage && !(stages[stoneType] || []).includes(stage)) {
    return alert("مرحله انتخاب‌شده با نوع عملیات سازگار نیست.");
  }

  newRecordSaveInFlight = true;
  const button = document.getElementById("save-new");
  const isRecheck = newRecordMatchReviewed;
  const matchStartedAt = Date.now();
  let progressTimer = null;

  if (button) {
    button.disabled = true;
    button.textContent = isRecheck
      ? "در حال بررسی مجدد رکوردهای موجود..."
      : "در حال بررسی رکوردهای موجود...";
  }

  try {
    progressTimer = window.setTimeout(() => {
      showMatchProgressMessage(matchStartedAt);
    }, NEW_RECORD_MATCH_STATUS_DELAY_MS);

    const result = await checkNewRecordMatch({
      name,
      lastname,
      piece,
      grave_row: row,
      grave_number: number,
    });

    if (progressTimer) {
      window.clearTimeout(progressTimer);
      progressTimer = null;
    }

    if (result.classification === "EXACT") {
      showExactWarning(result);
      newRecordMatchReviewed = false;
      if (button) {
        button.disabled = false;
        button.textContent = "ذخیره اطلاعات";
      }
      newRecordSaveInFlight = false;
      return;
    }

    if (result.classification === "SIMILAR" && !newRecordMatchReviewed) {
      showSimilarWarning(result);
      newRecordMatchReviewed = true;
      if (button) {
        button.disabled = false;
        button.textContent = "ثبت اطلاعات پس از بررسی";
      }
      newRecordSaveInFlight = false;
      return;
    }

    newRecordMatchReviewed = true;
  } catch (error) {
    if (progressTimer) window.clearTimeout(progressTimer);
    console.error("GolzarStone matching error:", error);
    if (button) {
      button.disabled = false;
      button.textContent = "ذخیره اطلاعات";
    }
    alert(
      "بررسی رکوردهای موجود انجام نشد. برای جلوگیری از ثبت رکورد بدون کنترل تکراری، ذخیره متوقف شد.\n\n" +
        (error?.message || error)
    );
    newRecordSaveInFlight = false;
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "در حال ثبت اطلاعات...";
  }

  try {
    const { error } = await supabaseClient.from("martyrs").insert({
      name,
      lastname,
      piece,
      grave_row: row,
      grave_number: number,
      stone_type: stoneType,
      stage: stage || null,
      notes: notes || null,
      status: STATUS.PENDING,
    });

    if (error) throw error;

    alert("اطلاعات شهید با موفقیت ثبت شد.");

    // ثبت موفق باید پنجره ثبت اطلاعات را باز نگه دارد
    // و فرم را برای ثبت رکورد بعدی از نو بسازد؛
    // بدون ایجاد History Entry جدید.
    newRecordSaveInFlight = false;
    newRecordCandidateCache = [];
    if (typeof showNewRecord === "function") {
      showNewRecord({ preserveHistory: true });
    } else {
      console.error("showNewRecord is unavailable after successful save.");
    }
  } catch (error) {
    console.error("GolzarStone save error:", error);
    if (button) {
      button.disabled = false;
      button.textContent = "ذخیره اطلاعات";
    }
    alert(
      `ذخیره اطلاعات انجام نشد.\n\nکد خطا: ${
        error?.code || "نامشخص"
      }\nجزئیات: ${error?.message || error}`
    );
    newRecordSaveInFlight = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  syncNewRecordStageOptions();
});

const newRecordObserver = new MutationObserver(mutations => {
  const stageListWasAdded = mutations.some(mutation =>
    Array.from(mutation.addedNodes || []).some(node => {
      if (node.nodeType !== 1) return false;
      return (
        node.id === "stage-list" ||
        (typeof node.querySelector === "function" &&
          !!node.querySelector("#stage-list"))
      );
    })
  );

  if (stageListWasAdded) {
    syncNewRecordStageOptions();
  }
});

if (document.body) {
  newRecordObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

document.addEventListener(
  "change",
  event => {
    const input = event.target;

    if (input?.matches?.('input[name="stone-type"]')) {
      newRecordMatchReviewed = false;
      clearMatchWarning();
      syncNewRecordStageOptions();
    }

    if (input?.matches?.('input[name="stage"]')) {
      newRecordMatchReviewed = false;
      clearMatchWarning();
    }
  },
  true
);

document.addEventListener(
  "input",
  event => {
    if (
      event.target?.matches?.(
        "#new-name, #new-lastname, #new-piece, #new-row, #new-number"
      )
    ) {
      newRecordMatchReviewed = false;
      clearMatchWarning();
    }
  },
  true
);

document.addEventListener(
  "click",
  event => {
    const button = event.target.closest?.("#save-new");
    if (button) saveNewRecordFromQA(event);
  },
  true
);

document.addEventListener(
  "click",
  event => {
    const button = event.target.closest?.("#back-home");
    if (!button) return;

    if (
      typeof currentAppPage === "undefined" ||
      (currentAppPage !== "new" && currentAppPage !== "pending")
    ) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    if (typeof goBackToStoneManagementMenu === "function") {
      goBackToStoneManagementMenu();
    }
  },
  true
);
