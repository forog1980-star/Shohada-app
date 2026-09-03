"use strict";

// Independent data normalization layer for the "جستجوی کل شهدا" module.
// It never writes to Supabase or modifies source Excel files.

const AllMartyrsNormalizer = (() => {
  const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
  const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

  function clean(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/\u200c/g, " ")
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[ۀة]/g, "ه")
      .replace(/[ؤ]/g, "و")
      .replace(/[إأآ]/g, "ا")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/[۰-۹]/g, d => String(PERSIAN_DIGITS.indexOf(d)))
      .replace(/[٠-٩]/g, d => String(ARABIC_DIGITS.indexOf(d)))
      .replace(/\s+/g, " ")
      .trim();
  }

  function value(value) {
    const text = clean(value);
    return text === "?" ? "" : text;
  }

  function normalizeYear(raw) {
    const text = value(raw);
    if (!text) return { raw: "", normalized: "", valid: false, suspicious: false };
    if (/^\d{2}$/.test(text)) return { raw: text, normalized: `13${text}`, valid: true, suspicious: false };
    if (/^\d{4}$/.test(text)) return { raw: text, normalized: text, valid: true, suspicious: false };
    return { raw: text, normalized: text, valid: false, suspicious: true };
  }

  function normalizeDate(day, month, year) {
    const d = value(day);
    const m = value(month);
    const y = normalizeYear(year);
    return {
      day: d,
      month: m,
      year: y.normalized,
      rawYear: y.raw,
      validYear: y.valid,
      suspiciousYear: y.suspicious,
      display: [d, m, y.normalized].filter(Boolean).join("/")
    };
  }

  function detectType(row, source) {
    const first = value(row.first_name);
    const last = value(row.last_name);
    const piece = value(row.grave_piece);
    const allText = `${first} ${last}`.replace(/\s+/g, " ").trim();

    if (/^شهید\s*گمنام$/.test(allText) || first === "شهیدگمنام" || last === "شهیدگمنام") {
      return "unknown_martyr";
    }
    if (/^اموات$/.test(first) || /^اموات$/.test(allText) || (source === "golzar" && first === "اموات")) {
      return "non_martyr";
    }
    // A record from either source is a martyr unless explicitly classified otherwise.
    return "martyr";
  }

  function makeRecord(row, source, sourceRow) {
    const birth = normalizeDate(row.birth_day, row.birth_month, row.birth_year);
    const death = normalizeDate(row.death_day, row.death_month, row.death_year);
    const birthYear = Number(birth.year);
    const deathYear = Number(death.year);
    const calculatedAge = Number.isInteger(birthYear) && Number.isInteger(deathYear)
      ? deathYear - birthYear
      : null;

    const record = {
      id: `${source}:${sourceRow}`,
      source,
      source_row: sourceRow,
      record_type: detectType(row, source),
      first_name: value(row.first_name),
      last_name: value(row.last_name),
      father_name: value(row.father_name),
      gender: value(row.gender),
      birth_date: birth,
      death_date: death,
      age_raw: value(row.age),
      age_calculated: calculatedAge !== null && calculatedAge >= 0 && calculatedAge <= 120 ? calculatedAge : null,
      martyrdom_category: value(row.martyrdom_category),
      martyrdom_location: value(row.martyrdom_location),
      grave_piece: value(row.grave_piece),
      grave_row: value(row.grave_row),
      grave_number: value(row.grave_number),
      description: value(row.description)
    };

    record.age_display = record.age_calculated !== null ? String(record.age_calculated) : record.age_raw;
    return record;
  }

  function fromGolzar(row, sourceRow) {
    return makeRecord({
      first_name: row["نام"],
      last_name: row["نام خانوادگی"],
      father_name: row["نام پدر"],
      gender: row["جنسیت"],
      birth_day: row["روز ولادت"],
      birth_month: row["ماه ولادت"],
      birth_year: row["سال ولادت"],
      death_day: row["روز شهادت"],
      death_month: row["ماه شهادت"],
      death_year: row["سال شهادت"],
      age: row["سن"],
      martyrdom_category: row["عملیات"],
      martyrdom_location: row["منطقه شهادت"],
      grave_piece: row["قطعه مزار"],
      grave_row: row["ردیف مزار"],
      grave_number: row["شماره مزار"],
      description: ""
    }, "golzar", sourceRow);
  }

  function fromOutside(row, sourceRow) {
    return makeRecord({
      first_name: row["نام"],
      last_name: row["نام خانوادگی"],
      father_name: row["نام پدر"],
      gender: "",
      birth_day: row["روز تولد"],
      birth_month: row["ماه تولد"],
      birth_year: row["سال تولد"],
      death_day: row["روز شهادت"],
      death_month: row["ماه شهادت"],
      death_year: row["سال شهادت"],
      age: "",
      martyrdom_category: row["دسته بندی شهادت"],
      martyrdom_location: row["محل شهادت"],
      grave_piece: row["قطعه مزار"],
      grave_row: row["ردیف مزار"],
      grave_number: row["شماره مزار"],
      description: row["توضیحات"]
    }, "outside", sourceRow);
  }

  function searchableText(record) {
    return [
      record.first_name,
      record.last_name,
      record.father_name,
      record.gender,
      record.birth_date.day,
      record.birth_date.month,
      record.birth_date.year,
      record.death_date.day,
      record.death_date.month,
      record.death_date.year,
      record.age_display,
      record.martyrdom_category,
      record.martyrdom_location,
      record.grave_piece,
      record.grave_row,
      record.grave_number,
      record.record_type === "unknown_martyr" ? "شهید گمنام" : "",
      record.record_type === "non_martyr" ? "اموات غیرشهید غیرشهید" : ""
    ].map(clean).filter(Boolean).join(" ");
  }

  return { clean, value, normalizeYear, normalizeDate, fromGolzar, fromOutside, searchableText };
})();
