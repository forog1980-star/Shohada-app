const DATA_URL = "http://127.0.0.1:8766/qa-results";

let allRecords = [];
let filteredRecords = [];
let currentPage = 1;
const PAGE_SIZE = 50;

const APPROVAL_STORAGE_KEY = "qa_approval_workflow_2026_10_04";

function loadApprovalStore() {
    try {
        const raw = localStorage.getItem(APPROVAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        console.error("خطا در خواندن وضعیت تأیید:", error);
        return {};
    }
}

function saveApprovalStore(store) {
    localStorage.setItem(
        APPROVAL_STORAGE_KEY,
        JSON.stringify(store)
    );
}

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString("fa-IR");
}

function submitApprovalProposal(record, proposedRecord, note = "") {
    const store = loadApprovalStore();
    const id = String(record.id);

    store[id] = {
        recordId: record.id,
        status: "در انتظار تأیید نهایی",
        submittedAt: new Date().toISOString(),
        note: note || "",
        originalRecord: record,
        proposedRecord: proposedRecord
    };

    saveApprovalStore(store);

    alert(
        "ثبت اطلاعات انجام شد و برای تأیید نهایی ناظر ارسال گردید."
    );

    renderApprovalQueue();
}

function formatIssues(issues) {
    if (!issues || !issues.length) {
        return "—";
    }

    return `
        <div class="issue-list">
            ${issues.map(issue => `• ${escapeHtml(issue)}`).join("<br>")}
        </div>
    `;
}

function renderApprovalQueue() {
    const store = loadApprovalStore();
    const items = Object.values(store).filter(
        item => item.status === "در انتظار تأیید نهایی"
    );

    if ($("approvalCount")) {
        $("approvalCount").textContent =
            `${formatNumber(items.length)} مورد در انتظار تأیید`;
    }

    if (!$("approvalList")) {
        return;
    }

    if (!items.length) {
        $("approvalList").innerHTML = `
            <div class="approval-empty">
                در حال حاضر اطلاعاتی برای تأیید نهایی وجود ندارد.
            </div>
        `;
        return;
    }

    $("approvalList").innerHTML = items.map(item => {
        const record = item.proposedRecord || item.originalRecord || {};

        const name =
            record.identity?.name ||
            record.name ||
            "";

        const lastname =
            record.identity?.lastname ||
            record.lastname ||
            "";

        return `
            <div class="approval-item">
                <div class="approval-item-header">
                    <div class="approval-item-title">
                        ID: ${escapeHtml(item.recordId)}
                        — ${escapeHtml(name)}
                        ${escapeHtml(lastname)}
                    </div>

                    <span class="approval-status">
                        در انتظار تأیید نهایی
                    </span>
                </div>

                <div class="approval-item-actions">
                    <button
                        class="approval-review-button"
                        data-approval-id="${escapeHtml(item.recordId)}"
                    >
                        بررسی اطلاعات
                    </button>
                </div>
            </div>
        `;
    }).join("");

    document
        .querySelectorAll(".approval-review-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                openApprovalReview(button.dataset.approvalId);
            });
        });
}

function renderCorrectionQueue() {
    const store = loadApprovalStore();

    const items = Object.values(store).filter(
        item => item.status === "برگشت برای اصلاح"
    );

    if ($("correctionCount")) {
        $("correctionCount").textContent =
            `${formatNumber(items.length)} مورد برگشتی`;
    }

    if (!$("correctionList")) {
        return;
    }

    if (!items.length) {
        $("correctionList").innerHTML = `
            <div class="correction-empty">
                در حال حاضر رکوردی برای اصلاح وجود ندارد.
            </div>
        `;
        return;
    }

    $("correctionList").innerHTML = items.map(item => {
        const record =
            item.proposedRecord ||
            item.originalRecord ||
            {};

        const name =
            record.identity?.name ||
            record.name ||
            "";

        const lastname =
            record.identity?.lastname ||
            record.lastname ||
            "";

        const priority =
            item.returnReview?.priority ||
            "عادی";

        const reasons =
            item.returnReview?.reasons || [];

        const note =
            item.returnReview?.note ||
            item.reviewerNote ||
            "";

        return `
            <div class="correction-item">
                <div class="correction-item-header">
                    <div class="correction-item-title">
                        ID: ${escapeHtml(item.recordId)}
                        — ${escapeHtml(name)}
                        ${escapeHtml(lastname)}
                    </div>

                    <span class="correction-status">
                        برگشت برای اصلاح
                    </span>
                </div>

                <div class="correction-item-details">
                    <div>
                        <strong>اولویت:</strong>
                        ${escapeHtml(priority)}
                    </div>

                    <div>
                        <strong>علت:</strong>
                        ${escapeHtml(reasons.join("، "))}
                    </div>

                    <div>
                        <strong>توضیح ناظر:</strong>
                        ${escapeHtml(note)}
                    </div>
                </div>

                <div class="correction-item-actions">
                    <button
                        class="correction-fix-button"
                        data-correction-id="${escapeHtml(item.recordId)}"
                    >
                        اصلاح اطلاعات
                    </button>
                </div>
            </div>
        `;
    }).join("");

    bindCorrectionQueueButtons();
}
function bindCorrectionQueueButtons() {
    document
        .querySelectorAll(".correction-fix-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                openCorrectionForm(button.dataset.correctionId);
            });
        });
}
function openCorrectionForm(recordId) {
    const store = loadApprovalStore();
    const id = String(recordId);
    const item = store[id];

    if (!item) {
        alert("رکورد برگشتی پیدا نشد.");
        return;
    }

    if (item.status !== "برگشت برای اصلاح") {
        alert("این رکورد در وضعیت برگشت برای اصلاح نیست.");
        return;
    }

    const record =
        item.proposedRecord ||
        item.originalRecord ||
        {};

    const identity = record.identity || {};
    const location = record.location || {};

    const name =
        identity.name ||
        record.name ||
        "";

    const lastname =
        identity.lastname ||
        record.lastname ||
        "";

    const fatherName =
        identity.father_name ||
        record.father_name ||
        "";

    const piece =
        location.piece ||
        record.piece ||
        "";

    const graveRow =
        location.grave_row ||
        record.grave_row ||
        "";

    const graveNumber =
        location.grave_number ||
        record.grave_number ||
        "";

    const stoneType =
        record.stone_type ||
        "";

    const stage =
        record.stage ||
        "";

    const notes =
        record.notes ||
        "";

    const returnReasons =
        item.returnReview?.reasons || [];

    const returnNote =
        item.returnReview?.note ||
        item.reviewerNote ||
        "";

    $("detailContent").innerHTML = `
        <h2>اصلاح اطلاعات رکورد</h2>

        <div class="correction-review-section">

            <div class="correction-return-info">
                <h3>نظر ناظر</h3>

                <div class="correction-return-field">
                    <strong>علت برگشت:</strong>
                    ${escapeHtml(returnReasons.join("، "))}
                </div>

                <div class="correction-return-field">
                    <strong>توضیح ناظر:</strong>
                    ${escapeHtml(returnNote)}
                </div>

                <div class="correction-return-field">
                    <strong>اولویت:</strong>
                    ${escapeHtml(item.returnReview?.priority || "عادی")}
                </div>
            </div>

            <h3>اطلاعات قابل اصلاح</h3>

            <div class="correction-form-grid">

                <div class="correction-form-field">
                    <label for="correctionName">نام</label>
                    <input
                        id="correctionName"
                        type="text"
                        value="${escapeHtml(name)}"
                    >
                </div>

                <div class="correction-form-field">
                    <label for="correctionLastname">نام خانوادگی</label>
                    <input
                        id="correctionLastname"
                        type="text"
                        value="${escapeHtml(lastname)}"
                    >
                </div>

                <div class="correction-form-field">
                    <label for="correctionFatherName">نام پدر</label>
                    <input
                        id="correctionFatherName"
                        type="text"
                        value="${escapeHtml(fatherName)}"
                    >
                </div>

                <div class="correction-form-field">
                    <label for="correctionPiece">قطعه</label>
                    <input
                        id="correctionPiece"
                        type="text"
                        value="${escapeHtml(piece)}"
                    >
                </div>

                <div class="correction-form-field">
                    <label for="correctionGraveRow">ردیف</label>
                    <input
                        id="correctionGraveRow"
                        type="text"
                        value="${escapeHtml(graveRow)}"
                    >
                </div>

                <div class="correction-form-field">
                    <label for="correctionGraveNumber">شماره مزار</label>
                    <input
                        id="correctionGraveNumber"
                        type="text"
                        value="${escapeHtml(graveNumber)}"
                    >
                </div>

                <div class="correction-form-field">
                    <label for="correctionStoneType">نوع سنگ</label>
                    <input
                        id="correctionStoneType"
                        type="text"
                        value="${escapeHtml(stoneType)}"
                    >
                </div>

                <div class="correction-form-field">
                    <label for="correctionStage">مرحله عملیات</label>
                    <input
                        id="correctionStage"
                        type="text"
                        value="${escapeHtml(stage)}"
                    >
                </div>

                <div class="correction-form-field correction-form-field-full">
                    <label for="correctionNotes">توضیحات</label>
                    <textarea id="correctionNotes">${escapeHtml(notes)}</textarea>
                </div>

            </div>

            <div class="correction-form-actions">
                <button
                    id="cancelCorrectionButton"
                    class="return-cancel-button"
                >
                    انصراف
                </button>

                <button
                    id="resubmitCorrectionButton"
                    class="correction-resubmit-button"
                >
                    ثبت اصلاح و ارسال مجدد
                </button>
            </div>

        </div>
    `;

    $("detailModal").classList.remove("hidden");

    $("cancelCorrectionButton").addEventListener("click", () => {
        $("detailModal").classList.add("hidden");
    });

    $("resubmitCorrectionButton").addEventListener("click", () => {
        const updatedRecord = {
            ...record,
            identity: {
                ...(record.identity || {}),
                name: $("correctionName").value.trim(),
                lastname: $("correctionLastname").value.trim(),
                father_name: $("correctionFatherName").value.trim()
            },
            location: {
                ...(record.location || {}),
                piece: $("correctionPiece").value.trim(),
                grave_row: $("correctionGraveRow").value.trim(),
                grave_number: $("correctionGraveNumber").value.trim()
            },
            stone_type: $("correctionStoneType").value.trim(),
            stage: $("correctionStage").value.trim(),
            notes: $("correctionNotes").value.trim()
        };

        const previousStatus = item.status;

        item.proposedRecord = updatedRecord;
        item.status = "در انتظار تأیید نهایی";
        item.resubmittedAt = new Date().toISOString();

        item.correctionHistory =
            item.correctionHistory || [];

        item.correctionHistory.push({
            submittedAt: new Date().toISOString(),
            previousStatus: previousStatus,
            returnReview: item.returnReview || null,
            record: updatedRecord
        });

        item.recorderNote =
            "اصلاحات انجام شد و رکورد برای تأیید مجدد ارسال شد.";

        saveApprovalStore(store);

        $("detailModal").classList.add("hidden");

        renderApprovalQueue();
        renderCorrectionQueue();

        alert(
            "اصلاحات ثبت شد و رکورد برای تأیید مجدد ناظر ارسال گردید."
        );
    });
}
function openApprovalReview(recordId) {
    const store = loadApprovalStore();
    const item = store[String(recordId)];

    if (!item) {
        alert("رکورد موردنظر در صف تأیید پیدا نشد.");
        return;
    }

    const original = item.originalRecord || {};
    const proposed = item.proposedRecord || {};

    const originalName =
        original.identity?.name ||
        original.name ||
        "";

    const originalLastname =
        original.identity?.lastname ||
        original.lastname ||
        "";

    const proposedName =
        proposed.identity?.name ||
        proposed.name ||
        "";

    const proposedLastname =
        proposed.identity?.lastname ||
        proposed.lastname ||
        "";

    $("detailContent").innerHTML = `
        <h2>بررسی اطلاعات برای تأیید نهایی</h2>

        <div class="approval-review-status">
            وضعیت: ${escapeHtml(item.status || "در انتظار تأیید نهایی")}
        </div>

        <div class="approval-review-grid">

            <div class="approval-review-column">
                <h3>اطلاعات قبلی</h3>

                <p><strong>ID:</strong> ${escapeHtml(original.id || recordId)}</p>
                <p><strong>نام:</strong> ${escapeHtml(originalName)}</p>
                <p><strong>نام خانوادگی:</strong> ${escapeHtml(originalLastname)}</p>
                <p><strong>قطعه:</strong> ${escapeHtml(original.location?.piece || original.piece || "")}</p>
                <p><strong>ردیف:</strong> ${escapeHtml(original.location?.grave_row || original.grave_row || "")}</p>
                <p><strong>شماره مزار:</strong> ${escapeHtml(original.location?.grave_number || original.grave_number || "")}</p>
                <p><strong>نوع سنگ:</strong> ${escapeHtml(original.operation?.stone_type || original.stone_type || "")}</p>
                <p><strong>مرحله:</strong> ${escapeHtml(original.operation?.stage_normalized || original.stage_normalized || "")}</p>
            </div>

            <div class="approval-review-column">
                <h3>اطلاعات پیشنهادی</h3>

                <p><strong>ID:</strong> ${escapeHtml(proposed.id || recordId)}</p>
                <p><strong>نام:</strong> ${escapeHtml(proposedName)}</p>
                <p><strong>نام خانوادگی:</strong> ${escapeHtml(proposedLastname)}</p>
                <p><strong>قطعه:</strong> ${escapeHtml(proposed.location?.piece || proposed.piece || "")}</p>
                <p><strong>ردیف:</strong> ${escapeHtml(proposed.location?.grave_row || proposed.grave_row || "")}</p>
                <p><strong>شماره مزار:</strong> ${escapeHtml(proposed.location?.grave_number || proposed.grave_number || "")}</p>
                <p><strong>نوع سنگ:</strong> ${escapeHtml(proposed.operation?.stone_type || proposed.stone_type || "")}</p>
                <p><strong>مرحله:</strong> ${escapeHtml(proposed.operation?.stage_normalized || proposed.stage_normalized || "")}</p>
            </div>

        </div>

        <div class="approval-review-actions">
            <button
                id="approveProposalButton"
                class="approval-review-button"
            >
                ثبت تأیید نهایی
            </button>

            <button
                id="returnProposalButton"
                class="approval-fix-button"
            >
                ثبت و برگشت برای اصلاح
            </button>
        </div>
    `;

    $("detailModal").classList.remove("hidden");

    $("approveProposalButton").addEventListener("click", () => {
        approveProposal(recordId);
    });

    $("returnProposalButton").addEventListener("click", () => {
        returnProposalForCorrection(recordId);
    });
}
function approveProposal(recordId) {
    const store = loadApprovalStore();
    const id = String(recordId);
    const item = store[id];

    if (!item) {
        alert("رکورد موردنظر پیدا نشد.");
        return;
    }

    item.status = "تأیید نهایی شد";
    item.reviewedAt = new Date().toISOString();
    item.reviewerNote = "تأیید نهایی توسط ناظر";

    saveApprovalStore(store);

    $("detailModal").classList.add("hidden");

    renderApprovalQueue();

    alert(
        "تأیید نهایی انجام شد.\n\n" +
        "توجه: در این نسخه آزمایشی، اطلاعات منبع اصلی تغییر نمی‌کند."
    );
}

function returnProposalForCorrection(recordId) {
    const store = loadApprovalStore();
    const id = String(recordId);
    const item = store[id];

    if (!item) {
        alert("رکورد موردنظر پیدا نشد.");
        return;
    }

    const record = item.proposedRecord || item.originalRecord || {};

    const name =
        record.identity?.name ||
        record.name ||
        "";

    const lastname =
        record.identity?.lastname ||
        record.lastname ||
        "";

    const piece =
        record.location?.piece ||
        record.piece ||
        "";

    const graveRow =
        record.location?.grave_row ||
        record.grave_row ||
        "";

    const graveNumber =
        record.location?.grave_number ||
        record.grave_number ||
        "";

    $("detailContent").innerHTML = `
        <h2>برگشت برای اصلاح</h2>

        <div class="return-review-section">

            <h3>مشخصات رکورد</h3>

            <div class="return-record-summary">

                <div class="return-record-field">
                    <strong>ID</strong>
                    ${escapeHtml(record.id || recordId)}
                </div>

                <div class="return-record-field">
                    <strong>نام</strong>
                    ${escapeHtml(name)}
                </div>

                <div class="return-record-field">
                    <strong>نام خانوادگی</strong>
                    ${escapeHtml(lastname)}
                </div>

                <div class="return-record-field">
                    <strong>قطعه</strong>
                    ${escapeHtml(piece)}
                </div>

                <div class="return-record-field">
                    <strong>ردیف</strong>
                    ${escapeHtml(graveRow)}
                </div>

                <div class="return-record-field">
                    <strong>شماره مزار</strong>
                    ${escapeHtml(graveNumber)}
                </div>

            </div>

            <h3>علت برگشت برای اصلاح</h3>

            <div class="return-reason-list">

                <label class="return-reason-item">
                    <input type="checkbox" name="returnReason" value="اطلاعات هویتی">
                    <span>اطلاعات هویتی</span>
                </label>

                <label class="return-reason-item">
                    <input type="checkbox" name="returnReason" value="قطعه">
                    <span>قطعه</span>
                </label>

                <label class="return-reason-item">
                    <input type="checkbox" name="returnReason" value="ردیف">
                    <span>ردیف</span>
                </label>

                <label class="return-reason-item">
                    <input type="checkbox" name="returnReason" value="شماره مزار">
                    <span>شماره مزار</span>
                </label>

                <label class="return-reason-item">
                    <input type="checkbox" name="returnReason" value="نوع سنگ">
                    <span>نوع سنگ</span>
                </label>

                <label class="return-reason-item">
                    <input type="checkbox" name="returnReason" value="مرحله عملیات">
                    <span>مرحله عملیات</span>
                </label>

                <label class="return-reason-item">
                    <input type="checkbox" name="returnReason" value="اطلاعات ناقص">
                    <span>اطلاعات ناقص</span>
                </label>

                <label class="return-reason-item">
                    <input type="checkbox" name="returnReason" value="مغایرت با منبع">
                    <span>مغایرت با منبع</span>
                </label>

                <label class="return-reason-item">
                    <input type="checkbox" name="returnReason" value="احتمال رکورد تکراری">
                    <span>احتمال رکورد تکراری</span>
                </label>

                <label class="return-reason-item">
                    <input type="checkbox" name="returnReason" value="سایر">
                    <span>سایر</span>
                </label>

            </div>

            <label class="return-review-label" for="returnReviewText">
                توضیح دقیق ناظر
            </label>

            <textarea
                id="returnReviewText"
                class="return-review-textarea"
                placeholder="دقیقاً توضیح دهید چه موردی باید اصلاح یا بررسی شود..."
            ></textarea>

            <label class="return-review-label">
                اولویت اصلاح
            </label>

            <div class="return-priority-list">

                <label class="return-priority-item">
                    <input
                        type="radio"
                        name="returnPriority"
                        value="عادی"
                        checked
                    >
                    <span>عادی</span>
                </label>

                <label class="return-priority-item">
                    <input
                        type="radio"
                        name="returnPriority"
                        value="مهم"
                    >
                    <span>مهم</span>
                </label>

                <label class="return-priority-item">
                    <input
                        type="radio"
                        name="returnPriority"
                        value="فوری"
                    >
                    <span>فوری</span>
                </label>

            </div>

            <div class="return-review-actions">

                <button
                    id="cancelReturnButton"
                    class="return-cancel-button"
                >
                    انصراف
                </button>

                <button
                    id="submitReturnButton"
                    class="return-submit-button"
                >
                    برگشت برای اصلاح
                </button>

            </div>

        </div>
    `;

    $("detailModal").classList.remove("hidden");

    $("cancelReturnButton").addEventListener("click", () => {
        $("detailModal").classList.add("hidden");
    });

    $("submitReturnButton").addEventListener("click", () => {

        const reasons = Array.from(
            document.querySelectorAll(
                'input[name="returnReason"]:checked'
            )
        ).map(input => input.value);

        const note = $("returnReviewText").value.trim();

        const priorityInput = document.querySelector(
            'input[name="returnPriority"]:checked'
        );

        const priority = priorityInput
            ? priorityInput.value
            : "عادی";

        if (!reasons.length) {
            alert("حداقل یک علت برگشت را انتخاب کنید.");
            return;
        }

        if (!note) {
            alert("توضیح دقیق ناظر الزامی است.");
            $("returnReviewText").focus();
            return;
        }

        item.status = "برگشت برای اصلاح";
        item.reviewedAt = new Date().toISOString();

        item.returnReview = {
            reasons: reasons,
            note: note,
            priority: priority,
            submittedAt: new Date().toISOString()
        };

        item.reviewerNote = note;

        saveApprovalStore(store);

        $("detailModal").classList.add("hidden");

        renderApprovalQueue();

        alert(
            "اطلاعات برای اصلاح برگشت داده شد."
        );
    });
}
function renderSourceInfo(payload) {
    const analysis = payload.analysis;

    $("sourceInfo").innerHTML = `
        <strong>تعداد رکورد:</strong>
        ${formatNumber(analysis.totalRecords)}
        &nbsp; | &nbsp;

        <strong>نسخه موتور:</strong>
        ${escapeHtml(analysis.engineVersion)}
        &nbsp; | &nbsp;

        <strong>حالت:</strong>
        فقط خواندنی
    `;
}

function renderSummary(payload) {
    const total = payload.analysis.totalRecords;
    const clean = payload.quality.clean;
    const problem = payload.quality.problem;

    $("summaryCards").innerHTML = `
        <div class="card">
            <h3>کل رکوردها</h3>
            <div class="number">${formatNumber(total)}</div>
        </div>

        <div class="card">
            <h3>بدون مشکل</h3>
            <div class="number">${formatNumber(clean)}</div>
        </div>

        <div class="card">
            <h3>دارای مشکل</h3>
            <div class="number">${formatNumber(problem)}</div>
        </div>
    `;
}

function renderIssueCards(payload) {
    const labels = {
        "مرحله خالی": "مرحله خالی",
        "نام/هویت تکراری یا چندرکوردی": "نام/هویت تکراری",
        "ردیف مزار خالی": "ردیف مزار خالی",
        "شماره مزار خالی": "شماره مزار خالی",
        "موقعیت مزار تکراری": "موقعیت مزار تکراری",
        "نوع سنگ خالی": "نوع سنگ خالی",
        "قطعه خالی": "قطعه خالی",
        "نام خالی": "نام خالی",
        "خارج از محدوده بهسازی ۸ قطعه آماری": "خارج از محدوده بهسازی"
    };

    const entries = Object.entries(payload.issueCounts);

    $("issueCards").innerHTML = entries.map(([issue, count]) => `
        <div class="card issue-card" data-issue="${escapeHtml(issue)}">
            <h3>${escapeHtml(labels[issue] || issue)}</h3>
            <div class="number">${formatNumber(count)}</div>
        </div>
    `).join("");

    document.querySelectorAll(".issue-card").forEach(card => {
        card.addEventListener("click", () => {
            $("searchInput").value = "";
            $("qualityFilter").value = "";
            applyFilters(card.dataset.issue);
        });
    });
}

function populatePieceFilter(records) {
    const pieces = [...new Set(
        records
            .map(record => record.location?.piece)
            .filter(Boolean)
            .map(String)
    )].sort((a, b) => a.localeCompare(b, "fa"));

    $("pieceFilter").innerHTML = `
        <option value="">همه قطعات</option>
        ${pieces.map(piece => `
            <option value="${escapeHtml(piece)}">
                قطعه ${escapeHtml(piece)}
            </option>
        `).join("")}
    `;
}

function searchableText(record) {
    return [
        record.id,
        record.identity?.name,
        record.identity?.lastname,
        record.identity?.father_name,
        record.location?.piece,
        record.location?.grave_row,
        record.location?.grave_number,
        record.operation?.stone_type,
        record.operation?.stage_raw,
        record.operation?.stage_normalized,
        record.quality?.status,
        ...(record.quality?.issues || [])
    ]
        .filter(value => value !== null && value !== undefined)
        .join(" ")
        .toLocaleLowerCase("fa-IR");
}

function applyFilters(issueFilter = null) {
    const search = $("searchInput").value
        .trim()
        .toLocaleLowerCase("fa-IR");

    const quality = $("qualityFilter").value;
    const piece = $("pieceFilter").value;

    filteredRecords = allRecords.filter(record => {
        if (search && !searchableText(record).includes(search)) {
            return false;
        }

        if (quality && record.quality?.status !== quality) {
            return false;
        }

        if (piece && String(record.location?.piece || "") !== piece) {
            return false;
        }

        if (
            issueFilter &&
            !(record.quality?.issues || []).includes(issueFilter)
        ) {
            return false;
        }

        return true;
    });

    currentPage = 1;
    renderTable();
}

function renderTable() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageRecords = filteredRecords.slice(start, start + PAGE_SIZE);

    $("resultCount").textContent =
        `${formatNumber(filteredRecords.length)} رکورد`;

    $("recordsBody").innerHTML = pageRecords.map(record => `
        <tr>
            <td class="sticky-details-cell">
                <button
                    class="detail-button"
                    data-id="${escapeHtml(record.id)}"
                >
                    جزئیات
                </button>
            </td>

            <td>${escapeHtml(record.id)}</td>

            <td>${escapeHtml(record.identity?.name)}</td>

            <td>${escapeHtml(record.identity?.lastname)}</td>

            <td>${escapeHtml(record.location?.piece)}</td>

            <td>${escapeHtml(record.location?.grave_row)}</td>

            <td>${escapeHtml(record.location?.grave_number)}</td>

            <td>${escapeHtml(record.operation?.stone_type)}</td>

            <td>${escapeHtml(
                record.operation?.stage_normalized ||
                record.operation?.stage_raw
            )}</td>

            <td>${escapeHtml(record.quality?.status)}</td>

            <td>${formatIssues(record.quality?.issues)}</td>


        </tr>
    `).join("");

    document.querySelectorAll(".detail-button").forEach(button => {
        button.addEventListener("click", () => {
            openDetails(button.dataset.id);
        });
    });

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.max(
        1,
        Math.ceil(filteredRecords.length / PAGE_SIZE)
    );

    let html = "";

    if (currentPage > 1) {
        html += `<button data-page="${currentPage - 1}">قبلی</button>`;
    }

    const maxButtons = 7;

    let start = Math.max(1, currentPage - 3);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
        start = Math.max(1, end - maxButtons + 1);
    }

    for (let page = start; page <= end; page++) {
        html += `
            <button
                class="${page === currentPage ? "active" : ""}"
                data-page="${page}"
            >
                ${formatNumber(page)}
            </button>
        `;
    }

    if (currentPage < totalPages) {
        html += `<button data-page="${currentPage + 1}">بعدی</button>`;
    }

    $("pagination").innerHTML = html;

    document.querySelectorAll("#pagination button").forEach(button => {
        button.addEventListener("click", () => {
            currentPage = Number(button.dataset.page);
            renderTable();
            window.scrollTo({
                top: document.querySelector("table").offsetTop - 80,
                behavior: "smooth"
            });
        });
    });
}

function openDetails(id) {
    const record = allRecords.find(
        item => String(item.id) === String(id)
    );

    if (!record) {
        return;
    }

    const identityIds =
        record.relations?.identity_duplicate_ids || [];

    const locationIds =
        record.relations?.location_duplicate_ids || [];

    $("detailContent").innerHTML = `
        <h2>جزئیات رکورد ${escapeHtml(record.id)}</h2>

        <h3>هویت</h3>

        <div class="detail-grid">
            <div class="detail-item">
                <strong>نام:</strong>
                ${escapeHtml(record.identity?.name)}
            </div>

            <div class="detail-item">
                <strong>نام خانوادگی:</strong>
                ${escapeHtml(record.identity?.lastname)}
            </div>

            <div class="detail-item">
                <strong>نام پدر:</strong>
                ${escapeHtml(record.identity?.father_name)}
            </div>

            <div class="detail-item">
                <strong>ID:</strong>
                ${escapeHtml(record.id)}
            </div>
        </div>

        <h3>موقعیت مزار</h3>

        <div class="detail-grid">
            <div class="detail-item">
                <strong>قطعه:</strong>
                ${escapeHtml(record.location?.piece)}
            </div>

            <div class="detail-item">
                <strong>ردیف:</strong>
                ${escapeHtml(record.location?.grave_row)}
            </div>

            <div class="detail-item">
                <strong>شماره:</strong>
                ${escapeHtml(record.location?.grave_number)}
            </div>

            <div class="detail-item">
                <strong>محدوده آماری:</strong>
                ${record.scope?.out_of_scope
                    ? "خارج از محدوده بهسازی"
                    : "داخل محدوده"}
            </div>
        </div>

        <h3>اطلاعات عملیات</h3>

        <div class="detail-grid">
            <div class="detail-item">
                <strong>نوع سنگ:</strong>
                ${escapeHtml(record.operation?.stone_type)}
            </div>

            <div class="detail-item">
                <strong>مرحله ثبت‌شده:</strong>
                ${escapeHtml(record.operation?.stage_raw)}
            </div>

            <div class="detail-item">
                <strong>مرحله استاندارد:</strong>
                ${escapeHtml(record.operation?.stage_normalized)}
            </div>

            <div class="detail-item">
                <strong>وضعیت:</strong>
                ${escapeHtml(record.status)}
            </div>
        </div>

        <div class="issue-detail">
            <h3>نتیجه کنترل کیفیت</h3>

            <p>
                <strong>وضعیت:</strong>
                ${escapeHtml(record.quality?.status)}
            </p>

            <strong>مشکلات:</strong>

            <ul>
                ${(record.quality?.issues || [])
                    .map(issue => `<li>${escapeHtml(issue)}</li>`)
                    .join("")}
            </ul>
        </div>

        ${
            identityIds.length
            ? `
                <h3>رکوردهای مرتبط از نظر هویت</h3>
                <p>
                    ${identityIds.map(id => escapeHtml(id)).join("، ")}
                </p>
            `
            : ""
        }

        ${
            locationIds.length
            ? `
                <h3>رکوردهای مرتبط از نظر موقعیت</h3>
                <p>
                    ${locationIds.map(id => escapeHtml(id)).join("، ")}
                </p>
            `
            : ""
        }
    `;

    $("detailModal").classList.remove("hidden");
}

function clearFilters() {
    $("searchInput").value = "";
    $("qualityFilter").value = "";
    $("pieceFilter").value = "";
    applyFilters();
}

async function loadData() {
    try {
        const response = await fetch(DATA_URL, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
            );
        }

        const payload = await response.json();

        allRecords = payload.records || [];
        filteredRecords = [...allRecords];

        renderSourceInfo(payload);
        renderSummary(payload);
        renderIssueCards(payload);
        populatePieceFilter(allRecords);
        renderTable();
        renderApprovalQueue();
        renderCorrectionQueue();

    } catch (error) {
        console.error(error);

        $("sourceInfo").innerHTML = `
            <strong>خطا در بارگذاری داده:</strong>
            ${escapeHtml(error.message)}
            <br>
            <small>
                صفحه را از طریق یک HTTP server محلی اجرا کنید.
            </small>
        `;
    }
}

$("searchInput").addEventListener("input", () => applyFilters());
$("qualityFilter").addEventListener("change", () => applyFilters());
$("pieceFilter").addEventListener("change", () => applyFilters());

$("clearFilters").addEventListener("click", clearFilters);

$("closeModal").addEventListener("click", () => {
    $("detailModal").classList.add("hidden");
});

$("detailModal").addEventListener("click", (event) => {
    if (event.target === $("detailModal")) {
        $("detailModal").classList.add("hidden");
    }
});

loadData();



