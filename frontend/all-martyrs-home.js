"use strict";

// ============================================================
// مستقل: Index / Launcher صفحه اصلی
// صفحه اصلی فقط دو مسیر اصلی دارد. منوی هر مسیر داخل خودش باز می‌شود.
// منطق داخلی ماژول‌های موجود و Supabase را تغییر نمی‌دهد.
// ============================================================

(function () {
  const originalShowHome = window.showHome;
  if (typeof originalShowHome !== "function") return;

  function installStyles() {
    if (document.getElementById("all-martyrs-home-style")) return;
    const style = document.createElement("style");
    style.id = "all-martyrs-home-style";
    style.textContent = `
      .modular-home{direction:rtl;display:grid;gap:18px;margin:4px 0 18px}
      .modular-home-toolbar{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-bottom:2px}
      .modular-home-toolbar button{border:1px solid #d7dfdb;background:#fff;border-radius:10px;padding:9px 15px;font:inherit;font-weight:700;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.04)}
      .modular-home-refresh{color:#17633d}
      .modular-home-main-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
      .modular-home-main-action{display:flex;align-items:center;gap:14px;min-height:108px;border:1px solid #d6e2dc;border-radius:18px;background:#fff;padding:18px;text-align:right;font:inherit;cursor:pointer;color:#234238;box-shadow:0 7px 22px rgba(23,99,61,.07);transition:transform .15s ease,box-shadow .15s ease}
      .modular-home-main-action:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(23,99,61,.11)}
      .modular-home-main-action.blue{border-top:4px solid #2878b8}.modular-home-main-action.green{border-top:4px solid #238b57}
      .modular-home-main-icon{display:grid;place-items:center;width:54px;height:54px;flex:0 0 54px;border-radius:15px;font-size:27px}
      .modular-home-main-action.blue .modular-home-main-icon{background:#e8f3fb}.modular-home-main-action.green .modular-home-main-icon{background:#e8f5ed}
      .modular-home-main-action strong{display:block;font-size:17px;color:#173e2e}.modular-home-main-action small{display:block;margin-top:5px;color:#718078;font-size:12px;line-height:1.6}.modular-home-main-arrow{margin-right:auto;font-size:28px;color:#719184}
      .modular-home-submenu{display:grid;gap:12px}
      .modular-home-submenu-header{position:relative;text-align:center;padding:4px 0 10px}
      .modular-home-submenu-header h2{margin:8px 0 4px;color:#173e2e;font-size:22px}
      .modular-home-submenu-header p{margin:0;color:#718078;font-size:12px}
      .modular-home-back{position:absolute;right:0;top:0;border:1px solid #ccd9d2;border-radius:10px;background:#fff;color:#17633d;padding:9px 15px;font:inherit;font-weight:700;cursor:pointer;box-shadow:0 3px 10px rgba(23,99,61,.04)}
      .modular-home-sub-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      .modular-home-sub-action{display:flex;align-items:center;gap:9px;min-height:72px;border:1px solid #d9e4de;border-radius:13px;background:#fafcfb;padding:10px 12px;text-align:right;font:inherit;cursor:pointer;color:#234238;transition:transform .15s ease,box-shadow .15s ease}
      .modular-home-sub-action:hover{transform:translateY(-1px);box-shadow:0 5px 14px rgba(23,99,61,.08)}
      .modular-home-sub-icon{display:grid;place-items:center;width:36px;height:36px;flex:0 0 36px;border-radius:10px;font-size:18px;background:#eef4f0}
      .modular-home-sub-action strong{display:block;font-size:14px}.modular-home-sub-action small{display:block;margin-top:3px;color:#7a8781;font-size:11px;line-height:1.5}
      @media(max-width:900px){.modular-home-main-actions{grid-template-columns:1fr}.modular-home-sub-actions{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:760px){.modular-home-main-action{min-height:90px;padding:14px}.modular-home-main-action strong{font-size:16px}.modular-home-main-icon{width:46px;height:46px;flex-basis:46px;font-size:23px}.modular-home-sub-actions{grid-template-columns:1fr}.modular-home-submenu-header{padding-top:42px}.modular-home-back{right:0;top:0}}
    `;
    document.head.appendChild(style);
  }

  function makeAction(title, description, icon, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modular-home-sub-action";
    button.innerHTML = `<span class="modular-home-sub-icon" aria-hidden="true">${icon}</span><span><strong>${title}</strong><small>${description}</small></span>`;
    button.addEventListener("click", handler);
    return button;
  }

  function buildStoneMenu() {
    const menu = document.querySelector(".menu");
    if (!menu) return;
    menu.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "modular-home-submenu";

    const header = document.createElement("div");
    header.className = "modular-home-submenu-header";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "modular-home-back";
    back.textContent = "بازگشت";
    back.addEventListener("click", buildHome);
    header.appendChild(back);
    header.insertAdjacentHTML("beforeend", "<h2>مدیریت و بهسازی سنگ مزار</h2><p>لطفاً بخش موردنظر را انتخاب کنید</p>");
    wrapper.appendChild(header);

    const actions = document.createElement("div");
    actions.className = "modular-home-sub-actions";
    actions.appendChild(makeAction("جستجوی شهید", "جستجو در اطلاعات ثبت‌شده سامانه", "🔍", () => { if (typeof window.showSearch === "function") window.showSearch(); }));
    actions.appendChild(makeAction("ثبت اطلاعات", "ثبت اطلاعات جدید شهید و سنگ مزار", "＋", () => { if (typeof window.showNewRecord === "function") window.showNewRecord(); }));
    actions.appendChild(makeAction("تأیید ثبت اطلاعات", "بررسی و تأیید اطلاعات در انتظار تأیید", "✓", () => { if (typeof window.showPendingRecords === "function") window.showPendingRecords(); }));
    actions.appendChild(makeAction("گزارش‌های آماری", "مشاهده آمار و گزارش‌های سامانه", "📊", () => { window.location.href = "statistics.html"; }));
    wrapper.appendChild(actions);
    menu.appendChild(wrapper);
  }

  function buildHome() {
    const menu = document.querySelector(".menu");
    if (!menu) return;
    menu.dataset.modularHome = "true";
    menu.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "modular-home";
    const toolbar = document.createElement("div");
    toolbar.className = "modular-home-toolbar";
    const refresh = document.createElement("button");
    refresh.type = "button";
    refresh.className = "modular-home-refresh";
    refresh.textContent = "تازه‌سازی";
    refresh.addEventListener("click", () => window.location.reload());
    toolbar.appendChild(refresh);
    wrapper.appendChild(toolbar);

    const mainActions = document.createElement("div");
    mainActions.className = "modular-home-main-actions";

    const allMartyrs = document.createElement("button");
    allMartyrs.type = "button";
    allMartyrs.className = "modular-home-main-action blue";
    allMartyrs.innerHTML = `<span class="modular-home-main-icon" aria-hidden="true">🔎</span><span><strong>جستجوی شهدا در کل بهشت زهرا</strong><small>جستجو و ورود اطلاعات مستقل شهدای داخل و خارج گلزار</small></span><span class="modular-home-main-arrow" aria-hidden="true">‹</span>`;
    allMartyrs.addEventListener("click", () => { window.location.href = "all-martyrs/all-martyrs.html"; });

    const stone = document.createElement("button");
    stone.type = "button";
    stone.className = "modular-home-main-action green";
    stone.innerHTML = `<span class="modular-home-main-icon" aria-hidden="true">🛠️</span><span><strong>مدیریت و بهسازی سنگ مزار</strong><small>جستجو، ثبت، تأیید و گزارش‌های آماری</small></span><span class="modular-home-main-arrow" aria-hidden="true">‹</span>`;
    stone.addEventListener("click", buildStoneMenu);

    mainActions.appendChild(allMartyrs);
    mainActions.appendChild(stone);
    wrapper.appendChild(mainActions);
    menu.appendChild(wrapper);
  }

  window.showModularHome = buildHome;
  window.showHome = function () {
    originalShowHome.apply(this, arguments);
    installStyles();
    buildHome();
  };
})();
