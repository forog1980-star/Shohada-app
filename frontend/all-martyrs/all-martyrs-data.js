"use strict";

const AllMartyrsData = (() => {
  const SOURCE = "https://raw.githubusercontent.com/forog1980-star/Shohada-app/data/all-martyrs-20260904/data/all-martyrs/golzar_martyrs.xlsx";

  const SHEETS = {
    golzar: "golzar_martyrs",
    outside: "outside_golzar_martyrs"
  };

  async function readWorkbook(url) {
    const response = await fetch(`${url}?v=20260904-01`, {
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error(`خطا در دریافت فایل داده (${response.status})`);
    }
    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
    return workbook;
  }

  function readSheet(workbook, sheetName) {
    if (!workbook.SheetNames.includes(sheetName)) {
      throw new Error(`برگه «${sheetName}» در فایل داده پیدا نشد.`);
    }
    return XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName],
      { defval: "" }
    );
  }

  async function load() {
    const workbook = await readWorkbook(SOURCE);
    const golzarRows = readSheet(workbook, SHEETS.golzar);
    const outsideRows = readSheet(workbook, SHEETS.outside);

    const records = [];

    golzarRows.forEach((row, index) => {
      records.push(AllMartyrsNormalizer.fromGolzar(row, index + 2));
    });

    outsideRows.forEach((row, index) => {
      records.push(AllMartyrsNormalizer.fromOutside(row, index + 2));
    });

    return {
      records,
      counts: {
        golzar: golzarRows.length,
        outside: outsideRows.length,
        total: records.length
      }
    };
  }

  return { load, SOURCE, SHEETS };
})();
