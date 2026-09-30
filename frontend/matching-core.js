"use strict";

// ============================================================
// GolzarStone — Central Matching Core
// Single-record registration duplicate/similarity guard.
// No database writes. Deterministic only.
// ============================================================

(function installGolzarMatchingCore() {
  const MATCH = Object.freeze({
    EXACT: "EXACT",
    SIMILAR: "SIMILAR",
    NONE: "NONE",
  });

  function toEnglishDigits(value) {
    return String(value ?? "")
      .replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  }

  function normalize(value) {
    return toEnglishDigits(String(value ?? ""))
      .trim()
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[\u200c\u200d]/g, " ")
      .replace(/[ـ]/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function compact(value) {
    return normalize(value).replace(/\s+/g, "");
  }

  function normalizedRecord(record) {
    return {
      name: normalize(record?.name),
      lastname: normalize(record?.lastname ?? record?.family),
      father_name: normalize(record?.father_name),
      piece: normalize(record?.piece ?? record?.grave_piece),
      grave_row: normalize(record?.grave_row),
      grave_number: normalize(record?.grave_number),
    };
  }

  function locationKey(record) {
    const r = normalizedRecord(record);
    return [r.piece, r.grave_row, r.grave_number].join("|");
  }

  function baseIdentityKey(record) {
    const r = normalizedRecord(record);
    return [r.name, r.lastname].join("|");
  }

  function fullKey(record) {
    const r = normalizedRecord(record);
    return [
      r.name,
      r.lastname,
      r.piece,
      r.grave_row,
      r.grave_number,
    ].join("|");
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a) return b.length;
    if (!b) return a.length;

    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);

    for (let i = 1; i <= a.length; i += 1) {
      const current = [i];
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        current[j] = Math.min(
          current[j - 1] + 1,
          prev[j] + 1,
          prev[j - 1] + cost
        );
      }
      prev = current;
    }

    return prev[b.length];
  }

  function similarity(a, b) {
    const left = compact(a);
    const right = compact(b);
    if (!left || !right) return 0;
    if (left === right) return 1;

    const distance = levenshtein(left, right);
    return 1 - distance / Math.max(left.length, right.length);
  }

  function sameNonEmpty(a, b) {
    return !!a && !!b && a === b;
  }

  function locationScore(input, candidate) {
    const a = normalizedRecord(input);
    const b = normalizedRecord(candidate);

    let score = 0;
    let comparable = 0;

    for (const key of ["piece", "grave_row", "grave_number"]) {
      if (a[key] && b[key]) {
        comparable += 1;
        if (a[key] === b[key]) score += 1;
      }
    }

    return comparable ? score / comparable : 0;
  }

  function candidateSimilarity(input, candidate) {
    const a = normalizedRecord(input);
    const b = normalizedRecord(candidate);

    const nameScore = similarity(a.name, b.name);
    const lastnameScore = similarity(a.lastname, b.lastname);
    const sameLocation = locationKey(input) === locationKey(candidate);
    const sameIdentity = baseIdentityKey(input) === baseIdentityKey(candidate);
    const locScore = locationScore(input, candidate);
    const fatherSame =
      sameNonEmpty(a.father_name, b.father_name);

    let score =
      nameScore * 0.42 +
      lastnameScore * 0.28 +
      locScore * 0.30;

    if (sameLocation) score += 0.18;
    if (sameIdentity) score += 0.12;
    if (fatherSame) score += 0.05;

    return Math.min(0.99, score);
  }

  function classify(input, records) {
    const source = normalizedRecord(input);
    const rows = Array.isArray(records) ? records : [];
    const candidates = [];

    for (const record of rows) {
      if (!record || record.id == null) continue;

      const target = normalizedRecord(record);

      // Canonical exact match:
      // name + lastname + piece + row + number.
      // father_name is supplementary: if both sides have it,
      // a disagreement prevents the record from being classified exact.
      const sameBase =
        fullKey(source) === fullKey(target);

      const fatherConflict =
        source.father_name &&
        target.father_name &&
        source.father_name !== target.father_name;

      if (sameBase && !fatherConflict) {
        candidates.push({
          record,
          score: 1,
          reasons: ["نام، نام خانوادگی و محل مزار یکسان است"],
          classification: MATCH.EXACT,
        });
        continue;
      }

      const sameLocation =
        locationKey(input) === locationKey(record);

      const sameIdentity =
        baseIdentityKey(input) === baseIdentityKey(record);

      const nameScore = similarity(source.name, target.name);
      const lastnameScore = similarity(source.lastname, target.lastname);
      const combinedNameScore =
        nameScore * 0.6 + lastnameScore * 0.4;

      const locScore = locationScore(input, record);

      const strongName =
        combinedNameScore >= 0.88 ||
        (nameScore >= 0.94 && lastnameScore >= 0.80);

      const strongLocation =
        sameLocation || locScore >= 0.66;

      const identityOnly =
        sameIdentity && !sameLocation;

      const likelySimilar =
        (strongLocation && combinedNameScore >= 0.72) ||
        (sameIdentity && !fatherConflict) ||
        (identityOnly && combinedNameScore >= 0.90);

      if (likelySimilar) {
        const reasons = [];

        if (sameLocation) {
          reasons.push("محل مزار یکسان است");
        } else if (locScore >= 0.66) {
          reasons.push("بخش عمده مشخصات محل مزار یکسان است");
        }

        if (sameIdentity) {
          reasons.push("نام و نام خانوادگی یکسان است");
        } else if (strongName) {
          reasons.push("نام و نام خانوادگی بسیار مشابه است");
        }

        if (fatherConflict) {
          reasons.push("نام پدر متفاوت است؛ نیازمند بررسی");
        }

        candidates.push({
          record,
          score: candidateSimilarity(input, record),
          reasons,
          classification: MATCH.SIMILAR,
        });
      }
    }

    const exact = candidates
      .filter(item => item.classification === MATCH.EXACT)
      .sort((a, b) => b.score - a.score);

    if (exact.length) {
      return {
        classification: MATCH.EXACT,
        exact,
        similar: [],
      };
    }

    const similar = candidates
      .filter(item => item.classification === MATCH.SIMILAR)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    return {
      classification: similar.length ? MATCH.SIMILAR : MATCH.NONE,
      exact: [],
      similar,
    };
  }

  window.GolzarMatchingCore = Object.freeze({
    MATCH,
    normalize,
    normalizedRecord,
    locationKey,
    baseIdentityKey,
    fullKey,
    similarity,
    classify,
  });
})();