"use strict";

const AllMartyrsSearch = (() => {
  const FIELDS = {
    first_name: "نام",
    last_name: "نام خانوادگی",
    father_name: "نام پدر",
    gender: "جنسیت",
    birth_day: "روز تولد",
    birth_month: "ماه تولد",
    birth_year: "سال تولد",
    death_day: "روز شهادت",
    death_month: "ماه شهادت",
    death_year: "سال شهادت",
    age: "سن",
    martyrdom_category: "عملیات / دسته‌بندی شهادت",
    martyrdom_location: "منطقه / محل شهادت",
    grave_piece: "قطعه مزار",
    grave_row: "ردیف مزار",
    grave_number: "شماره مزار"
  };

  const MONTH_OPTIONS = AllMartyrsNormalizer.MONTHS.map((name, index) => ({ value: String(index + 1), label: name }));
  const PIECE_OPTIONS = [
    { value: "", label: "همه قطعات" },
    { value: "17", label: "قطعه 17" },
    { value: "21", label: "قطعه 21" },
    { value: "24", label: "قطعه 24" },
    { value: "26", label: "قطعه 26" },
    { value: "27", label: "قطعه 27" },
    { value: "28", label: "قطعه 28" },
    { value: "29", label: "قطعه 29" },
    { value: "40", label: "قطعه 40" },
    { value: "44", label: "قطعه 44" },
    { value: "53", label: "قطعه 53" },
    { value: "outside", label: "قطعات عمومی بهشت زهرا" }
  ];

  function fieldValue(record, field) {
    switch (field) {
      case "birth_day": return record.birth_date.day;
      case "birth_month": return record.birth_date.month;
      case "birth_year": return record.birth_date.year;
      case "death_day": return record.death_date.day;
      case "death_month": return record.death_date.month;
      case "death_year": return record.death_date.year;
      case "age": return record.age_display;
      default: return record[field] || "";
    }
  }

  function matchesField(record, field, query) {
    const q = AllMartyrsNormalizer.clean(query);
    if (!q) return true;
    if (field === "birth_month" || field === "death_month") {
      const month = Number(record[field === "birth_month" ? "birth_date" : "death_date"].month);
      if (Number.isInteger(month) && month >= 1 && month <= 12) {
        const name = AllMartyrsNormalizer.MONTHS[month - 1];
        return q === String(month) || q === AllMartyrsNormalizer.clean(name);
      }
    }
    return AllMartyrsNormalizer.clean(fieldValue(record, field)).includes(q);
  }

  function matchesAllWords(record, query) {
    const searchable = AllMartyrsNormalizer.searchableText(record);
    const words = AllMartyrsNormalizer.clean(query).split(/\s+/).filter(Boolean);
    return words.length > 0 && words.every(word => searchable.includes(word));
  }

  function scoreField(record, field, query) {
    const q = AllMartyrsNormalizer.clean(query);
    if (!q) return 0;
    const value = AllMartyrsNormalizer.clean(fieldValue(record, field));
    if (!value) return 0;
    if (value === q) return 100;
    if (value.startsWith(q)) return 40;
    return value.includes(q) ? 10 : 0;
  }

  function scoreResult(record, { query = "", field = "all", filters = {} } = {}) {
    let score = 0;

    if (query) {
      if (field !== "all") {
        score += scoreField(record, field, query);
      } else {
        const q = AllMartyrsNormalizer.clean(query);
        const searchable = AllMartyrsNormalizer.clean(AllMartyrsNormalizer.searchableText(record));
        if (searchable === q) score += 120;
        else if (searchable.startsWith(q)) score += 50;
        else if (searchable.includes(q)) score += 15;
      }
    }

    const piece = AllMartyrsNormalizer.clean(record.grave_piece);
    const row = AllMartyrsNormalizer.clean(record.grave_row);
    const number = AllMartyrsNormalizer.clean(record.grave_number);
    const fp = AllMartyrsNormalizer.clean(filters.grave_piece);
    const fr = AllMartyrsNormalizer.clean(filters.grave_row);
    const fn = AllMartyrsNormalizer.clean(filters.grave_number);

    if (fp && fp !== "outside" && piece === fp) score += 200;
    if (fr && row === fr) score += 200;
    if (fn && number === fn) score += 200;

    if (fp && fp !== "outside" && fr && fn && piece === fp && row === fr && number === fn) {
      score += 1000;
    }

    return score;
  }

  function isInvalidGraveLocation(record) {
    const row = AllMartyrsNormalizer.clean(record.grave_row);
    const number = AllMartyrsNormalizer.clean(record.grave_number);
    return row === "0" || number === "0";
  }

  function search(records, { query = "", field = "all", filters = {} } = {}) {
    const q = AllMartyrsNormalizer.clean(query);
    let result = records.filter(record => !isInvalidGraveLocation(record));

    if (q) {
      if (field === "all") result = result.filter(record => matchesAllWords(record, q));
      else if (FIELDS[field]) result = result.filter(record => matchesField(record, field, q));
    }

    for (const [key, filterValue] of Object.entries(filters)) {
      if (!filterValue) continue;

      if (key === "grave_piece") {
        if (filterValue === "outside") {
          result = result.filter(record => record.source === "outside");
        } else {
          result = result.filter(record =>
            AllMartyrsNormalizer.clean(record.grave_piece) === AllMartyrsNormalizer.clean(filterValue)
          );
        }
      } else if (FIELDS[key]) {
        const normalizedFilter = AllMartyrsNormalizer.clean(filterValue);
        if ((key === "grave_row" || key === "grave_number") && normalizedFilter === "0") {
          return [];
        }
        result = result.filter(record => matchesField(record, key, filterValue));
      }
    }

    return result
      .map((record, index) => ({ record, score: scoreResult(record, { query, field, filters }), index }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map(item => item.record);
  }

  return { FIELDS, MONTH_OPTIONS, PIECE_OPTIONS, search, fieldValue };
})();
