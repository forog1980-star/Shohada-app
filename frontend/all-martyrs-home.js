"use strict";

// Independent launcher for the All Martyrs Search module.
// It only augments the existing home menu; it does not touch Supabase or data.
(function () {
  const originalShowHome = window.showHome;
  if (typeof originalShowHome !== "function") return;
  window.showHome = function () {
    originalShowHome.apply(this, arguments);
    const menu = document.querySelector(".menu");
    if (!menu || document.getElementById("btn-all-martyrs")) return;

    const divider = document.createElement("div");
    divider.className = "all-martyrs-home-divider";
    divider.innerHTML = '<span>جستجوی جامع گلزار</span>';

    const button = document.createElement("button");
    button.type = "button";
    button.id = "btn-all-martyrs";
    button.className = "menu-button all-martyrs-home-button";
    button.innerHTML = '<span class="icon">🔍</span><span class="button-text"><strong>جستجوی کل شهدا</strong><small>در گلزار</small></span><span class="button-arrow">‹</span>';
    button.addEventListener("click", function () {
      window.location.href = "all-martyrs/all-martyrs.html";
    });

    menu.insertBefore(divider, menu.firstChild);
    menu.insertBefore(button, menu.children[1] || null);
  };
})();
