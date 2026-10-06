"""GolzarStone POC-01 deterministic matching engine.

No database access. No writes. Pure functions only.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from typing import Any, Iterable, Mapping


MATCH_EXACT = "EXACT"
MATCH_SIMILAR = "SIMILAR"
MATCH_NONE = "NONE"

ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"
PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
ENGLISH_DIGITS = "0123456789"
DIGIT_TRANSLATION = str.maketrans(
    ARABIC_DIGITS + PERSIAN_DIGITS,
    ENGLISH_DIGITS + ENGLISH_DIGITS,
)

FIELD_ALIASES = {
    "lastname": ("lastname", "family", "last_name"),
    "piece": ("piece", "grave_piece"),
}


def _value(record: Mapping[str, Any], key: str) -> Any:
    if key in record:
        return record.get(key)
    for alias in FIELD_ALIASES.get(key, ()):  # pragma: no branch
        if alias in record:
            return record.get(alias)
    return None


def normalize(value: Any) -> str:
    """Normalize Persian/Arabic text without semantic guessing."""
    if value is None:
        return ""

    text = str(value)
    text = unicodedata.normalize("NFKC", text)
    text = text.translate(DIGIT_TRANSLATION)
    text = text.replace("ي", "ی").replace("ى", "ی").replace("ك", "ک")
    text = text.replace("\u200c", " ").replace("\u200d", " ")
    text = text.replace("ـ", "")
    text = "".join(ch for ch in text if unicodedata.category(ch) not in {"Mn", "Me"})
    text = re.sub(r"\s+", " ", text).strip()
    return text.lower()


def compact(value: Any) -> str:
    return re.sub(r"\s+", "", normalize(value))


def is_anonymous_identity(value: Any) -> bool:
    """Detect anonymous-martyr identity forms without semantic overreach."""
    text = normalize(value)
    text = re.sub(r"[^\w\s]+", " ", text)
    tokens = [token for token in re.split(r"\s+", text.strip()) if token]
    if not tokens:
        return False

    compact_text = "".join(tokens)
    if compact_text in {"گمنام", "شهیدگمنام"}:
        return True

    return "گمنام" in tokens and all(
        token in {"شهید", "گمنام"} for token in tokens
    )


def normalized_record(record: Mapping[str, Any]) -> dict[str, str]:
    return {
        "name": normalize(_value(record, "name")),
        "lastname": normalize(_value(record, "lastname")),
        "father_name": normalize(_value(record, "father_name")),
        "piece": normalize(_value(record, "piece")),
        "grave_row": normalize(_value(record, "grave_row")),
        "grave_number": normalize(_value(record, "grave_number")),
    }


def location_key(record: Mapping[str, Any]) -> str:
    r = normalized_record(record)
    return "|".join((r["piece"], r["grave_row"], r["grave_number"]))


def identity_key(record: Mapping[str, Any]) -> str:
    r = normalized_record(record)
    return "|".join((r["name"], r["lastname"]))


def full_key(record: Mapping[str, Any]) -> str:
    r = normalized_record(record)
    return "|".join(
        (r["name"], r["lastname"], r["piece"], r["grave_row"], r["grave_number"])
    )


def levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)

    if len(a) > len(b):
        a, b = b, a

    previous = list(range(len(b) + 1))
    for i, left in enumerate(a, start=1):
        current = [i]
        for j, right in enumerate(b, start=1):
            cost = 0 if left == right else 1
            current.append(
                min(
                    current[-1] + 1,
                    previous[j] + 1,
                    previous[j - 1] + cost,
                )
            )
        previous = current
    return previous[-1]


def similarity(a: Any, b: Any) -> float:
    left = compact(a)
    right = compact(b)
    if not left or not right:
        return 0.0
    if left == right:
        return 1.0
    distance = levenshtein(left, right)
    return 1.0 - distance / max(len(left), len(right))


def location_score(left: Mapping[str, Any], right: Mapping[str, Any]) -> float:
    a = normalized_record(left)
    b = normalized_record(right)
    score = 0
    comparable = 0
    for key in ("piece", "grave_row", "grave_number"):
        if a[key] and b[key]:
            comparable += 1
            if a[key] == b[key]:
                score += 1
    return score / comparable if comparable else 0.0


def father_conflict(left: Mapping[str, Any], right: Mapping[str, Any]) -> bool:
    a = normalized_record(left)["father_name"]
    b = normalized_record(right)["father_name"]
    return bool(a and b and a != b)


def candidate_similarity(left: Mapping[str, Any], right: Mapping[str, Any]) -> float:
    a = normalized_record(left)
    b = normalized_record(right)

    name_score = similarity(a["name"], b["name"])
    lastname_score = similarity(a["lastname"], b["lastname"])
    same_location = location_key(left) == location_key(right)
    same_identity = identity_key(left) == identity_key(right)
    loc_score = location_score(left, right)
    father_same = bool(
        a["father_name"] and b["father_name"] and a["father_name"] == b["father_name"]
    )

    score = name_score * 0.42 + lastname_score * 0.28 + loc_score * 0.30
    if same_location:
        score += 0.18
    if same_identity:
        score += 0.12
    if father_same:
        score += 0.05
    return min(0.99, score)


@dataclass(frozen=True)
class MatchCandidate:
    record: Mapping[str, Any]
    score: float
    reasons: tuple[str, ...]
    classification: str


@dataclass(frozen=True)
class MatchResult:
    classification: str
    exact: tuple[MatchCandidate, ...]
    similar: tuple[MatchCandidate, ...]
    conflicts: tuple[MatchCandidate, ...]


def classify(input_record: Mapping[str, Any], records: Iterable[Mapping[str, Any]]) -> MatchResult:
    source = normalized_record(input_record)
    candidates: list[MatchCandidate] = []
    conflicts: list[MatchCandidate] = []

    for record in records:
        if not record:
            continue

        target = normalized_record(record)
        if is_anonymous_identity(source["name"]) and is_anonymous_identity(target["name"]):
            source_location = (
                source["piece"],
                source["grave_row"],
                source["grave_number"],
            )
            target_location = (
                target["piece"],
                target["grave_row"],
                target["grave_number"],
            )

            comparable = sum(
                bool(source_value and target_value)
                for source_value, target_value in zip(
                    source_location, target_location
                )
            )
            matches = sum(
                bool(
                    source_value
                    and target_value
                    and source_value == target_value
                )
                for source_value, target_value in zip(
                    source_location, target_location
                )
            )
            loc_score = matches / comparable if comparable else 0.0

            complete_same_location = (
                all(source_location)
                and all(target_location)
                and source_location == target_location
            )

            if complete_same_location:
                candidates.append(
                    MatchCandidate(
                        record=record,
                        score=1.0,
                        reasons=("anonymous_identity_and_same_location",),
                        classification=MATCH_EXACT,
                    )
                )
                continue

            if comparable >= 2 and loc_score >= 0.66:
                candidates.append(
                    MatchCandidate(
                        record=record,
                        score=loc_score,
                        reasons=("anonymous_identity_and_similar_location",),
                        classification=MATCH_SIMILAR,
                    )
                )
                continue

            continue

        same_base = (
            source["name"] == target["name"]
            and source["lastname"] == target["lastname"]
            and source["piece"] == target["piece"]
            and source["grave_row"] == target["grave_row"]
            and source["grave_number"] == target["grave_number"]
        )

        f_conflict = father_conflict(input_record, record)
        if same_base and not f_conflict:
            candidates.append(
                MatchCandidate(
                    record=record,
                    score=1.0,
                    reasons=("نام، نام خانوادگی و محل مزار یکسان است",),
                    classification=MATCH_EXACT,
                )
            )
            continue

        if same_base and f_conflict:
            conflicts.append(
                MatchCandidate(
                    record=record,
                    score=1.0,
                    reasons=("محل و نام یکسان است اما نام پدر متفاوت است",),
                    classification="CONFLICT",
                )
            )
            continue

        same_location = location_key(input_record) == location_key(record)
        same_identity = identity_key(input_record) == identity_key(record)
        name_score = similarity(source["name"], target["name"])
        lastname_score = similarity(source["lastname"], target["lastname"])
        combined_name_score = name_score * 0.6 + lastname_score * 0.4
        loc_score = location_score(input_record, record)

        strong_name = (
            combined_name_score >= 0.88
            or (name_score >= 0.94 and lastname_score >= 0.80)
        )
        strong_location = same_location or loc_score >= 0.66
        identity_only = same_identity and not same_location

        likely_similar = (
            (strong_location and combined_name_score >= 0.72)
            or (same_identity and not f_conflict)
            or (identity_only and combined_name_score >= 0.90)
        )

        if likely_similar:
            reasons: list[str] = []
            if same_location:
                reasons.append("محل مزار یکسان است")
            elif loc_score >= 0.66:
                reasons.append("بخش عمده مشخصات محل مزار یکسان است")

            if same_identity:
                reasons.append("نام و نام خانوادگی یکسان است")
            elif strong_name:
                reasons.append("نام و نام خانوادگی بسیار مشابه است")

            if f_conflict:
                reasons.append("نام پدر متفاوت است؛ نیازمند بررسی")

            candidates.append(
                MatchCandidate(
                    record=record,
                    score=candidate_similarity(input_record, record),
                    reasons=tuple(reasons),
                    classification=MATCH_SIMILAR,
                )
            )

    exact = tuple(
        sorted(
            (c for c in candidates if c.classification == MATCH_EXACT),
            key=lambda c: c.score,
            reverse=True,
        )
    )
    if exact:
        return MatchResult(MATCH_EXACT, exact, tuple(), tuple(conflicts))

    similar = tuple(
        sorted(
            (c for c in candidates if c.classification == MATCH_SIMILAR),
            key=lambda c: c.score,
            reverse=True,
        )[:8]
    )
    classification = MATCH_SIMILAR if similar else ("CONFLICT" if conflicts else MATCH_NONE)
    return MatchResult(classification, tuple(), similar, tuple(conflicts))


def duplicate_groups(records: Iterable[Mapping[str, Any]]) -> dict[str, list[Mapping[str, Any]]]:
    groups: dict[str, list[Mapping[str, Any]]] = {}

    for record in records:
        if is_anonymous_identity(_value(record, "name")):
            normalized = normalized_record(record)
            location = (
                normalized["piece"],
                normalized["grave_row"],
                normalized["grave_number"],
            )

            # Anonymous identities are grouped only by a complete exact location.
            # Name/title variants or decorative symbols must not create duplicates.
            if not all(location):
                continue

            key = "ANONYMOUS_LOCATION|" + "|".join(location)
        else:
            key = full_key(record)

        if key == "||||":
            continue

        groups.setdefault(key, []).append(record)

    return {key: rows for key, rows in groups.items() if len(rows) > 1}



def conflict_groups(records: Iterable[Mapping[str, Any]]) -> dict[str, list[Mapping[str, Any]]]:
    """Same identity at different locations, or same location with conflicting identity."""
    by_identity: dict[str, list[Mapping[str, Any]]] = {}
    by_location: dict[str, list[Mapping[str, Any]]] = {}

    for record in records:
        ik = identity_key(record)
        lk = location_key(record)
        if ik != "|":
            by_identity.setdefault(ik, []).append(record)
        if lk != "|||" :
            by_location.setdefault(lk, []).append(record)

    result: dict[str, list[Mapping[str, Any]]] = {}

    for key, rows in by_identity.items():
        locations = {location_key(r) for r in rows}
        if len(locations) > 1:
            result[f"IDENTITY:{key}"] = rows

    for key, rows in by_location.items():
        identities = {identity_key(r) for r in rows}
        if len(identities) > 1:
            result[f"LOCATION:{key}"] = rows

    return result
