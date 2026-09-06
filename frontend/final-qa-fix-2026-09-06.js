"use strict";

// GolzarStone final QA fix — minimal runtime overrides.
// No Supabase schema/data changes.

const GOLZAR_FINAL_STAGES = Object.freeze({
  "ترمیمی": Object.freeze([
    "طرح سنگ به واحد مرمت ارسال شد",
    "سنگ مرمتی آماده است",
    "نصب سنگ مرمت شده",
  ]),
  "تعویضی": Object.freeze([
    "طرح سنگ به واحد تعویض ارسال شد",
    "سنگ تعویضی آماده است",
    "سنگ تعویضی نصب شد",
  ]),
});

function syncFinalStageOptions() {
  const list = document.getElementById("stage-list");
  if (!list) return;

  const selectedType = document.querySelector('input[name="stone-type"]:checked')?.value || "";
  const allowed = new Set(GOLZAR_FINAL_STAGES[selectedType] || []);
  const inputs = list.querySelectorAll('input[name="stage"]');

  inputs.forEach((input, index) => {
    const type = index < 3 ? "ترمیمی" : "تعویضی";
    const stage = GOLZAR_FINAL_STAGES[type][index % 3];
    const option = input.closest(".stage-option");
    input.value = stage;
    input.disabled = !allowed.has(stage);
    if (!allowed.has(stage)) input.checked = false;
    option.dataset.stage = stage;
    option.classList.toggle("disabled", !allowed.has(stage));
    const span = option.querySelector("span");
    if (span) span.textContent = stage;
  });
}

function finalStageWatcher() {
  syncFinalStageOptions();
  document.querySelectorAll('input[name="stone-type"]').forEach((input) => {
    input.addEventListener("change", () => setTimeout(syncFinalStageOptions, 0), true);
  });
}

async function finalSaveNewRecord(event) {
  event.preventDefault();
  event.stopImmediatePropagation();

  const value = (id) => document.getElementById(id)?.value?.trim() || "";
  const name = value("new-name");
  const lastname = value("new-lastname");
  const piece = value("new-piece");
  const row = value("new-row");
  const number = value("new-number");
  const stoneType = document.querySelector('input[name="stone-type"]:checked')?.value || "";
  const stage = document.querySelector('input[name="stage"]:checked')?.value || "";
  const notes = value("new-notes");

  if (!name) return alert("نام شهید را وارد کنید.");
  if (!lastname) return alert("نام خانوادگی شهید را وارد کنید.");
  if (!stoneType) return alert("نوع عملیات سنگ را مشخص کنید.");
  if (!piece) return alert("قطعه را انتخاب کنید.");
  if (!row) return alert("ردیف مزار را وارد کنید.");
  if (!number) return alert("شماره مزار را وارد کنید.");
  if (!stage || !(GOLZAR_FINAL_STAGES[stoneType] || []).includes(stage)) {
    return alert("مرحله فعلی کار را مشخص کنید.");
  }

  const button = document.getElementById("save-new");
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
      stage,
      notes: notes || null,
      status: STATUS.PENDING,
    });

    if (error) throw error;

    alert("اطلاعات شهید با موفقیت ثبت شد.");
    if (typeof goHomeFromNewRecord === "function") goHomeFromNewRecord();
  } catch (error) {
    console.error("GolzarStone save error:", error);
    if (button) {
      button.disabled = false;
      button.textContent = "ذخیره اطلاعات";
    }
    alert(`ذخیره اطلاعات انجام نشد.\n\nکد خطا: ${error?.code || "نامشخص"}\nجزئیات: ${error?.message || error}`);
  }
}

document.addEventListener("click", (event) => {
  const button = event.target.closest?.("#save-new");
  if (button) finalSaveNewRecord(event);
}, true);

document.addEventListener("click", (event) => {
  const button = event.target.closest?.("#back-home");
  if (!button) return;
  if (typeof currentAppPage === "undefined" || (currentAppPage !== "new" && currentAppPage !== "pending")) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (typeof goBackToStoneManagementMenu === "function") goBackToStoneManagementMenu();
}, true);

document.addEventListener("DOMContentLoaded", finalStageWatcher);
new MutationObserver(() => syncFinalStageOptions()).observe(document.body, { childList: true, subtree: true });
