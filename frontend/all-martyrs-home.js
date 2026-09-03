"use strict";

// Independent launcher for the All Martyrs Search module.
// It only augments the existing home menu; it does not touch Supabase or data.
(function () {
  const originalShowHome = window.showHome;
  if (typeof originalShowHome !== "function") return;
  window.showHome = function () {
    originalShowHome.apply(this, arguments);
    if (!document.getElementById("all-martyrs-home-style")) {
      const style = document.createElement("style");
      style.id = "all-martyrs-home-style";
      style.textContent = `.all-martyrs-home-divider{margin:18px 0 10px;padding:8px 0;text-align:center;color:#17633d;font-size:12px;position:relative}.all-martyrs-home-divider:before{content:"";position:absolute;right:0;left:0;top:50%;border-top:1px solid #d7e4dc}.all-martyrs-home-divider span{position:relative;background:#f4f7f5;padding:0 12px}.all-martyrs-home-button{border:1px solid #cfe0d6!important;box-shadow:0 4px 14px rgba(23,99,61,.06)}`;
      document.head.appendChild(style);
    }
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
    button.addEventListener("click", function () { window.location.href = "all-martyrs/all-martyrs.html"; });
    menu.insertBefore(divider, menu.firstChild);
    menu.insertBefore(button, menu.children[1] || null);
  };
})();
