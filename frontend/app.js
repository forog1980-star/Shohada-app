// ============================================================
// GolzarStone
// سامانه مدیریت و پایش سنگ مزار شهدا
// نسخه موبایل - اتصال به Supabase
// ============================================================

"use strict";

// ============================================================
// تنظیمات Supabase
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
// تنظیمات برنامه
// ============================================================

const TABLE_NAME = "martyrs";

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
// وضعیت برنامه
// ============================================================

let currentScreen = "home";


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
// اعداد فارسی
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


// ============================================================
// اعداد انگلیسی
// ============================================================

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
            /[^0-9]/g,
            ""
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
// پیام خطا
// ============================================================

function showError(message) {

    alert(
        "خطا\n\n" +
        message
    );

}


// ============================================================
// صفحه اصلی
// ============================================================

function showHome() {

    currentScreen = "home";

    const app =
        document.querySelector(".app");

    if (!app) {

        return;

    }


    app.innerHTML = `

        <header class="header">

            <h1>
                بهسازی سنگ شهدا
            </h1>

            <p>
                سامانه مدیریت و پایش سنگ مزار
            </p>

        </header>


        <main class="menu">

            <button
                class="menu-button"
                type="button"
                id="btn-search"
            >

                <span class="icon">
                    🔎
                </span>

                جستجوی شهید

                <span class="description">
                    مشاهده اطلاعات و وضعیت سنگ
                </span>

            </button>


            <button
                class="menu-button"
                type="button"
                id="btn-new"
            >

                <span class="icon">
                    ➕
                </span>

                ثبت شهید جدید

                <span class="description">
                    ثبت سریع اطلاعات شهید در محل
                </span>

            </button>


            <button
                class="menu-button"
                type="button"
                id="btn-pending"
            >

                <span class="icon">
                    📋
                </span>

                اطلاعات ثبت‌شده

                <span class="description">
                    مشاهده موارد ثبت‌شده و در انتظار تأیید
                </span>

            </button>

        </main>


        <footer class="footer">

            GolzarStone

            <br>

            پروژه بهسازی سنگ‌های شهدا

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

}


// ============================================================
// سربرگ داخلی
// ============================================================

function internalHeader(title) {

    return `

        <div class="internal-header">

            <button
                type="button"
                class="back-button"
                id="back-home"
            >
                ← بازگشت
            </button>

            <h2>
                ${escapeHtml(title)}
            </h2>

        </div>

    `;

}


// ============================================================
// صفحه ثبت شهید جدید
// ============================================================

function showNewRecord() {

    currentScreen = "new";

    const app =
        document.querySelector(".app");


    app.innerHTML = `

        ${internalHeader("ثبت شهید جدید")}


        <main class="content">

            <div class="card">


                <!-- نام -->

                <div class="form-group">

                    <label>
                        نام
                    </label>

                    <input
                        type="text"
                        id="new-name"
                        autocomplete="off"
                    >

                </div>


                <!-- نام خانوادگی -->

                <div class="form-group">

                    <label>
                        نام خانوادگی
                    </label>

                    <input
                        type="text"
                        id="new-lastname"
                        autocomplete="off"
                    >

                </div>


                <!-- محل مزار -->

                <div class="form-row">


                    <div class="form-group">

                        <label>
                            قطعه
                        </label>

                        <select id="new-piece">

                            <option value="">
                                انتخاب قطعه
                            </option>

                            ${PIECES.map(
                                piece => `
                                    <option value="${piece}">
                                        ${toPersianDigits(piece)}
                                    </option>
                                `
                            ).join("")}

                        </select>

                    </div>


                    <div class="form-group">

                        <label>
                            ردیف
                        </label>

                        <input
                            type="text"
                            id="new-row"
                            inputmode="numeric"
                            autocomplete="off"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            شماره
                        </label>

                        <input
                            type="text"
                            id="new-number"
                            inputmode="numeric"
                            autocomplete="off"
                        >

                    </div>


                </div>


                <!-- نوع کار -->

                <div class="section-title">

                    نوع کار

                </div>


                <div class="main-status">


                    <label class="status-option">

                        <input
                            type="radio"
                            name="stone-type"
                            value="مرمتی"
                        >

                        <span>
                            ✓ مرمتی
                        </span>

                    </label>


                    <label class="status-option">

                        <input
                            type="radio"
                            name="stone-type"
                            value="تعویضی"
                        >

                        <span>
                            ✓ تعویضی
                        </span>

                    </label>


                </div>


                <!-- مرحله فعلی -->

                <div class="section-title">

                    مرحله فعلی کار

                </div>


                <div class="stage-list">


                    <!-- مرمت -->

                    <label class="check-option">

                        <input
                            type="radio"
                            name="stage"
                            value="ارسال به واحد مرمت"
                            data-type="مرمتی"
                        >

                        <span>
                            ارسال به واحد مرمت
                        </span>

                    </label>


                    <label class="check-option">

                        <input
                            type="radio"
                            name="stage"
                            value="سنگ مرمتی آماده"
                            data-type="مرمتی"
                        >

                        <span>
                            سنگ مرمتی آماده
                        </span>

                    </label>


                    <label class="check-option">

                        <input
                            type="radio"
                            name="stage"
                            value="نصب مرمتی شده"
                            data-type="مرمتی"
                        >

                        <span>
                            نصب مرمتی شده
                        </span>

                    </label>


                    <!-- تعویض -->

                    <label class="check-option">

                        <input
                            type="radio"
                            name="stage"
                            value="ارسال به واحد تعویض"
                            data-type="تعویضی"
                        >

                        <span>
                            ارسال به واحد تعویض
                        </span>

                    </label>


                    <label class="check-option">

                        <input
                            type="radio"
                            name="stage"
                            value="سنگ تعویضی آماده"
                            data-type="تعویضی"
                        >

                        <span>
                            سنگ تعویضی آماده
                        </span>

                    </label>


                    <label class="check-option">

                        <input
                            type="radio"
                            name="stage"
                            value="تعویضی نصب شده"
                            data-type="تعویضی"
                        >

                        <span>
                            تعویضی نصب شده
                        </span>

                    </label>


                </div>


                <!-- توضیحات -->

                <div class="form-group">

                    <label>
                        توضیحات
                    </label>

                    <textarea
                        id="new-notes"
                        rows="3"
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


    setupNumberInputs();


    setupStageLogic();


    document
        .getElementById("new-name")
        .focus();

}


// ============================================================
// منطق هماهنگی نوع کار و مرحله
// ============================================================

function setupStageLogic() {

    const typeInputs =
        document.querySelectorAll(
            'input[name="stone-type"]'
        );


    const stageInputs =
        document.querySelectorAll(
            'input[name="stage"]'
        );


    typeInputs.forEach(
        input => {

            input.addEventListener(
                "change",
                () => {

                    const selectedType =
                        input.value;


                    stageInputs.forEach(
                        stage => {

                            if (
                                stage.dataset.type ===
                                selectedType
                            ) {

                                stage.disabled =
                                    false;

                            } else {

                                stage.checked =
                                    false;

                                stage.disabled =
                                    true;

                            }

                        }
                    );

                }
            );

        }
    );


    stageInputs.forEach(
        stage => {

            stage.disabled = true;

        }
    );

}


// ============================================================
// ذخیره شهید جدید
// ============================================================

async function saveNewRecord() {

    const saveButton =
        document.getElementById(
            "save-new"
        );


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
        toEnglishDigits(
            document
                .getElementById("new-row")
                .value
                .trim()
        );


    const number =
        toEnglishDigits(
            document
                .getElementById("new-number")
                .value
                .trim()
        );


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


    // --------------------------------------------------------
    // کنترل اطلاعات
    // --------------------------------------------------------

    if (!name) {

        alert(
            "نام شهید را وارد کنید."
        );

        return;

    }


    if (!lastname) {

        alert(
            "نام خانوادگی شهید را وارد کنید."
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


    if (!stoneType) {

        alert(
            "مرمتی یا تعویضی را مشخص کنید."
        );

        return;

    }


    if (!stage) {

        alert(
            "مرحله فعلی کار را مشخص کنید."
        );

        return;

    }


    if (
        stage.dataset.type !==
        stoneType.value
    ) {

        alert(
            "مرحله انتخاب‌شده با نوع کار هماهنگ نیست."
        );

        return;

    }


    // --------------------------------------------------------
    // جلوگیری از دوبار کلیک
    // --------------------------------------------------------

    saveButton.disabled = true;

    saveButton.textContent =
        "در حال ذخیره...";


    // --------------------------------------------------------
    // اطلاعات برای Supabase
    // --------------------------------------------------------

    const record = {

        name: name,

        lastname: lastname,

        piece: piece,

        grave_row: row,

        grave_number: number,

        stone_type: stoneType.value,

        stage: stage.value,

        notes: notes || null,

        status: "در انتظار تأیید"

    };


    // --------------------------------------------------------
    // INSERT
    // --------------------------------------------------------

    const {
        data,
        error
    } = await supabaseClient

        .from(TABLE_NAME)

        .insert(record)

        .select();


    // --------------------------------------------------------
    // خطا
    // --------------------------------------------------------

    if (error) {

        console.error(
            "Supabase INSERT error:",
            error
        );


        saveButton.disabled =
            false;

        saveButton.textContent =
            "ذخیره اطلاعات";


        showError(
            "ذخیره اطلاعات انجام نشد.\n\n" +
            error.message
        );


        return;

    }


    // --------------------------------------------------------
    // موفقیت
    // --------------------------------------------------------

    alert(
        "اطلاعات شهید با موفقیت ثبت شد.\n\n" +
        "وضعیت: در انتظار تأیید"
    );


    showHome();

}


// ============================================================
// اطلاعات ثبت شده
// ============================================================

async function showPendingRecords() {

    currentScreen = "pending";

    const app =
        document.querySelector(".app");


    app.innerHTML = `

        ${internalHeader(
            "اطلاعات ثبت‌شده"
        )}


        <main class="content">

            <div class="card">

                <div
                    id="pending-container"
                    class="search-results"
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


    const {
        data,
        error
    } = await supabaseClient

        .from(TABLE_NAME)

        .select("*")

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    const container =
        document.getElementById(
            "pending-container"
        );


    if (error) {

        console.error(
            "Supabase SELECT error:",
            error
        );


        container.innerHTML = `

            <div class="empty-message">

                دریافت اطلاعات انجام نشد.

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-message">

                هنوز اطلاعاتی ثبت نشده است.

            </div>

        `;

        return;

    }


    container.innerHTML =
        data
            .map(
                record =>
                    recordCard(
                        record,
                        false
                    )
            )
            .join("");

}


// ============================================================
// کارت رکورد
// ============================================================

function recordCard(
    record,
    showDelete = false
) {

    return `

        <div class="record-card">


            <div class="record-name">

                ${escapeHtml(
                    record.name
                )}

                ${escapeHtml(
                    record.lastname
                )}

            </div>


            <div class="record-info">

                قطعه
                ${toPersianDigits(
                    record.piece
                )}

                -

                ردیف
                ${toPersianDigits(
                    record.grave_row
                )}

                -

                شماره
                ${toPersianDigits(
                    record.grave_number
                )}

            </div>


            <div class="record-info">

                نوع کار:
                ${escapeHtml(
                    record.stone_type
                )}

            </div>


            <div class="record-info">

                مرحله:
                ${escapeHtml(
                    record.stage
                )}

            </div>


            ${
                record.notes

                ?

                `
                <div class="record-notes">

                    توضیحات:
                    ${escapeHtml(
                        record.notes
                    )}

                </div>
                `

                :

                ""
            }


            <div class="record-status">

                ${escapeHtml(
                    record.status ||
                    "در انتظار تأیید"
                )}

            </div>


            ${
                showDelete

                ?

                `
                <button
                    type="button"
                    class="danger-button"
                    data-id="${escapeHtml(
                        record.id
                    )}"
                >
                    حذف
                </button>
                `

                :

                ""
            }


        </div>

    `;

}


// ============================================================
// جستجو
// ============================================================

function showSearch() {

    currentScreen = "search";

    const app =
        document.querySelector(".app");


    app.innerHTML = `

        ${internalHeader(
            "جستجوی شهید"
        )}


        <main class="content">

            <div class="card">


                <div class="form-group">

                    <label>
                        نام یا نام خانوادگی
                    </label>

                    <input
                        type="text"
                        id="search-text"
                        autocomplete="off"
                    >

                </div>


                <div class="form-row">


                    <div class="form-group">

                        <label>
                            قطعه
                        </label>

                        <select id="search-piece">

                            <option value="">
                                همه قطعات
                            </option>

                            ${PIECES.map(
                                piece => `
                                    <option value="${piece}">
                                        ${toPersianDigits(piece)}
                                    </option>
                                `
                            ).join("")}

                        </select>

                    </div>


                    <div class="form-group">

                        <label>
                            شماره
                        </label>

                        <input
                            type="text"
                            id="search-number"
                            inputmode="numeric"
                            autocomplete="off"
                        >

                    </div>


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
            showHome
        );


    document
        .getElementById("search-button")
        .addEventListener(
            "click",
            performSearch
        );


    setupNumberInputs();


    document
        .getElementById("search-text")
        .focus();

}


// ============================================================
// اجرای جستجو
// ============================================================

async function performSearch() {

    const button =
        document.getElementById(
            "search-button"
        );


    const container =
        document.getElementById(
            "search-results"
        );


    const text =
        document
            .getElementById("search-text")
            .value
            .trim();


    const piece =
        document
            .getElementById("search-piece")
            .value;


    const number =
        toEnglishDigits(
            document
                .getElementById("search-number")
                .value
                .trim()
        );


    button.disabled = true;

    button.textContent =
        "در حال جستجو...";


    container.innerHTML = `

        <div class="loading-message">

            در حال جستجو...

        </div>

    `;


    // --------------------------------------------------------
    // ساخت Query
    // --------------------------------------------------------

    let query =
        supabaseClient

            .from(TABLE_NAME)

            .select("*");


    if (piece) {

        query =
            query.eq(
                "piece",
                piece
            );

    }


    if (number) {

        query =
            query.eq(
                "grave_number",
                number
            );

    }


    // --------------------------------------------------------
    // دریافت اطلاعات
    // --------------------------------------------------------

    const {
        data,
        error
    } = await query

        .order(
            "name",
            {
                ascending: true
            }
        );


    button.disabled = false;

    button.textContent =
        "جستجو";


    // --------------------------------------------------------
    // خطا
    // --------------------------------------------------------

    if (error) {

        console.error(
            "Supabase SEARCH error:",
            error
        );


        container.innerHTML = `

            <div class="empty-message">

                جستجو انجام نشد.

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

        return;

    }


    // --------------------------------------------------------
    // فیلتر نام
    // --------------------------------------------------------

    let results =
        data || [];


    if (text) {

        const searchText =
            text.toLowerCase();


        results =
            results.filter(
                record => {

                    const fullName =
                        `${record.name || ""} ${record.lastname || ""}`
                            .toLowerCase();


                    return fullName.includes(
                        searchText
                    );

                }
            );

    }


    // --------------------------------------------------------
    // نتیجه
    // --------------------------------------------------------

    if (
        results.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-message">

                رکوردی پیدا نشد.

            </div>

        `;

        return;

    }


    container.innerHTML =

        `

        <div class="result-count">

            تعداد نتایج:
            ${toPersianDigits(
                results.length
            )}

        </div>

        `

        +

        results

            .map(
                record =>
                    recordCard(
                        record,
                        false
                    )
            )

            .join("");

}


// ============================================================
// ورودی‌های عددی
// ============================================================

function setupNumberInputs() {

    const inputs =
        document.querySelectorAll(
            'input[inputmode="numeric"]'
        );


    inputs.forEach(
        input => {

            input.addEventListener(
                "input",
                () => {

                    input.value =
                        toEnglishDigits(
                            input.value
                        );

                }
            );

        }
    );

}


// ============================================================
// تست اتصال Supabase
// ============================================================

async function testSupabaseConnection() {

    try {

        const {
            error
        } = await supabaseClient

            .from(TABLE_NAME)

            .select("id")

            .limit(1);


        if (error) {

            console.error(
                "Supabase connection error:",
                error
            );

            return false;

        }


        return true;

    } catch (error) {

        console.error(
            error
        );

        return false;

    }

}


// ============================================================
// پایان
// ============================================================
