
// ============================================================
// Shohada-app / GolzarStone
// نسخه موبایل - Supabase + UI
// ============================================================

"use strict";


// ============================================================
// Supabase
// ============================================================

const SUPABASE_URL =
    "https://bafrksgdcmglahyrppfy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_O5CkSuivysXJf-8hu1IUCA_izu8hWiX";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ============================================================
// تنظیمات
// ============================================================

const PIECES = [
    "17",
    "24",
    "26",
    "27",
    "28",
    "29",
    "40",
    "53"
];


// ============================================================
// ابزار اعداد فارسی
// ============================================================

function toPersianDigits(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value).replace(
        /[0-9]/g,
        digit =>
            "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]
    );
}


function toEnglishDigits(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(
            /[۰-۹]/g,
            digit =>
                String(
                    "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
                )
        )
        .replace(
            /[٠-٩]/g,
            digit =>
                String(
                    "٠١٢٣٤٥٦٧٨٩".indexOf(digit)
                )
        );
}


// ============================================================
// جلوگیری از HTML
// ============================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// شروع برنامه
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        showHome();

    }
);


// ============================================================
// صفحه اصلی
// ============================================================

function showHome() {

    const app =
        document.querySelector(".app");

    if (!app) {
        return;
    }

    app.innerHTML = `

        <header class="header">

            <div class="header-badge">
                گلزار شهدای تهران
            </div>

            <h1>
                سامانه مدیریت و پایش سنگ مزار
            </h1>

        </header>


        <main class="menu">


            <button
                class="menu-button menu-search"
                type="button"
                id="btn-search"
            >

                <span class="icon">
                    🔎
                </span>

                <span class="button-text">

                    <strong>
                        جستجوی اطلاعات شهید
                    </strong>

                    <small>
                        مشاهده اطلاعات و وضعیت سنگ
                    </small>

                </span>

                <span class="button-arrow">
                    ‹
                </span>

            </button>


            <button
                class="menu-button menu-new"
                type="button"
                id="btn-new"
            >

                <span class="icon">
                    ➕
                </span>

                <span class="button-text">

                    <strong>
                        ثبت اطلاعات شهید جدید
                    </strong>

                    <small>
                        ثبت اطلاعات اولیه برای بررسی و تأیید
                    </small>

                </span>

                <span class="button-arrow">
                    ‹
                </span>

            </button>


            <button
                class="menu-button menu-pending"
                type="button"
                id="btn-pending"
            >

                <span class="icon">
                    📋
                </span>

                <span class="button-text">

                    <strong>
                        اطلاعات ثبت‌شده
                    </strong>

                    <small>
                        بررسی، تأیید و مدیریت اطلاعات ثبت‌شده
                    </small>

                </span>

                <span class="button-arrow">
                    ‹
                </span>

            </button>


            <button
                class="menu-button menu-test"
                type="button"
                id="btn-test"
            >

                <span class="icon">
                    🔗
                </span>

                <span class="button-text">

                    <strong>
                        تست اتصال
                    </strong>

                    <small>
                        بررسی ارتباط با بانک اطلاعاتی
                    </small>

                </span>

                <span class="button-arrow">
                    ‹
                </span>

            </button>


        </main>


        <footer class="footer">

            <strong>
                گلزار شهدای تهران
            </strong>

            <br>

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
// تست اتصال Supabase
// ============================================================

async function testSupabaseConnection() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("martyrs")
            .select("id")
            .limit(1);


        if (error) {

            console.error(
                "Supabase connection error:",
                error
            );

            alert(
                "اتصال به Supabase برقرار نشد.\n\n" +
                error.message
            );

            return;
        }


        console.log(
            "Supabase connection successful:",
            data
        );


        alert(
            "اتصال به Supabase با موفقیت برقرار شد."
        );

    }
    catch (error) {

        console.error(error);

        alert(
            "خطای غیرمنتظره در اتصال به Supabase."
        );

    }
}


// ============================================================
// سربرگ صفحات داخلی
// ============================================================

function internalHeader(
    title,
    subtitle = ""
) {

    return `

        <header class="internal-header">

            <button
                type="button"
                class="back-button"
                id="back-home"
            >
                <span>→</span>
                بازگشت
            </button>


            <div class="internal-title">

                <h2>
                    ${escapeHtml(title)}
                </h2>

                ${
                    subtitle
                    ?
                    `
                    <p>
                        ${escapeHtml(subtitle)}
                    </p>
                    `
                    :
                    ""
                }

            </div>

        </header>

    `;
}


// ============================================================
// صفحه ثبت اطلاعات شهید جدید
// ============================================================

function showNewRecord() {

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
                            value="مرمتی"
                        >

                        <span class="choice-dot"></span>

                        <span>
                            مرمتی
                        </span>

                    </label>


                    <label class="choice-card">

                        <input
                            type="radio"
                            name="stone-type"
                            value="تعویضی"
                        >

                        <span class="choice-dot"></span>

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

                        <label for="new-piece">
                            قطعه
                        </label>

                        <select id="new-piece">

                            <option value="">
                                انتخاب قطعه
                            </option>

                            ${PIECES.map(
                                piece =>
                                `
                                <option value="${piece}">
                                    ${toPersianDigits(piece)}
                                </option>
                                `
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


                <div class="stage-columns">


                    <div class="stage-column">

                        <div class="stage-column-title">
                            مرمت
                        </div>


                        <label class="stage-option">

                            <input
                                type="radio"
                                name="stage"
                                value="طرح سنگ به واحد مرمت ارسال شد"
                            >

                            <span class="stage-dot"></span>

                            <span>
                                طرح سنگ به واحد مرمت ارسال شد
                            </span>

                        </label>


                        <label class="stage-option">

                            <input
                                type="radio"
                                name="stage"
                                value="سنگ مرمتی آماده است"
                            >

                            <span class="stage-dot"></span>

                            <span>
                                سنگ مرمتی آماده است
                            </span>

                        </label>


                        <label class="stage-option">

                            <input
                                type="radio"
                                name="stage"
                                value="نصب سنگ مرمت شده"
                            >

                            <span class="stage-dot"></span>

                            <span>
                                نصب سنگ مرمت شده
                            </span>

                        </label>


                    </div>


                    <div class="stage-column">

                        <div class="stage-column-title">
                            تعویض
                        </div>


                        <label class="stage-option">

                            <input
                                type="radio"
                                name="stage"
                                value="طرح سنگ به واحد تعویض ارسال شد"
                            >

                            <span class="stage-dot"></span>

                            <span>
                                طرح سنگ به واحد تعویض ارسال شد
                            </span>

                        </label>


                        <label class="stage-option">

                            <input
                                type="radio"
                                name="stage"
                                value="سنگ تعویضی آماده است"
                            >

                            <span class="stage-dot"></span>

                            <span>
                                سنگ تعویضی آماده است
                            </span>

                        </label>


                        <label class="stage-option">

                            <input
                                type="radio"
                                name="stage"
                                value="سنگ تعویضی نصب شد"
                            >

                            <span class="stage-dot"></span>

                            <span>
                                سنگ تعویضی نصب شد
                            </span>

                        </label>


                    </div>


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


    document
        .getElementById("back-home")
        .addEventListener(
            "click",
            showHome
        );


    document
        .getElementById("save-new")
        .addEventListener(
            "click",
            saveNewRecord
        );


    document
        .getElementById("new-name")
        .focus();
}


// ============================================================
// ذخیره رکورد جدید
// ============================================================

async function saveNewRecord() {

    const name =
        document
            .getElementById("new-name")
            .value
            .trim();


    const lastname =
        document
            .getElementById("new-lastname")
            .value
            .trim();


    const piece =
        document
            .getElementById("new-piece")
            .value;


    const row =
        document
            .getElementById("new-row")
            .value
            .trim();


    const number =
        document
            .getElementById("new-number")
            .value
            .trim();


    const stoneType =
        document.querySelector(
            'input[name="stone-type"]:checked'
        );


    const stage =
        document.querySelector(
            'input[name="stage"]:checked'
        );


    const notes =
        document
            .getElementById("new-notes")
            .value
            .trim();


    if (!name) {

        alert("نام شهید را وارد کنید.");

        return;
    }


    if (!lastname) {

        alert(
            "نام خانوادگی شهید را وارد کنید."
        );

        return;
    }


    if (!stoneType) {

        alert(
            "نوع عملیات سنگ را مشخص کنید."
        );

        return;
    }


    if (!piece) {

        alert(
            "قطعه را انتخاب کنید."
        );

        return;
    }


    if (!row) {

        alert(
            "ردیف مزار را وارد کنید."
        );

        return;
    }


    if (!number) {

        alert(
            "شماره مزار را وارد کنید."
        );

        return;
    }


    if (!stage) {

        alert(
            "مرحله فعلی کار را مشخص کنید."
        );

        return;
    }


    const button =
        document.getElementById(
            "save-new"
        );


    button.disabled = true;

    button.textContent =
        "در حال ذخیره...";


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("martyrs")
            .insert({

                name: name,

                lastname: lastname,

                piece: piece,

                grave_row: row,

                grave_number: number,

                stone_type:
                    stoneType.value,

                stage:
                    stage.value,

                notes:
                    notes || null,

                status:
                    "در انتظار تأیید"

            })
            .select()
            .single();


        if (error) {

            console.error(
                "Insert error:",
                error
            );

            alert(
                "ذخیره اطلاعات انجام نشد.\n\n" +
                error.message
            );

            button.disabled = false;

            button.textContent =
                "ذخیره اطلاعات";

            return;
        }


        if (!data) {

            alert(
                "رکورد ذخیره نشد."
            );

            button.disabled = false;

            button.textContent =
                "ذخیره اطلاعات";

            return;
        }


        alert(
            "اطلاعات شهید با موفقیت ثبت شد.\n\n" +
            "وضعیت: در انتظار تأیید"
        );


        showPendingRecords();

    }
    catch (error) {

        console.error(error);

        alert(
            "خطای غیرمنتظره هنگام ذخیره اطلاعات."
        );


        button.disabled = false;

        button.textContent =
            "ذخیره اطلاعات";

    }
}


// ============================================================
// صفحه اطلاعات ثبت‌شده
// ============================================================

async function showPendingRecords() {

    const app =
        document.querySelector(".app");


    app.innerHTML = `

        ${internalHeader(
            "اطلاعات ثبت‌شده",
            "بررسی و تأیید اطلاعات ثبت‌شده"
        )}


        <main class="content">

            <div class="card">


                <div
                    id="record-summary"
                    class="record-summary"
                >
                    در حال دریافت اطلاعات...
                </div>


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
            showHome
        );


    await loadPendingRecords();
}


// ============================================================
// دریافت رکوردها
// ============================================================

async function loadPendingRecords() {

    const container =
        document.getElementById(
            "pending-container"
        );


    const summary =
        document.getElementById(
            "record-summary"
        );


    if (!container) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("martyrs")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Fetch records error:",
                error
            );


            container.innerHTML = `

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


        const records =
            data || [];


        const total =
            records.length;


        const pending =
            records.filter(
                record =>
                    record.status ===
                    "در انتظار تأیید"
            ).length;


        const approved =
            records.filter(
                record =>
                    record.status ===
                    "تأیید شده"
            ).length;


        if (summary) {

            summary.innerHTML = `

                <div class="summary-item">

                    <strong>
                        ${toPersianDigits(total)}
                    </strong>

                    <span>
                        کل رکوردها
                    </span>

                </div>


                <div class="summary-item">

                    <strong>
                        ${toPersianDigits(pending)}
                    </strong>

                    <span>
                        در انتظار تأیید
                    </span>

                </div>


                <div class="summary-item">

                    <strong>
                        ${toPersianDigits(approved)}
                    </strong>

                    <span>
                        تأیید شده
                    </span>

                </div>

            `;

        }


        if (records.length === 0) {

            container.innerHTML = `

                <div class="empty-message">

                    هنوز اطلاعاتی ثبت نشده است.

                </div>

            `;

            return;
        }


        container.innerHTML =
            records
                .map(
                    record =>
                        `
                        <button
                            type="button"
                            class="record-list-item"
                            data-record-id="${escapeHtml(record.id)}"
                        >

                            <span>

                                ${escapeHtml(
                                    record.name
                                )}

                                ${escapeHtml(
                                    record.lastname
                                )}

                            </span>


                            <small>

                                ${
                                    record.status ||
                                    "در انتظار تأیید"
                                }

                            </small>

                        </button>
                        `
                )
                .join("");


        container
            .querySelectorAll(
                ".record-list-item"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () =>
                        showRecordDetail(
                            button.dataset.recordId
                        )
                );

            });

    }
    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="error-message">

                خطای غیرمنتظره هنگام دریافت اطلاعات.

            </div>

        `;

    }
}


// ============================================================
// جزئیات رکورد
// ============================================================

async function showRecordDetail(id) {

    const app =
        document.querySelector(".app");


    app.innerHTML = `

        ${internalHeader(
            "جزئیات اطلاعات شهید",
            "بررسی رکورد"
        )}


        <main class="content">

            <div class="card">

                <div
                    id="record-detail-container"
                    class="record-detail"
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
            showPendingRecords
        );


    const container =
        document.getElementById(
            "record-detail-container"
        );


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("martyrs")
            .select("*")
            .eq(
                "id",
                id
            )
            .maybeSingle();


        if (error) {

            console.error(
                "Detail error:",
                error
            );


            container.innerHTML = `

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


        if (!data) {

            container.innerHTML = `

                <div class="error-message">

                    این رکورد دیگر در بانک اطلاعاتی وجود ندارد.

                </div>

            `;

            return;
        }


        container.innerHTML = buildRecordDetail(data);


        const approveButton =
            document.getElementById(
                "approve-record"
            );


        const deleteButton =
            document.getElementById(
                "delete-record"
            );


        if (approveButton) {

            approveButton.addEventListener(
                "click",
                () =>
                    approveRecord(
                        data.id
                    )
            );

        }


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                () =>
                    deleteRecord(
                        data.id
                    )
            );

        }

    }
    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="error-message">

                خطای غیرمنتظره هنگام دریافت اطلاعات.

            </div>

        `;

    }
}


// ============================================================
// ساخت جزئیات رکورد
// ============================================================

function buildRecordDetail(record) {

    const status =
        record.status ||
        "در انتظار تأیید";


    const isPending =
        status === "در انتظار تأیید";


    return `

        <div class="detail-status">

            ${escapeHtml(status)}

        </div>


        <div class="detail-name">

            ${escapeHtml(record.name)}

            ${escapeHtml(record.lastname)}

        </div>


        <div class="detail-grid">


            <div class="detail-item">

                <small>
                    نوع عملیات سنگ
                </small>

                <strong>
                    ${escapeHtml(
                        record.stone_type
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <small>
                    قطعه
                </small>

                <strong>
                    ${toPersianDigits(
                        record.piece
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <small>
                    ردیف
                </small>

                <strong>
                    ${escapeHtml(
                        record.grave_row
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <small>
                    شماره
                </small>

                <strong>
                    ${escapeHtml(
                        record.grave_number
                    )}
                </strong>

            </div>


        </div>


        <div class="detail-stage">

            <span>
                مرحله فعلی کار
            </span>

            <strong>
                ${escapeHtml(
                    record.stage
                )}
            </strong>

        </div>


        ${
            record.notes
            ?
            `
            <div class="detail-notes">

                <span>
                    توضیحات
                </span>

                <p>
                    ${escapeHtml(
                        record.notes
                    )}
                </p>

            </div>
            `
            :
            ""
        }


        <div class="detail-actions">


            ${
                isPending
                ?
                `
                <button
                    type="button"
                    class="primary-button"
                    id="approve-record"
                >
                    تأیید اطلاعات
                </button>
                `
                :
                ""
            }


            <button
                type="button"
                class="danger-button"
                id="delete-record"
            >
                حذف این رکورد
            </button>


        </div>

    `;
}


// ============================================================
// تأیید رکورد
// ============================================================

async function approveRecord(id) {

    const answer =
        window.confirm(
            "آیا از تأیید اطلاعات این شهید مطمئن هستید؟"
        );


    if (!answer) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("martyrs")
            .update({
                status: "تأیید شده"
            })
            .eq(
                "id",
                id
            )
            .select("id,status");


        if (error) {

            console.error(
                "Approve error:",
                error
            );


            alert(
                "تأیید اطلاعات انجام نشد.\n\n" +
                error.message
            );

            return;
        }


        if (!data || data.length === 0) {

            alert(
                "رکوردی برای تأیید پیدا نشد."
            );

            return;
        }


        alert(
            "اطلاعات شهید با موفقیت تأیید شد."
        );


        showPendingRecords();

    }
    catch (error) {

        console.error(error);

        alert(
            "خطای غیرمنتظره هنگام تأیید اطلاعات."
        );

    }
}


// ============================================================
// حذف رکورد
// ============================================================

async function deleteRecord(id) {

    const answer =
        window.confirm(
            "آیا از حذف این اطلاعات مطمئن هستید؟"
        );


    if (!answer) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("martyrs")
            .delete()
            .eq(
                "id",
                id
            )
            .select("id");


        if (error) {

            console.error(
                "Delete error:",
                error
            );


            alert(
                "حذف انجام نشد.\n\n" +
                error.message
            );

            return;
        }


        if (!data || data.length === 0) {

            alert(
                "رکورد حذف نشد.\n\n" +
                "احتمالاً دسترسی حذف در Supabase فعال نیست."
            );

            return;
        }


        alert(
            "رکورد با موفقیت حذف شد."
        );


        showPendingRecords();

    }
    catch (error) {

        console.error(error);

        alert(
            "خطای غیرمنتظره هنگام حذف."
        );

    }
}


// ============================================================
// صفحه جستجو
// ============================================================

function showSearch() {

    const app =
        document.querySelector(".app");


    app.innerHTML = `

        ${internalHeader(
            "جستجوی اطلاعات شهید",
            "جستجو در اطلاعات ثبت‌شده"
        )}


        <main class="content">

            <div class="card">


                <div class="search-form">


                    <div class="form-group">

                        <label for="search-name">
                            نام
                        </label>

                        <input
                            type="text"
                            id="search-name"
                            autocomplete="off"
                            placeholder="مثلاً اصغر"
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
                            placeholder="نام خانوادگی"
                        >

                    </div>


                    <div class="form-row">


                        <div class="form-group">

                            <label for="search-piece">
                                قطعه
                            </label>

                            <select id="search-piece">

                                <option value="">
                                    انتخاب قطعه
                                </option>

                                ${PIECES.map(
                                    piece =>
                                    `
                                    <option value="${piece}">
                                        ${toPersianDigits(piece)}
                                    </option>
                                    `
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


                    <div class="form-group">

                        <label for="search-status">
                            وضعیت عملیات
                        </label>

                        <select id="search-status">

                            <option value="">
                                همه وضعیت‌ها
                            </option>

                            <option value="مرمتی">
                                مرمتی
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


                </div>


                <div
                    id="search-count"
                    class="search-count"
                ></div>


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
            showHome
        );


    document
        .getElementById("search-button")
        .addEventListener(
            "click",
            performSearch
        );


    const searchInputs =
        document.querySelectorAll(
            "#search-name, #search-lastname, #search-row, #search-number"
        );


    searchInputs.forEach(input => {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    performSearch();

                }

            }
        );

    });


    document
        .getElementById("search-name")
        .focus();
}


// ============================================================
// جستجو
// ============================================================

async function performSearch() {

    const name =
        document
            .getElementById("search-name")
            .value
            .trim();


    const lastname =
        document
            .getElementById("search-lastname")
            .value
            .trim();


    const piece =
        document
            .getElementById("search-piece")
            .value;


    const row =
        document
            .getElementById("search-row")
            .value
            .trim();


    const number =
        document
            .getElementById("search-number")
            .value
            .trim();


    const status =
        document
            .getElementById("search-status")
            .value;


    const countContainer =
        document.getElementById(
            "search-count"
        );


    const resultsContainer =
        document.getElementById(
            "search-results"
        );


    countContainer.innerHTML = "";


    resultsContainer.innerHTML = `

        <div class="loading-message">
            در حال جستجو...
        </div>

    `;


    try {

        let query =
            supabaseClient
                .from("martyrs")
                .select("*");


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


        if (status === "مرمتی") {

            query =
                query.eq(
                    "stone_type",
                    "مرمتی"
                );

        }


        if (status === "تعویضی") {

            query =
                query.eq(
                    "stone_type",
                    "تعویضی"
                );

        }


        const {
            data,
            error
        } = await query
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Search error:",
                error
            );


            countContainer.innerHTML = "";

            resultsContainer.innerHTML = `

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


        const records =
            data || [];


        countContainer.innerHTML = `

            <strong>
                ${toPersianDigits(
                    records.length
                )}
            </strong>

            رکورد پیدا شد

        `;


        if (records.length === 0) {

            resultsContainer.innerHTML = `

                <div class="empty-message">

                    رکوردی با این مشخصات پیدا نشد.

                </div>

            `;

            return;
        }


        resultsContainer.innerHTML =
            records
                .map(
                    record =>
                        `
                        <button
                            type="button"
                            class="record-list-item"
                            data-record-id="${escapeHtml(record.id)}"
                        >

                            <span>

                                ${escapeHtml(
                                    record.name
                                )}

                                ${escapeHtml(
                                    record.lastname
                                )}

                            </span>


                            <small>

                                قطعه
                                ${toPersianDigits(
                                    record.piece
                                )}

                                -

                                ${escapeHtml(
                                    record.status ||
                                    "در انتظار تأیید"
                                )}

                            </small>

                        </button>
                        `
                )
                .join("");


        resultsContainer
            .querySelectorAll(
                ".record-list-item"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () =>
                        showRecordDetail(
                            button.dataset.recordId
                        )
                );

            });

    }
    catch (error) {

        console.error(error);

        countContainer.innerHTML = "";

        resultsContainer.innerHTML = `

            <div class="error-message">

                خطای غیرمنتظره هنگام جستجو.

            </div>

        `;

    }
}
```
