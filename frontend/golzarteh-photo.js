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

function normalizeIdentityText(value) {
  return normalizeText(value).replace(/\s+/g, "");
}

function getLeadingAlefVariants(value) {
  const normalized = normalizeText(value);
  if (!normalized) return [];

  const words = normalized.split(" ").filter(Boolean);
  let variants = [""];

  for (const word of words) {
    const choices = [word];

    if (/^[آأإا]/.test(word)) {
      const rest = word.slice(1);
      choices.push("ا" + rest);
      choices.push("آ" + rest);
    }

    variants = variants.flatMap((prefix) =>
      choices.map((choice) =>
        prefix ? prefix + " " + choice : choice
      )
    );
  }

  return [...new Set(variants)];
}

function getIdentityVariants(value) {
  const baseVariants = getLeadingAlefVariants(value);
  const compactVariants = baseVariants
    .map((variant) => variant.replace(/\s+/g, ""))
    .filter(Boolean);

  return [...new Set([...baseVariants, ...compactVariants])].slice(0, 24);
}

function normalizePersonName(value) {
  return normalizeText(value).replace(/^(سید|سیده)\s*/, "");
}

function getFamilyNameVariants(value) {
  const normalized = normalizeText(value);
  if (!normalized) return [];

  const legacyVariants = [normalized];
  const alefAroVariant = normalized.replace(/\sارا$/g, " آرا");

  if (alefAroVariant && alefAroVariant !== normalized) {
    legacyVariants.push(alefAroVariant);
  }

  const controlledVariants = legacyVariants.flatMap(getIdentityVariants);
  return [...new Set(controlledVariants)].slice(0, 24);
}

function getPersonNameVariants(value) {
  const normalized = normalizeText(value);
  if (!normalized) return [];

  const baseVariants = [
    normalized,
    normalized.replace(/^(سید|سیده)\s*/, ""),
    normalized.replace(/\s+/g, "")
  ];

  return [
    ...new Set(
      baseVariants
        .flatMap(getIdentityVariants)
        .filter(Boolean)
    )
  ].slice(0, 24);
}

function namesEquivalent(a, b) {
  const aVariants = getIdentityVariants(a);
  const bVariants = new Set(getIdentityVariants(b));
  return aVariants.some((variant) => bVariants.has(variant));
}

function sameNumber(a, b) {
  return String(a ?? "").trim() === String(b ?? "").trim();
}

function getMartyrPlaceField(martyr, field) {
  return martyr?.[field] ?? martyr?.tombInfo?.[field] ?? "";
}

function getRecordField(record, keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }

  return "";
}

function getApiField(record, keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }

  return "";
}

const BIRTH_DATE_KEYS = [
  "birthDate",
  "birth_date",
  "dateOfBirth",
  "date_of_birth",
  "birth"
];

const DEATH_DATE_KEYS = [
  "deathDate",
  "death_date",
  "martyrdomDate",
  "martyrdom_date",
  "dateOfMartyrdom",
  "date_of_martyrdom",
  "death"
];

function dateComparable(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "object") {
    const day =
      value.day ??
      value.Day ??
      value.deathDay ??
      value.birthDay ??
      "";
    const month =
      value.month ??
      value.Month ??
      value.deathMonth ??
      value.birthMonth ??
      "";
    const year =
      value.year ??
      value.Year ??
      value.deathYear ??
      value.birthYear ??
      "";

    if (day || month || year) {
      return [day, month, year]
        .map((part) =>
          normalizeText(part)
            .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
            .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
        )
        .join("/")
        .replace(/\/+$/, "");
    }
  }

  return normalizeText(value)
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[-.\s]+/g, "/")
    .replace(/\/+/g, "/")
    .trim();
}

function getRecordDate(record, type) {
  return type === "birth"
    ? getRecordField(record, ["birth_date", "birthDate"])
    : getRecordField(record, ["death_date", "deathDate", "martyrdom_date", "martyrdomDate"]);
}

function getApiDate(record, type) {
  return type === "birth"
    ? getApiField(record, BIRTH_DATE_KEYS)
    : getApiField(record, DEATH_DATE_KEYS);
}

function sameOptionalField(recordValue, apiValue, normalizer = normalizeIdentityText) {
  if (!recordValue || !apiValue) return null;
  return normalizer(recordValue) === normalizer(apiValue);
}

function buildMatchDetails(record, martyr) {
  const fatherRecord = getRecordField(record, ["father_name", "fatherName"]);
  const birthRecord = getRecordDate(record, "birth");
  const deathRecord = getRecordDate(record, "death");

  const fatherApi = getApiField(martyr, ["fatherName", "father_name"]);
  const birthApi = getApiDate(martyr, "birth");
  const deathApi = getApiDate(martyr, "death");

  const fatherMatch = sameOptionalField(
    fatherRecord,
    fatherApi,
    normalizeIdentityText
  );

  const birthMatch = sameOptionalField(
    dateComparable(birthRecord),
    dateComparable(birthApi),
    normalizeText
  );

  const deathMatch = sameOptionalField(
    dateComparable(deathRecord),
    dateComparable(deathApi),
    normalizeText
  );

  const locationMatch =
    sameNumber(
      getRecordField(record, ["piece"]),
      getMartyrPlaceField(martyr, "section")
    ) &&
    sameNumber(
      getRecordField(record, ["grave_row"]),
      getMartyrPlaceField(martyr, "row")
    ) &&
    sameNumber(
      getRecordField(record, ["grave_number"]),
      getMartyrPlaceField(martyr, "number")
    );

  let score = 80;
  if (fatherMatch === true) score += 10;
  if (birthMatch === true) score += 5;
  if (deathMatch === true) score += 5;
  if (locationMatch) score += 10;

  return {
    nameMatch: namesEquivalent(record?.name, martyr?.firstName),
    lastNameMatch: namesEquivalent(record?.lastname, martyr?.lastName),
    fatherMatch,
    birthMatch,
    deathMatch,
    locationMatch,
    score
  };
}

function isExactLocation(record, martyr) {
  return (
    sameNumber(
      record.piece,
      getMartyrPlaceField(martyr, "section")
    ) &&
    sameNumber(
      record.grave_row,
      getMartyrPlaceField(martyr, "row")
    ) &&
    sameNumber(
      record.grave_number,
      getMartyrPlaceField(martyr, "number")
    )
  );
}

function strictNamesMatch(record, martyr) {
  return (
    normalizeIdentityText(
      normalizePersonName(record.name)
    ) ===
      normalizeIdentityText(
        normalizePersonName(martyr.firstName)
      ) &&
    normalizeIdentityText(record.lastname) ===
      normalizeIdentityText(martyr.lastName)
  );
}

function isExactMatch(record, martyr) {
  if (!isExactLocation(record, martyr)) return false;

  if (strictNamesMatch(record, martyr)) {
    return true;
  }

  const details = buildMatchDetails(record, martyr);

  return (
    details.nameMatch &&
    details.lastNameMatch &&
    (details.fatherMatch === true ||
      details.birthMatch === true ||
      details.deathMatch === true)
  );
}

function isNameSimilar(record, martyr) {
  return (
    namesEquivalent(
      normalizePersonName(record.name),
      normalizePersonName(martyr.firstName)
    ) &&
    namesEquivalent(
      record.lastname,
      martyr.lastName
    )
  );
}

function mapQueryRows(result) {
  return Array.isArray(result?.data) ? result.data : [];
}

async function fetchGolzartehByParams(params) {
  const response = await fetch(
    GOLZARTEH_API +
      "/martyr/summary?" +
      new URLSearchParams(params).toString()
  );

  if (!response.ok) {
    throw new Error("Golzarteh API: " + response.status);
  }

  return response.json();
}

async function findExactGolzartehMartyr(record) {
  const firstNameVariants = getPersonNameVariants(record.name);
  const lastNameVariants = getFamilyNameVariants(record.lastname);

  for (const firstName of firstNameVariants.slice(0, 4)) {
    for (const lastName of lastNameVariants.slice(0, 4)) {
      const result = await fetchGolzartehByParams({
        perPage: "25",
        number: String(record.grave_number ?? ""),
        section: String(record.piece ?? ""),
        lastName,
        row: String(record.grave_row ?? ""),
        page: "1",
        firstName
      });

      const rows = mapQueryRows(result);
      if (!rows.length) continue;

      const exact = rows.filter((martyr) =>
        isExactMatch(record, martyr)
      );

      if (exact.length === 1) {
        return exact[0];
      }
    }
  }

  return null;
}

async function findSimilarGolzartehMartyrs(record) {
  const firstNameVariants = getPersonNameVariants(record.name);
  const lastNameVariants = getFamilyNameVariants(record.lastname);
  const candidates = new Map();

  for (const firstName of firstNameVariants.slice(0, 8)) {
    for (const lastName of lastNameVariants.slice(0, 8)) {
      const result = await fetchGolzartehByParams({
        perPage: "25",
        lastName,
        page: "1",
        firstName
      });

      for (const martyr of mapQueryRows(result)) {
        if (!martyr?.id) continue;
        if (!isNameSimilar(record, martyr)) continue;
        candidates.set(String(martyr.id), martyr);
      }

      if (candidates.size >= 25) break;
    }

    if (candidates.size >= 25) break;
  }

  return [...candidates.values()]
    .map((martyr) => ({
      ...martyr,
      matchDetails: buildMatchDetails(record, martyr)
    }))
    .sort((a, b) => {
      const scoreDiff =
        (b.matchDetails?.score || 0) -
        (a.matchDetails?.score || 0);

      if (scoreDiff !== 0) return scoreDiff;

      return String(a.id).localeCompare(String(b.id));
    })
    .slice(0, 10);
}

async function findGolzartehMatches(record) {
  const exact = await findExactGolzartehMartyr(record);

  if (exact) {
    return {
      matchType: "exact",
      exact,
      similar: []
    };
  }

  const similar = await findSimilarGolzartehMartyrs(record);

  return {
    matchType: similar.length ? "similar" : "none",
    exact: null,
    similar
  };
}

function findGolzartehMartyr(record) {
  return findExactGolzartehMartyr(record);
}

function getGolzartehPhotoUrl(photoId) {
  if (!photoId) return "";
  return GOLZARTEH_FILE + "/" + encodeURIComponent(photoId);
}

function toPhotoData(martyr) {
  return {
    martyrId: martyr?.id ?? null,
    uniqueCode: martyr?.uniqueCode ?? "",
    firstName: martyr?.firstName ?? "",
    lastName: martyr?.lastName ?? "",
    fatherName: martyr?.fatherName ?? "",
    birthDate: getApiDate(martyr, "birth"),
    deathDate: getApiDate(martyr, "death"),
    piece: getMartyrPlaceField(martyr, "section"),
    row: getMartyrPlaceField(martyr, "row"),
    number: getMartyrPlaceField(martyr, "number"),
    mainPhoto: getGolzartehPhotoUrl(martyr?.mainPhoto),
    thumbnail: getGolzartehPhotoUrl(martyr?.thumbnailKey),
    tombPhotos: (martyr?.tombInfo?.tombPhotos || [])
      .map(getGolzartehPhotoUrl)
      .filter(Boolean),
    matchDetails: martyr?.matchDetails || null
  };
}

async function getGolzartehPhotos(record) {
  const matches = await findGolzartehMatches(record);

  if (matches.exact) {
    return {
      matchType: "exact",
      ...toPhotoData(matches.exact)
    };
  }

  return {
    matchType: matches.matchType,
    mainPhoto: "",
    thumbnail: "",
    tombPhotos: [],
    similarMatches: matches.similar.map(toPhotoData)
  };
}

window.GolzarTehPhoto = {
  findMartyr: findGolzartehMartyr,
  findMatches: findGolzartehMatches,
  getPhotos: getGolzartehPhotos,
  getPhotoUrl: getGolzartehPhotoUrl
};