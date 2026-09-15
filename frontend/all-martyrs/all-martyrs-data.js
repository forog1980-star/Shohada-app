"use strict";

const AllMartyrsData = (() => {
  const SOURCE = "https://raw.githubusercontent.com/forog1980-star/Shohada-app/data/all-martyrs-20260904/data/all-martyrs/golzar_martyrs.xlsx";
  const LOAD_TIMEOUT_MS = 30000;

  const SHEETS = {
    golzar: "golzar_martyrs",
    outside: "outside_golzar_martyrs"
  };

  async function readWorkbook(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);
    try {
      const response = await fetch(`${url}?v=20260905-01`, {
        cache: "no-store",
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`خطا در دریافت فایل داده (${response.status})`);
      }
      const buffer = await response.arrayBuffer();
      if (!buffer.byteLength) {
        throw new Error("فایل داده خالی دریافت شد.");
      }
      if (typeof XLSX === "undefined") {
        throw new Error("کتابخانه Excel (XLSX) بارگذاری نشده است.");
      }
      return XLSX.read(buffer, { type: "array", cellDates: false });
    } catch (error) {
      if (error && error.name === "AbortError") {
        throw new Error("دریافت فایل اطلاعات شهدا بیش از ۳۰ ثانیه طول کشید. اتصال اینترنت یا دسترسی به GitHub را بررسی کنید.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
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
