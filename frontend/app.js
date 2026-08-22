// ============================================================
// سربرگ داخلی
// ============================================================

function internalHeader(
  title,
  subtitle = "",
  showRefresh = false
) {
  return `
    <header class="internal-header">

      <button
        type="button"
        class="back-button"
        id="back-home"
      >بازگشت</button>

      <div class="internal-title">
        <h2>${escapeHtml(title)}</h2>

        ${
          subtitle
            ? `<p>${escapeHtml(subtitle)}</p>`
            : ""
        }
      </div>

      ${
        showRefresh
          ? `
            <button
              type="button"
              class="refresh-button"
              id="refresh-page"
            >
              ↻ تازه‌سازی
            </button>
          `
          : ""
      }

    </header>
  `;
}


// ============================================================
// صفحه اصلی
// ============================================================

function showHome() {
  applyAppStyles();

  currentAppPage = "home";
  editingRecordId = null;

  const app =
    document.querySelector(".app");

  if (!app) return;

  app.innerHTML = `
    <header class="header">

      <div class="header-badge">
        گلزار شهدای تهران
      </div>

      <p>
        سامانه مدیریت و پایش سنگ مزار
      </p>

    </header>

    <main class="menu">

      <button
        class="menu-button menu-search"
        type="button"
        id="btn-search"
      >
        <span class="icon">🔎</span>

        <span class="button-text">
          <strong>جستجوی شهید</strong>
          <small>
            جستجو و مشاهده اطلاعات شهید
          </small>
        </span>

        <span class="button-arrow">‹</span>
      </button>


      <button
        class="menu-button menu-new"
        type="button"
        id="btn-new"
      >
        <span class="icon">➕</span>

        <span class="button-text">
          <strong>ثبت اطلاعات شهید جدید</strong>
          <small>
            ثبت اطلاعات اولیه شهید برای بررسی و تأیید
          </small>
        </span>

        <span class="button-arrow">‹</span>
      </button>


      <button
        class="menu-button menu-pending"
        type="button"
        id="btn-pending"
      >
        <span class="icon">📋</span>

        <span class="button-text">
          <strong>اطلاعات ثبت‌شده</strong>
          <small>
            بررسی، تأیید و مدیریت اطلاعات ثبت‌شده
          </small>
        </span>

        <span class="button-arrow">‹</span>
      </button>


      <button
        class="menu-button menu-test"
        type="button"
        id="btn-test"
      >
        <span class="icon">🔗</span>

        <span class="button-text">
          <strong>تست اتصال</strong>
          <small>
            بررسی ارتباط با بانک اطلاعاتی
          </small>
        </span>

        <span class="button-arrow">‹</span>
      </button>

    </main>


    <footer class="footer">
      <strong>گلزار شهدای تهران</strong><br>

      سامانه بهسازی و پایش سنگ مزار شهدا<br>

      <a
        href="https://golzarteh.ir/"
        target="_blank"
        rel="noopener noreferrer"
      >
        golzarteh.ir
      </a>
    </footer>
  `;


  document
    .getElementById("btn-search")
    .addEventListener(
      "click",
      showSearch
    );


  document
    .getElementById("btn-new")
    .addEventListener(
      "click",
      showNewRecord
    );


  document
    .getElementById("btn-pending")
    .addEventListener(
      "click",
      showPendingRecords
    );


  document
    .getElementById("btn-test")
    .addEventListener(
      "click",
      testSupabaseConnection
    );
}


// ============================================================
// تست اتصال
// ============================================================

async function testSupabaseConnection() {
  const { error } =
    await runSupabaseQuery(
      supabaseClient
        .from(TABLE_NAME)
        .select("id")
        .limit(1),
      {
        errorAlertPrefix:
          "اتصال به Supabase برقرار نشد.",
      }
    );


  if (!error) {
    alert(
      "اتصال به Supabase با موفقیت برقرار شد."
    );
  }
}


// ============================================================
// ثبت جدید
// ============================================================

function showNewRecord() {
  if (!isHandlingHistory) {
    pushAppHistory("new");
  }

  currentAppPage = "new";

  const app =
    document.querySelector(".app");

  app.innerHTML = `
    ${internalHeader(
      "ثبت اطلاعات شهید جدید",
      "ثبت اطلاعات اولیه برای بررسی و تأیید"
    )}

    <main class="content">

      <div class="card">

        <div class="card-title">
          اطلاعات شهید
        </div>


        <div class="form-group">
          <label for="new-name">
            نام
          </label>

          <input
            type="text"
            id="new-name"
            autocomplete="off"
            placeholder="نام شهید"
          >
        </div>


        <div class="form-group">
          <label for="new-lastname">
            نام خانوادگی
          </label>

          <input
            type="text"
            id="new-lastname"
            autocomplete="off"
            placeholder="نام خانوادگی شهید"
          >
        </div>


        <div class="section-title">
          نوع عملیات سنگ
        </div>


        <div class="choice-grid">

          <label class="choice-card">
            <input
              type="radio"
              name="stone-type"
              value="ترمیمی"
            >
            <span>ترمیمی</span>
          </label>


          <label class="choice-card">
            <input
              type="radio"
              name="stone-type"
              value="تعویضی"
            >
            <span>تعویضی</span>
          </label>

        </div>


        <div class="section-title">
          محل مزار
        </div>


        <div class="form-row">

          <div class="form-group">

            <label for="new-piece">
              قطعه
            </label>

            <select id="new-piece">

              <option value="">
                انتخاب قطعه
              </option>

              ${PIECES.map(
                (p) =>
                  `<option value="${p}">
                    ${toPersianDigits(p)}
                  </option>`
              ).join("")}

            </select>

          </div>


          <div class="form-group">

            <label for="new-row">
              ردیف
            </label>

            <input
              type="text"
              id="new-row"
              autocomplete="off"
              placeholder="مثلاً ۲۴ مکرر"
            >

          </div>


          <div class="form-group">

            <label for="new-number">
              شماره
            </label>

            <input
              type="text"
              id="new-number"
              autocomplete="off"
              placeholder="مثلاً ج"
            >

          </div>

        </div>


        <div class="section-title">
          مرحله فعلی کار
        </div>


        <div
          class="stage-list"
          id="stage-list"
        >
          ${renderStageOptions()}
        </div>


        <div class="section-title">
          توضیحات
        </div>


        <div class="form-group">

          <textarea
            id="new-notes"
            rows="4"
            placeholder="در صورت نیاز توضیحات را وارد کنید..."
          ></textarea>

        </div>


        <button
          type="button"
          class="primary-button"
          id="save-new"
        >
          ذخیره اطلاعات
        </button>

      </div>

    </main>
  `;


  // ==========================================================
  // اصلاح مهم:
  // بازگشت ثبت اطلاعات مستقیماً به صفحه اصلی می‌رود.
  // دیگر از window.history.back() استفاده نمی‌کنیم.
  // ==========================================================

  document
    .getElementById("back-home")
    .addEventListener(
      "click",
      () => {
        editingRecordId = null;
        currentAppPage = "home";
        showHome();
      }
    );


  document
    .getElementById("save-new")
    .addEventListener(
      "click",
      saveNewRecord
    );


  document
    .querySelectorAll(
      'input[name="stone-type"]'
    )
    .forEach((input) => {
      input.addEventListener(
        "change",
        updateStageOptions
      );
    });


  document
    .getElementById("new-name")
    .focus();
}


// ============================================================
// گزینه‌های مرحله
// ============================================================

function renderStageOptions(
  selectedStage = ""
) {
  const allStages = [
    ...STAGES["ترمیمی"],
    ...STAGES["تعویضی"],
  ];


  return allStages
    .map(
      (stage) => `
        <label
          class="stage-option disabled"
          data-stage="${escapeHtml(stage)}"
        >

          <input
            type="radio"
            name="stage"
            value="${escapeHtml(stage)}"
            disabled
            ${
              stage === selectedStage
                ? "checked"
                : ""
            }
          >

          <span>
            ${escapeHtml(stage)}
          </span>

        </label>
      `
    )
    .join("");
}


// ============================================================
// فعال / غیرفعال کردن مراحل
// ============================================================

function updateStageOptions() {
  const selectedType =
    document.querySelector(
      'input[name="stone-type"]:checked'
    );


  const stageOptions =
    document.querySelectorAll(
      ".stage-option"
    );


  stageOptions.forEach((option) => {

    const stage =
      option.dataset.stage;

    const input =
      option.querySelector(
        'input[name="stage"]'
      );


    const allowed =
      selectedType &&
      isValidStageForStoneType(
        selectedType.value,
        stage
      );


    if (allowed) {

      option.classList.remove(
        "disabled"
      );

      input.disabled = false;

    } else {

      option.classList.add(
        "disabled"
      );

      input.disabled = true;
      input.checked = false;

    }
  });
}


// ============================================================
// ذخیره ثبت جدید
// ============================================================

async function saveNewRecord() {

  const name =
    document.getElementById(
      "new-name"
    ).value.trim();


  const lastname =
    document.getElementById(
      "new-lastname"
    ).value.trim();


  const piece =
    document.getElementById(
      "new-piece"
    ).value;


  const row =
    document.getElementById(
      "new-row"
    ).value.trim();


  const number =
    document.getElementById(
      "new-number"
    ).value.trim();


  const stoneType =
    document.querySelector(
      'input[name="stone-type"]:checked'
    );


  const stage =
    document.querySelector(
      'input[name="stage"]:checked'
    );


  const notes =
    document.getElementById(
      "new-notes"
    ).value.trim();


  const validations = [

    [
      !name,
      "نام شهید را وارد کنید."
    ],

    [
      !lastname,
      "نام خانوادگی شهید را وارد کنید."
    ],

    [
      !stoneType,
      "نوع عملیات سنگ را مشخص کنید."
    ],

    [
      !piece,
      "قطعه را انتخاب کنید."
    ],

    [
      !row,
      "ردیف مزار را وارد کنید."
    ],

    [
      !number,
      "شماره مزار را وارد کنید."
    ],

    [
      !stage,
      "مرحله فعلی کار را مشخص کنید."
    ],

  ];


  for (
    const [failed, message]
    of validations
  ) {

    if (failed) {
      alert(message);
      return;
    }

  }


  if (
    !isValidStageForStoneType(
      stoneType.value,
      stage.value
    )
  ) {

    alert(
      "مرحله انتخاب‌شده با نوع عملیات سازگار نیست."
    );

    return;
  }


  const button =
    document.getElementById(
      "save-new"
    );


  button.disabled = true;

  button.textContent =
    "در حال ثبت اطلاعات...";


  const { data, error } =
    await runSupabaseQuery(

      supabaseClient
        .from(TABLE_NAME)
        .insert({
          name,
          lastname,
          piece,
          grave_row: row,
          grave_number: number,
          stone_type:
            stoneType.value,
          stage:
            stage.value,
          notes:
            notes || null,
          status:
            STATUS.PENDING,
        })
        .select("*")
        .single(),

      {
        errorAlertPrefix:
          "ذخیره اطلاعات انجام نشد.",
      }

    );


  if (error) {

    button.disabled = false;

    button.textContent =
      "ذخیره اطلاعات";

    return;
  }


  const insertedCreatedAt =
    data
      ? getRecordCreatedAt(data)
      : null;


  const registeredDate =
    insertedCreatedAt
      ? getJalaliDateTime(
          insertedCreatedAt
        )
      : "";


  alert(
    "اطلاعات شهید با موفقیت ثبت شد." +
      (
        registeredDate
          ? `\n\nتاریخ ثبت: ${registeredDate}`
          : ""
      )
  );


  showNewRecord();
}


// ============================================================
// اطلاعات ثبت شده
// ============================================================

async function showPendingRecords(
  preserveHistory = false
) {

  if (
    !isHandlingHistory &&
    !preserveHistory
  ) {
    pushAppHistory("pending");
  }


  currentAppPage = "pending";


  const app =
    document.querySelector(".app");


  app.innerHTML = `
    ${internalHeader(
      "اطلاعات ثبت‌شده",
      "رکوردهای در انتظار تأیید",
      true
    )}

    <main class="content">

      <div class="card">

        <div
          id="records-summary"
          class="records-summary"
        ></div>


        <div
          id="pending-container"
          class="records-container"
        >

          <div class="loading-message">
            در حال دریافت اطلاعات...
          </div>

        </div>

      </div>

    </main>
  `;


  document
    .getElementById("back-home")
    .addEventListener(
      "click",
      () => window.history.back()
    );


  document
    .getElementById("refresh-page")
    .addEventListener(
      "click",
      refreshPendingRecords
    );


  await loadPendingRecords();
}


// ============================================================
// دریافت رکوردهای در انتظار
// ============================================================

async function loadPendingRecords() {

  const container =
    document.getElementById(
      "pending-container"
    );


  const summary =
    document.getElementById(
      "records-summary"
    );


  if (!container || !summary)
    return;


  container.innerHTML = `
    <div class="loading-message">
      در حال دریافت اطلاعات تازه...
    </div>
  `;


  const { data, error } =
    await runSupabaseQuery(

      supabaseClient
        .from(TABLE_NAME)
        .select("*")
        .eq(
          "status",
          STATUS.PENDING
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(
          MAX_RECORDS_PER_QUERY
        )

    );


  if (error) {

    showRecordsError(
      error.message ||
        "خطای غیرمنتظره هنگام دریافت اطلاعات."
    );

    return;
  }


  const records =
    data || [];


  summary.innerHTML = `

    <div class="summary-box warning">

      <strong>
        ${toPersianDigits(
          records.length
        )}
      </strong>

      <small>
        در انتظار تأیید
      </small>

    </div>


    <div class="summary-box">

      <strong>
        ${toPersianDigits(
          records.length
        )}
      </strong>

      <small>
        قابل بررسی
      </small>

    </div>

  `;


  if (
    records.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-message">
        رکوردی در انتظار تأیید وجود ندارد.
      </div>
    `;

    return;
  }


  container.innerHTML =
    records
      .map(recordSummaryCard)
      .join("");


  records.forEach(
    (record) => {

      const card =
        document.getElementById(
          `record-summary-${record.id}`
        );


      if (card) {

        card.addEventListener(
          "click",
          () =>
            showRecordDetail(
              record.id,
              "records"
            )
        );

      }

    }
  );
}


// ============================================================
// تازه‌سازی
// ============================================================

async function refreshPendingRecords() {

  const button =
    document.getElementById(
      "refresh-page"
    );


  if (button) {

    button.disabled = true;

    button.textContent =
      "↻ در حال تازه‌سازی...";

  }


  await loadPendingRecords();


  if (button) {

    button.disabled = false;

    button.textContent =
      "↻ تازه‌سازی";

  }
}


// ============================================================
// کارت رکورد
// ============================================================

function recordSummaryCard(record) {

  const status =
    record.status ||
    STATUS.PENDING;


  const statusClass =
    status === STATUS.APPROVED
      ? "approved"
      : "";


  const editedAt =
    getRecordEditedAt(record);


  return `
    <div
      class="record-card clickable"
      id="record-summary-${record.id}"
    >

      <div class="record-card-header">

        <div class="record-name">
          ${escapeHtml(
            record.name
          )}
          ${escapeHtml(
            record.lastname
          )}
        </div>


        <span
          class="status-badge ${statusClass}"
        >
          ${escapeHtml(status)}
        </span>

      </div>


      <div class="location-box">

        <div>
          <small>قطعه</small>

          <strong>
            ${toPersianDigits(
              record.piece
            )}
          </strong>
        </div>


        <div>
          <small>ردیف</small>

          <strong>
            ${escapeHtml(
              record.grave_row
            )}
          </strong>
        </div>


        <div>
          <small>شماره</small>

          <strong>
            ${escapeHtml(
              record.grave_number
            )}
          </strong>
        </div>

      </div>


      <div class="record-info">

        <span>
          نوع عملیات:
        </span>

        <strong>
          ${escapeHtml(
            record.stone_type
          )}
        </strong>

      </div>


      <div class="record-info">

        <span>
          مرحله:
        </span>

        <strong>
          ${escapeHtml(
            record.stage
          )}
        </strong>

      </div>


      ${
        getRecordCreatedAt(record)
          ? `
            <div class="record-info">

              <span>
                تاریخ ثبت:
              </span>

              <strong>
                ${escapeHtml(
                  getJalaliDateTime(
                    getRecordCreatedAt(
                      record
                    )
                  )
                )}
              </strong>

            </div>
          `
          : ""
      }


      ${
        editedAt
          ? `
            <div class="edited-info">

              ✏️

              <strong>
                آخرین ویرایش:
              </strong>

              ${escapeHtml(
                getJalaliDateTime(
                  editedAt
                )
              )}

            </div>
          `
          : ""
      }

    </div>
  `;
}


// ============================================================
// جزئیات رکورد
// ============================================================

async function showRecordDetail(
  id,
  source = "records"
) {

  const app =
    document.querySelector(".app");


  app.innerHTML = `
    ${internalHeader(
      "جزئیات اطلاعات شهید",
      source === "search"
        ? "مشاهده اطلاعات شهید"
        : "بررسی و تصمیم نهایی کارشناس"
    )}

    <main class="content">

      <div
        id="detail-container"
        class="detail-card"
      >

        <div class="loading-message">
          در حال دریافت اطلاعات...
        </div>

      </div>

    </main>
  `;


  const goBack = () =>
    source === "search"
      ? restoreSearchPage()
      : showPendingRecords(true);


  document
    .getElementById("back-home")
    .addEventListener(
      "click",
      goBack
    );


  const { data, error } =
    await runSupabaseQuery(

      supabaseClient
        .from(TABLE_NAME)
        .select("*")
        .eq("id", id)
        .single()

    );


  const detailContainer =
    document.getElementById(
      "detail-container"
    );


  if (error) {

    detailContainer.innerHTML = `
      <div class="error-message">

        دریافت اطلاعات انجام نشد.

        <br><br>

        ${escapeHtml(
          error.message
        )}

      </div>
    `;

    return;
  }


  const status =
    data.status ||
    STATUS.PENDING;


  const isApproved =
    status === STATUS.APPROVED;


  const showManagementActions =
    source === "records";


  const editedAt =
    getRecordEditedAt(data);


  detailContainer.innerHTML = `

    <div class="detail-title">

      ${escapeHtml(
        data.name
      )}

      ${escapeHtml(
        data.lastname
      )}

    </div>


    <div class="detail-row">

      <span>شناسه</span>

      <strong>
        ${escapeHtml(
          data.id
        )}
      </strong>

    </div>


    <div class="detail-row">

      <span>وضعیت ثبت</span>

      <strong>
        ${escapeHtml(
          status
        )}
      </strong>

    </div>


    <div class="detail-row">

      <span>
        نوع عملیات سنگ
      </span>

      <strong>
        ${escapeHtml(
          data.stone_type
        )}
      </strong>

    </div>


    <div class="detail-row">

      <span>قطعه</span>

      <strong>
        ${toPersianDigits(
          data.piece
        )}
      </strong>

    </div>


    <div class="detail-row">

      <span>ردیف</span>

      <strong>
        ${escapeHtml(
          data.grave_row
        )}
      </strong>

    </div>


    <div class="detail-row">

      <span>شماره</span>

      <strong>
        ${escapeHtml(
          data.grave_number
        )}
      </strong>

    </div>


    <div class="detail-row">

      <span>
        مرحله فعلی کار
      </span>

      <strong>
        ${escapeHtml(
          data.stage
        )}
      </strong>

    </div>


    ${
      getRecordCreatedAt(data)
        ? `
          <div class="detail-row">

            <span>
              تاریخ ثبت
            </span>

            <strong>
              ${escapeHtml(
                getJalaliDateTime(
                  getRecordCreatedAt(
                    data
                  )
                )
              )}
            </strong>

          </div>
        `
        : ""
    }


    ${
      editedAt
        ? `
          <div
            class="detail-row edited-row"
          >

            <span>
              آخرین ویرایش
            </span>

            <strong>

              ✏️

              ${escapeHtml(
                getJalaliDateTime(
                  editedAt
                )
              )}

            </strong>

          </div>
        `
        : ""
    }


    ${
      data.edit_notes
        ? `
          <div
            class="detail-row edited-row"
          >

            <span>
              توضیحات ویرایش
            </span>

            <strong>
              ${escapeHtml(
                data.edit_notes
              )}
            </strong>

          </div>
        `
        : ""
    }


    ${
      data.notes
        ? `
          <div class="detail-row">

            <span>
              توضیحات
            </span>

            <strong>
              ${escapeHtml(
                data.notes
              )}
            </strong>

          </div>
        `
        : ""
    }


    <div class="detail-actions">

      ${
        source === "search"
          ? `
            <button
              type="button"
              class="edit-button"
              id="edit-record"
            >
              ✏️ ویرایش اطلاعات
            </button>
          `
          : ""
      }


      ${
        showManagementActions &&
        !isApproved
          ? `
            <button
              type="button"
              class="approve-button"
              id="approve-record"
            >
              ✓ تأیید این اطلاعات
            </button>
          `
          : ""
      }


      ${
        showManagementActions
          ? `
            <button
              type="button"
              class="danger-button"
              id="delete-detail"
            >
              حذف این رکورد
            </button>
          `
          : ""
      }


      <button
        type="button"
        class="back-secondary"
        id="back-records"
      >
        ${
          source === "search"
            ? "بازگشت به نتایج جستجو"
            : "بازگشت به فهرست"
        }
      </button>

    </div>
  `;


  if (source === "search") {

    document
      .getElementById(
        "edit-record"
      )
      .addEventListener(
        "click",
        () =>
          showEditRecord(
            id,
            "search"
          )
      );

  }


  if (
    showManagementActions &&
    !isApproved
  ) {

    document
      .getElementById(
        "approve-record"
      )
      .addEventListener(
        "click",
        () =>
          approveRecord(id)
      );

  }


  if (showManagementActions) {

    document
      .getElementById(
        "delete-detail"
      )
      .addEventListener(
        "click",
        () =>
          deleteRecord(id)
      );

  }


  document
    .getElementById(
      "back-records"
    )
    .addEventListener(
      "click",
      goBack
    );
}


// ============================================================
// ویرایش رکورد
// ============================================================

async function showEditRecord(
  id,
  source = "search",
  fromHistory = false
) {

  editingRecordId = id;
  editingRecordSource = source;


  if (
    !isHandlingHistory &&
    !fromHistory
  ) {
    pushAppHistory("edit");
  }


  currentAppPage = "edit";


  const app =
    document.querySelector(".app");


  app.innerHTML = `
    ${internalHeader(
      "ویرایش اطلاعات شهید",
      "اصلاح اطلاعات ثبت‌شده"
    )}

    <main class="content">

      <div
        id="edit-container"
        class="card"
      >

        <div class="loading-message">
          در حال دریافت اطلاعات...
        </div>

      </div>

    </main>
  `;


  document
    .getElementById("back-home")
    .addEventListener(
      "click",
      () => {
        cancelEdit();
      }
    );


  const { data, error } =
    await runSupabaseQuery(

      supabaseClient
        .from(TABLE_NAME)
        .select("*")
        .eq("id", id)
        .single()

    );


  const container =
    document.getElementById(
      "edit-container"
    );


  if (error) {

    container.innerHTML = `
      <div class="error-message">

        دریافت اطلاعات برای ویرایش انجام نشد.

        <br><br>

        ${escapeHtml(
          error.message
        )}

      </div>
    `;

    return;
  }


  container.innerHTML = `

    <div class="card-title">

      ویرایش اطلاعات:

      ${escapeHtml(
        data.name
      )}

      ${escapeHtml(
        data.lastname
      )}

    </div>


    <div class="form-group">

      <label for="edit-name">
        نام
      </label>

      <input
        type="text"
        id="edit-name"
        value="${escapeHtml(
          data.name || ""
        )}"
        autocomplete="off"
      >

    </div>


    <div class="form-group">

      <label for="edit-lastname">
        نام خانوادگی
      </label>

      <input
        type="text"
        id="edit-lastname"
        value="${escapeHtml(
          data.lastname || ""
        )}"
        autocomplete="off"
      >

    </div>


    <div class="section-title">
      نوع عملیات سنگ
    </div>


    <div class="choice-grid">

      <label class="choice-card">

        <input
          type="radio"
          name="edit-stone-type"
          value="ترمیمی"
          ${
            data.stone_type ===
            "ترمیمی"
              ? "checked"
              : ""
          }
        >

        <span>
          ترمیمی
        </span>

      </label>


      <label class="choice-card">

        <input
          type="radio"
          name="edit-stone-type"
          value="تعویضی"
          ${
            data.stone_type ===
            "تعویضی"
              ? "checked"
              : ""
          }
        >

        <span>
          تعویضی
        </span>

      </label>

    </div>


    <div class="section-title">
      محل مزار
    </div>


    <div class="form-row">

      <div class="form-group">

        <label for="edit-piece">
          قطعه
        </label>

        <select id="edit-piece">

          <option value="">
            انتخاب قطعه
          </option>

          ${PIECES.map(
            (p) =>
              `<option
                value="${p}"
                ${
                  String(
                    data.piece || ""
                  ) === String(p)
                    ? "selected"
                    : ""
                }
              >
                ${toPersianDigits(p)}
              </option>`
          ).join("")}

        </select>

      </div>


      <div class="form-group">

        <label for="edit-row">
          ردیف
        </label>

        <input
          type="text"
          id="edit-row"
          value="${escapeHtml(
            data.grave_row || ""
          )}"
          autocomplete="off"
        >

      </div>


      <div class="form-group">

        <label for="edit-number">
          شماره
        </label>

        <input
          type="text"
          id="edit-number"
          value="${escapeHtml(
            data.grave_number || ""
          )}"
          autocomplete="off"
        >

      </div>

    </div>


    <div class="section-title">
      مرحله فعلی کار
    </div>


    <div
      class="stage-list"
      id="edit-stage-list"
    >
      ${renderStageOptions(
        data.stage || ""
      )}
    </div>


    <div class="section-title">
      توضیحات
    </div>


    <div class="form-group">

      <textarea
        id="edit-notes"
        rows="4"
        placeholder="توضیحات..."
      >${escapeHtml(
        data.notes || ""
      )}</textarea>

    </div>


    <div class="section-title">
      توضیحات ویرایش
    </div>


    <div class="form-group">

      <textarea
        id="edit-notes-change"
        rows="3"
        placeholder="علت یا توضیح این ویرایش را وارد کنید..."
      >${escapeHtml(
        data.edit_notes || ""
      )}</textarea>

    </div>


    <div class="edit-actions">

      <button
        type="button"
        class="edit-save-button"
        id="save-edit"
      >
        ذخیره و ثبت ویرایش
      </button>


      <button
        type="button"
        class="cancel-edit-button"
        id="cancel-edit"
      >
        انصراف
      </button>

    </div>
  `;


  document
    .querySelectorAll(
      'input[name="edit-stone-type"]'
    )
    .forEach((input) => {

      input.addEventListener(
        "change",
        updateEditStageOptions
      );

    });


  updateEditStageOptions();


  document
    .getElementById("save-edit")
    .addEventListener(
      "click",
      () =>
        saveEditRecord(
          id,
          source
        )
    );


  document
    .getElementById("cancel-edit")
    .addEventListener(
      "click",
      cancelEdit
    );
}


// ============================================================
// گزینه‌های مرحله ویرایش
// ============================================================

function updateEditStageOptions() {

  const selectedType =
    document.querySelector(
      'input[name="edit-stone-type"]:checked'
    );


  const options =
    document.querySelectorAll(
      "#edit-stage-list .stage-option"
    );


  options.forEach(
    (option) => {

      const stage =
        option.dataset.stage;


      const input =
        option.querySelector(
          'input[name="stage"]'
        );


      const allowed =
        selectedType &&
        isValidStageForStoneType(
          selectedType.value,
          stage
        );


      if (allowed) {

        option.classList.remove(
          "disabled"
        );

        input.disabled = false;

      } else {

        option.classList.add(
          "disabled"
        );

        input.disabled = true;
        input.checked = false;

      }

    }
  );
}


// ============================================================
// ذخیره ویرایش
// ============================================================

async function saveEditRecord(
  id,
  source
) {

  const name =
    document.getElementById(
      "edit-name"
    ).value.trim();


  const lastname =
    document.getElementById(
      "edit-lastname"
    ).value.trim();


  const piece =
    document.getElementById(
      "edit-piece"
    ).value;


  const row =
    document.getElementById(
      "edit-row"
    ).value.trim();


  const number =
    document.getElementById(
      "edit-number"
    ).value.trim();


  const stoneType =
    document.querySelector(
      'input[name="edit-stone-type"]:checked'
    );


  const stage =
    document.querySelector(
      'input[name="stage"]:checked'
    );


  const notes =
    document.getElementById(
      "edit-notes"
    ).value.trim();


  const editNotes =
    document.getElementById(
      "edit-notes-change"
    ).value.trim();


  const validations = [

    [
      !name,
      "نام شهید را وارد کنید."
    ],

    [
      !lastname,
      "نام خانوادگی شهید را وارد کنید."
    ],

    [
      !stoneType,
      "نوع عملیات سنگ را مشخص کنید."
    ],

    [
      !piece,
      "قطعه را انتخاب کنید."
    ],

    [
      !row,
      "ردیف مزار را وارد کنید."
    ],

    [
      !number,
      "شماره مزار را وارد کنید."
    ],

    [
      !stage,
      "مرحله فعلی کار را مشخص کنید."
    ],

  ];


  for (
    const [failed, message]
    of validations
  ) {

    if (failed) {

      alert(message);

      return;

    }

  }


  if (
    !isValidStageForStoneType(
      stoneType.value,
      stage.value
    )
  ) {

    alert(
      "مرحله انتخاب‌شده با نوع عملیات سازگار نیست."
    );

    return;
  }


  const button =
    document.getElementById(
      "save-edit"
    );


  const cancelButton =
    document.getElementById(
      "cancel-edit"
    );


  button.disabled = true;
  cancelButton.disabled = true;


  button.textContent =
    "در حال ذخیره ویرایش...";


  const editedAt =
    new Date().toISOString();


  const updatePayload = {

    name,

    lastname,

    piece,

    grave_row:
      row,

    grave_number:
      number,

    stone_type:
      stoneType.value,

    stage:
      stage.value,

    notes:
      notes || null,

    edited_at:
      editedAt,

    edit_notes:
      editNotes || null,

  };


  const { data, error } =
    await runSupabaseQuery(

      supabaseClient
        .from(TABLE_NAME)
        .update(
          updatePayload
        )
        .eq("id", id)
        .select("*")
        .single(),

      {
        errorAlertPrefix:
          "ویرایش اطلاعات انجام نشد.",
      }

    );


  if (error) {

    button.disabled = false;

    cancelButton.disabled = false;

    button.textContent =
      "ذخیره و ثبت ویرایش";

    return;
  }


  if (!data) {

    button.disabled = false;

    cancelButton.disabled = false;

    button.textContent =
      "ذخیره و ثبت ویرایش";


    alert(
      "رکورد پیدا نشد یا اجازه ویرایش وجود ندارد."
    );

    return;
  }


  // ========================================================
  // مهم:
  // رکورد تازه‌شده مستقیماً در نتایج قبلی جایگزین می‌شود.
  // ========================================================

  updateLastSearchResult(
    data
  );


  editingRecordId = null;


  alert(
    "اطلاعات شهید با موفقیت ویرایش شد." +
      `\n\nتاریخ ویرایش: ${getJalaliDateTime(
        data.edited_at
      )}`
  );


  if (source === "search") {

    restoreSearchPage();

  } else {

    showPendingRecords(true);

  }
}


// ============================================================
// جایگزینی رکورد تازه در نتایج جستجو
// ============================================================

function updateLastSearchResult(
  updatedRecord
) {

  if (!updatedRecord)
    return;


  const index =
    lastSearchResults.findIndex(
      (record) =>
        String(record.id) ===
        String(
          updatedRecord.id
        )
    );


  if (index !== -1) {

    lastSearchResults[index] =
      updatedRecord;

  } else {

    lastSearchResults.unshift(
      updatedRecord
    );

  }
}


// ============================================================
// انصراف از ویرایش
// ============================================================

function cancelEdit() {

  editingRecordId = null;


  if (
    editingRecordSource ===
    "search"
  ) {

    restoreSearchPage();

  } else {

    showPendingRecords(true);

  }
}


// ============================================================
// تأیید
// ============================================================

async function approveRecord(
  id
) {

  if (
    !confirm(
      "آیا اطلاعات این شهید را تأیید می‌کنید؟"
    )
  ) {
    return;
  }


  const { data, error } =
    await runSupabaseQuery(

      supabaseClient
        .from(TABLE_NAME)
        .update({
          status:
            STATUS.APPROVED,
        })
        .eq("id", id)
        .select()
        .single(),

      {
        errorAlertPrefix:
          "تأیید اطلاعات انجام نشد.",
      }

    );


  if (error)
    return;


  if (!data) {

    alert(
      "رکورد پیدا نشد یا اجازه تغییر آن وجود ندارد."
    );

    return;
  }


  updateLastSearchResult(
    data
  );


  alert(
    "اطلاعات این شهید با موفقیت تأیید شد."
  );


  showPendingRecords();
}


// ============================================================
// حذف
// ============================================================

async function deleteRecord(
  id
) {

  if (
    !confirm(
      "آیا از حذف این اطلاعات مطمئن هستید؟"
    )
  ) {
    return;
  }


  const { data, error } =
    await runSupabaseQuery(

      supabaseClient
        .from(TABLE_NAME)
        .delete()
        .eq("id", id)
        .select(),

      {
        errorAlertPrefix:
          "حذف انجام نشد.",
      }

    );


  if (error)
    return;


  if (
    !data ||
    data.length === 0
  ) {

    alert(
      "رکورد حذف نشد یا اجازه حذف وجود ندارد."
    );

    return;
  }


  lastSearchResults =
    lastSearchResults.filter(
      (record) =>
        String(record.id) !==
        String(id)
    );


  alert(
    "رکورد با موفقیت حذف شد."
  );


  showPendingRecords();
}


// ============================================================
// جستجو
// ============================================================

function showSearch(
  restore = false
) {

  if (!isHandlingHistory) {
    pushAppHistory("search");
  }


  currentAppPage = "search";


  const app =
    document.querySelector(".app");


  app.innerHTML = `

    ${internalHeader(
      "جستجوی اطلاعات شهید",
      "جستجو در اطلاعات ثبت‌شده"
    )}


    <main class="content">

      <div class="card">

        <div class="card-title">
          معیارهای جستجو
        </div>


        <div class="form-group">

          <label for="search-name">
            نام
          </label>

          <input
            type="text"
            id="search-name"
            autocomplete="off"
            placeholder="مثلاً اصغر یا ۳۳۳۳۳"
          >

        </div>


        <div class="form-group">

          <label for="search-lastname">
            نام خانوادگی
          </label>

          <input
            type="text"
            id="search-lastname"
            autocomplete="off"
            placeholder="اختیاری"
          >

        </div>


        <div class="section-title">
          محل مزار
        </div>


        <div class="form-row">

          <div class="form-group">

            <label for="search-piece">
              قطعه
            </label>

            <select id="search-piece">

              <option value="">
                همه
              </option>

              ${PIECES.map(
                (p) =>
                  `<option value="${p}">
                    ${toPersianDigits(p)}
                  </option>`
              ).join("")}

            </select>

          </div>


          <div class="form-group">

            <label for="search-row">
              ردیف
            </label>

            <input
              type="text"
              id="search-row"
              autocomplete="off"
              placeholder="مثلاً ۲۴ مکرر"
            >

          </div>


          <div class="form-group">

            <label for="search-number">
              شماره
            </label>

            <input
              type="text"
              id="search-number"
              autocomplete="off"
              placeholder="مثلاً ج"
            >

          </div>

        </div>


        <div class="section-title">
          وضعیت سنگ
        </div>


        <div class="form-group">

          <label for="search-status">
            جستجوی وضعیت
          </label>

          <select id="search-status">

            <option value="">
              همه وضعیت‌ها
            </option>

            <option value="ترمیمی">
              ترمیمی
            </option>

            <option value="تعویضی">
              تعویضی
            </option>

          </select>

        </div>


        <button
          type="button"
          class="primary-button"
          id="search-button"
        >
          جستجو
        </button>


        <div
          id="search-results"
          class="search-results"
        ></div>

      </div>

    </main>
  `;


  document
    .getElementById("back-home")
    .addEventListener(
      "click",
      () => window.history.back()
    );


  document
    .getElementById("search-button")
    .addEventListener(
      "click",
      performSearch
    );


  [
    "search-name",
    "search-lastname",
    "search-row",
    "search-number",
  ].forEach(
    (id) => {

      document
        .getElementById(id)
        .addEventListener(
          "keydown",
          (event) => {

            if (
              event.key ===
              "Enter"
            ) {

              event.preventDefault();

              performSearch();

            }

          }
        );

    }
  );


  if (
    restore &&
    lastSearchFilters
  ) {

    document.getElementById(
      "search-name"
    ).value =
      lastSearchFilters.name ||
      "";


    document.getElementById(
      "search-lastname"
    ).value =
      lastSearchFilters.lastname ||
      "";


    document.getElementById(
      "search-piece"
    ).value =
      lastSearchFilters.piece ||
      "";


    document.getElementById(
      "search-row"
    ).value =
      lastSearchFilters.row ||
      "";


    document.getElementById(
      "search-number"
    ).value =
      lastSearchFilters.number ||
      "";


    document.getElementById(
      "search-status"
    ).value =
      lastSearchFilters.status ||
      "";


    renderSearchResults(
      lastSearchResults
    );


    return;
  }


  document
    .getElementById(
      "search-name"
    )
    .focus();
}


// ============================================================
// اجرای جستجو
// ============================================================

async function performSearch() {

  const name =
    normalizeSearchText(
      document.getElementById(
        "search-name"
      ).value
    );


  const lastname =
    normalizeSearchText(
      document.getElementById(
        "search-lastname"
      ).value
    );


  const piece =
    toEnglishDigits(
      document.getElementById(
        "search-piece"
      ).value
    );


  const row =
    normalizeSearchText(
      document.getElementById(
        "search-row"
      ).value
    );


  const number =
    normalizeSearchText(
      document.getElementById(
        "search-number"
      ).value
    );


  const status =
    document.getElementById(
      "search-status"
    ).value;


  const container =
    document.getElementById(
      "search-results"
    );


  lastSearchFilters = {
    name,
    lastname,
    piece,
    row,
    number,
    status,
  };


  container.innerHTML = `
    <div class="loading-message">
      در حال جستجو...
    </div>
  `;


  let query =
    supabaseClient
      .from(TABLE_NAME)
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(
        MAX_RECORDS_PER_QUERY
      );


  if (name) {

    query =
      query.ilike(
        "name",
        `%${name}%`
      );

  }


  if (lastname) {

    query =
      query.ilike(
        "lastname",
        `%${lastname}%`
      );

  }


  if (piece) {

    query =
      query.eq(
        "piece",
        piece
      );

  }


  if (row) {

    query =
      query.ilike(
        "grave_row",
        `%${row}%`
      );

  }


  if (number) {

    query =
      query.ilike(
        "grave_number",
        `%${number}%`
      );

  }


  if (status) {

    query =
      query.eq(
        "stone_type",
        status
      );

  }


  const { data, error } =
    await runSupabaseQuery(
      query
    );


  if (error) {

    container.innerHTML = `
      <div class="error-message">

        جستجو انجام نشد.

        <br><br>

        ${escapeHtml(
          error.message
        )}

      </div>
    `;

    return;
  }


  const results =
    data || [];


  lastSearchResults =
    results;


  renderSearchResults(
    results
  );
}


// ============================================================
// نمایش نتایج جستجو
// ============================================================

function renderSearchResults(
  results
) {

  const container =
    document.getElementById(
      "search-results"
    );


  if (!container)
    return;


  container.innerHTML = `

    <div class="search-count">

      ${toPersianDigits(
        results.length
      )}

      رکورد پیدا شد.

    </div>


    ${
      results.length > 0
        ? `
          <button
            type="button"
            class="export-button"
            id="export-search-results"
          >
            📊 خروجی اکسل
          </button>
        `
        : ""
    }


    <div class="records-container">

      ${
        results.length === 0

          ? `
            <div class="empty-message">

              رکوردی با این مشخصات
              پیدا نشد.

            </div>
          `

          : results
              .map(
                recordSummaryCard
              )
              .join("")
      }

    </div>
  `;


  if (
    results.length > 0
  ) {

    const exportButton =
      document.getElementById(
        "export-search-results"
      );


    if (exportButton) {

      exportButton.addEventListener(
        "click",
        exportSearchResultsToExcel
      );

    }

  }


  results.forEach(
    (record) => {

      const card =
        document.getElementById(
          `record-summary-${record.id}`
        );


      if (card) {

        card.addEventListener(
          "click",
          () =>
            showRecordDetail(
              record.id,
              "search"
            )
        );

      }

    }
  );
}


// ============================================================
// Excel
// ============================================================

const EXCEL_DATE_COLUMN_HEADER =
  "تاریخ ثبت";


const EXCEL_EDITED_COLUMN_HEADER =
  "تاریخ آخرین ویرایش";


const EXCEL_EDIT_NOTES_HEADER =
  "توضیحات ویرایش";


function exportSearchResultsToExcel() {

  if (
    !lastSearchResults ||
    lastSearchResults.length === 0
  ) {

    alert(
      "رکوردی برای خروجی گرفتن وجود ندارد."
    );

    return;
  }


  if (
    typeof XLSX ===
    "undefined"
  ) {

    alert(
      "کتابخانه خروجی اکسل بارگذاری نشده است.\n\nلطفاً SheetJS را در index.html بارگذاری کنید."
    );

    return;
  }


  try {

    const exportData =
      lastSearchResults.map(
        (record) => ({

          "نام":
            record.name || "",

          "نام خانوادگی":
            record.lastname || "",

          "قطعه":
            toPersianDigits(
              record.piece || ""
            ),

          "ردیف":
            record.grave_row || "",

          "شماره":
            record.grave_number || "",

          "نوع عملیات":
            record.stone_type || "",

          "مرحله":
            record.stage || "",

          "وضعیت ثبت":
            record.status || "",

          "توضیحات":
            record.notes || "",

          [EXCEL_DATE_COLUMN_HEADER]:
            formatJalaliDateForExcel(
              getRecordCreatedAt(
                record
              )
            ),

          [EXCEL_EDITED_COLUMN_HEADER]:
            formatJalaliDateForExcel(
              getRecordEditedAt(
                record
              )
            ),

          [EXCEL_EDIT_NOTES_HEADER]:
            record.edit_notes || "",

        })
      );


    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );


    worksheet["!cols"] = [

      { wch: 18 },
      { wch: 24 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 16 },
      { wch: 28 },
      { wch: 18 },
      { wch: 35 },
      { wch: 18 },
      { wch: 22 },
      { wch: 35 },

    ];


    const headers =
      Object.keys(
        exportData[0] || {}
      );


    const dateColumns = [

      EXCEL_DATE_COLUMN_HEADER,

      EXCEL_EDITED_COLUMN_HEADER,

    ];


    dateColumns.forEach(
      (header) => {

        const index =
          headers.indexOf(
            header
          );


        if (index === -1)
          return;


        const columnLetter =
          XLSX.utils.encode_col(
            index
          );


        for (
          let rowIndex = 2;
          rowIndex <=
          exportData.length + 1;
          rowIndex++
        ) {

          const cellAddress =
            `${columnLetter}${rowIndex}`;


          if (
            worksheet[
              cellAddress
            ]
          ) {

            worksheet[
              cellAddress
            ].t = "s";


            worksheet[
              cellAddress
            ].v =
              String(
                worksheet[
                  cellAddress
                ].v || ""
              );

          }

        }

      }
    );


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "نتایج جستجو"
    );


    const jalaliFileDate =
      getTodayJalaliForFileName();


    const fileName =
      `GolzarStone_نتایج_جستجو_${jalaliFileDate}.xlsx`;


    XLSX.writeFile(
      workbook,
      fileName
    );


    alert(
      "خروجی اکسل با موفقیت ایجاد شد." +
        `\n\nتعداد رکورد: ${toPersianDigits(
          exportData.length
        )}` +
        `\n\nتاریخ فایل: ${toPersianDigits(
          jalaliFileDate
        )}`
    );


  } catch (error) {

    console.error(
      "Excel export error:",
      error
    );


    alert(
      `ایجاد خروجی اکسل انجام نشد.\n\n${error.message}`
    );

  }
}


// ============================================================
// بازگردانی نتایج جستجو
// ============================================================

function restoreSearchPage() {
  showSearch(true);
}


// ============================================================
// خطای رکوردها
// ============================================================

function showRecordsError(
  message
) {

  const container =
    document.getElementById(
      "pending-container"
    );


  if (!container)
    return;


  container.innerHTML = `
    <div class="error-message">

      دریافت اطلاعات انجام نشد.

      <br><br>

      ${escapeHtml(
        message
      )}

    </div>
  `;
}
