"use strict";

const GOLZARTEH_API = "https://api.golzarteh.ir/api/v1";
const GOLZARTEH_FILE = GOLZARTEH_API + "/files/download";

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .replace(/[يى]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[\u200c\u200f\u200e]/g, "")
    .replace(/\s+/g, " ");
}

function sameText(a, b) {
  return normalizeText(a) === normalizeText(b);
}

function sameNumber(a, b) {
  return String(a ?? "").trim() === String(b ?? "").trim();
}

function getMartyrPlaceField(martyr, field) {
  return martyr?.[field] ?? martyr?.tombInfo?.[field] ?? "";
}

function isExactMatch(record, martyr) {
  return (
    sameText(record.name, martyr.firstName) &&
    sameText(record.lastname, martyr.lastName) &&
    sameNumber(record.piece, getMartyrPlaceField(martyr, "section")) &&
    sameNumber(record.grave_row, getMartyrPlaceField(martyr, "row")) &&
    sameNumber(record.grave_number, getMartyrPlaceField(martyr, "number"))
  );
}

async function findGolzartehMartyr(record) {
  const params = new URLSearchParams({
    perPage: "25",
    number: String(record.grave_number ?? ""),
    section: String(record.piece ?? ""),
    lastName: String(record.lastname ?? ""),
    row: String(record.grave_row ?? ""),
    page: "1",
    firstName: String(record.name ?? "")
  });

  const response = await fetch(
    GOLZARTEH_API + "/martyr/summary?" + params.toString()
  );

  if (!response.ok) {
    throw new Error("Golzarteh API: " + response.status);
  }

  const result = await response.json();
  const rows = Array.isArray(result.data) ? result.data : [];

  if (result.total !== undefined && Number(result.total) !== 1) {
    return null;
  }

  const exact = rows.filter((martyr) => isExactMatch(record, martyr));

  return exact.length === 1 ? exact[0] : null;
}

function getGolzartehPhotoUrl(photoId) {
  if (!photoId) return "";
  return GOLZARTEH_FILE + "/" + encodeURIComponent(photoId);
}

async function getGolzartehPhotos(record) {
  const martyr = await findGolzartehMartyr(record);

  if (!martyr) return null;

  return {
    martyrId: martyr.id ?? null,
    uniqueCode: martyr.uniqueCode ?? "",
    mainPhoto: getGolzartehPhotoUrl(martyr.mainPhoto),
    thumbnail: getGolzartehPhotoUrl(martyr.thumbnailKey),
    tombPhotos: (martyr.tombInfo?.tombPhotos || [])
      .map(getGolzartehPhotoUrl)
      .filter(Boolean)
  };
}

window.GolzarTehPhoto = {
  findMartyr: findGolzartehMartyr,
  getPhotos: getGolzartehPhotos,
  getPhotoUrl: getGolzartehPhotoUrl
};
