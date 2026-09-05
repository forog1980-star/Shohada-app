"use strict";

// ============================================================
// مستقل: Index / Launcher صفحه اصلی
// این فایل فقط لایه منوی اصلی را سامان‌دهی می‌کند.
// منطق داخلی ماژول‌های موجود و Supabase را تغییر نمی‌دهد.
// ============================================================

(function () {
  const originalShowHome = window.showHome;
  if (typeof originalShowHome !== "function") return;

  const MODULES = [
    {
      id: "all-martyrs",
      title: "جستجوی شهدا در کل بهشت زهرا",
      description: "جستجو و ورود مستقل اطلاعات شهدای داخل و خارج گلزار",
      icon: "🔎",
      theme: "blue",
      actions: [
        {
          title: "جستجوی کل شهدا",
          description: "جستجو در اطلاعات شهدای داخل و خارج گلزار",
          icon: "🔎",
          run: () => { window.location.href = "all-martyrs/all-martyrs-search.html"; }
        },
        {
          title: "افزودن نام تکی",
          description: "ثبت یک رکورد جدید با فرم مرحله‌ای",
          icon: "＋",
          run: () => { window.location.href = "all-martyrs/all-martyrs-entry-single.html"; }
        },
        {
          title: "افزودن نام گروهی",
          description: "آماده‌سازی و بررسی فایل برای ورود گروهی",
          icon: "▦",
          run: () => { window.location.href = "all-martyrs/all-martyrs-entry-bulk.html"; }
        }
      ]
    },
    {
      id: "stone-management",
      title: "مدیریت و بهسازی سنگ مزار",
      description: "مدیریت جستجو، ثبت، تأیید و آمار اطلاعات سنگ مزار",
      icon: "🛠️",
      theme: "green",
      actions: [
        {
          title: "جستجوی شهید",
          description: "جستجو در اطلاعات ثبت‌شده سامانه",
          icon: "🔍",
          run: () => { if (typeof window.showSearch === "function") window.showSearch(); }
        },
        {
          title: "ثبت اطلاعات",
          description: "ثبت اطلاعات جدید شهید و سنگ مزار",
          icon: "＋",
          run: () => { if (typeof window.showNewRecord === "function") window.showNewRecord(); }
        },
        {
          title: "تأیید ثبت اطلاعات",
          description: "بررسی و تأیید اطلاعات در انتظار تأیید",
          icon: "✓",
          run: () => { if (typeof window.showPendingRecords === "function") window.showPendingRecords(); }
        },
        {
          title: "گزارش‌های آماری",
          description: "مشاهده آمار و گزارش‌های سامانه",
          icon: "📊",
          run: () => { window.location.href = "statistics.html"; }
        }
      ]
    }
  ];

  function installStyles() {
    if (document.getElementById("all-martyrs-home-style")) return;
    const style = document.createElement("style");
    style.id = "all-martyrs-home-style";
    style.textContent = `
      .modular-home{direction:rtl;display:grid;gap:18px;margin:4px 0 18px}
      .modular-home-toolbar{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-bottom:2px}
      .modular-home-toolbar button{border:1px solid #d7dfdb;background:#fff;border-radius:10px;padding:9px 15px;font:inherit;font-weight:700;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.04)}
      .modular-home-refresh{color:#17633d}
      .modular-home-card{background:#fff;border:1px solid #dbe5df;border-radius:20px;padding:18px;box-shadow:0 7px 24px rgba(23,99,61,.07)}
      .modular-home-card.blue{border-top:4px solid #2878b8}.modular-home-card.green{border-top:4px solid #238b57}
      .modular-home-card-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}
      .modular-home-card-icon{display:grid;place-items:center;width:50px;height:50px;flex:0 0 50px;border-radius:14px;font-size:25px}
      .modular-home-card.blue .modular-home-card-icon{background:#e8f3fb}.modular-home-card.green .modular-home-card-icon{background:#e8f5ed}
      .modular-home-card-title{margin:0;font-size:20px;color:#173e2e}.modular-home-card-description{margin:4px 0 0;color:#718078;font-size:12px;line-height:1.7}
      .modular-home-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      .modular-home-card.blue .modular-home-actions{grid-template-columns:repeat(3,minmax(0,1fr))}
      .modular-home-action{display:flex;align-items:center;gap:9px;min-height:66px;border:1px solid #d9e4de;border-radius:13px;background:#fafcfb;padding:10px 12px;text-align:right;font:inherit;cursor:pointer;color:#234238;transition:transform .15s ease,box-shadow .15s ease}
      .modular-home-action:hover{transform:translateY(-1px);box-shadow:0 5px 14px rgba(23,99,61,.08)}
      .modular-home-action-icon{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border-radius:10px;font-size:18px;background:#eef4f0}
      .modular-home-action strong{display:block;font-size:14px}.modular-home-action small{display:block;margin-top:3px;color:#7a8781;font-size:11px;line-height:1.5}
      @media(max-width:900px){.modular-home-card.blue .modular-home-actions{grid-template-columns:1fr}}
      @media(max-width:760px){.modular-home-card{padding:14px;border-radius:17px}.modular-home-card-title{font-size:18px}.modular-home-actions{grid-template-columns:1fr!important}.modular-home-action{min-height:60px}}
    `;
    document.head.appendChild(style);
  }

  function renderModule(module) {
    const card = document.createElement("section");
    card.className = `modular-home-card ${module.theme}`;
    card.dataset.moduleId = module.id;
    const head = document.createElement("div");
    head.className = "modular-home-card-head";
    head.innerHTML = `<div class="modular-home-card-icon" aria-hidden="true">${module.icon}</div><div><h2 class="modular-home-card-title">${module.title}</h2><p class="modular-home-card-description">${module.description}</p></div>`;
    card.appendChild(head);
    const actions = document.createElement("div");
    actions.className = "modular-home-actions";
    module.actions.forEach(action => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "modular-home-action";
      button.innerHTML = `<span class="modular-home-action-icon" aria-hidden="true">${action.icon}</span><span><strong>${action.title}</strong><small>${action.description}</small></span>`;
      button.addEventListener("click", action.run);
      actions.appendChild(button);
    });
    card.appendChild(actions);
    return card;
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
    MODULES.forEach(module => wrapper.appendChild(renderModule(module)));
    menu.appendChild(wrapper);
  }

  window.showModularHome = buildHome;
  window.showHome = function () {
    originalShowHome.apply(this, arguments);
    installStyles();
    buildHome();
  };
})();
