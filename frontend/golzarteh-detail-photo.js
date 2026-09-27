"use strict";

(function () {
  if (window.__GOLZARTEH_DETAIL_PHOTO_INSTALLED__) return;
  window.__GOLZARTEH_DETAIL_PHOTO_INSTALLED__ = true;

  function installStyles() {
    if (document.getElementById("golzarteh-detail-photo-styles")) return;

    const style = document.createElement("style");
    style.id = "golzarteh-detail-photo-styles";
    style.textContent = `
      .golzarteh-photo-box{margin-top:20px;padding:14px;border:1px solid var(--border,#dce6df);border-radius:18px;background:#fbfdfc}
      .golzarteh-photo-title{color:var(--green-dark,#17633d);font-weight:bold;font-size:16px;margin-bottom:10px}
      .golzarteh-photo-status{color:var(--muted,#708078);font-size:13px;line-height:1.8}
      .golzarteh-photo-image{display:block;width:100%;max-height:520px;object-fit:contain;border-radius:14px;background:#eef2ef;margin-top:10px}
      .golzarteh-photo-source{display:block;margin-top:8px;color:var(--muted,#708078);font-size:11px;text-decoration:none}
    `;
    document.head.appendChild(style);
  }

  async function render(record, container) {
    if (!record || !container || !window.GolzarTehPhoto) return;

    const old = container.querySelector(".golzarteh-photo-box");
    if (old) old.remove();

    const box = document.createElement("section");
    box.className = "golzarteh-photo-box";

    const title = document.createElement("div");
    title.className = "golzarteh-photo-title";
    title.textContent = "📷 عکس شهید در گلزارته";

    const status = document.createElement("div");
    status.className = "golzarteh-photo-status";
    status.textContent = "در حال دریافت عکس...";

    box.append(title, status);
    container.appendChild(box);

    try {
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

  installStyles();
  window.renderGolzartehDetailPhoto = render;
})();
