"use strict";

(function () {
  if (window.__GOLZARTEH_DETAIL_PHOTO_INSTALLED__) return;
  window.__GOLZARTEH_DETAIL_PHOTO_INSTALLED__ = true;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function faDigits(value) {
    return String(value ?? "").replace(
      /[0-9]/g,
      (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]
    );
  }

  function installStyles() {
    if (document.getElementById("golzarteh-detail-photo-styles")) return;

    const style = document.createElement("style");
    style.id = "golzarteh-detail-photo-styles";
    style.textContent = [
      ".golzarteh-photo-box{margin-top:20px;padding:14px;border:1px solid var(--border,#dce6df);border-radius:18px;background:#fbfdfc}",
      ".golzarteh-photo-title{color:var(--green-dark,#17633d);font-weight:bold;font-size:16px;margin-bottom:10px}",
      ".golzarteh-photo-status{color:var(--muted,#708078);font-size:13px;line-height:1.8}",
      ".golzarteh-photo-image{display:block;width:100%;max-height:520px;object-fit:contain;border-radius:14px;background:#eef2ef;margin-top:10px}",
      ".golzarteh-photo-source{display:block;margin-top:8px;color:var(--muted,#708078);font-size:11px;text-decoration:none}",
      ".golzarteh-similar-note{margin:12px 0;padding:11px 12px;border-radius:12px;background:#fff8e7;border:1px solid #ead9a6;color:#6c5a20;font-size:13px;line-height:1.9}",
      ".golzarteh-similar-list{display:grid;gap:14px;margin-top:12px}",
      ".golzarteh-similar-card{padding:13px;border:1px solid #dde7e1;border-radius:16px;background:#fff}",
      ".golzarteh-similar-head{font-weight:bold;font-size:15px;color:#245a40}",
      ".golzarteh-similar-meta{margin-top:5px;color:#5f6f67;font-size:12px;line-height:1.9}",
      ".golzarteh-similar-checks{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}",
      ".golzarteh-match-chip{padding:4px 8px;border-radius:999px;background:#eef6f0;color:#315f45;font-size:11px}",
      ".golzarteh-match-chip.is-unknown{background:#f3f4f4;color:#69726e}",
      ".golzarteh-similar-photo-box{margin-top:12px;padding:10px;border:1px solid #dde7e1;border-radius:12px;background:#fbfdfc}",
      ".golzarteh-similar-photo-title{font-weight:bold;color:#315f45;font-size:12px;margin-bottom:7px}",
      ".golzarteh-similar-main{display:block;width:100%;max-height:360px;object-fit:contain;border-radius:10px;background:#eef2ef}",
      ".golzarteh-similar-tombs{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-top:10px}",
      ".golzarteh-similar-tombs img{display:block;width:100%;height:170px;object-fit:cover;border-radius:10px;background:#eef2ef}",
      ".golzarteh-similar-source{display:block;margin-top:8px;color:#6f7c76;font-size:11px;text-decoration:none}"
    ].join("");

    document.head.appendChild(style);
  }

  function dateText(value) {
    if (!value) return "";

    if (typeof value === "object") {
      const day = value.day ?? "";
      const month = value.month_name ?? value.month ?? "";
      const year = value.year ?? "";
      return [day, month, year]
        .filter(Boolean)
        .join(" / ");
    }

    return String(value);
  }

  function locationText(candidate) {
    const piece = candidate.piece || "";
    const row = candidate.row || "";
    const number = candidate.number || "";

    if (!piece && !row && !number) {
      return "اطلاعات مزار ثبت نشده است.";
    }

    return [
      piece ? "قطعه " + faDigits(piece) : "",
      row ? "ردیف " + faDigits(row) : "",
      number ? "شماره " + faDigits(number) : ""
    ].filter(Boolean).join(" / ");
  }

  function matchChip(label, value) {
    if (value === true) {
      return '<span class="golzarteh-match-chip">✓ ' +
        escapeHtml(label) +
        "</span>";
    }

    if (value === false) {
      return '<span class="golzarteh-match-chip is-unknown">تفاوت ' +
        escapeHtml(label) +
        "</span>";
    }

    return '<span class="golzarteh-match-chip is-unknown">— ' +
      escapeHtml(label) +
      " نامشخص</span>";
  }

  function renderSimilarCard(candidate) {
    const fullName = [
      candidate.firstName,
      candidate.lastName
    ].filter(Boolean).join(" ") || "رکورد مشابه";

    const details = candidate.matchDetails || {};

    const card = document.createElement("article");
    card.className = "golzarteh-similar-card";

    const head = document.createElement("div");
    head.className = "golzarteh-similar-head";
    head.textContent = fullName;
    card.appendChild(head);

    const meta = document.createElement("div");
    meta.className = "golzarteh-similar-meta";

    const metaParts = [];

    if (candidate.fatherName) {
      metaParts.push("نام پدر: " + candidate.fatherName);
    }

    if (candidate.birthDate) {
      metaParts.push("تولد: " + dateText(candidate.birthDate));
    }

    if (candidate.deathDate) {
      metaParts.push("شهادت: " + dateText(candidate.deathDate));
    }

    metaParts.push(locationText(candidate));

    meta.innerHTML = metaParts
      .map((part) => "<div>" + escapeHtml(part) + "</div>")
      .join("");

    card.appendChild(meta);

    const checks = document.createElement("div");
    checks.className = "golzarteh-similar-checks";
    checks.innerHTML = [
      matchChip("نام", details.nameMatch),
      matchChip("نام خانوادگی", details.lastNameMatch),
      matchChip("نام پدر", details.fatherMatch),
      matchChip("تاریخ تولد", details.birthMatch),
      matchChip("تاریخ شهادت", details.deathMatch),
      matchChip("آدرس مزار", details.locationMatch)
    ].join("");
    card.appendChild(checks);

    if (candidate.mainPhoto || candidate.thumbnail) {
      const photoBox = document.createElement("div");
      photoBox.className = "golzarteh-similar-photo-box";

      const photoTitle = document.createElement("div");
      photoTitle.className = "golzarteh-similar-photo-title";
      photoTitle.textContent = "عکس شهید در گلزار شهدای تهران";
      photoBox.appendChild(photoTitle);

      const image = document.createElement("img");
      image.className = "golzarteh-similar-main";
      image.alt = "عکس شهید در گلزار شهدای تهران";
      image.loading = "lazy";
      image.src = candidate.mainPhoto || candidate.thumbnail;

      image.onerror = () => {
        if (candidate.thumbnail && image.src !== candidate.thumbnail) {
          image.src = candidate.thumbnail;
          return;
        }
        photoBox.remove();
      };

      photoBox.appendChild(image);
      card.appendChild(photoBox);
    }

    if (candidate.tombPhotos?.length) {
      const tombBox = document.createElement("div");
      tombBox.className = "golzarteh-similar-photo-box";

      const tombTitle = document.createElement("div");
      tombTitle.className = "golzarteh-similar-photo-title";
      tombTitle.textContent = "عکس مزار شهید در گلزار شهدای تهران";
      tombBox.appendChild(tombTitle);

      const tombs = document.createElement("div");
      tombs.className = "golzarteh-similar-tombs";

      candidate.tombPhotos.forEach((src) => {
        const img = document.createElement("img");
        img.alt = "عکس مزار شهید در گلزار شهدای تهران";
        img.loading = "lazy";
        img.src = src;
        img.onerror = () => img.remove();
        tombs.appendChild(img);
      });

      tombBox.appendChild(tombs);
      card.appendChild(tombBox);
    }

    const source = document.createElement("a");
    source.className = "golzarteh-similar-source";
    source.href =
      candidate.mainPhoto ||
      candidate.thumbnail ||
      candidate.tombPhotos?.[0] ||
      "#";
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent =
      "منبع تصویر: سایت گلزار شهدای تهران — این نتیجه به‌صورت مشابه نمایش داده شده است.";
    card.appendChild(source);

    return card;
  }

  function renderSimilarMatches(similarMatches, box) {
    const note = document.createElement("div");
    note.className = "golzarteh-similar-note";
    note.textContent =
      "نتیجه دقیق بر اساس مشخصات مکانی فعلی پیدا نشد؛ اما یک یا چند رکورد با نام و مشخصات هویتی مشابه در گلزارته پیدا شد. این موارد به‌صورت پیشنهادی نمایش داده شده‌اند و به رکورد فعلی متصل نشده‌اند.";
    box.appendChild(note);

    const list = document.createElement("div");
    list.className = "golzarteh-similar-list";

    similarMatches.forEach((candidate) => {
      list.appendChild(renderSimilarCard(candidate));
    });

    box.appendChild(list);
  }

  async function render(record, container) {
    if (!record || !container || !window.GolzarTehPhoto) return;

    const old = container.querySelector(".golzarteh-photo-box");
    if (old) old.remove();

    const box = document.createElement("section");
    box.className = "golzarteh-photo-box";

    const title = document.createElement("div");
    title.className = "golzarteh-photo-title";
    title.textContent = "📷 عکس شهید در سایت گلزار شهدای تهران";

    const status = document.createElement("div");
    status.className = "golzarteh-photo-status";
    status.textContent = "در حال دریافت عکس و بررسی تطبیق...";

    box.append(title, status);
    container.appendChild(box);

    try {
      const photos = await window.GolzarTehPhoto.getPhotos(record);

      if (photos?.matchType === "similar" && photos.similarMatches?.length) {
        status.remove();
        renderSimilarMatches(photos.similarMatches, box);
        return;
      }

      if (!photos?.mainPhoto) {
        status.textContent =
          "عکس دقیق این شهید در سایت گلزار شهدای تهران پیدا نشد.";
        return;
      }

      const image = document.createElement("img");
      image.className = "golzarteh-photo-image";
      image.alt = "عکس شهید در سایت گلزار شهدای تهران";
      image.loading = "lazy";
      image.src = photos.mainPhoto;

      image.onerror = () => {
        if (photos.thumbnail && image.src !== photos.thumbnail) {
          image.src = photos.thumbnail;
          return;
        }
        status.textContent =
          "دریافت عکس از سایت گلزار شهدای تهران انجام نشد.";
        image.remove();
      };

      box.appendChild(image);

      const source = document.createElement("a");
      source.className = "golzarteh-photo-source";
      source.href = photos.mainPhoto;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = "منبع عکس: سایت گلزار شهدای تهران";
      box.appendChild(source);

      status.remove();

      if (typeof window.renderGolzartehTombPhoto === "function") {
        window.renderGolzartehTombPhoto(record, container);
      }
    } catch (error) {
      console.error("Golzarteh detail photo error:", error);
      status.textContent =
        "دریافت عکس از سایت گلزار شهدای تهران انجام نشد.";
    }
  }

  installStyles();
  window.renderGolzartehDetailPhoto = render;
})();