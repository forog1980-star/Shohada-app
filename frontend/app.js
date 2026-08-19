
// ============================================================
// Shohada-app / GolzarStone
// نسخه موبایل - Supabase + UI داخلی
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
// ابزارها
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

    app.innerHTML = 

        <header class="header">

            <div class="header-badge">
                GolzarStone
            </div>

            <h1>
                بهسازی سنگ شهدا
            </h1>

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

                <span class="icon">
                    🔎
                </span>

                <span class="button-text">

                    <strong>
                        جستجوی شهید
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
                        ثبت شهید جدید
                    </strong>

                    <small>
                        ثبت اطلاعات شهید 
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
                        مشاهده موارد ثبت‌شده و در انتظار تأیید
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
                GolzarStone
            </strong>

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

function internalHeader(title, subtitle = "") {

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
                    `<p>${escapeHtml(subtitle)}</p>`
                    :
                    ""
                }

            </div>

        </header>

    `;
}


// ============================================================
// صفحه ثبت شهید جدید
// ============================================================

function showNewRecord() {

    const app =
        document.querySelector(".app");

    app.innerHTML = `

        ${internalHeader(
            "ثبت شهید جدید",
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
                            inputmode="numeric"
                            placeholder="ردیف"
                        >

                    </div>


                    <div class="form-group">

                        <label for="new-number">
                            شماره
                        </label>

                        <input
                            type="text"
                            id="new-number"
                            inputmode="numeric"
                            placeholder="شماره"
                        >

                    </div>

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

                        <span>
                            تعویضی
                        </span>

                    </label>

                </div>


                <div class="section-title">
                    مرحله فعلی کار
                </div>


                <div class="stage-list">

                    <label class="stage-option">

                        <input
                            type="radio"
                            name="stage"
                            value="ارسال به واحد مرمت"
                        >

                        <span>
                            ارسال به واحد مرمت
                        </span>

                    </label>


                    <label class="stage-option">

                        <input
                            type="radio"
                            name="stage"
                            value="سنگ مرمتی آماده"
                        >

                        <span>
                            سنگ مرمتی آماده
                        </span>

                    </label>


                    <label class="stage-option">

                        <input
                            type="radio"
                            name="stage"
                            value="نصب مرمتی شده"
                        >

                        <span>
                            نصب مرمتی شده
                        </span>

                    </label>


                    <label class="stage-option">

                        <input
                            type="radio"
                            name="stage"
                            value="ارسال به واحد تعویض"
                        >

                        <span>
                            ارسال به واحد تعویض
                        </span>

                    </label>


                    <label class="stage-option">

                        <input
                            type="radio"
                            name="stage"
                            value="سنگ تعویضی آماده"
                        >

                        <span>
                            سنگ تعویضی آماده
                        </span>

                    </label>


                    <label class="stage-option">

                        <input
                            type="radio"
                            name="stage"
                            value="تعویضی نصب شده"
                        >

                        <span>
                            تعویضی نصب شده
                        </span>

                    </label>

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


    setupNumberInputs();


    document
        .getElementById("new-name")
        .focus();
}


// ============================================================
// ذخیره مستقیم در Supabase
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
            "نوع عملیات سنگ را مشخص کنید."
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


        console.log(
            "Saved record:",
            data
        );


        alert(
            "اطلاعات شهید با موفقیت در بانک اطلاعاتی ثبت شد."
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
// اطلاعات ثبت‌شده از Supabase
// ============================================================

async function showPendingRecords() {

    const app =
        document.querySelector(".app");


    app.innerHTML = `

        ${internalHeader(
            "اطلاعات ثبت‌شده",
            "رکوردهای ثبت‌شده در بانک اطلاعاتی"
        )}


        <main class="content">

            <div class="card">

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

            document
                .getElementById(
                    "pending-container"
                )
                .innerHTML = `

                    <div class="error-message">

                        دریافت اطلاعات انجام نشد.

                        <br><br>

                        ${escapeHtml(error.message)}

                    </div>

                `;

            return;
        }


        const container =
            document.getElementById(
                "pending-container"
            );


        if (!data || data.length === 0) {

            container.innerHTML = `

                <div class="empty-message">

                    هنوز اطلاعاتی ثبت نشده است.

                </div>

            `;

            return;
        }


        container.innerHTML =
            data
                .map(recordCard)
                .join("");


        data.forEach(record => {

            const button =
                document.getElementById(
                    `delete-${record.id}`
                );


            if (button) {

                button.addEventListener(
                    "click",
                    () =>
                        deleteRecord(
                            record.id
                        )
                );

            }

        });

    }
    catch (error) {

        console.error(error);

        document
            .getElementById(
                "pending-container"
            )
            .innerHTML = `

                <div class="error-message">

                    خطای غیرمنتظره هنگام دریافت اطلاعات.

                </div>

            `;

    }
}


// ============================================================
// کارت رکورد
// ============================================================

function recordCard(record) {

    return `

        <div class="record-card">

            <div class="record-card-header">

                <div class="record-name">

                    ${escapeHtml(record.name)}
                    ${escapeHtml(record.lastname)}

                </div>


                <span class="status-badge">

                    ${escapeHtml(
                        record.status ||
                        "در انتظار تأیید"
                    )}

                </span>

            </div>


            <div class="location-box">

                <div>

                    <small>
                        قطعه
                    </small>

                    <strong>
                        ${toPersianDigits(
                            record.piece
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        ردیف
                    </small>

                    <strong>
                        ${toPersianDigits(
                            record.grave_row
                        )}
                    </strong>

                </div>


                <div>

                    <small>
                        شماره
                    </small>

                    <strong>
                        ${toPersianDigits(
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
                record.notes
                ?
                `
                <div class="record-notes">

                    <span>
                        توضیحات:
                    </span>

                    ${escapeHtml(
                        record.notes
                    )}

                </div>
                `
                :
                ""
            }


            <button
                type="button"
                class="danger-button"
                id="delete-${record.id}"
            >
                حذف این رکورد
            </button>

        </div>

    `;
}


// ============================================================
// حذف از Supabase
// ============================================================

async function deleteRecord(id) {

    const answer =
        confirm(
            "آیا از حذف این اطلاعات مطمئن هستید؟"
        );


    if (!answer) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("martyrs")
            .delete()
            .eq(
                "id",
                id
            );


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
// فعلاً فقط رکوردهای ثبت‌شده در martyrs
// ============================================================

function showSearch() {

    const app =
        document.querySelector(".app");


    app.innerHTML = `

        ${internalHeader(
            "جستجوی شهید",
            "جستجو در اطلاعات ثبت‌شده"
        )}


        <main class="content">

            <div class="card">

                <div class="form-group">

                    <label for="search-text">
                        نام یا نام خانوادگی
                    </label>

                    <input
                        type="text"
                        id="search-text"
                        autocomplete="off"
                        placeholder="نام یا نام خانوادگی"
                    >

                </div>


                <div class="form-row">

                    <div class="form-group">

                        <label for="search-piece">
                            قطعه
                        </label>

                        <select id="search-piece">

                            <option value="">
                                همه قطعات
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

                        <label for="search-number">
                            شماره
                        </label>

                        <input
                            type="text"
                            id="search-number"
                            inputmode="numeric"
                            placeholder="شماره"
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
// جستجو در Supabase
// ============================================================

async function performSearch() {

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


    const container =
        document.getElementById(
            "search-results"
        );


    container.innerHTML = `

        <div class="loading-message">
            در حال جستجو...
        </div>

    `;


    try {

        let query =
            supabaseClient
                .from("martyrs")
                .select("*");


        if (text) {

            query =
                query.or(
                    `name.ilike.%${text}%,lastname.ilike.%${text}%`
                );

        }


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


        if (!data || data.length === 0) {

            container.innerHTML = `

                <div class="empty-message">

                    رکوردی پیدا نشد.

                </div>

            `;

            return;
        }


        container.innerHTML =
            data
                .map(recordCard)
                .join("");


        data.forEach(record => {

            const button =
                document.getElementById(
                    `delete-${record.id}`
                );


            if (button) {

                button.addEventListener(
                    "click",
                    () =>
                        deleteRecord(
                            record.id
                        )
                );

            }

        });

    }
    catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="error-message">

                خطای غیرمنتظره هنگام جستجو.

            </div>

        `;

    }
}


// ============================================================
// ورودی عددی
// ============================================================

function setupNumberInputs() {

    const inputs =
        document.querySelectorAll(
            'input[inputmode="numeric"]'
        );


    inputs.forEach(input => {

        input.addEventListener(
            "input",
            () => {

                input.value =
                    toEnglishDigits(
                        input.value
                    )
                    .replace(
                        /[^0-9]/g,
                        ""
                    );

            }
        );

    });
}

