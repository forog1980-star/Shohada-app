from collections import Counter
from typing import Any


ENGINE_VERSION = "0.1.0"
UNKNOWN = "نامشخص"


def _nested(record: dict[str, Any], *keys: str) -> Any:
    current: Any = record

    for key in keys:
        if not isinstance(current, dict):
            return None
        current = current.get(key)

    return current


def _label(value: Any) -> str:
    if value is None:
        return UNKNOWN

    text = str(value).strip()
    return text if text else UNKNOWN


def _count(values: list[Any]) -> dict[str, int]:
    counts = Counter(_label(value) for value in values)

    def sort_key(item: tuple[str, int]) -> tuple[int, Any]:
        name = item[0]
        try:
            return (0, int(name))
        except ValueError:
            return (1, name)

    return dict(sorted(counts.items(), key=sort_key))


def _percent(count: int, total: int) -> float:
    if total == 0:
        return 0.0

    return round((count / total) * 100, 2)


def build_statistics(payload: dict[str, Any]) -> dict[str, Any]:
    records = payload.get("records", [])

    if not isinstance(records, list):
        raise ValueError("records باید از نوع list باشد.")

    analysis = payload.get("analysis") or {}
    quality = payload.get("quality") or {}
    issue_counts = payload.get("issueCounts") or {}

    total = len(records)

    stone_types = _count(
        [
            _nested(record, "operation", "stone_type")
            for record in records
        ]
    )

    stages = _count(
        [
            _nested(record, "operation", "stage_normalized")
            for record in records
        ]
    )

    pieces = _count(
        [
            _nested(record, "location", "piece")
            for record in records
        ]
    )

    quality_status = _count(
        [
            _nested(record, "quality", "status")
            for record in records
        ]
    )

    status_counts = _count(
        [
            _nested(record, "status")
            for record in records
        ]
    )

    official_records = sum(
        1
        for record in records
        if _nested(record, "scope", "official_piece") is True
    )

    out_of_scope_records = sum(
        1
        for record in records
        if _nested(record, "scope", "official_piece") is False
    )

    stage_shares = {
        stage: {
            "count": count,
            "share_percent": _percent(count, total),
        }
        for stage, count in stages.items()
    }

    return {
        "engineVersion": ENGINE_VERSION,
        "source": {
            "analysisId": analysis.get("analysisId"),
            "analyzedAt": analysis.get("analyzedAt"),
            "sourceType": analysis.get("sourceType"),
            "sourceFile": analysis.get("sourceFile"),
        },
        "totals": {
            "records": total,
            "officialRecords": official_records,
            "outOfScopeRecords": out_of_scope_records,
            "officialSharePercent": _percent(
                official_records,
                total,
            ),
        },
        "operations": {
            "stoneType": stone_types,
        },
        "stages": {
            "counts": stages,
            "shares": stage_shares,
        },
        "pieces": pieces,
        "quality": {
            "clean": int(quality.get("clean", 0)),
            "problem": int(quality.get("problem", 0)),
            "statusCounts": quality_status,
            "issueCounts": {
                str(name): int(value)
                for name, value in issue_counts.items()
            },
        },
        "status": {
            "counts": status_counts,
        },
    }