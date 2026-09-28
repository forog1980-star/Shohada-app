"use strict";

(function () {
  if (window.__GOLZARTEH_TOMB_PHOTO_INSTALLED__) return;
  window.__GOLZARTEH_TOMB_PHOTO_INSTALLED__ = true;

  function installStyles() {
    if (document.getElementById("golzarteh-tomb-photo-styles")) return;

    const style = document.createElement("style");
    style.id = "golzarteh-tomb-photo-styles";
    style.textContent = `
      .golzarteh-tomb-box{margin-top:14px;padding:14px;border:1px solid var(--border,#dce6df);border-radius:18px;background:#fbfdfc}
      .golzarteh-tomb-title{color:var(--green-dark,#17633d);font-weight:bold;font-size:16px;margin-bottom:10px}
      .golzarteh-tomb-status{color:var(--muted,#708078);font-size:13px;line-height:1.8}
      .golzarteh-tomb-image{display:block;width:100%;max-height:620px;object-fit:contain;border-radius:14px;background:#eef2ef;margin-top:10px}
      .golzarteh-tomb-source{display:block;margin-top:8px;color:var(--muted,#708078);font-size:11px;text-decoration:none}
      .golzarteh-tomb-gallery{display:grid;gap:14px}
    `;
    document.head.appendChild(style);
  }

  async function render(record, container) {
    if (!record || !container || !window.GolzarTehPhoto) return;

    const old = container.querySelector(".golzarteh-tomb-box");
    if (old) old.remove();

    const box = document.createElement("section");
    box.className = "golzarteh-tomb-box";

    const title = document.createElement("div");
    title.className = "golzarteh-tomb-title";
    title.textContent = "🪦 عکس مزار شهید در سایت گلزار شهدای تهران";

    const status = document.createElement("div");
    status.className = "golzarteh-tomb-status";
    status.textContent = "در حال دریافت عکس مزار...";

    const gallery = document.createElement("div");
    gallery.className = "golzarteh-tomb-gallery";

    box.append(title, status, gallery);
    container.appendChild(box);

    try {
      const photos = await window.GolzarTehPhoto.getPhotos(record);
      const tombPhotos = Array.isArray(photos?.tombPhotos) ? photos.tombPhotos : [];

      if (!tombPhotos.length) {
        status.textContent = "عکس مزار این شهید در سایت گلزار شهدای تهران پیدا نشد.";
        return;
      }

      status.remove();

      tombPhotos.forEach((photoUrl, index) => {
        const image = document.createElement("img");
        image.className = "golzarteh-tomb-image";
        image.alt = `عکس مزار شهید در سایت گلزار شهدای تهران - ${index + 1}`;
        image.loading = "lazy";
        image.src = photoUrl;

        image.onerror = () => {
          image.remove();
          if (!gallery.children.length) {
            const failed = document.createElement("div");
            failed.className = "golzarteh-tomb-status";
            failed.textContent = "دریافت عکس مزار از سایت گلزار شهدای تهران انجام نشد.";
            gallery.appendChild(failed);
          }
        };

        gallery.appendChild(image);

        const source = document.createElement("a");
        source.className = "golzarteh-tomb-source";
        source.href = photoUrl;
        source.target = "_blank";
        source.rel = "noopener noreferrer";
        source.textContent = `منبع عکس مزار ${index + 1}: سایت گلزار شهدای تهران`;
        gallery.appendChild(source);
      });
    } catch (error) {
      console.error("Golzarteh tomb photo error:", error);
      status.textContent = "دریافت عکس مزار از سایت گلزار شهدای تهران انجام نشد.";
    }
  }

  installStyles();
  window.renderGolzartehTombPhoto = render;
})();