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
    return AllMartyrsNormalizer.clean(fieldValue(record, field)).includes(q);
  }

  function search(records, { query = "", field = "all", filters = {} } = {}) {
    const q = AllMartyrsNormalizer.clean(query);
    let result = records;

    if (q) {
      if (field === "all") {
        result = result.filter(record => AllMartyrsNormalizer.searchableText(record).includes(q));
      } else if (FIELDS[field]) {
        result = result.filter(record => matchesField(record, field, q));
      }
    }

    for (const [key, filterValue] of Object.entries(filters)) {
      if (!filterValue) continue;
      if (key === "record_type") {
        result = result.filter(record => record.record_type === filterValue);
      } else if (FIELDS[key]) {
        result = result.filter(record => matchesField(record, key, filterValue));
      }
    }

    return result;
  }

  return { FIELDS, search, fieldValue };
})();
