"use strict";

(function () {
  if (window.__GOLZARTEH_DETAIL_PHOTO_INSTALLED__) return;
  window.__GOLZARTEH_DETAIL_PHOTO_INSTALLED__ = true;

  function installStyles() {
    if (document.getElementById("golzarteh-detail-photo-styles")) return;

    const style = document.createElement("style");
    style.id = "golzarteh-detail-photo-styles";
    style.textContent = `
      .golzarteh-photo-box {
        margin-top: 20px;
        padding: 14px;
        border: 1px solid var(--border, #dce6df);
        border-radius: 18px;
        background: #fbfdfc;
      }

      .golzarteh-photo-title {
        color: var(--green-dark, #17633d);
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 10px;
      }

      .golzarteh-photo-status {
        color: var(--muted, #708078);
        font-size: 13px;
        line-height: 1.8;
      }

      .golzarteh-photo-image {
        display: block;
        width: 100%;
        max-height: 520px;
        object-fit: contain;
        border-radius: 14px;
        background: #eef2ef;
        margin-top: 10px;
      }

      .golzarteh-photo-source {
        display: block;
        margin-top: 8px;
        color: var(--muted, #708078);
        font-size: 11px;
        text-decoration: none;
      }
    `;

    document.head.appendChild(style);
  }

  function createPhotoBox() {
    const box = document.createElement("section");
    box.className = "golzarteh-photo-box";

    const title = document.createElement("div");
    title.className = "golzarteh-photo-title";
    title.textContent = "📷 عکس شهید در گلزارته";

    const status = document.createElement("div");
    status.className = "golzarteh-photo-status";
    status.textContent = "در حال دریافت عکس...";

    box.appendChild(title);
    box.appendChild(status);

    return { box, status };
  }

  async function loadPhoto(id, container) {
    if (!window.GolzarTehPhoto || !window.supabaseClient) return;

    const old = container.querySelector(".golzarteh-photo-box");
    if (old) old.remove();

    const { box, status } = createPhotoBox();
    container.appendChild(box);

    try {
      const result = await window.supabaseClient
        .from("martyrs")
        .select("name,lastname,piece,grave_row,grave_number")
        .eq("id", id)
        .limit(1);

      const record = result.data?.[0];

      if (result.error || !record) {
        status.textContent = "اطلاعات لازم برای تطبیق عکس در دسترس نیست.";
        return;
      }

      const photos = await window.GolzarTehPhoto.getPhotos(record);

      if (!photos?.mainPhoto) {
        status.textContent = "عکس دقیق این شهید در گلزارته پیدا نشد.";
        return;
      }

      const image = document.createElement("img");
      image.className = "golzarteh-photo-image";
      image.alt = "عکس شهید در گلزارته";
      image.loading = "lazy";
      image.src = photos.mainPhoto;

      image.onerror = () => {
        if (photos.thumbnail && image.src !== photos.thumbnail) {
          image.src = photos.thumbnail;
          return;
        }
        status.textContent = "دریافت عکس از گلزارته انجام نشد.";
        image.remove();
      };

      box.appendChild(image);

      const source = document.createElement("a");
      source.className = "golzarteh-photo-source";
      source.href = photos.mainPhoto;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = "منبع عکس: گلزارته";
      box.appendChild(source);

      status.remove();
    } catch (error) {
      console.error("Golzarteh detail photo error:", error);
      status.textContent = "دریافت عکس از گلزارته انجام نشد.";
    }
  }

  function install() {
    installStyles();

    if (typeof window.showRecordDetail !== "function") {
      console.error("GolzarStone: showRecordDetail not found.");
      return;
    }

    const original = window.showRecordDetail;
    if (original.__golzartehWrapped__) return;

    const wrapped = async function (id, source = "records") {
      await original(id, source);

      const container = document.getElementById("detail-container");
      if (!container) return;

      loadPhoto(id, container);
    };

    wrapped.__golzartehWrapped__ = true;
    window.showRecordDetail = wrapped;
  }

  install();
})();
