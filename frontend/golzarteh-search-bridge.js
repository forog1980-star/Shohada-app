"use strict";

(function () {
  if (window.__GOLZARTEH_SEARCH_BRIDGE_INSTALLED__) return;
  window.__GOLZARTEH_SEARCH_BRIDGE_INSTALLED__ = true;

  function install() {
    if (typeof window.showRecordDetail !== "function") return false;
    if (window.showRecordDetail.__golzartehPhotoBridgeInstalled__) return true;

    const originalShowRecordDetail = window.showRecordDetail;

    async function bridgedShowRecordDetail(id, source) {
      const result = await originalShowRecordDetail.call(this, id, source);

      try {
        const detailContainer =
          document.getElementById("detail-container");

        if (
          detailContainer &&
          typeof window.renderGolzartehDetailPhoto === "function" &&
          !detailContainer.querySelector(".golzarteh-photo-box") &&
          typeof window.supabaseClient !== "undefined" &&
          typeof window.TABLE_NAME !== "undefined"
        ) {
          const { data, error } = await window.supabaseClient
            .from(window.TABLE_NAME)
            .select("*")
            .eq("id", id)
            .limit(1);

          if (!error && data && data.length) {
            await window.renderGolzartehDetailPhoto(
              data[0],
              detailContainer
            );
          }
        }
      } catch (error) {
        console.error(
          "Golzarteh search photo bridge error:",
          error
        );
      }

      return result;
    }

    bridgedShowRecordDetail.__golzartehPhotoBridgeInstalled__ = true;
    bridgedShowRecordDetail.__golzartehPhotoOriginal__ =
      originalShowRecordDetail;

    window.showRecordDetail = bridgedShowRecordDetail;
    return true;
  }

  function waitForShowRecordDetail() {
    if (install()) return;

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;

      if (install() || attempts >= 100) {
        clearInterval(timer);
      }
    }, 100);
  }

  waitForShowRecordDetail();
})();
