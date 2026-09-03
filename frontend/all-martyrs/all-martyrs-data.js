"use strict";

const AllMartyrsData = (() => {
  const SOURCES = {
    golzar: "../../AllMartyrsData/golzar_martyrs.xlsx",
    outside: "../../AllMartyrsData/outside_golzar_martyrs.xlsx"
  };

  async function readWorkbook(url) {
    const response = await fetch(`${url}?v=20260903-01`, { cache: "no-store" });
    if (!response.ok) throw new Error(`خطا در دریافت فایل داده (${response.status})`);
    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("برگه‌ای در فایل داده پیدا نشد.");
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
  }

  async function load() {
    const [golzarRows, outsideRows] = await Promise.all([
      readWorkbook(SOURCES.golzar),
      readWorkbook(SOURCES.outside)
    ]);

    const records = [];
    golzarRows.forEach((row, index) => records.push(AllMartyrsNormalizer.fromGolzar(row, index + 2)));
    outsideRows.forEach((row, index) => records.push(AllMartyrsNormalizer.fromOutside(row, index + 2)));

    return {
      records,
      counts: {
        golzar: golzarRows.length,
        outside: outsideRows.length,
        total: records.length
      }
    };
  }

  return { load, SOURCES };
})();
