// ============================================================
// Shohada-app / GolzarStone
// نسخه موبایل
// Supabase + UI کامل
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
// وضعیت صفحه جستجو
// ============================================================

let lastSearchResults = [];
let lastSearchFilters = null;

// ============================================================
// مراحل مجاز
// ============================================================

const STAGES = {
    "ترمیمی": [
        "طرح سنگ به واحد مرمت ارسال شد",
        "سنگ مرمتی آماده است",
        "نصب سنگ مرمت شده"
    ],

    "تعویضی": [
        "طرح سنگ به واحد تعویض ارسال شد",
        "سنگ تعویضی آماده است",
        "سنگ تعویضی نصب شد"
    ]
};

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
// اعتبارسنجی نوع عملیات و مرحله
// ============================================================

function isValidStageForStoneType(
    stoneType,
    stage
) {

    if (!stoneType || !stage) {
        return false;
    }

    if (!STAGES[stoneType]) {
        return false;
    }

    return STAGES[stoneType].includes(stage);
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
// CSS داخلی
// ============================================================

function applyAppStyles() {

    if (
        document.getElementById(
            "golzar-app-styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "golzar-app-styles";

    style.textContent = `

        :root {
            --green-dark: #17633d;
            --green: #238b57;
            --green-light: #e8f5ed;
            --orange: #d9822b;
            --orange-light: #fff1df;
            --blue: #2878b8;
            --blue-light: #e8f3fb;
            --red: #c84b4b;
            --text: #26352d;
            --muted: #708078;
            --bg: #f4f7f5;
            --white: #ffffff;
            --border: #dce6df;
            --shadow: 0 5px 18px rgba(23, 99, 61, 0.08);
        }


        .app {
            direction: rtl;
            font-family:
                "B Nazanin",
                "B Yekan",
                Tahoma,
                Arial,
                sans-serif;
            color: var(--text);
            background: var(--bg);
            min-height: 100vh;
        }


        .header {
            background:
                linear-gradient(
                    145deg,
                    var(--green-dark),
                    var(--green)
                );
            color: white;
            text-align: center;
            padding: 30px 20px 28px;
            border-radius: 0 0 28px 28px;
            box-shadow: var(--shadow);
        }


        .header-badge {
            display: inline-block;
            background: rgba(255,255,255,.14);
            border: 1px solid rgba(255,255,255,.22);
            padding: 6px 14px;
            border-radius: 30px;
            font-size: 13px;
            margin-bottom: 12px;
        }


        .header h1 {
            margin: 0;
            font-size: 27px;
            font-weight: 700;
        }


        .header p {
            margin: 9px 0 0;
            font-size: 15px;
            opacity: .9;
        }


        .menu {
            padding: 22px 16px;
            display: flex;
            flex-direction: column;
            gap: 14px;
        }


        .menu-button {
            border: none;
            border-radius: 20px;
            min-height: 92px;
            padding: 15px 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            text-align: right;
            cursor: pointer;
            background: white;
            box-shadow: var(--shadow);
            color: var(--text);
            transition: .15s ease;
        }


        .menu-button:active {
            transform: scale(.985);
        }


        .menu-button .icon {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 25px;
            flex-shrink: 0;
        }


        .menu-search .icon {
            background: var(--blue-light);
        }


        .menu-new .icon {
            background: var(--green-light);
        }


        .menu-pending .icon {
            background: var(--orange-light);
        }


        .menu-test .icon {
            background: #edf0f0;
        }


        .button-text {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }


        .button-text strong {
            font-size: 18px;
        }


        .button-text small {
            font-size: 13px;
            color: var(--muted);
        }


        .button-arrow {
            font-size: 29px;
            color: #9aa8a1;
        }


        .footer {
            text-align: center;
            color: var(--muted);
            font-size: 12px;
            padding: 10px 20px 30px;
            line-height: 2;
        }


        .footer a {
            color: var(--green-dark);
            text-decoration: none;
            font-weight: bold;
        }


        .internal-header {
            display: flex;
            align-items: center;
            gap: 12px;
            background: white;
            padding: 15px;
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 10;
        }


        .back-button {
            border: none;
            background: var(--green-light);
            color: var(--green-dark);
            border-radius: 13px;
            padding: 10px 13px;
            font-family: inherit;
            font-size: 14px;
            cursor: pointer;
            white-space: nowrap;
        }


        .internal-title {
            flex: 1;
        }


        .internal-title h2 {
            margin: 0;
            font-size: 20px;
        }


        .internal-title p {
            margin: 4px 0 0;
            color: var(--muted);
            font-size: 12px;
        }


        .content {
            padding: 16px;
        }


        .card {
            background: white;
            border-radius: 20px;
            padding: 18px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border);
        }


        .card-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            color: var(--green-dark);
        }


        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: var(--green-dark);
            border-right: 4px solid var(--green);
            padding-right: 9px;
            margin: 22px 0 13px;
        }


        .form-group {
            margin-bottom: 15px;
        }


        .form-group label {
            display: block;
            margin-bottom: 7px;
            font-size: 14px;
            font-weight: bold;
        }


        input,
        select,
        textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid var(--border);
            border-radius: 13px;
            padding: 12px 13px;
            font-family: inherit;
            font-size: 15px;
            background: #fbfdfc;
            color: var(--text);
            outline: none;
        }


        input:focus,
        select:focus,
        textarea:focus {
            border-color: var(--green);
            box-shadow:
                0 0 0 3px
                rgba(35,139,87,.10);
        }


        textarea {
            resize: vertical;
        }


        .form-row {
            display: grid;
            grid-template-columns:
                1fr 1fr 1fr;
            gap: 10px;
        }


        .choice-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }


        .choice-card {
            position: relative;
            min-height: 82px;
            border: 2px solid var(--border);
            border-radius: 18px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            transition: .15s ease;
        }


        .choice-card input {
            position: absolute;
            opacity: 0;
            pointer-events: none;
        }


        .choice-card:has(input:checked) {
            border-color: var(--green);
            background: var(--green-light);
            color: var(--green-dark);
        }


        .choice-card span::before {
            content: "";
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 3px solid #b8c6be;
            border-radius: 50%;
            vertical-align: -3px;
            margin-left: 9px;
            box-sizing: border-box;
        }


        .choice-card:has(input:checked)
        span::before {
            border-color: var(--green);
            background:
                radial-gradient(
                    circle,
                    var(--green) 0 55%,
                    transparent 58%
                );
        }


        .stage-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }


        .stage-option {
            position: relative;
            min-height: 70px;
            border: 2px solid var(--border);
            border-radius: 16px;
            padding: 12px 14px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            cursor: pointer;
            background: white;
            font-size: 14px;
            transition: .15s ease;
        }


        .stage-option.disabled {
            opacity: .35;
            cursor: not-allowed;
            background: #f1f3f2;
        }


        .stage-option input {
            position: absolute;
            opacity: 0;
            pointer-events: none;
        }


        .stage-option span::before {
            content: "";
            display: inline-block;
            width: 17px;
            height: 17px;
            border: 3px solid #bdc8c2;
            border-radius: 50%;
            vertical-align: -4px;
            margin-left: 8px;
            box-sizing: border-box;
        }


        .stage-option:has(input:checked) {
            border-color: var(--orange);
            background: var(--orange-light);
            color: #8a4f13;
            font-weight: bold;
        }


        .stage-option:has(input:checked)
        span::before {
            border-color: var(--orange);
            background:
                radial-gradient(
                    circle,
                    var(--orange) 0 55%,
                    transparent 58%
                );
        }


        .primary-button {
            width: 100%;
            border: none;
            border-radius: 15px;
            padding: 14px;
            background: var(--green);
            color: white;
            font-family: inherit;
            font-size: 17px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 10px;
        }


        .primary-button:disabled {
            opacity: .65;
            cursor: wait;
        }


        .records-summary {
            display: grid;
            grid-template-columns:
                1fr 1fr 1fr;
            gap: 8px;
            margin-bottom: 15px;
        }


        .summary-box {
            border-radius: 14px;
            padding: 11px 7px;
            text-align: center;
            background: var(--green-light);
        }


        .summary-box.warning {
            background: var(--orange-light);
        }


        .summary-box.approved {
            background: var(--blue-light);
        }


        .summary-box strong {
            display: block;
            font-size: 21px;
        }


        .summary-box small {
            font-size: 11px;
            color: var(--muted);
        }


        .records-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }


        .record-card {
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 15px;
            background: white;
        }


        .record-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 12px;
        }


        .record-name {
            font-size: 18px;
            font-weight: bold;
            color: var(--green-dark);
        }


        .status-badge {
            background: var(--orange-light);
            color: #8a4f13;
            padding: 5px 9px;
            border-radius: 20px;
            font-size: 11px;
            white-space: nowrap;
        }


        .status-badge.approved {
            background: var(--green-light);
            color: var(--green-dark);
        }


        .location-box {
            display: grid;
            grid-template-columns:
                1fr 1fr 1fr;
            gap: 8px;
            margin-bottom: 12px;
        }


        .location-box > div {
            background: var(--bg);
            border-radius: 12px;
            padding: 8px;
            text-align: center;
        }


        .location-box small {
            display: block;
            color: var(--muted);
            font-size: 11px;
        }


        .location-box strong {
            display: block;
            margin-top: 3px;
            font-size: 16px;
        }


        .record-info {
            display: flex;
            gap: 7px;
            margin-top: 8px;
            font-size: 14px;
        }


        .record-info span {
            color: var(--muted);
        }


        .record-notes {
            margin-top: 11px;
            padding: 10px;
            background: #faf9f5;
            border-radius: 11px;
            font-size: 13px;
            line-height: 1.8;
        }


        .record-notes span {
            font-weight: bold;
        }


        .danger-button {
            width: 100%;
            border: none;
            border-radius: 12px;
            padding: 11px;
            background: #fff0f0;
            color: var(--red);
            font-family: inherit;
            margin-top: 13px;
            cursor: pointer;
        }


        .record-card.clickable {
            cursor: pointer;
        }


        .record-card.clickable:active {
            transform: scale(.99);
        }


        .search-count {
            background: var(--blue-light);
            color: var(--blue);
            border-radius: 13px;
            padding: 10px 12px;
            margin-bottom: 12px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
        }


        .filter-title {
            margin-top: 18px;
            margin-bottom: 10px;
            color: var(--green-dark);
            font-weight: bold;
        }


        .loading-message,
        .empty-message,
        .error-message {
            text-align: center;
            padding: 30px 15px;
            color: var(--muted);
            line-height: 2;
        }


        .error-message {
            color: var(--red);
            background: #fff4f4;
            border-radius: 14px;
        }


        .detail-card {
            background: white;
            border-radius: 20px;
            padding: 20px;
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
        }


        .detail-title {
            font-size: 22px;
            font-weight: bold;
            color: var(--green-dark);
            margin-bottom: 18px;
        }


        .detail-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
        }


        .detail-row span {
            color: var(--muted);
        }


        .detail-row strong {
            text-align: left;
        }


        .detail-actions {
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 9px;
        }


        .approve-button {
            border: none;
            border-radius: 13px;
            padding: 13px;
            background: var(--green);
            color: white;
            font-family: inherit;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
        }


        .back-secondary {
            border: 1px solid var(--border);
            border-radius: 13px;
            padding: 12px;
            background: white;
            color: var(--text);
            font-family: inherit;
            cursor: pointer;
        }


        @media (max-width: 600px) {

            .form-row {
                grid-template-columns:
                    1fr 1fr 1fr;
            }

            .stage-list {
                grid-template-columns:
                    1fr 1fr;
            }

        }


        @media (max-width: 390px) {

            .stage-list {
                grid-template-columns:
                    1fr;
            }

            .form-row {
                gap: 7px;
            }

            .card {
                padding: 14px;
            }

        }

    `;

    document.head.appendChild(style);
}

// ============================================================
// سربرگ داخلی
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
                ← بازگشت
            </button>

            <div class="internal-title">

                <h2>
                    ${escapeHtml(title)}
                </h2>

                ${
                    subtitle
                    ?
                    `<p>
                        ${escapeHtml(subtitle)}
                    </p>`
                    :
                    ""
                }

            </div>

        </header>

    `;
}

// ============================================================
// صفحه اصلی
// ============================================================

function showHome() {

    applyAppStyles();

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
                گلزار شهدای تهران
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
                        جستجو و مشاهده اطلاعات شهید
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
                        ثبت اطلاعات اولیه شهید برای بررسی و تأیید
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

            سامانه بهسازی و پایش سنگ مزار شهدا

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
                            value="ترمیمی"
                        >

                        <span>
                            ترمیمی
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
        .querySelectorAll(
            'input[name="stone-type"]'
        )
        .forEach(input => {

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
// ساخت گزینه‌های مرحله
// ============================================================

function renderStageOptions(
    selectedStage = ""
) {

    const allStages = [
        ...STAGES["ترمیمی"],
        ...STAGES["تعویضی"]
    ];

    return allStages
        .map(
            stage =>
                `
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
// فعال‌سازی فقط مراحل مربوط به نوع عملیات
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

    stageOptions.forEach(option => {

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

        }
        else {

            option.classList.add(
                "disabled"
            );

            input.disabled = true;
            input.checked = false;

        }

    });

}

// ============================================================
// ذخیره اطلاعات شهید جدید
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


    // کنترل دوم در زمان ذخیره
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
            "بررسی، تأیید و مدیریت اطلاعات ثبت‌شده"
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

            showRecordsError(
                error.message
            );

            return;
        }


        const records =
            data || [];


        const waiting =
            records.filter(
                record =>
                    (
                        record.status ||
                        "در انتظار تأیید"
                    )
                    ===
                    "در انتظار تأیید"
            );


        const approved =
            records.filter(
                record =>
                    (
                        record.status ||
                        ""
                    )
                    ===
                    "تأیید شده"
            );


        document
            .getElementById(
                "records-summary"
            )
            .innerHTML = `

                <div class="summary-box">

                    <strong>
                        ${toPersianDigits(
                            records.length
                        )}
                    </strong>

                    <small>
                        کل رکوردها
                    </small>

                </div>


                <div class="summary-box warning">

                    <strong>
                        ${toPersianDigits(
                            waiting.length
                        )}
                    </strong>

                    <small>
                        در انتظار تأیید
                    </small>

                </div>


                <div class="summary-box approved">

                    <strong>
                        ${toPersianDigits(
                            approved.length
                        )}
                    </strong>

                    <small>
                        تأیید شده
                    </small>

                </div>

            `;


        const container =
            document.getElementById(
                "pending-container"
            );


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
                        recordSummaryCard(
                            record
                        )
                )
                .join("");


        records.forEach(record => {

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

        });

    }
    catch (error) {

        console.error(error);

        showRecordsError(
            "خطای غیرمنتظره هنگام دریافت اطلاعات."
        );

    }

}

// ============================================================
// کارت خلاصه رکورد
// ============================================================

function recordSummaryCard(record) {

    const status =
        record.status ||
        "در انتظار تأیید";


    const statusClass =
        status === "تأیید شده"
        ?
        "approved"
        :
        "";


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
                        ${escapeHtml(
                            record.grave_row
                        )}
                    </strong>

                </div>


                <div>

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

        </div>

    `;

}

// ============================================================
// نمایش جزئیات رکورد
// ============================================================
// source:
// "records" = از اطلاعات ثبت‌شده
// "search"  = از جستجو
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
            ?
            "مشاهده اطلاعات شهید"
            :
            "بررسی و تصمیم نهایی کارشناس"
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


    document
        .getElementById("back-home")
        .addEventListener(
            "click",
            () => {

                if (
                    source === "search"
                ) {

                    restoreSearchPage();

                }
                else {

                    showHome();

                }

            }
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
            .single();


        if (error) {

            document
                .getElementById(
                    "detail-container"
                )
                .innerHTML = `

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
            "در انتظار تأیید";


        const isApproved =
            status === "تأیید شده";


        const showManagementActions =
            source === "records";


        document
            .getElementById(
                "detail-container"
            )
            .innerHTML = `

                <div class="detail-title">

                    ${escapeHtml(
                        data.name
                    )}

                    ${escapeHtml(
                        data.lastname
                    )}

                </div>


                <div class="detail-row">

                    <span>
                        وضعیت ثبت
                    </span>

                    <strong>
                        ${escapeHtml(status)}
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

                    <span>
                        قطعه
                    </span>

                    <strong>
                        ${toPersianDigits(
                            data.piece
                        )}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        ردیف
                    </span>

                    <strong>
                        ${escapeHtml(
                            data.grave_row
                        )}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        شماره
                    </span>

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
                    data.notes
                    ?
                    `
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
                    :
                    ""
                }


                ${
                    showManagementActions
                    ?
                    `
                    <div class="detail-actions">

                        ${
                            !isApproved
                            ?
                            `
                            <button
                                type="button"
                                class="approve-button"
                                id="approve-record"
                            >
                                ✓ تأیید این اطلاعات
                            </button>
                            `
                            :
                            `
                            <div
                                class="search-count"
                            >
                                این رکورد قبلاً تأیید شده است.
                            </div>
                            `
                        }


                        <button
                            type="button"
                            class="danger-button"
                            id="delete-detail"
                        >
                            حذف این رکورد
                        </button>


                        <button
                            type="button"
                            class="back-secondary"
                            id="back-records"
                        >
                            بازگشت به فهرست
                        </button>

                    </div>
                    `
                    :
                    `
                    <div class="detail-actions">

                        <button
                            type="button"
                            class="back-secondary"
                            id="back-records"
                        >
                            بازگشت به نتایج جستجو
                        </button>

                    </div>
                    `
                }

            `;


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
                        approveRecord(
                            id
                        )
                );

        }


        if (
            showManagementActions
        ) {

            document
                .getElementById(
                    "delete-detail"
                )
                .addEventListener(
                    "click",
                    () =>
                        deleteRecord(
                            id
                        )
                );

        }


        document
            .getElementById(
                "back-records"
            )
            .addEventListener(
                "click",
                () => {

                    if (
                        source === "search"
                    ) {

                        restoreSearchPage();

                    }
                    else {

                        showPendingRecords();

                    }

                }
            );

    }
    catch (error) {

        console.error(error);

        document
            .getElementById(
                "detail-container"
            )
            .innerHTML = `

                <div class="error-message">

                    خطای غیرمنتظره هنگام دریافت اطلاعات.

                </div>

            `;

    }

}

// ============================================================
// تأیید تک‌به‌تک
// ============================================================

async function approveRecord(id) {

    const answer =
        confirm(
            "آیا اطلاعات این شهید را تأیید می‌کنید؟"
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

                status:
                    "تأیید شده"

            })
            .eq(
                "id",
                id
            )
            .select()
            .single();


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


        if (!data) {

            alert(
                "رکورد پیدا نشد یا اجازه تغییر آن وجود ندارد."
            );

            return;
        }


        if (
            data.status !==
            "تأیید شده"
        ) {

            alert(
                "وضعیت رکورد تغییر نکرد."
            );

            return;
        }


        alert(
            "اطلاعات این شهید با موفقیت تأیید شد."
        );


        showRecordDetail(
            id,
            "records"
        );

    }
    catch (error) {

        console.error(error);

        alert(
            "خطای غیرمنتظره هنگام تأیید."
        );

    }

}

// ============================================================
// حذف
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
            data,
            error
        } = await supabaseClient
            .from("martyrs")
            .delete()
            .eq(
                "id",
                id
            )
            .select();


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


        if (
            !data ||
            data.length === 0
        ) {

            alert(
                "رکورد حذف نشد.\n\n" +
                "احتمالاً اجازه حذف از طریق برنامه وجود ندارد یا رکورد پیدا نشد."
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
// جستجوی اطلاعات شهید
// ============================================================

function showSearch(
    restore = false
) {

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
            showHome
        );


    document
        .getElementById("search-button")
        .addEventListener(
            "click",
            performSearch
        );


    // اجرای جستجو با Enter
    [
        "search-name",
        "search-lastname",
        "search-row",
        "search-number"
    ]
    .forEach(id => {

        document
            .getElementById(id)
            .addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        performSearch();

                    }

                }
            );

    });


    if (restore && lastSearchFilters) {

        document
            .getElementById(
                "search-name"
            )
            .value =
            lastSearchFilters.name || "";


        document
            .getElementById(
                "search-lastname"
            )
            .value =
            lastSearchFilters.lastname || "";


        document
            .getElementById(
                "search-piece"
            )
            .value =
            lastSearchFilters.piece || "";


        document
            .getElementById(
                "search-row"
            )
            .value =
            lastSearchFilters.row || "";


        document
            .getElementById(
                "search-number"
            )
            .value =
            lastSearchFilters.number || "";


        document
            .getElementById(
                "search-status"
            )
            .value =
            lastSearchFilters.status || "";


        renderSearchResults(
            lastSearchResults
        );

        return;
    }


    document
        .getElementById("search-name")
        .focus();

}

// ============================================================
// اجرای جستجو
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


    const container =
        document.getElementById(
            "search-results"
        );


    // ذخیره فیلترها برای بازگشت از پرونده
    lastSearchFilters = {
        name,
        lastname,
        piece,
        row,
        number,
        status
    };


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


        const results =
            data || [];


        lastSearchResults =
            results;


        renderSearchResults(
            results
        );

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
// نمایش نتایج جستجو
// ============================================================

function renderSearchResults(
    results
) {

    const container =
        document.getElementById(
            "search-results"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="search-count">

            ${toPersianDigits(
                results.length
            )}

            رکورد پیدا شد.

        </div>


        <div class="records-container">

            ${
                results.length === 0
                ?
                `
                <div class="empty-message">

                    رکوردی با این مشخصات پیدا نشد.

                </div>
                `
                :
                results
                    .map(
                        record =>
                            recordSummaryCard(
                                record
                            )
                    )
                    .join("")
            }

        </div>

    `;


    results.forEach(record => {

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

    });

}

// ============================================================
// بازسازی صفحه جستجو و نتایج قبلی
// ============================================================

function restoreSearchPage() {

    showSearch(true);

}

// ============================================================
// خطای دریافت اطلاعات
// ============================================================

function showRecordsError(
    message
) {

    const container =
        document.getElementById(
            "pending-container"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="error-message">

            دریافت اطلاعات انجام نشد.

            <br><br>

            ${escapeHtml(message)}

        </div>

    `;

}
