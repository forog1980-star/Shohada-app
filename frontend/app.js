
// ============================================================
// GolzarStone
// سامانه ساده مدیریت و پایش سنگ مزار شهدا
// نسخه اولیه موبایل
// ============================================================

"use strict";

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

const STORAGE_KEY = "golzarstone_pending_records";

// ============================================================
// ابزار اعداد فارسی
// ============================================================

function toPersianDigits(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value).replace(
        /[0-9]/g,
        digit => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]
    );
}

// ============================================================
// وضعیت برنامه
// ============================================================

let currentScreen = "home";

// ============================================================
// شروع برنامه
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    setupHomeButtons();

    showHome();

});

// ============================================================
// دکمه‌های صفحه اصلی
// ============================================================

function setupHomeButtons() {

    const buttons = document.querySelectorAll(".menu-button");

    if (buttons.length < 3) {
        return;
    }

    // جستجوی شهید
    buttons[0].addEventListener("click", () => {
        showSearch();
    });

    // ثبت شهید جدید
    buttons[1].addEventListener("click", () => {
        showNewRecord();
    });

    // اطلاعات ثبت شده
    buttons[2].addEventListener("click", () => {
        showPendingRecords();
    });
}

// ============================================================
// صفحه اصلی
// ============================================================

function showHome() {

    currentScreen = "home";

    const app = document.querySelector(".app");

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

                <span class="icon">🔎</span>

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

                <span class="icon">➕</span>

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

                <span class="icon">📋</span>

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
        .addEventListener("click", showSearch);

    document
        .getElementById("btn-new")
        .addEventListener("click", showNewRecord);

    document
        .getElementById("btn-pending")
        .addEventListener("click", showPendingRecords);
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
                ${title}
            </h2>

        </div>

    `;
}

// ============================================================
// صفحه ثبت شهید جدید
// ============================================================

function showNewRecord() {

    currentScreen = "new";

    const app = document.querySelector(".app");

    app.innerHTML = `

        ${internalHeader("ثبت شهید جدید")}

        <main class="content">

            <div class="card">

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
                                piece =>
                                `<option value="${piece}">
                                    ${toPersianDigits(piece)}
                                </option>`
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
                        >

                    </div>

                </div>


                <div class="section-title">
                    وضعیت سنگ
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


                <div class="section-title">
                    مرحله فعلی کار
                </div>


                <div class="stage-list">

                    <label class="check-option">

                        <input
                            type="radio"
                            name="stage"
                            value="ارسال به واحد مرمت"
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
                        >

                        <span>
                            نصب مرمتی شده
                        </span>

                    </label>


                    <label class="check-option">

                        <input
                            type="radio"
                            name="stage"
                            value="ارسال به واحد تعویض"
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
                        >

                        <span>
                            تعویضی نصب شده
                        </span>

                    </label>

                </div>


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
        .addEventListener("click", showHome);

    document
        .getElementById("save-new")
        .addEventListener("click", saveNewRecord);

    setupNumberInputs();

    document
        .getElementById("new-name")
        .focus();
}

// ============================================================
// ذخیره شهید جدید
// ============================================================

function saveNewRecord() {

    const name =
        document.getElementById("new-name").value.trim();

    const lastname =
        document.getElementById("new-lastname").value.trim();

    const piece =
        document.getElementById("new-piece").value;

    const row =
        document.getElementById("new-row").value.trim();

    const number =
        document.getElementById("new-number").value.trim();

    const stoneType =
        document.querySelector(
            'input[name="stone-type"]:checked'
        );

    const stage =
        document.querySelector(
            'input[name="stage"]:checked'
        );

    const notes =
        document.getElementById("new-notes").value.trim();


    if (!name) {

        alert("نام شهید را وارد کنید.");

        return;
    }


    if (!lastname) {

        alert("نام خانوادگی شهید را وارد کنید.");

        return;
    }


    if (!piece) {

        alert("قطعه را انتخاب کنید.");

        return;
    }


    if (!row) {

        alert("ردیف مزار را وارد کنید.");

        return;
    }


    if (!number) {

        alert("شماره مزار را وارد کنید.");

        return;
    }


    if (!stoneType) {

        alert("وضعیت سنگ را مشخص کنید.");

        return;
    }


    if (!stage) {

        alert("مرحله فعلی کار را مشخص کنید.");

        return;
    }


    const record = {

        id: Date.now(),

        name: name,

        lastname: lastname,

        piece: piece,

        row: row,

        number: number,

        stoneType: stoneType.value,

        stage: stage.value,

        notes: notes,

        createdAt: new Date().toISOString(),

        status: "در انتظار تأیید"

    };


    const records = getPendingRecords();

    records.push(record);

    savePendingRecords(records);


    alert(
        "اطلاعات شهید با موفقیت ثبت شد.\n\n" +
        "وضعیت: در انتظار تأیید"
    );


    showHome();
}

// ============================================================
// اطلاعات ثبت شده
// ============================================================

function showPendingRecords() {

    currentScreen = "pending";

    const records = getPendingRecords();

    const app = document.querySelector(".app");

    app.innerHTML = `

        ${internalHeader("اطلاعات ثبت‌شده")}

        <main class="content">

            <div class="card">

                ${
                    records.length === 0

                    ?

                    `
                    <div class="empty-message">

                        هنوز اطلاعاتی ثبت نشده است.

                    </div>
                    `

                    :

                    records
                        .slice()
                        .reverse()
                        .map(
                            recordCard
                        )
                        .join("")
                }

            </div>

        </main>

    `;


    document
        .getElementById("back-home")
        .addEventListener("click", showHome);


    records.forEach(record => {

        const button =
            document.getElementById(
                `delete-${record.id}`
            );

        if (button) {

            button.addEventListener(
                "click",
                () => deleteRecord(record.id)
            );

        }

    });
}

// ============================================================
// کارت رکورد
// ============================================================

function recordCard(record) {

    return `

        <div class="record-card">

            <div class="record-name">

                ${escapeHtml(record.name)}
                ${escapeHtml(record.lastname)}

            </div>


            <div class="record-info">

                قطعه
                ${toPersianDigits(record.piece)}

                -

                ردیف
                ${toPersianDigits(record.row)}

                -

                شماره
                ${toPersianDigits(record.number)}

            </div>


            <div class="record-info">

                وضعیت:
                ${escapeHtml(record.stoneType)}

            </div>


            <div class="record-info">

                مرحله:
                ${escapeHtml(record.stage)}

            </div>


            ${
                record.notes

                ?

                `
                <div class="record-notes">

                    ${escapeHtml(record.notes)}

                </div>
                `

                :

                ""
            }


            <div class="record-status">

                ${escapeHtml(record.status)}

            </div>


            <button
                type="button"
                class="danger-button"
                id="delete-${record.id}"
            >
                حذف
            </button>

        </div>

    `;
}

// ============================================================
// حذف رکورد
// ============================================================

function deleteRecord(id) {

    const answer = confirm(
        "آیا از حذف این اطلاعات مطمئن هستید؟"
    );

    if (!answer) {
        return;
    }


    const records =
        getPendingRecords()
        .filter(record => record.id !== id);


    savePendingRecords(records);

    showPendingRecords();
}

// ============================================================
// جستجو
// ============================================================

function showSearch() {

    currentScreen = "search";

    const app = document.querySelector(".app");

    app.innerHTML = `

        ${internalHeader("جستجوی شهید")}

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
                                piece =>
                                `<option value="${piece}">
                                    ${toPersianDigits(piece)}
                                </option>`
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
        .addEventListener("click", showHome);


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

function performSearch() {

    const text =
        document
            .getElementById("search-text")
            .value
            .trim()
            .toLowerCase();

    const piece =
        document
            .getElementById("search-piece")
            .value;

    const number =
        document
            .getElementById("search-number")
            .value
            .trim();


    const records =
        getPendingRecords();


    const results =
        records.filter(record => {

            const fullName =
                `${record.name} ${record.lastname}`
                .toLowerCase();


            if (
                text &&
                !fullName.includes(text)
            ) {

                return false;

            }


            if (
                piece &&
                record.piece !== piece
            ) {

                return false;

            }


            if (
                number &&
                record.number !== number
            ) {

                return false;

            }


            return true;

        });


    const container =
        document.getElementById(
            "search-results"
        );


    if (results.length === 0) {

        container.innerHTML = `

            <div class="empty-message">

                رکوردی پیدا نشد.

            </div>

        `;

        return;
    }


    container.innerHTML =
        results
            .map(recordCard)
            .join("");
}

// ============================================================
// LocalStorage
// ============================================================

function getPendingRecords() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!data) {
            return [];
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(error);

        return [];

    }
}

// ============================================================

function savePendingRecords(records) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );
}

// ============================================================
// اعداد ورودی
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
                    input.value
                        .replace(
                            /[۰-۹]/g,
                            digit =>
                                String(
                                    "۰۱۲۳۴۵۶۷۸۹"
                                        .indexOf(digit)
                                )
                        )
                        .replace(
                            /[^0-9]/g,
                            ""
                        );

            }
        );

    });
}

// ============================================================
// جلوگیری از ورود HTML
// ============================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
