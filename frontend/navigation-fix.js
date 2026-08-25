"use strict";
// بازگشت قطعی از صفحه ثبت اطلاعات به صفحه اصلی.
// از delegation استفاده می‌کنیم تا با بازسازی innerHTML دکمه از کار نیفتد.
document.addEventListener("click", function(event){
  const button = event.target.closest?.("#back-home");
  if (!button) return;
  if (window.currentAppPage === "new") return;
  if (typeof goHomeFromNewRecord === "function" && typeof currentAppPage !== "undefined" && currentAppPage === "new") {
    event.preventDefault();
    event.stopImmediatePropagation();
    goHomeFromNewRecord();
  }
}, true);
